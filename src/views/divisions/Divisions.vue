<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="divisions"
        :items-per-page="itemsPerPage"
        :search="search"
        :loading="loadingStatus"
        show-select
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Divisions</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog">
                  <v-icon>mdi-plus-circle</v-icon>
                </v-btn>
              </template>
              <span>Add</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  :disabled="!selected.length > 0"
                  text
                  icon
                  v-on="on"
                  @click="deleteDivisions"
                  ><v-icon>mdi-delete</v-icon></v-btn
                >
              </template>
              <span>Delete</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on"><v-icon>print</v-icon></v-btn>
              </template>
              <span>Print</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <json-excel :data="divisions">
                  <v-btn text icon v-on="on"
                    ><v-icon>mdi-file-export</v-icon></v-btn
                  >
                </json-excel>
              </template>
              <span>Export</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="refreshData">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh</span>
            </v-tooltip>

            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>

            <v-dialog persistent :value="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-text-field
                          autofocus
                          v-model="editedDivision.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedDivision.name.$touch()"
                          @keydown.enter="save"
                        ></v-text-field>

                        <v-flex md12>
                          <v-autocomplete
                            v-model="editedDivision.departments"
                            :items="departments"
                            item-text="name"
                            item-value="id"
                            multiple
                            chips
                            small-chips
                            label="Select Departments"
                          >
                            <template v-slot:selection="{ item, index }">
                              <v-chip small v-if="index === 0">
                                <span>{{ item.name }}</span>
                              </v-chip>
                              <span
                                v-if="index === 1"
                                class="grey--text caption"
                                >(+{{
                                  editedDivision.departments.length - 1
                                }}
                                others)</span
                              >
                            </template>
                          </v-autocomplete>
                        </v-flex>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Cancel</v-btn
                  >
                  <v-btn
                    color="blue darken-1"
                    text
                    @click="save"
                    :loading="loadingStatus"
                    >Save</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>

        <template v-slot:item.departments="{ item }">
          <span
            style="cursor:pointer;"
            v-if="item.departments.length > 0"
            @click="popDept(item)"
          >
            <span v-for="(department, index) in item.departments" :key="department.id">
              <v-chip small color="primary darken-2" v-if="index === 0">
                {{ department.name }}
              </v-chip>
            </span>
            <span v-if="item.departments.length - 1 > 0">
              (+{{ item.departments.length - 1 }} other{{
                item.departments.length - 1 != 1 ? "s" : ""
              }})
            </span>
          </span>
          <v-chip small color="secondary" v-if="item.departments.length <= 0">
            None
          </v-chip>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editDivision(item)">
            mdi-pencil
          </v-icon>
          <v-icon small>
            mdi-content-duplicate
          </v-icon>
        </template>
      </v-data-table>
    </v-container>
    <DepartmentsDialog />
  </div>
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

import DepartmentsDialog from "./templates/DepartmentsDialog";
import JsonExcel from "vue-json-excel";

export default {
  components: {
    DepartmentsDialog,
    JsonExcel
  },

  mixins: [validationMixin],

  data() {
    return {
      itemsPerPage: 5,
      search: "",
      selected: [],
      headers: [
        { text: "Name", align: "left", value: "name" },
        { text: "Departments", align: "left", value: "departments" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedDivision: {
        name: "",
        departments: []
      },
      defaultDivision: {
        name: "",
        departments: []
      }
    };
  },

  validations: {
    editedDivision: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.divisions.filter(
            division => division.name == value
          ).length;
          if (isName === 1) {
            return false;
          } else {
            return true;
          }
        }
      }
    }
  },

  computed: {
    ...mapGetters({
      divisions: "division/getDivisions",
      divisionErrors: "division/getDivisionErrors",
      departments: "department/getDepartments"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Division" : "Edit Division";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedDivision.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.divisionErrors["name|required"]) {
        nameRequiredError = this.divisionErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.divisionErrors["name|unique"]) {
        nameUniqueError = this.divisionErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedDivision.name.required && errors.push(nameRequiredError);
      !this.$v.editedDivision.name.isUnique && errors.push(nameUniqueError);
      return errors;
    }
  },

  watch: {
    divisions() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("division/fetchDivisions");
    this.$store.dispatch("department/fetchDepartments");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("division/fetchDivisions");
      this.$store.dispatch("department/fetchDepartments");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedDivision = Object.assign({}, this.defaultDivision); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editDivision(division) {
      this.editedIndex = this.divisions.indexOf(division); // get index: important

      const deptIds = division.departments.map(department => department.id); // get department ids
      this.editedDivision = Object.assign(
        {},
        {
          id: division.id,
          name: division.name,
          departments: deptIds
        }
      );
      this.$store.dispatch("triggerDialog", true);
    },

    deleteDivisions() {
      const divisions = this.$data.selected;
      const divisionIds = divisions.map(division => {
        return division.id;
      });
      const divisionNames = divisions.map(division => {
        return division.name;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            divisionNames,
          title: "Confirm Delete",
          actions: {
            false: "Cancel",
            true: {
              text: "Confirm",
              color: "warning"
            }
          }
        })
        .then(state => {
          if (state) {
            this.$store.dispatch("division/deleteDivisions", divisionIds);
            this.$data.selected = []; // reset selected
          }
        });
    },

    close() {
      this.editedIndex = -1;
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },

    save() {
      this.$v.$touch();
      if (this.editedIndex > -1) {
        // update division
        this.$store.dispatch("division/updateDivision", this.editedDivision);
      } else {
        // store division
        this.$store.dispatch("division/storeDivision", this.editedDivision);
      }
    },

    popDept(item) {
      let payload = {
        dialog: true,
        item: item
      };
      this.$store.commit("division/SET_DIVISION_ITEM", payload); // open dialog
    }
  }
};
</script>
