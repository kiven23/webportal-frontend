<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="incoming"
        :search="search"
        :loading="loadingStatus2"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Customer Installment Ledger</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on"><v-icon>print</v-icon></v-btn>
              </template>
              <span>Print</span>
            </v-tooltip> -->

            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <json-excel :data="providers">
                  <v-btn text icon v-on="on"
                    ><v-icon>mdi-file-export</v-icon></v-btn
                  >
                </json-excel>
              </template>
              <span>Export</span>
            </v-tooltip>  -->

            <!-- <v-autocomplete
              v-model="branch"
              :loading="loadingStatus"
              :items="branches"
              item-value="value"
              item-text="name"
              return-object
              dense
              label="Select Branch"
              chips
              hide-details
              hide-selected
              solo
              @change="get()"
            ></v-autocomplete> -->

            <v-text-field
              v-model="search"
              append-icon="search"
              label="Customer Name / Invoice"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <p class="text-center">
              <br /><strong
                >GRADE: {{ grade.grade }}
                <v-progress-circular
                  v-if="!grade.grade"
                  indeterminate
                  color="primary"
                ></v-progress-circular></strong
              ><br /><small> as of {{ new Date().toDateString() }}</small>
            </p>

            <v-dialog
              scrollable
              :value="dialog"
              width="800"
              hide-overlay
              transition="dialog-bottom-transition"
              persistent
            >
              <v-card>
                <v-car-title>
                  <v-toolbar>
                    <v-btn icon @click="close">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>
                      {{ name }}
                      <p style="font-size: 10px">
                        {{ address }}
                      </p>
                    </v-toolbar-title>

                    <v-toolbar-title
                      style="
                        text-transform: uppercase;
                        font-size: 12px;
                        font-weight: bold;
                      "
                      >{{ reportID }}</v-toolbar-title
                    >
                    <v-chip class="ma-5" color="green"
                      >DOCUMENT TYPE :<strong> {{ installment_type }}</strong>
                    </v-chip>
                    <v-chip class="ma-1" color="green"
                      >DOWNPAYMENT :
                      <strong>
                        <money-format
                          :value="
                            downpayment != 0.0 ? parseInt(downpayment) : 0
                          "
                          locale="en"
                          currency-code="PHP"
                        >
                        </money-format
                      ></strong>
                    </v-chip>

                    <v-spacer></v-spacer>
                  </v-toolbar>
                </v-car-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-data-table
                        :headers="headers2"
                        :items="installment"
                        :items-per-page="12"
                        :loading="loadingStatus"
                        class="elevation-1"
                      >
                        <template v-slot:item.Date="{ item }">
                          {{ new Date(item.Date).toDateString() }}
                        </template>
                        <template v-slot:item.Total="{ item }">
                          <money-format
                            :value="parseInt(item.Total)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                        <template v-slot:item.Payment="{ item }">
                          <money-format
                            :value="
                              item.Payment != 0.0 ? parseInt(item.Payment) : 0
                            "
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                        <template v-slot:item.SapEndingBalance="{ item }">
                          <money-format
                            :value="
                              item.SapEndingBalance != 0.0
                                ? parseInt(item.SapEndingBalance)
                                : 0
                            "
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                        <template v-slot:item.ManualEndingBalance="{ item }">
                          <v-text-field
                            v-if="item.DocStat == 'C'"
                            :label="item.ManualEndingBalance"
                            v-model="manualending[item.id]"
                            class="mt-4"
                            outlined
                            dense
                            @change="update(item)"
                          ></v-text-field>
                        </template>
                      </v-data-table>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-dialog>
            <v-dialog
              scrollable
              :value="dialog2"
              width="900"
              hide-overlay
              transition="dialog-bottom-transition"
              persistent
            >
              <v-card>
                <v-car-title>
                  <v-toolbar>
                    <v-btn icon @click="close">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title>
                      {{ name }}
                      <p style="font-size: 10px">
                        {{ address }}
                      </p></v-toolbar-title
                    >
                    <v-toolbar-title
                      style="
                        text-transform: uppercase;
                        font-size: 12px;
                        font-weight: bold;
                      "
                      >{{ reportID }}</v-toolbar-title
                    >
                    <v-spacer></v-spacer>
                  </v-toolbar>
                </v-car-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-data-table
                        :headers="headers3"
                        :items="installment"
                        :items-per-page="12"
                        :loading="loadingStatus"
                        class="elevation-1"
                      >
                        <template v-slot:item.Date="{ item }">
                          {{ new Date(item.Date).toDateString() }}
                        </template>
                        <template v-slot:item.Total="{ item }">
                          <money-format
                            :value="parseInt(item.Total)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                        <template v-slot:item.discrepancy="{ item }">
                          <money-format
                            :value="
                              parseInt(
                                item.SapEndingBalance - item.ManualEndingBalance
                              )
                            "
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>

                        <template v-slot:item.Payment="{ item }">
                          <money-format
                            :value="
                              item.Payment != 0.0 ? parseInt(item.Payment) : 0
                            "
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                        <template v-slot:item.SapEndingBalance="{ item }">
                          <money-format
                            :value="
                              item.SapEndingBalance != 0.0
                                ? parseInt(item.SapEndingBalance)
                                : 0
                            "
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                        <template v-slot:item.ManualEndingBalance="{ item }">
                          <money-format
                            :value="
                              item.ManualEndingBalance != null
                                ? parseInt(item.ManualEndingBalance)
                                : ''
                            "
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                      </v-data-table>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:item.Status="{ item }">
          <v-chip
            :color="item.Status == 'C' ? 'red' : 'green'"
            class="ma-2"
            label
            small
          >
            {{ item.Status == "C" ? "CLOSE" : "OPEN" }}
          </v-chip>
        </template>
        <template v-slot:item.action="{ item }">
          <!-- <v-icon
            small
            class="mr-2"
            @click="editArchived(item)"
             
          >
            mdi-pencil
          </v-icon> -->
          <v-icon small @click="view(item)" v-if="item.Installment !== 'CASH'">
            mdi-content-duplicate
          </v-icon>
        </template>
        <template v-slot:item.action="{ item }">
          <!-- <v-icon
            small
            class="mr-2"
            @click="editArchived(item)"
             
          >
            mdi-pencil
          </v-icon> -->
          <v-icon small @click="view(item)" v-if="item.Installment !== 'CASH'">
            mdi-content-duplicate
          </v-icon>
          <v-icon
            small
            @click="discyp(item)"
            v-if="item.Installment !== 'CASH'"
          >
            mdi-file
          </v-icon>
        </template>

        <template v-slot:item.Total="{ item }">
          <money-format
            :value="parseInt(item.Total)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
