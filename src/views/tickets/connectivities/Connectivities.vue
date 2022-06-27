<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="tickets"
        :items-per-page="itemsPerPage"
        :search="search"
        :loading="loadingStatus"
        show-select
        show-expand
        multi-sort
        single-expand
        class="elevation-1"
        @toggle-select-all="selectAllToggle"
        @current-items="currentItems"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Connectivity Tickets</v-toolbar-title>
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
                  @click="deleteTickets"
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
                <json-excel :data="tickets">
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
              fullscreen
              persistent
              scrollable
              :value="dialog"
              max-width="500px"
              hide-overlay
              transition="dialog-bottom-transition"
            >
              <v-card>
                <v-car-title>
                  <v-toolbar>
                    <v-btn icon @click="close">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Connectivity Tickets</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                      <v-btn text @click="save">Save</v-btn>
                    </v-toolbar-items>
                  </v-toolbar>
                </v-car-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="4">
                        <v-autocomplete
                          v-model="editedTicket.branch"
                          :error-messages="branchErrors"
                          :search-input="editedTicket.branch"
                          :disabled="loadingStatus"
                          :items="branches"
                          item-text="name"
                          item-value="id"
                          label="Branch"
                          filled
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model="editedTicket.reported_by_name"
                          :error-messages="reportedByNameErrors"
                          :disabled="loadingStatus"
                          label="Reported By"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model="editedTicket.reported_by_position"
                          :error-messages="reportedByPositionErrors"
                          :disabled="loadingStatus"
                          label="Position"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="4">
                        <v-autocomplete
                          v-model="editedTicket.service_provider"
                          :search-input="editedTicket.service_provider"
                          :error-messages="serviceProviderErrors"
                          :disabled="loadingStatus"
                          :items="serviceProviders"
                          item-text="name"
                          item-value="id"
                          label="Service Provider"
                          filled
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="4">
                        <v-autocomplete
                          v-model="editedTicket.service_type"
                          :error-messages="serviceTypeErrors"
                          :search-input="editedTicket.service_type"
                          :disabled="loadingStatus"
                          :items="serviceTypes"
                          item-text="name"
                          item-value="id"
                          label="Service Type"
                          filled
                        ></v-autocomplete>
                      </v-col>
                      <v-col cols="4">
                        <v-autocomplete
                          v-model="editedTicket.service_category"
                          :error-messages="serviceCategoryErrors"
                          :search-input="editedTicket.service_category"
                          :disabled="loadingStatus"
                          :items="serviceCategories"
                          item-text="name"
                          item-value="id"
                          label="Service Category"
                          filled
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="4">
                        <v-dialog v-model="reportedToHoDialog" width="400">
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="editedTicket.problem_reported_ho"
                              :error-messages="problemReportedErrors"
                              :disabled="loadingStatus"
                              label="Problem Reported To HO"
                              prepend-icon="event"
                              readonly
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-card>
                            <v-card-title class="text-center justify-center"
                              >Problem Reported to HO</v-card-title
                            >

                            <v-tabs v-model="tab" centered grow>
                              <v-tabs-slider></v-tabs-slider>
                              <v-tab href="#date">
                                <v-icon>mdi-calendar</v-icon>
                              </v-tab>
                              <v-tab href="#time">
                                <v-icon>mdi-clock</v-icon>
                              </v-tab>

                              <v-tabs-items v-model="tab">
                                <v-tab-item value="date">
                                  <v-container fluid>
                                    <v-row justify="center">
                                      <v-date-picker
                                        v-model="
                                          editedTicket.problem_reported_ho_date
                                        "
                                      >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                          text
                                          :disabled="
                                            !editedTicket.problem_reported_ho_date
                                          "
                                          @click="nextTab"
                                          >OK</v-btn
                                        >
                                      </v-date-picker>
                                    </v-row>
                                  </v-container>
                                </v-tab-item>

                                <v-tab-item value="time">
                                  <v-container fluid>
                                    <v-row justify="center">
                                      <v-time-picker
                                        v-model="
                                          editedTicket.problem_reported_ho_time
                                        "
                                      >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                          :disabled="
                                            !editedTicket.problem_reported_ho_time
                                          "
                                          text
                                          @click="saveReportedToHO"
                                          >OK</v-btn
                                        >
                                      </v-time-picker>
                                    </v-row>
                                  </v-container>
                                </v-tab-item>
                              </v-tabs-items>
                            </v-tabs>
                          </v-card>
                        </v-dialog>
                      </v-col>
                      <v-col cols="4">
                        <v-dialog v-model="reportedToIspDialog" width="400">
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="editedTicket.problem_reported_isp"
                              :disabled="loadingStatus"
                              label="Problem Reported To ISP"
                              prepend-icon="event"
                              readonly
                              v-on="on"
                              clearable
                            ></v-text-field>
                          </template>
                          <v-card>
                            <v-card-title class="text-center justify-center"
                              >Problem Reported to ISP</v-card-title
                            >

                            <v-tabs v-model="tab" centered grow>
                              <v-tabs-slider></v-tabs-slider>
                              <v-tab href="#date">
                                <v-icon>mdi-calendar</v-icon>
                              </v-tab>
                              <v-tab href="#time">
                                <v-icon>mdi-clock</v-icon>
                              </v-tab>

                              <v-tabs-items v-model="tab">
                                <v-tab-item value="date">
                                  <v-container fluid>
                                    <v-row justify="center">
                                      <v-date-picker
                                        v-model="
                                          editedTicket.problem_reported_isp_date
                                        "
                                      >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                          text
                                          :disabled="
                                            !editedTicket.problem_reported_isp_date
                                          "
                                          @click="nextTab"
                                          >OK</v-btn
                                        >
                                      </v-date-picker>
                                    </v-row>
                                  </v-container>
                                </v-tab-item>

                                <v-tab-item value="time">
                                  <v-container fluid>
                                    <v-row justify="center">
                                      <v-time-picker
                                        v-model="
                                          editedTicket.problem_reported_isp_time
                                        "
                                      >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                          :disabled="
                                            !editedTicket.problem_reported_isp_time
                                          "
                                          text
                                          @click="saveReportedToISP"
                                          >OK</v-btn
                                        >
                                      </v-time-picker>
                                    </v-row>
                                  </v-container>
                                </v-tab-item>
                              </v-tabs-items>
                            </v-tabs>
                          </v-card>
                        </v-dialog>
                      </v-col>
                      <v-col cols="4">
                        <v-dialog
                          v-model="resolutionReportedDialog"
                          width="400"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              v-model="editedTicket.resolution_reported"
                              :disabled="loadingStatus"
                              label="Resolution Reported"
                              prepend-icon="event"
                              readonly
                              v-on="on"
                              clearable
                            ></v-text-field>
                          </template>
                          <v-card>
                            <v-card-title class="text-center justify-center"
                              >Resolution Reported</v-card-title
                            >

                            <v-tabs v-model="tab" centered grow>
                              <v-tabs-slider></v-tabs-slider>
                              <v-tab href="#date">
                                <v-icon>mdi-calendar</v-icon>
                              </v-tab>
                              <v-tab href="#time">
                                <v-icon>mdi-clock</v-icon>
                              </v-tab>

                              <v-tabs-items v-model="tab">
                                <v-tab-item value="date">
                                  <v-container fluid>
                                    <v-row justify="center">
                                      <v-date-picker
                                        v-model="
                                          editedTicket.resolution_reported_date
                                        "
                                      >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                          text
                                          :disabled="
                                            !editedTicket.resolution_reported_date
                                          "
                                          @click="nextTab"
                                          >OK</v-btn
                                        >
                                      </v-date-picker>
                                    </v-row>
                                  </v-container>
                                </v-tab-item>

                                <v-tab-item value="time">
                                  <v-container fluid>
                                    <v-row justify="center">
                                      <v-time-picker
                                        v-model="
                                          editedTicket.resolution_reported_time
                                        "
                                      >
                                        <v-spacer></v-spacer>
                                        <v-btn
                                          :disabled="
                                            !editedTicket.resolution_reported_time
                                          "
                                          text
                                          @click="saveResolutionReported"
                                          >OK</v-btn
                                        >
                                      </v-time-picker>
                                    </v-row>
                                  </v-container>
                                </v-tab-item>
                              </v-tabs-items>
                            </v-tabs>
                          </v-card>
                        </v-dialog>
                      </v-col>

                      <v-col cols="4">
                        <v-text-field
                          label="Provider Ticket #"
                          v-model="editedTicket.provider_ticket"
                          :disabled="loadingStatus"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="4">
                        <v-textarea
                          v-model="editedTicket.problem"
                          :error-messages="problemErrors"
                          :disabled="loadingStatus"
                          row-height="1"
                          auto-grow
                          label="Problem"
                        ></v-textarea>
                      </v-col>

                      <v-col cols="4">
                        <v-textarea
                          v-model="editedTicket.last_update"
                          :disabled="loadingStatus"
                          row-height="1"
                          auto-grow
                          label="Last update"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>

        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length + 1" class="text-xs-center">
            <v-list-item two-line="">
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.branch.name.toUpperCase() }}
                  ({{ item.ticket_number }})
                  <v-chip
                    small
                    :color="ticketStatus(item.status).statusColor"
                    text-color="white"
                  >
                    {{ ticketStatus(item.status).statusLabel }}
                  </v-chip>
                  <v-chip
                    label
                    class="ml-2"
                    v-if="item.survey"
                    small
                    :color="ticketRate(item.survey.rate).rateColor"
                    text-color="white"
                    outlined
                    :title="surveyRate(item.survey)"
                  >
                    {{ ticketRate(item.survey.rate).rateLabel }}
                  </v-chip>
                </v-list-item-title>

                <v-list-item-title>
                  {{ item.service_provider.name }}
                  {{ item.service_type.name }}
                  {{ item.service_category.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.problem }}
                </v-list-item-subtitle>

                <v-list-item-title>Logged By</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.user.name }}
                  {{ item.updated_by ? "/" + item.updated_by.name : "" }}
                </v-list-item-subtitle>

                <v-list-item-title>Reported By</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.reported_by_name }} ({{ item.reported_by_position }})
                </v-list-item-subtitle>

                <v-list-item-title>Confirmed By</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    item.confirmed_by
                      ? item.confirmed_by.full_name
                      : "Not yet confirmed"
                  }}
                </v-list-item-subtitle>

                <v-list-item-title>Problem Reported HO / ISP</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    moment(item.problem_reported_ho).format("MMM D, Y (h:mm a)")
                  }}
                  {{
                    item.problem_reported_isp
                      ? "/ " +
                        moment(item.problem_reported_isp).format(
                          "MMM D, Y (h:mm a)"
                        )
                      : "/ Not reported yet"
                  }}
                </v-list-item-subtitle>

                <v-list-item-title>Resolution Reported</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    item.resolution_reported
                      ? moment(item.resolution_reported).format(
                          "MMM D, Y (h:mm a)"
                        )
                      : "Not reported yet"
                  }}
                </v-list-item-subtitle>

                <v-list-item-title>Resolved</v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    ticketResolved(
                      item.problem_reported_ho,
                      item.resolution_reported
                    )
                  }}
                </v-list-item-subtitle>

                <v-list-item-title>Date Created / Updated</v-list-item-title>
                <v-list-item-subtitle>
                  {{ moment(item.created_at).format("MMM D, Y (h:mm a)") }} /
                  {{ moment(item.updated_at).format("MMM D, Y (h:mm a)") }}
                </v-list-item-subtitle>

                <v-list-item-title>Last Update</v-list-item-title>
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
            :disabled="tickets.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            small
            :color="ticketStatus(item.status).statusColor"
            text-color="white"
          >
            {{ ticketStatus(item.status).statusLabel }}
          </v-chip>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" title="Edit" @click="editTicket(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editTicket(item, 2)">
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
      search: "",
      tab: false,
      expand: false,
      selected: [],
      disabledCount: 0,
      reportedToHoDialog: false,
      reportedToIspDialog: false,
      resolutionReportedDialog: false,
      headers: [
        { text: "", align: "left", value: "expand", sortable: false },
        { text: "Ticket #", align: "left", value: "ticket_number" },
        { text: "Branch", align: "left", value: "branch.name" },
        { text: "Status", align: "left", value: "status" },
        { text: "Service Provider", align: " d-none", value: "service_provider.name" },
        { text: "Service Type", align: " d-none", value: "service_type.name" },
        { text: "Service Category", align: " d-none", value: "service_category.name" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedTicket: {
        branch: "",
        service_provider: "",
        service_type: "",
        service_category: "",

        problem_reported_ho_date: "",
        problem_reported_ho_time: "",
        problem_reported_ho: "",

        problem_reported_isp_date: "",
        problem_reported_isp_time: "",
        problem_reported_isp: "",

        resolution_reported_date: "",
        resolution_reported_time: "",
        resolution_reported: "",

        reported_by_name: "",
        reported_by_position: "",
        problem: "",
        last_update: "",
        provider_ticket: ""
      },
      defaultTicket: {
        branch: "",
        service_provider: "",
        service_type: "",
        service_category: "",

        problem_reported_ho_date: "",
        problem_reported_ho_time: "",
        problem_reported_ho: "",

        problem_reported_isp_date: "",
        problem_reported_isp_time: "",
        problem_reported_isp: "",

        resolution_reported_date: "",
        resolution_reported_time: "",
        resolution_reported: "",

        reported_by_name: "",
        reported_by_position: "",
        problem: "",
        last_update: "",
        provider_ticket: ""
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedTicket: {
      branch: { required },
      service_provider: { required },
      service_type: { required },
      service_category: { required },
      problem_reported_ho: { required },
      reported_by_name: { required },
      reported_by_position: { required },
      problem: { required }
    }
  },

  computed: {
    ...mapGetters({
      tickets: "connectivityTicket/getTickets",
      ticketErrors: "connectivityTicket/getTicketErrors",
      branches: "branch/getBranches",
      serviceTypes: "serviceType/getTypes",
      serviceCategories: "serviceCategory/getCategories",
      serviceProviders: "serviceProvider/getProviders"
    }), 

    dialog() {
       
       return this.$store.state.dialog;
     
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Ticket" : "Edit Ticket";
    },

    branchErrors() {
      const errors = [];
      if (!this.$v.editedTicket.branch.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["branch|required"]) {
        requiredError = this.ticketErrors["branch|required"];
      } else {
        requiredError = "The branch field is required.";
      }

      !this.$v.editedTicket.branch.required && errors.push(requiredError);
      return errors;
    },
    problemErrors() {
      const errors = [];
      if (!this.$v.editedTicket.problem.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["problem|required"]) {
        requiredError = this.ticketErrors["problem|required"];
      } else {
        requiredError = "The problem field is required.";
      }

      !this.$v.editedTicket.problem.required && errors.push(requiredError);
      return errors;
    },
    problemReportedErrors() {
      const errors = [];
      if (!this.$v.editedTicket.problem_reported_ho.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["problem_reported_ho|required"]) {
        requiredError = this.ticketErrors["problem_reported_ho|required"];
      } else {
        requiredError = "This field is required.";
      }

      !this.$v.editedTicket.problem_reported_ho.required &&
        errors.push(requiredError);
      return errors;
    },
    reportedByNameErrors() {
      const errors = [];
      if (!this.$v.editedTicket.reported_by_name.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["reported_by_name|required"]) {
        requiredError = this.ticketErrors["reported_by_name|required"];
      } else {
        requiredError = "This field is required.";
      }

      !this.$v.editedTicket.reported_by_name.required &&
        errors.push(requiredError);
      return errors;
    },
    reportedByPositionErrors() {
      const errors = [];
      if (!this.$v.editedTicket.reported_by_position.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["reported_by_position|required"]) {
        requiredError = this.ticketErrors["reported_by_position|required"];
      } else {
        requiredError = "This field is required.";
      }

      !this.$v.editedTicket.reported_by_position.required &&
        errors.push(requiredError);
      return errors;
    },
    serviceProviderErrors() {
      const errors = [];
      if (!this.$v.editedTicket.service_provider.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["service_provider|required"]) {
        requiredError = this.ticketErrors["service_provider|required"];
      } else {
        requiredError = "This field is required.";
      }

      !this.$v.editedTicket.service_provider.required &&
        errors.push(requiredError);
      return errors;
    },
    serviceTypeErrors() {
      const errors = [];
      if (!this.$v.editedTicket.service_type.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["service_type|required"]) {
        requiredError = this.ticketErrors["service_type|required"];
      } else {
        requiredError = "This field is required.";
      }

      !this.$v.editedTicket.service_type.required && errors.push(requiredError);
      return errors;
    },
    serviceCategoryErrors() {
      const errors = [];
      if (!this.$v.editedTicket.service_category.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["service_category|required"]) {
        requiredError = this.ticketErrors["service_category|required"];
      } else {
        requiredError = "This field is required.";
      }

      !this.$v.editedTicket.service_category.required &&
        errors.push(requiredError);
      return errors;
    }
  },

  watch: {
    tickets() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("connectivityTicket/fetchTickets");
    this.$store.dispatch("branch/fetchBranches");
    this.$store.dispatch("serviceType/fetchTypes");
    this.$store.dispatch("serviceCategory/fetchCategories");
    this.$store.dispatch("serviceProvider/fetchProviders");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("connectivityTicket/fetchTickets");
      this.$store.dispatch("branch/fetchBranches");
      this.$store.dispatch("serviceType/fetchTypes");
      this.$store.dispatch("serviceCategory/fetchCategories");
      this.$store.dispatch("serviceProvider/fetchProviders");
    },

    nextTab() {
      this.tab = "time";
    },

    saveReportedToHO() {
      this.tab = "date";
      this.reportedToHoDialog = false;
      var datetime = this.moment(
        this.editedTicket.problem_reported_ho_date +
          " " +
          this.editedTicket.problem_reported_ho_time
      ).format("YYYY-MM-DD HH:mm:ss");
      this.editedTicket.problem_reported_ho = datetime;
    },

    saveReportedToISP() {
      this.tab = "date";
      this.reportedToIspDialog = false;
      var datetime = this.moment(
        this.editedTicket.problem_reported_isp_date +
          " " +
          this.editedTicket.problem_reported_isp_time
      ).format("YYYY-MM-DD HH:mm:ss");
      this.editedTicket.problem_reported_isp = datetime;
    },

    saveResolutionReported() {
      this.tab = "date";
      this.resolutionReportedDialog = false;
      var datetime = this.moment(
        this.editedTicket.resolution_reported_date +
          " " +
          this.editedTicket.resolution_reported_time
      ).format("YYYY-MM-DD HH:mm:ss");
      this.editedTicket.resolution_reported = datetime;
    },

    ticketRate(rate) {
      var label = null;
      var color = null;
      if (rate == 1) {
        label = "Poor";
        color = "red";
      } else if (rate == 2) {
        label = "Needs Improvement";
        color = "orange";
      } else if (rate == 3) {
        label = "Satisfactory";
        color = "blue lighten-2";
      } else if (rate == 4) {
        label = "Very Good";
        color = "blue";
      } else if (rate == 5) {
        label = "Excellent";
        color = "green";
      }

      var computerRate = { rateColor: color, rateLabel: label };
      return computerRate;
    },

    surveyRate(payload) {
      var name = payload.rater.full_name;
      var remarks = payload.remarks;
      return name + ": " + remarks;
    },

    ticketResolved(from, to) {
      var resolution_date = to
        ? this.moment().format("YYYY-MM-DD HH:mm:ss")
        : to;
      var now = this.moment(from);
      var end = this.moment(resolution_date);
      var duration = this.moment.duration(end.diff(now));

      var days = duration._data.days;
      var hours = duration._data.hours;
      var minutes = duration._data.minutes;

      return days + " days, " + hours + " hours & " + minutes + " minutes";
    },

    ticketStatus(status) {
      var label = null;
      var color = null;
      if (status == 1) {
        label = "Open";
        color = "red";
      } else if (status == 2) {
        label = "Pending";
        color = "orange";
      } else {
        label = "Closed";
        color = "black";
      }

      var computedStatus = { statusColor: color, statusLabel: label };
      return computedStatus;
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedTicket = Object.assign({}, this.defaultTicket); // reset to default
      console.log(this.editedTicket);
      this.$store.dispatch("triggerDialog", true);
    },

    editTicket(ticket, action) {
      this.editedIndex = action == 2 ? -1 : this.tickets.indexOf(ticket); // set index: important
      this.editedTicket = Object.assign(
        {},
        {
          id: ticket.id,
          branch: ticket.branch.id,
          ticket_number: ticket.ticket_number,
          service_provider: ticket.service_provider.id,
          service_type: ticket.service_type.id,
          service_category: ticket.service_category.id,
          reported_by_name: ticket.reported_by_name,
          reported_by_position: ticket.reported_by_position,

          problem_reported_ho: ticket.problem_reported_ho,
          problem_reported_ho_date: this.moment(
            ticket.problem_reported_ho
          ).format("YYYY-MM-DD"),
          problem_reported_ho_time: this.moment(
            ticket.problem_reported_ho
          ).format("HH:mm:ss"),

          problem_reported_isp: ticket.problem_reported_isp,
          problem_reported_isp_date: this.moment(
            ticket.problem_reported_isp
          ).format("YYYY-MM-DD"),
          problem_reported_isp_time: this.moment(
            ticket.problem_reported_isp
          ).format("HH:mm:ss"),

          resolution_reported: ticket.resolution_reported,
          resolution_reported_date: this.moment(
            ticket.resolution_reported
          ).format("YYYY-MM-DD"),
          resolution_reported_time: this.moment(
            ticket.resolution_reported
          ).format("HH:mm:ss"),

          provider_ticket: ticket.provider_ticket,
          problem: ticket.problem,
          last_update: ticket.remarks
        }
      );
      this.$store.dispatch("triggerDialog", true);
    },

    deleteTickets() {
      const tickets = this.$data.selected;
      const ticketIds = tickets.map(ticket => {
        return ticket.id;
      });
      const ticketNumbers = tickets.map(ticket => {
        const lists = "<br />" + ticket.ticket_number;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            ticketNumbers,
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
            this.$store.dispatch("connectivityTicket/deleteTickets", ticketIds);
            this.$data.selected = []; // reset selected
          }
        });
    },

    close() {
      this.editedIndex = -1;
      this.editedTicket = {};
      console.log(this.editedTicket);
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },

    save() {
      this.$v.$touch();
      if (this.editedIndex > -1) {
        // update ticket
        this.$store.dispatch(
          "connectivityTicket/updateTicket",
          this.editedTicket
        );
      } else {
        // store ticket
        this.$store.dispatch(
          "connectivityTicket/storeTicket",
          this.editedTicket
        );
      }
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          self.selected.push(item);
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
