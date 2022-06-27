<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="departments"
        :items-per-page="itemsPerPage"
        :search="search"
        :loading="loadingStatus"
        show-select
        class="elevation-1"
        @toggle-select-all="selectAllToggle"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Departments</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
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
                  @click="deleteDepartments"
                  ><v-icon>delete</v-icon></v-btn
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
                <json-excel :data="departments">
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
              append-icon="search"
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
                          v-model="editedDepartment.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedDepartment.name.$touch()"
                          @keydown.enter="save"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="close">Cancel</v-btn>
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

        <template v-slot:header.data-table-select="{ on, props }">
          <v-simple-checkbox
            v-bind="props"
            v-on="on"
            :disabled="departments.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.employees.length > 0"
            :disabled="item.employees.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editDepartment(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="editDepartment(item, 2)">
            mdi-content-duplicate
          </v-icon>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import JsonExcel from "vue-json-excel";

export default {
  components: {
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
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedDepartment: {
        name: ""
      },
      defaultDepartment: {
        name: ""
      }
    };
  },

  validations: {
    editedDepartment: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.departments.filter(
            department => department.name == value
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
      departments: "department/getDepartments",
      departmentErrors: "department/getDepartmentErrors"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Department" : "Edit Department";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedDepartment.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.departmentErrors["name|required"]) {
        nameRequiredError = this.departmentErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.departmentErrors["name|unique"]) {
        nameUniqueError = this.departmentErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedDepartment.name.required && errors.push(nameRequiredError);
      !this.$v.editedDepartment.name.isUnique && errors.push(nameUniqueError);
      return errors;
    }
  },

  watch: {
    departments() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("department/fetchDepartments");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("department/fetchDepartments");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedDepartment = Object.assign({}, this.defaultDepartment); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editDepartment(department, action) {
      this.editedIndex =
        action == 2 ? -1 : this.departments.indexOf(department); // set index: important
      this.editedDepartment = Object.assign({}, department);
      this.$store.dispatch("triggerDialog", true);
    },

    deleteDepartments() {
      const departments = this.$data.selected;
      const departmentIds = departments.map(department => {
        return department.id;
      });
      const departmentNames = departments.map(department => {
        const lists = "<br />" + department.name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            departmentNames,
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
            this.$store.dispatch("department/deleteDepartments", departmentIds);
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
        // update department
        this.$store.dispatch(
          "department/updateDepartment",
          this.editedDepartment
        );
      } else {
        // store department
        this.$store.dispatch(
          "department/storeDepartment",
          this.editedDepartment
        );
      }
    },

    selectAllToggle(props) {
      if (
        this.selected.length !=
        this.departments.length - this.disabledCount
      ) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.employees.length > 0) {
            self.selected.push(item);
          }
        });
        self.disabledCount = this.departments.length - this.selected.length;
      } else this.selected = [];
    }
  }
};
</script>