import MoneyFormat from "vue-money-format";
//import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
//import JsonExcel from "vue-json-excel";
export default {
  components: {
    // JsonExcel,
    "money-format": MoneyFormat,
  },

  mixins: [validationMixin],

  data() {
    return {
      installment_type: "",
      downpayment: "",
      name: "",
      address: "",
      branch: "",
      reveal: false,
      search: "",
      selected: [],
      loader: null,
      disabledCount: 0,
      submitDisable: true,
      headers: [
        { text: "CUSTOMER NAME", align: "left", value: "CustomerName" },
        { text: "INVOICE", align: "left", value: "InvoiceNumber" },
        { text: "DOCUMENT TYPE", align: "left", value: "Installment" },
        { text: "TOTAL", align: "left", value: "Total" },
        { text: "STATUS", align: "left", value: "Status" },
        { text: "ACTIONS", align: "center", value: "action", sortable: false },
      ],
      headers2: [
        { text: "DUEDATE", align: "left", value: "Date" },
        { text: "INSTALLMENT", align: "left", value: "Intallment" },
        { text: "INSTALLMENT DUE", align: "left", value: "Total" },
        { text: "PAYMENTS", align: "left", value: "Payment" },
        {
          text: "MANUAL ENDING BALANCE",
          align: "left",
          value: "ManualEndingBalance",
        },
      ],
      headers3: [
        { text: "DUEDATE", align: "left", value: "Date" },
        { text: "INSTALLMENT", align: "left", value: "Intallment" },
        { text: "INSTALLMENT DUE", align: "left", value: "Total" },
        { text: "PAYMENTS", align: "left", value: "Payment" },
        {
          text: "SAP ENDING BALANCE",
          align: "left",
          value: "SapEndingBalance",
        },
        {
          text: "MANUAL ENDING BALANCE",
          align: "left",
          value: "ManualEndingBalance",
        },
        {
          text: "DISCREPANCY",
          align: "left",
          value: "discrepancy",
        },
      ],
      manualending: [],
      editedIndex: -1,
      viewMode: false,
      viewOnly: 0,
      reportID: "",
      dialog2: false,
    };
  },

  computed: {
    ...mapGetters({
      branches: "digitized/getBranches",
      incoming: "recon/getIncoming",
      installment: "recon/getInstallment",
      grade: "recon/getbranchgrade",
    }),
    // deleteAll() {
    //   return this.permissions.includes("Delete Agencies File");
    // },
    // userCanCreate_role() {
    //   return this.permissions.includes("Create Agencies File");
    // },
    // ShowDoc_role() {
    //   return this.permissions.includes("Show Agencies File");
    // },
    // Editdoc_role() {
    //   return this.permissions.includes("Edit Agencies File");
    // },
    // Download_role() {
    //   return this.permissions.includes("Download Agencies Files");
    // },

    dialog() {
      return this.$store.state.dialog;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
    loadingStatus2() {
      return this.$store.state.loading2;
    },
  },

  watch: {
    providers() {
      this.$v.$reset(); // reset validation
    },
  },
  created() {
    this.$store.dispatch("recon/fetchIncoming");
    this.$store.dispatch("recon/ComputeBranchGrade");
    this.$store.dispatch("digitized/fetchbranches");
  },
  methods: {
    refreshData() {
      //   this.$store.dispatch("agencies/fetchAgencies");
    },
    openDialog() {
      //   this.viewOnly = 0;
      //   this.viewMode = false;
      //   this.refreshData();
      //   this.editedIndex = -1; // reset default
      this.$store.dispatch("triggerDialog", true);
    },
    getfile() {},

    view(data) {
      console.log(data);
      this.name = data.CustomerName;
      this.address = data.Address;
      this.downpayment = data.DownPayment;
      this.installment_type = data.Installment;

      this.$store.dispatch("recon/fetchInstallment", data);
      this.$store.dispatch("triggerDialog", true);
    },
    discyp(data) {
      this.name = data.CustomerName;
      this.address = data.Address;
      this.$store.dispatch("recon/fetchInstallment", data);
      this.dialog2 = true;
      //this.$store.dispatch("triggerDialog", true);
    },
    check() {
      // console.log(this.uploadData);
    },

    get() {
      this.$store.dispatch("recon/fetchIncoming", this.branch);
    },

    close() {
      this.manualending = [];
      this.editedIndex = -1;

      this.$store.dispatch("triggerDialog", false);
      this.dialog2 = false;
    },
    update(data) {
      let result = { id: data.id, value: this.manualending[data.id] };
      this.$store.dispatch("recon/updateManual", result);
    },
  },
};
</script>
<style>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>