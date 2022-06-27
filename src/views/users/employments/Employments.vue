<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="employments"
        :items-per-page="itemsPerPage"
        :search="search"
        :loading="loadingStatus"
        show-expand
        single-expand
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>User Employments</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on"><v-icon>print</v-icon></v-btn>
              </template>
              <span>Print</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <json-excel :data="employments">
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

            <v-dialog scrollable persistent :value="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-form ref="form">
                          <v-text-field
                            v-model="editedEmployment.user"
                            label="Employee"
                            disabled
                          ></v-text-field>
                          <v-text-field
                            v-model="editedEmployment.sss"
                            :error-messages="sssErrors"
                            label="SSS"
                            required
                            :disabled="loadingStatus"
                            @input="$v.editedEmployment.sss.$touch()"
                          ></v-text-field>
                          <v-autocomplete
                            v-model="editedEmployment.branch"
                            :search-input="editedEmployment.branch"
                            :items="branches"
                            item-text="name"
                            item-value="id"
                            label="Select Branch"
                            filled
                          ></v-autocomplete>
                          <v-autocomplete
                            v-model="editedEmployment.position"
                            :search-input="editedEmployment.position"
                            :error-messages="positionErrors"
                            :items="positions"
                            item-text="name"
                            item-value="id"
                            label="Select Position"
                            filled
                          ></v-autocomplete>
                          <v-autocomplete
                            v-model="editedEmployment.department"
                            :search-input="editedEmployment.department"
                            :error-messages="departmentErrors"
                            :items="departments"
                            item-text="name"
                            item-value="id"
                            label="Select Department"
                            filled
                          ></v-autocomplete>
                          <v-autocomplete
                            v-model="editedEmployment.payroll"
                            :search-input="editedEmployment.payroll"
                            :error-messages="payrollErrors"
                            :items="payrollOptions"
                            item-text="name"
                            item-value="id"
                            label="Payroll"
                            filled
                          ></v-autocomplete>
                          <v-dialog
                            ref="timeFromDialog"
                            v-if="editedEmployment.branch === 1"
                            v-model="timeFromModal"
                            :return-value.sync="editedEmployment.time_from"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="editedEmployment.time_from"
                                label="Time From"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              header-color="primary"
                              color="primary"
                              v-if="timeFromModal"
                              v-model="editedEmployment.time_from"
                            >
                              <v-spacer></v-spacer>
                              <v-btn text @click="timeFromModal = false"
                                >Cancel</v-btn
                              >
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.timeFromDialog.save(
                                    editedEmployment.time_from
                                  )
                                "
                                >OK</v-btn
                              >
                            </v-time-picker>
                          </v-dialog>
                          <v-dialog
                            ref="timeToDialog"
                            v-if="editedEmployment.branch === 1"
                            v-model="timeToModal"
                            :return-value.sync="editedEmployment.time_to"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                :disabled="!editedEmployment.time_from"
                                v-model="editedEmployment.time_to"
                                label="Time To"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              header-color="primary"
                              color="primary"
                              v-if="timeToModal"
                              v-model="editedEmployment.time_to"
                              :min="editedEmployment.time_from"
                            >
                              <v-spacer></v-spacer>
                              <v-btn text @click="timeToModal = false"
                                >Cancel</v-btn
                              >
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.timeToDialog.save(
                                    editedEmployment.time_to
                                  )
                                "
                                >OK</v-btn
                              >
                            </v-time-picker>
                          </v-dialog>
                        </v-form>
                      </v-col>
                    </v-row>
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
                  item.user.full_name.toUpperCase()
                }}</v-list-item-title>
                <v-list-item-title>Payroll</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    item.payroll != null
                      ? item.payroll == 1
                        ? "ATM"
                        : "Cash"
                      : "None"
                  }}
                </v-list-item-subtitle>

                <v-list-item-title>Department</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.department ? item.department.name : "None" }}
                </v-list-item-subtitle>

                <v-list-item-title>Position</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.position ? item.position.name : "None" }}
                </v-list-item-subtitle>

                <v-list-item-title>Schedule</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.schedule ? item.schedule.name : "None" }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </td>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" title="Edit" @click="editEmployment(item)">
            mdi-pencil
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
      timeFromModal: false,
      timeToModal: false,
      payrollOptions: [
        { name: "Cash", id: 0 },
        { name: "ATM", id: 1 }
      ],
      expand: false,
      search: "",
      selected: [],
      headers: [
        { text: "SSS", align: "left", value: "sss" },
        { text: "Name", align: "left", value: "user.full_name" },
        { text: "Branch", align: "left", value: "branch.name" },
        { text: "Position", align: "left", value: "position.name" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedEmployment: {
        sss: "",
        payroll: "",
        branch: "",
        position: "",
        department: "",
        time_from: "",
        time_to: ""
      }
    };
  },

  validations: {
    editedEmployment: {
      sss: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isSss = this.employments.filter(
            employment => employment.sss == value
          ).length;
          if (isSss > 0) {
            return false;
          } else {
            return true;
          }
        }
      },
      payroll: { required },
      branch: { required },
      position: { required },
      department: { required }
    }
  },

  computed: {
    ...mapGetters({
      employments: "employment/getEmployments",
      employmentErrors: "employment/getEmploymentErrors",
      branches: "branch/getBranches",
      positions: "position/getPositions",
      departments: "department/getDepartments"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return "Edit User Employment";
    },

    sssErrors() {
      const errors = [];
      if (!this.$v.editedEmployment.sss.$dirty) return errors;

      var sssRequiredError = null;
      if (this.employmentErrors["sss|required"]) {
        sssRequiredError = this.employmentErrors["sss|required"];
      } else {
        sssRequiredError = "The first name field is required.";
      }

      var sssUniqueError = null;
      if (this.employmentErrors["sss|unique"]) {
        sssUniqueError = this.employmentErrors["sss|unique"];
      } else {
        sssUniqueError = "The sss has already been taken.";
      }

      !this.$v.editedEmployment.sss.required && errors.push(sssRequiredError);
      !this.$v.editedEmployment.sss.isUnique && errors.push(sssUniqueError);
      return errors;
    },
    payrollErrors() {
      const errors = [];
      if (!this.$v.editedEmployment.payroll.$dirty) return errors;

      var payrollRequiredError = null;
      if (this.employmentErrors["payroll|required"]) {
        payrollRequiredError = this.employmentErrors["payroll|required"];
      } else {
        payrollRequiredError = "Please select payroll.";
      }

      !this.$v.editedEmployment.payroll.required &&
        errors.push(payrollRequiredError);
      return errors;
    },
    positionErrors() {
      const errors = [];
      if (!this.$v.editedEmployment.position.$dirty) return errors;

      var positionRequiredError = null;
      if (this.employmentErrors["position|required"]) {
        positionRequiredError = this.employmentErrors["position|required"];
      } else {
        positionRequiredError = "Please select position.";
      }

      !this.$v.editedEmployment.position.required &&
        errors.push(positionRequiredError);
      return errors;
    },
    departmentErrors() {
      const errors = [];
      if (!this.$v.editedEmployment.department.$dirty) return errors;

      var departmentRequiredError = null;
      if (this.employmentErrors["department|required"]) {
        departmentRequiredError = this.employmentErrors["department|required"];
      } else {
        departmentRequiredError = "Please select department.";
      }

      !this.$v.editedEmployment.department.required &&
        errors.push(departmentRequiredError);
      return errors;
    }
  },

  watch: {
    employments() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("employment/fetchEmployments");
    this.$store.dispatch("branch/fetchBranches");
    this.$store.dispatch("position/fetchPositions");
    this.$store.dispatch("department/fetchDepartments");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("employment/fetchEmployments");
      this.$store.dispatch("branch/fetchBranches");
      this.$store.dispatch("position/fetchPositions");
      this.$store.dispatch("department/fetchDepartments");
    },

    editEmployment(employment) {
      this.editedEmployment = Object.assign(
        {},
        {
          id: employment.id,
          user: employment.user.full_name,
          sss: employment.sss,
          payroll: employment.payroll,
          branch: employment.branch.id,
          position: employment.position ? employment.position.id : null,
          department: employment.department ? employment.department.id : null,
          time_from: employment.time_from,
          time_to: employment.time_to
        }
      );
      console.log(this.editedEmployment);
      this.$store.dispatch("triggerDialog", true);
    },

    close() {
      this.$v.$reset();
      this.editedEmployment = {};
      this.$store.dispatch("triggerDialog", false);
    },

    save() {
      this.$v.$touch();
      this.$store.dispatch(
        "employment/updateEmployment",
        this.editedEmployment
      );
    }
  }
};
</script>
