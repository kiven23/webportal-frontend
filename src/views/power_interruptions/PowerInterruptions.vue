<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="powerinterruptions"
        :items-per-page="itemsPerPage"
        :search="search"
        :loading="loadingStatus"
        show-select
        show-expand
        single-expand
        class="elevation-1"
        @toggle-select-all="selectAllToggle"
        @current-items="currentItems"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Power Interruptions</v-toolbar-title>
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
                  @click="deletePowerInterruptions"
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
                <json-excel :data="powerinterruptions">
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

            <v-dialog persistent :value="dialog" max-width="500px" scrollable>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-autocomplete
                          v-model="editedPowerInterruption.branch"
                          :search-input="editedPowerInterruption.branch"
                          :error-messages="branchErrors"
                          @input="$v.editedPowerInterruption.branch.$touch()"
                          :disabled="loadingStatus"
                          :items="branches"
                          item-text="name"
                          item-value="id"
                          label="Select Branch"
                        ></v-autocomplete>

                        <v-menu
                          v-model="dateMenu"
                          :close-on-content-click="true"
                          transition="scale-transition"
                          offset-y
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="editedPowerInterruption.date"
                              label="Date"
                              prepend-icon="event"
                              readonly
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="editedPowerInterruption.date"
                            @input="defaultPowerInterruption.date"
                          ></v-date-picker>
                        </v-menu>

                        <v-flex md12>
                          <v-dialog
                            ref="datetimeFromDialog"
                            v-model="datetimeFromModal"
                            :return-value.sync="
                              editedPowerInterruption.datetime_from
                            "
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="editedPowerInterruption.datetime_from"
                                :error-messages="datetimeFromErrors"
                                label="Time From"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="datetimeFromModal"
                              v-model="editedPowerInterruption.datetime_from"
                            >
                              <v-spacer></v-spacer>
                              <v-btn text @click="datetimeFromModal = false"
                                >Cancel</v-btn
                              >
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.datetimeFromDialog.save(
                                    editedPowerInterruption.datetime_from
                                  )
                                "
                                >OK</v-btn
                              >
                            </v-time-picker>
                          </v-dialog>
                        </v-flex>

                        <v-flex md12>
                          <v-dialog
                            ref="datetimeToDialog"
                            v-model="datetimeToModal"
                            :return-value.sync="
                              editedPowerInterruption.datetime_to
                            "
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                :disabled="
                                  !editedPowerInterruption.datetime_from
                                "
                                v-model="editedPowerInterruption.datetime_to"
                                :error-messages="datetimeToErrors"
                                label="Time To"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="datetimeToModal"
                              v-model="editedPowerInterruption.datetime_to"
                              :min="editedPowerInterruption.datetime_from"
                            >
                              <v-spacer></v-spacer>
                              <v-btn text @click="datetimeToModal = false"
                                >Cancel</v-btn
                              >
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.datetimeToDialog.save(
                                    editedPowerInterruption.datetime_to
                                  )
                                "
                                >OK</v-btn
                              >
                            </v-time-picker>
                          </v-dialog>
                        </v-flex>

                        <v-text-field
                          v-model="editedPowerInterruption.reported_by_name"
                          :error-messages="reportedByNameErrors"
                          label="Reported by"
                          :disabled="loadingStatus"
                          @input="
                            $v.editedPowerInterruption.reported_by_name.$touch()
                          "
                        ></v-text-field>
                        <v-text-field
                          v-model="editedPowerInterruption.reported_by_position"
                          label="Position"
                          :disabled="loadingStatus"
                        ></v-text-field>
                        <v-textarea
                          auto-grow
                          row-height="1"
                          v-model="editedPowerInterruption.remarks"
                          :error-messages="remarksErrors"
                          label="Remarks"
                          :disabled="loadingStatus"
                          @input="$v.editedPowerInterruption.remarks.$touch()"
                        ></v-textarea>
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

        <template v-slot:item.datetime_from="{ item }">
          {{ moment(item.datetime_from).format("MMM D, Y (h:mm a)") }}
        </template>

        <template v-slot:item.datetime_to="{ item }">
          {{ moment(item.datetime_to).format("MMM D, Y (h:mm a)") }}
        </template>

        <template v-slot:item.total_hours="{ item }">
          {{
            moment
              .utc(
                moment.duration(item.total_hours, "seconds").asMilliseconds()
              )
              .format("H ") + "hours"
          }}
          {{
            "& " +
              moment
                .utc(
                  moment.duration(item.total_hours, "seconds").asMilliseconds()
                )
                .format("m ") +
              " minutes"
          }}
        </template>

        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length" class="text-xs-center">
            <v-list-item two-line="">
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.branch.name.toUpperCase() }}
                </v-list-item-title>

                <v-list-item-title>Logged By</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.user.name }}
                </v-list-item-subtitle>

                <v-list-item-title>Reported By</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.reported_by_name }} ({{
                    item.reported_by_position
                      ? item.reported_by_position
                      : "None"
                  }})
                </v-list-item-subtitle>

                <v-list-item-title>Remarks</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.remarks ? item.remarks : "None" }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </td>
        </template>

        <template v-slot:header.data-table-select="{ on, props }">
          <v-simple-checkbox
            v-bind="props"
            v-on="on"
            :disabled="powerinterruptions.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon
            small
            class="mr-2"
            title="Edit"
            @click="editPowerInterruption(item, 1)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            small
            title="Duplicate"
            @click="editPowerInterruption(item, 2)"
          >
            mdi-content-duplicatepowerinterruption
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
      search: "",
      selected: [],
      datetimeFromModal: false,
      datetimeToModal: false,
      dateMenu: false,
      headers: [
        { text: "Branch", align: "left", value: "branch.name" },
        { text: "From", align: "left", value: "datetime_from" },
        { text: "To", align: "left", value: "datetime_to" },
        { text: "Total Hours", align: "left", value: "total_hours" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedPowerInterruption: {
        branch: null,
        reported_by_name: "",
        reported_by_position: "",
        date: "",
        datetime_from: "",
        datetime_to: "",
        remarks: ""
      },
      defaultPowerInterruption: {
        branch: null,
        reported_by_name: "",
        reported_by_position: "",
        date: new Date().toISOString().substr(0, 10),
        datetime_from: "",
        datetime_to: "",
        remarks: ""
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedPowerInterruption: {
      branch: { required },
      reported_by_name: { required },
      date: { required },
      datetime_from: { required },
      datetime_to: { required },
      remarks: { required }
    }
  },

  computed: {
    ...mapGetters({
      powerinterruptions: "powerInterruption/getPowerInterruptions",
      powerInterruptionErrors: "powerInterruption/getPowerInterruptionErrors",
      branches: "branch/getBranches"
      
    
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1
        ? "New Power Interruption"
        : "Edit Power Interruption";
    },

    branchErrors() {
      const errors = [];
      if (!this.$v.editedPowerInterruption.branch.$dirty) return errors;

      var branchRequiredError = null;
      if (this.powerInterruptionErrors["branch|required"]) {
        branchRequiredError = this.powerInterruptionErrors["branch|required"];
      } else {
        branchRequiredError = "This field is required.";
      }

      !this.$v.editedPowerInterruption.branch.required &&
        errors.push(branchRequiredError);
      return errors;
    },

    datetimeFromErrors() {
      const errors = [];
      if (!this.$v.editedPowerInterruption.datetime_from.$dirty) return errors;

      var datetimeFromRequiredError = null;
      if (this.powerInterruptionErrors["datetime_from|required"]) {
        datetimeFromRequiredError = this.powerInterruptionErrors[
          "datetime_from|required"
        ];
      } else {
        datetimeFromRequiredError = "The time from field is required.";
      }

      !this.$v.editedPowerInterruption.datetime_from.required &&
        errors.push(datetimeFromRequiredError);
      return errors;
    },

    datetimeToErrors() {
      const errors = [];
      if (!this.$v.editedPowerInterruption.datetime_to.$dirty) return errors;

      var datetimeToRequiredError = null;
      if (this.powerInterruptionErrors["datetime_to|required"]) {
        datetimeToRequiredError = this.powerInterruptionErrors[
          "datetime_to|required"
        ];
      } else {
        datetimeToRequiredError = "The time to field is required.";
      }

      !this.$v.editedPowerInterruption.datetime_to.required &&
        errors.push(datetimeToRequiredError);
      return errors;
    },

    reportedByNameErrors() {
      const errors = [];
      if (!this.$v.editedPowerInterruption.reported_by_name.$dirty)
        return errors;

      var reported_by_nameRequiredError = null;
      if (this.powerInterruptionErrors["reported_by_name|required"]) {
        reported_by_nameRequiredError = this.powerInterruptionErrors[
          "reported_by_name|required"
        ];
      } else {
        reported_by_nameRequiredError = "This field is required.";
      }

      !this.$v.editedPowerInterruption.reported_by_name.required &&
        errors.push(reported_by_nameRequiredError);
      return errors;
    },

    remarksErrors() {
      const errors = [];
      if (!this.$v.editedPowerInterruption.remarks.$dirty) return errors;

      var remarksRequiredError = null;
      if (this.powerInterruptionErrors["remarks|required"]) {
        remarksRequiredError = this.powerInterruptionErrors["remarks|required"];
      } else {
        remarksRequiredError = "The remarks field is required.";
      }

      !this.$v.editedPowerInterruption.remarks.required &&
        errors.push(remarksRequiredError);
      return errors;
    }
  },

  watch: {
    powerinterruptions() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("powerInterruption/fetchPowerInterruptions");
    this.$store.dispatch("branch/fetchBranches");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("powerInterruption/fetchPowerInterruptions");
      this.$store.dispatch("branch/fetchBranches");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedPowerInterruption = Object.assign(
        {},
        this.defaultPowerInterruption
      ); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editPowerInterruption(powerinterruption, action) {
      this.editedIndex =
        action == 2 ? -1 : this.powerinterruptions.indexOf(powerinterruption); // set index: important
      this.editedPowerInterruption = Object.assign(
        {},
        {
          id: powerinterruption.id,
          user: powerinterruption.user.name,
          branch: powerinterruption.branch.id,
          reported_by_name: powerinterruption.reported_by_name,
          reported_by_position: powerinterruption.reported_by_position,
          remarks: powerinterruption.remarks,
          date: this.moment(powerinterruption.datetime_from).format(
            "YYYY-MM-DD"
          ),
          datetime_from: this.moment(powerinterruption.datetime_from).format(
            "HH:mm"
          ),
          datetime_to: this.moment(powerinterruption.datetime_to).format(
            "HH:mm"
          )
        }
      );
      this.$store.dispatch("triggerDialog", true);
    },

    deletePowerInterruptions() {
      const powerinterruptions = this.$data.selected;
      const powerinterruptionIds = powerinterruptions.map(powerinterruption => {
        return powerinterruption.id;
      });
      const powerinterruptionNames = powerinterruptions.map(
        powerinterruption => {
          const lists = "<br />" + powerinterruption.branch.name;
          return lists;
        }
      );

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            powerinterruptionNames,
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
            this.$store.dispatch(
              "powerInterruption/deletePowerInterruptions",
              powerinterruptionIds
            );
            this.$data.selected = []; // reset selected
          }
        });
    },

    close() {
      this.editedIndex = -1;
      this.editedPowerInterruption = {};
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },

    save() {
      this.$v.$touch();
      if (this.editedIndex > -1) {
        // update powerinterruption
        this.$store.dispatch(
          "powerInterruption/updatePowerInterruption",
          this.editedPowerInterruption
        );
      } else {
        // store powerinterruption
        this.$store.dispatch(
          "powerInterruption/storePowerInterruption",
          this.editedPowerInterruption
        );
      }
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.powerinterruptions > 0) {
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
