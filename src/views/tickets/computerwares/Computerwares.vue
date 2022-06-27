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
            <v-toolbar-title>Computerware Tickets</v-toolbar-title>
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

            <v-dialog persistent scrollable :value="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-text-field
                          v-model="editedTicket.ticket_number"
                          label="Ticket # (auto-generated)"
                          disabled
                          @input="$v.editedTicket.ticket_number.$touch()"
                        ></v-text-field>
                        <v-autocomplete
                          v-model="editedTicket.branch"
                          :error-messages="branchErrors"
                          :disabled="loadingStatus"
                          :items="branches"
                          item-text="name"
                          item-value="id"
                          label="Select Branch"
                        ></v-autocomplete>
                        <v-autocomplete
                          v-model="editedTicket.productItem"
                          :error-messages="productItemErrors"
                          :disabled="loadingStatus"
                          :items="productItems"
                          item-text="item"
                          item-value="id"
                          label="Select Product Item"
                        ></v-autocomplete>
                        <v-text-field
                          v-model="editedTicket.problem"
                          :error-messages="problemErrors"
                          label="Problem"
                          :disabled="loadingStatus"
                          @input="$v.editedTicket.problem.$touch()"
                        ></v-text-field>
                        <v-text-field
                          v-model="editedTicket.product_item_serial_number"
                          :error-messages="serialErrors"
                          label="Serial"
                          :disabled="loadingStatus"
                          @input="
                            $v.editedTicket.product_item_serial_number.$touch()
                          "
                        ></v-text-field>
                        <v-text-field
                          v-model="editedTicket.reported_by_name"
                          :error-messages="reportedByNameErrors"
                          label="Reported by"
                          :disabled="loadingStatus"
                          @input="$v.editedTicket.reported_by_name.$touch()"
                        ></v-text-field>
                        <v-text-field
                          v-model="editedTicket.reported_by_position"
                          :error-messages="reportedByPositionErrors"
                          label="Position"
                          :disabled="loadingStatus"
                          @input="$v.editedTicket.reported_by_position.$touch()"
                        ></v-text-field>
                        <v-text-field
                          v-model="editedTicket.assigned_tech"
                          :error-messages="assignedTechErrors"
                          label="Assign Tech."
                          :disabled="loadingStatus"
                          @input="$v.editedTicket.assigned_tech.$touch()"
                        ></v-text-field>
                        <v-textarea
                          auto-grow
                          row-height="1"
                          v-model="editedTicket.remarks"
                          :error-messages="remarksErrors"
                          label="Remarks"
                          :disabled="loadingStatus"
                          @input="$v.editedTicket.remarks.$touch()"
                        ></v-textarea>
                        <v-select
                          :items="reportStatus"
                          :error-messages="statusErrors"
                          :disabled="loadingStatus"
                          item-text="text"
                          item-value="id"
                          v-model="editedTicket.report_status"
                          label="Status"
                        ></v-select>
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
          <td :colspan="headers.length + 1" class="text-xs-center">
            <v-list-item two-line="">
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.branch.name.toUpperCase() }}
                  ({{ item.ticket_number }})
                  <v-chip
                    small
                    :color="item.report_status === 1 ? 'green' : 'red'"
                    text-color="white"
                  >
                    {{ item.report_status === 1 ? "Open" : "Closed" }}
                  </v-chip>
                </v-list-item-title>
                <v-list-item-title>
                  {{ item.item.brand.name }}
                  {{ item.item.category.name }}
                  ({{ item.item.model }})
                  - {{ item.product_item_serial_number }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.problem }}
                </v-list-item-subtitle>

                <v-list-item-title>Reported By</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.reported_by }}
                </v-list-item-subtitle>

                <v-list-item-title>Date Reported / Closed</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.date_reported }}
                  / {{ item.date_closed ? item.date_closed : 'Not closed' }}
                </v-list-item-subtitle>

                <v-list-item-title>Assigned Tech.</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.assigned_tech }}
                </v-list-item-subtitle>

                <v-list-item-title>Remarks</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.remarks ? item.remarks : 'N/A' }}
                </v-list-item-subtitle>

                <v-list-item-title>Logged By</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.logged_by.name }}
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

        <template v-slot:item.report_status="{ item }">
          <v-chip
            small
            :color="item.report_status === 1 ? 'green' : 'red'"
            text-color="white"
          >
            {{ item.report_status === 1 ? "Open" : "Closed" }}
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
      reportStatus: [
        { id: 1, text: "Open" },
        { id: 2, text: "Closed" }
      ],
      search: "",
      expand: false,
      selected: [],
      disabledCount: 0,
      headers: [
        { text: "", align: "left", value: "expand", sortable: false },
        { text: "Ticket #", align: "left", value: "ticket_number" },
        { text: "Branch", align: "left", value: "branch.name" },
        { text: "Status", align: "left", value: "report_status" },
        { text: "Product Item", align: " d-none", value: "item.model" },
        { text: "Product Category", align: " d-none", value: "item.category.name" },
        { text: "Product Brand", align: " d-none", value: "item.brand.name" },
        { text: "Serial", align: " d-none", value: "product_item_serial_number" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedTicket: {
        name: "",
        branch: "",
        productItem: "",
        loggedBy: "",
        problem: "",
        product_item_serial_number: "",
        reported_by_name: "",
        reported_by_position: "",
        date_reported: "",
        date_closed: "",
        assigned_tech: "",
        reported_status: "",
        remarks: ""
      },
      defaultTicket: {
        name: "",
        branch: "",
        productItem: "",
        loggedBy: "",
        problem: "",
        product_item_serial_number: "",
        reported_by_name: "",
        reported_by_position: "",
        date_reported: "",
        date_closed: "",
        assigned_tech: "",
        reported_status: "",
        remarks: ""
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedTicket: {
      branch: { required },
      productItem: { required },
      problem: { required },
      reported_by_name: { required },
      reported_by_position: { required },
      assigned_tech: { required },
      remarks: { required },
      report_status: { required },
      product_item_serial_number: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isSerial = this.tickets.filter(
            ticket => ticket.product_item_serial_number == value
          ).length;
          if (isSerial === 1) {
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
      tickets: "computerwareTicket/getTickets",
      ticketErrors: "computerwareTicket/getTicketErrors",
      branches: "branch/getBranches",
      productItems: "productItem/getItems"
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
    productItemErrors() {
      const errors = [];
      if (!this.$v.editedTicket.productItem.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["productItem|required"]) {
        requiredError = this.ticketErrors["productItem|required"];
      } else {
        requiredError = "The product item field is required.";
      }

      !this.$v.editedTicket.productItem.required && errors.push(requiredError);
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
    serialErrors() {
      const errors = [];
      if (!this.$v.editedTicket.product_item_serial_number.$dirty)
        return errors;

      var requiredError = null;
      if (this.ticketErrors["product_item_serial_number|required"]) {
        requiredError = this.ticketErrors[
          "product_item_serial_number|required"
        ];
      } else {
        requiredError = "The serial field is required.";
      }

      var uniqueError = null;
      if (this.ticketErrors["product_item_serial_number|unique"]) {
        uniqueError = this.ticketErrors["product_item_serial_number|unique"];
      } else {
        uniqueError = "The serial has already been taken.";
      }

      !this.$v.editedTicket.product_item_serial_number.required &&
        errors.push(requiredError);
      !this.$v.editedTicket.product_item_serial_number.isUnique &&
        errors.push(uniqueError);
      return errors;
    },
    reportedByNameErrors() {
      const errors = [];
      if (!this.$v.editedTicket.reported_by_name.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["reported_by_name|required"]) {
        requiredError = this.ticketErrors["reported_by_name|required"];
      } else {
        requiredError = "The reported by name field is required.";
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
        requiredError = "The reported by position field is required.";
      }

      !this.$v.editedTicket.reported_by_position.required &&
        errors.push(requiredError);
      return errors;
    },
    assignedTechErrors() {
      const errors = [];
      if (!this.$v.editedTicket.assigned_tech.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["assigned_tech|required"]) {
        requiredError = this.ticketErrors["assigned_tech|required"];
      } else {
        requiredError = "The assigned tech field is required.";
      }

      !this.$v.editedTicket.assigned_tech.required &&
        errors.push(requiredError);
      return errors;
    },
    remarksErrors() {
      const errors = [];
      if (!this.$v.editedTicket.remarks.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["remarks|required"]) {
        requiredError = this.ticketErrors["remarks|required"];
      } else {
        requiredError = "The remarks field is required.";
      }

      !this.$v.editedTicket.remarks.required && errors.push(requiredError);
      return errors;
    },
    statusErrors() {
      const errors = [];
      if (!this.$v.editedTicket.report_status.$dirty) return errors;

      var requiredError = null;
      if (this.ticketErrors["report_status|required"]) {
        requiredError = this.ticketErrors["report_status|required"];
      } else {
        requiredError = "The status field is required.";
      }

      !this.$v.editedTicket.report_status.required &&
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
    this.$store.dispatch("computerwareTicket/fetchTickets");
    this.$store.dispatch("branch/fetchBranches");
    this.$store.dispatch("productItem/fetchItems");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("computerwareTicket/fetchTickets");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedTicket = Object.assign({}, this.defaultTicket); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editTicket(ticket, action) {
      this.editedIndex = action == 2 ? -1 : this.tickets.indexOf(ticket); // set index: important
      this.editedTicket = Object.assign(
        {},
        {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          branch: ticket.branch.id,
          productItem: ticket.item.id,
          problem: ticket.problem,
          product_item_serial_number: ticket.product_item_serial_number,
          reported_by_name: ticket.reported_by_name,
          reported_by_position: ticket.reported_by_position,
          assigned_tech: ticket.assigned_tech,
          report_status: ticket.report_status,
          remarks: ticket.remarks
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
            this.$store.dispatch("computerwareTicket/deleteTickets", ticketIds);
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
        // update ticket
        this.$store.dispatch(
          "computerwareTicket/updateTicket",
          this.editedTicket
        );
      } else {
        // store ticket
        this.$store.dispatch(
          "computerwareTicket/storeTicket",
          this.editedTicket
        );
      }
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          // if(!item.branches.length > 0) {
          //   self.selected.push(item);
          // }
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
