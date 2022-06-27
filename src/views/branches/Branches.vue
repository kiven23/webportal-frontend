<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="branches"
        :search="search"
        :loading="loadingStatus"
        :items-per-page="itemsPerPage"
        show-select
        show-expand
        single-expand
        class="elevation-1"
        @toggle-select-all="selectAllToggle"
        @current-items="currentItems"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Branches</v-toolbar-title>
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
                  @click="deleteBranches"
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
                <json-excel :data="branches">
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

            <v-dialog
              persistent
              :value="dialog"
              max-width="500px"
              @keydown.enter="save"
              scrollable
            >
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-layout wrap>
                      <v-flex md12>
                        <v-text-field
                          autofocus
                          v-model="editedBranch.machine_number"
                          :error-messages="machineNumErrors"
                          label="Machine Number"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedBranch.machine_number.$touch()"
                        ></v-text-field>
                      </v-flex>
                      <v-flex md12>
                        <v-text-field
                          v-model="editedBranch.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedBranch.name.$touch()"
                        ></v-text-field>
                      </v-flex>
                      <v-flex md12>
                        <v-autocomplete
                          clearable
                          v-model="editedBranch.schedule"
                          :search-input="editedBranch.schedule"
                          required
                          :items="schedules"
                          item-text="time"
                          item-value="id"
                          label="Select Schedule"
                          filled
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex md12>
                        <v-autocomplete
                          v-model="editedBranch.region"
                          :search-input="editedBranch.region"
                          :error-messages="regionErrors"
                          @input="$v.editedBranch.region.$touch()"
                          required
                          :items="regions"
                          item-text="name"
                          item-value="id"
                          label="Select Region"
                          filled
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex md12>
                        <v-text-field
                          v-model="editedBranch.whscode"
                          :error-messages="whsCodeErrors"
                          label="Whs Code"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedBranch.whscode.$touch()"
                        ></v-text-field>
                      </v-flex>
                      <v-flex md12>
                        <v-text-field
                          v-model="editedBranch.bm_oic"
                          label="BM/OIC"
                          required
                          :disabled="loadingStatus"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="close">Cancel</v-btn>
                  <v-btn
                    color="blue"
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

        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length" class="text-xs-center">
            <v-list-item two-line="">
              <v-list-item-content>
                <v-list-item-title>{{
                  item.name.toUpperCase()
                }}</v-list-item-title>
                <v-list-item-title>Schedule</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.schedule ? item.schedule.time : "None" }}
                </v-list-item-subtitle>

                <v-list-item-title>Whs Code</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.whscode ? item.whscode : "None" }}
                </v-list-item-subtitle>

                <v-list-item-title>BM/OIC</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.bm_oic ? item.bm_oic : "None" }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </td>
        </template>

        <template v-slot:header.data-table-select="{ on, props }">
          <v-simple-checkbox
            v-bind="props"
            v-on="on"
            :disabled="branches.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.users.length > 0"
            :disabled="item.users.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" title="Edit" @click="editBranch(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editBranch(item, 2)">
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
      expand: false,
      search: "",
      selected: [],
      disabledCount: 0,
      headers: [
        { text: "Name", align: "left", value: "name" },
        { text: "Machine Number", align: "left", value: "machine_number" },
        { text: "Region", align: "left", value: "region.name" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedBranch: {
        name: "",
        machine_number: "",
        whscode: "",
        bm_oic: "",

        schedule: null,
        region: null
      },
      defaultBranch: {
        name: "",
        machine_number: "",
        whscode: "",
        bm_oic: "",

        schedule: null,
        region: null
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedBranch: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.branches.filter(branch => branch.name == value)
            .length;
          if (isName === 1) {
            return false;
          } else {
            return true;
          }
        }
      },
      region: { required },
      machine_number: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isMachineNum = this.branches.filter(
            branch => branch.machine_number == value
          ).length;
          if (isMachineNum === 1) {
            return false;
          } else {
            return true;
          }
        }
      },
      whscode: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isWhsCode = this.branches.filter(branch => {
            return branch.whscode == value;
          }).length;
          if (isWhsCode === 1) {
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
      branches: "branch/getBranches",
      branchErrors: "branch/getBranchErrors",
      regions: "region/getRegions",
      schedules: "bsched/getSchedules"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Branch" : "Edit Branch";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedBranch.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.branchErrors["name|required"]) {
        nameRequiredError = this.branchErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.branchErrors["name|unique"]) {
        nameUniqueError = this.branchErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedBranch.name.required && errors.push(nameRequiredError);
      !this.$v.editedBranch.name.isUnique && errors.push(nameUniqueError);
      return errors;
    },

    regionErrors() {
      const errors = [];
      if (!this.$v.editedBranch.region.$dirty) return errors;

      var regionRequiredError = null;
      if (this.branchErrors["region|required"]) {
        regionRequiredError = this.branchErrors["region|required"];
      } else {
        regionRequiredError = "The region field is required.";
      }

      !this.$v.editedBranch.region.required && errors.push(regionRequiredError);
      return errors;
    },

    machineNumErrors() {
      const errors = [];
      if (!this.$v.editedBranch.machine_number.$dirty) return errors;

      var machineNumRequiredError = null;
      if (this.branchErrors["machine_number|required"]) {
        machineNumRequiredError = this.branchErrors["machine_number|required"];
      } else {
        machineNumRequiredError = "The machine number field is required.";
      }

      var machineNumUniqueError = null;
      if (this.branchErrors["machine_number|unique"]) {
        machineNumUniqueError = this.branchErrors["machine_number|unique"];
      } else {
        machineNumUniqueError = "The machine number has already been taken.";
      }

      !this.$v.editedBranch.machine_number.required &&
        errors.push(machineNumRequiredError);
      !this.$v.editedBranch.machine_number.isUnique &&
        errors.push(machineNumUniqueError);
      return errors;
    },

    whsCodeErrors() {
      const errors = [];
      if (!this.$v.editedBranch.whscode.$dirty) return errors;

      var whsCodeRequiredError = null;
      if (this.branchErrors["whscode|required"]) {
        whsCodeRequiredError = this.branchErrors["whscode|required"];
      } else {
        whsCodeRequiredError = "The whscode field is required.";
      }

      var whsCodeUniqueError = null;
      if (this.branchErrors["whscode|unique"]) {
        whsCodeUniqueError = this.branchErrors["whscode|unique"];
      } else {
        whsCodeUniqueError = "The whscode has already been taken.";
      }

      !this.$v.editedBranch.whscode.required &&
        errors.push(whsCodeRequiredError);
      !this.$v.editedBranch.whscode.isUnique && errors.push(whsCodeUniqueError);
      return errors;
    }
  },

  watch: {
    branches() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("branch/fetchBranches");
    this.$store.dispatch("region/fetchRegions");
    this.$store.dispatch("bsched/fetchSchedules");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("branch/fetchBranches");
      this.$store.dispatch("region/fetchRegions");
      this.$store.dispatch("bsched/fetchSchedules");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedBranch = Object.assign({}, this.defaultBranch); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editBranch(branch, action) {
      this.editedIndex = action == 2 ? -1 : this.branches.indexOf(branch); // set index: important
      this.editedBranch = Object.assign(
        {},
        {
          id: branch.id,
          name: branch.name,
          schedule: branch.schedule ? branch.schedule.id : null,
          region: branch.region.id,
          machine_number: branch.machine_number,
          whscode: branch.whscode,
          bm_oic: branch.bm_oic
        }
      );
      this.$store.dispatch("triggerDialog", true);
    },

    deleteBranches() {
      const branches = this.$data.selected;
      const branchIds = branches.map(branch => {
        return branch.id;
      });
      const branchNames = branches.map(branch => {
        const lists = "<br />" + branch.name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            branchNames,
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
            this.$store.dispatch("branch/deleteBranches", branchIds);
            this.$data.selected = []; // reset selected
          }
        });
    },

    close() {
      this.editedIndex = -1;
      this.editedBranch = {};
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },

    save() {
      this.$v.$touch();
      if (this.editedIndex > -1) {
        // update branch
        this.$store.dispatch("branch/updateBranch", this.editedBranch);
      } else {
        // store branch
        this.$store.dispatch("branch/storeBranch", this.editedBranch);
      }
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.users.length > 0) {
            self.selected.push(item);
          }
        });
        self.disabledCount = this.current_items - this.selected.length;
      } else this.selected = [];
    },

    currentItems(items) {
      this.current_items = items.length;
    }
  }
};
</script>
