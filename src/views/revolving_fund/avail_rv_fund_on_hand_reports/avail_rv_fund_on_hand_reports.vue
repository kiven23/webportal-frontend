<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loadingStatus"
        :search="search"
       
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Available Revolving Fund On Hand</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="refreshData()">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="printAvailRFOnHandReports()">
                  <v-icon>mdi-printer</v-icon>
                </v-btn>
              </template>
              <span>Print</span>
            </v-tooltip>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-toolbar>
        </template>
        <!-- <template v-slot:group.header="{ toggle, isOpen, group }">
          <th colspan="6">
            <v-icon :class="{ active: isOpen }" class="mr-2" @click="toggle">
              mdi-chevron-down
            </v-icon>
            {{ group.toUpperCase() }} BRANCH
          </th>
        </template> -->
        <template v-slot:item.revolving_fund="{ item }">
          <money-format
            :value="parseFloat(item.revolving_fund)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
        <template v-slot:item.cash_advances="{ item }">
          <money-format
            :value="parseFloat(item.cash_advances)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
        <template v-slot:item.avail_fund_on_hand="{ item }">
          <money-format
            :value="parseFloat(item.avail_fund_on_hand)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon @click="editDetails(item)"
            ><v-icon small>mdi-pencil</v-icon></v-btn
          >
          <v-btn icon @click="viewDetails(item)"
            ><v-icon small>mdi-eye</v-icon></v-btn
          >
          <v-btn icon @click="viewHistory(item)"
            ><v-icon small>mdi-history</v-icon></v-btn
          >
        </template>
        <template v-slot:footer>
          <v-divider></v-divider>
          <div class="d-flex my-2">
            <div class="ml-4" style="width:16.8em">Total</div>
            <div
              style="width:11em"
              class="ml-4 d-flex d-inline-block subtitle-1"
            >
              <money-format
                :value="parseFloat(rvFundsTotal)"
                locale="en"
                currency-code="PHP"
              >
              </money-format>
            </div>
            <div  style="width:10.7em" class="ml-4 d-flex subtitle-1">
              <money-format
                :value="parseFloat(rvCashAdvTotal)"
                locale="en"
                currency-code="PHP"
              >
              </money-format>
            </div>
            <div class="ml-4 d-flex d-inline-block  subtitle-1">
              <money-format
                :value="parseFloat(availRFundsTotal)"
                locale="en"
                currency-code="PHP"
              >
              </money-format>
            </div>
          </div>
        </template>
      </v-data-table>
      <v-dialog max-width="300" v-model="dialogs.edit_rf" persistent>
        <v-card>
          <v-card-title class="text-h6 mb-1">
            Update Fund
          </v-card-title>
          <v-card-subtitle class="pb-1" style="line-height: normal;"
            >Edit Fund of
            {{ selected_branch }} branch</v-card-subtitle
          >
          <v-card-text>
            <v-text-field
              v-model="fields.fund"
              :error-messages="validation_errors.fund"
              label="Revolving Fund"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              class="mt-4"
              v-model="fields.cash_advances"
              :error-messages="validation_errors.cash_advances"
              label="Cash Advances"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              class="mt-4"
              v-model="fields.cash_advances_or"
              label="OR#"
              hide-details="auto"
              v-if="fields.cash_advances == 0"
            ></v-text-field>
            <v-text-field
              v-model="fields.incoming"
              label="Incoming"
              hide-details="auto"
            ></v-text-field>
            <v-text-field
              class="mt-4"
              v-model="fields.outgoing"
              label="Outgoing"
              hide-details="auto"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseEditDetailsDialog()">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="saveDetailsDialog()">
              Update
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- Start - Summary of Revolving Fund Dialog -->
      <v-dialog
        v-model="dialogs.summary_of_rf"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar>
            <v-btn icon @click="dialogs.summary_of_rf = false; rvFundItemsPanel = []">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Summary of Revolving Fund</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn color="blue-grey" @click="printRvFundsSummary()">
                Print</v-btn
              >
            </v-toolbar-items>
          </v-toolbar>
         <v-list two-line>
            <v-list-item>
              <v-list-item-content>
                 <div class="d-flex">
                  <div class="d-flex align-center">
                    <span class="font-weight-bold mr-1">BRANCH:</span>
                    <span class="text-uppercase">{{
                      rv_fund_with_expense_items.branch
                    }}</span>
                  </div>
                  <div class="d-inline-flex align-center  ml-auto">
                    <span class="font-weight-bold mr-1">SUBMITTED DATE:</span>
                    <span>{{ rv_fund_with_expense_items.submitted_date }}</span>
                  </div>
                </div>
                 <div class="d-inline-flex align-center">
                  <span class="font-weight-bold mr-1">AS OF:</span>
                  <span>{{
                    moment(rv_fund_with_expense_items.as_of).format(
                      "MMM DD, YYYY"
                    )
                  }}</span>
                </div>
                <!-- <v-row>
                  <v-col cols="2">
                    <v-text-field
                      v-model="rv_fund_with_expense_items.branch"
                      disabled
                      label="Branch"
                      prepend-icon="mdi-store"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-menu
                      ref="as_of_date_view_menu"
                      v-model="menus_activator.as_of_date_view"
                      :close-on-content-click="false"
                      :return-value.sync="fields.rv_fund.as_of"
                      transition="scale-transition"
                      offset-y
                      min-width="auto"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          :value="formatDate(fields.rv_fund.as_of)"
                          label="As of Date"
                          prepend-icon="mdi-calendar"
                          :disabled="!isEditingRVFund"
                          readonly
                          clearable
                          @click:clear="fields.rv_fund.as_of = null"
                          v-bind="attrs"
                          v-on="on"
                          :error-messages="validation_errors.rv_fund.as_of"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="fields.rv_fund.as_of"
                        no-title
                        scrollable
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          text
                          color="primary"
                          @click="menus_activator.as_of_date_view = false"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          text
                          color="primary"
                          @click="
                            $refs.as_of_date_view_menu.save(
                              fields.rv_fund.as_of
                            )
                          "
                        >
                          OK
                        </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row> -->
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <div class="d-flex">
                  <div class="mr-auto">REVOLVING FUND:</div>
                  <div style="    margin-right: 8.5em;">
                     <money-format
                      class="d-inline-block"
                      :value="
                        parseFloat(
                         rv_fund_with_expense_items
                          .fund
                        )
                      "
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <div class="mr-auto d-flex align-center">
                    <span>CASH ADVANCES: Marketing Activities</span> 
                  </div>
                  <div style="    margin-right: 3.4em;">
                     <money-format
                      class="d-inline-block"
                      :value="
                        parseFloat(
                         rv_fund_with_expense_items
                          .cash_advances
                        )
                      "
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                  <div> 
                    <money-format
                      class="d-inline-block"
                      :value="
                        parseFloat(
                          getTotalOfRv
                        )
                      "
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-expansion-panels class="mt-5 px-2" v-model="rvFundItemsPanel" multiple>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div class="d-flex">
                  <div>
                    <span class="mr-1">Check Voucher Verification</span>
                  </div>
                  <div class="ml-auto align-self-center" style="margin-right:6.6em">
                    <span class="mr-1"> Total : </span>
                    <money-format
                      class="d-inline-block"
                      :value="
                        parseFloat(
                         this.rv_fund_with_expense_items
                          .check_voucher_verifications_total
                        )
                      "
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-simple-table fixed-header>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left" style="width:352px">Date Transmitted</th>
                        <th class="text-left" style="width:400px">CK#</th>
                        <th class="text-left" style="width: 200px">Status</th>
                        <th class="text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="chkVoucherVerifications.length == 0">
                        <td colspan="4">
                          No record found
                        </td>
                      </tr>
                      <tr
                        v-else
                        v-for="item in chkVoucherVerifications"
                        :key="`chk_voucher_verification_${item.id}`"
                      >
                        <td>
                          {{ moment(item.date_transmitted).format("MM/DD/YY") }}
                        </td>
                        <td>{{ item.ck_no }}</td>
                        <td>
                          {{ item.status }}
                        </td>
                        <td>
                          <money-format
                            :value="parseFloat(item.amount)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div class="d-flex">
                  <div>
                    <span> Check Voucher For Transmittal</span>
                  </div>
                  <div class="ml-auto align-self-center"  style="margin-right:6.6em">
                    <span class="mr-1">Total:</span>
                    <money-format
                      class="d-inline-block"
                      :value="
                        parseFloat(
                          this.rv_fund_with_expense_items
                            .check_voucher_for_transmittals_total
                        )
                      "
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-simple-table fixed-header>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left" style="width:350px">
                          Check Voucher Date
                        </th>
                        <th class="text-left" style="width:600px">CK#</th>
                        <th class="text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="chkVoucherForTransmittals.length == 0">
                        <td colspan="3">
                          No record found
                        </td>
                      </tr>
                      <tr
                        v-else
                        v-for="item in chkVoucherForTransmittals"
                        :key="`chk_voucher_for_transmittal_${item.id}`"
                      >
                        <td>
                          {{
                            moment(item.check_voucher_date).format("MM/DD/YY")
                          }}
                        </td>
                        <td>{{ item.ck_no }}</td>
                        <td>
                          <money-format
                            :value="parseFloat(item.amount)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div class="d-flex">
                  <div>
                    <span>Expenses For Check Preparation</span>
                  </div>
                  <div class="ml-auto align-self-center"  style="margin-right:6.6em">
                    <span class="mr-1">Total:</span>
                    <money-format
                      class="d-inline-block"
                      :value="
                        parseFloat(
                          this.rv_fund_with_expense_items
                          .expenses_for_check_preparations_total
                        )
                      "
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                </div>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-simple-table fixed-header>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left" style="width:350px">
                          PCV Date
                        </th>
                        <th class="text-left"  style="width:600px">Particulars</th>
                        <th class="text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="expensesForChkPreparations.length == 0">
                        <td colspan="3">
                          No record found
                        </td>
                      </tr>
                      <tr
                        v-else
                        v-for="item in expensesForChkPreparations"
                        :key="`expenses_for_chk_preparation_${item.id}`"
                      >
                        <td>
                          {{ moment(item.pcv_date).format("MM/DD/YY") }}
                        </td>
                        <td>{{ item.particulars }}</td>
                        <td>
                          <money-format
                            :value="parseFloat(item.amount)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <div class="text-right pb-2">
                   <money-format
                        :value="parseFloat(getTotalOfRvFundItems)"
                        locale="en"
                        currency-code="PHP"
                      >
                      </money-format>
                </div>
                <v-divider></v-divider>
                <div class="d-flex mt-1 text-h6">
                  <div class="font-weight-bold">AVAILABLE REVOLVING FUND ON HAND</div>
                  <div class="ml-auto font-weight-bold"> 
                    <money-format
                        :value="parseFloat(getAvailRVFundOnHand)"
                        locale="en"
                        currency-code="PHP"
                      >
                      </money-format>
                  </div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-dialog>
      <!-- End - Summary of Revolving Fund Dialog -->
         <!-- Preparation -->
      <v-dialog
        v-model="dialogHistory"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
      
        <v-card>
          <v-toolbar color="dark">
            <v-btn icon @click="dialogHistory = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{branch}} History</v-toolbar-title>
            
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark text @click="dialog = false"> Save </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-list three-line subheader>
            <v-subheader>
              Revolving Fund On Hand History 
            </v-subheader>
              
            <v-list-item>
              <v-list-item-content>
                <v-card>
          
                  <v-card-title>
                    <v-text-field
                      v-model="search"
                      append-icon="mdi-magnify"
                      label="Search"
                      single-line
                      hide-details
                    ></v-text-field>
                
                  </v-card-title>
                  <v-data-table
                    :headers="headers2"
                    :items="historyData"
                    :search="search"
                  >
                   <!-- <template v-slot:item.tin="{ item }">
                   
                      <strong>{{item.tin == 1? 'With BIR': 'None'}}</strong>
                    </template> -->
                  
                  
                  </v-data-table>
                </v-card>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-dialog>
      <!-- END Preparation-->
    </v-container>
  </div>
</template>
<script>
import MoneyFormat from "vue-money-format";
import { mapGetters } from "vuex";
export default {
  components: {
    "money-format": MoneyFormat,
  },
  mounted() {
    this.refreshData();
  },
  data() {
    return {
      headers: [
        {
          text: "BRANCH",
          value: "branch",
          width: "25%"
        },
        {
          text: "REVOLVING FUND",
          value: "revolving_fund",
        },
        {
          text: "CASH ADVANCES",
          value: "cash_advances",
        },
        {
          text: "AVAILABLE REVOLVING FUND ON HAND",
          value: "avail_fund_on_hand",
        },
        {
          text: "ACTIONS",
          value: "actions",
        },
      ],
        headers2: [ 
        {
          text: "REVOLVING FUND",
          value: "revolvingfund",
        },
         {
          text: "OR NUMBER",
          value: "ornumber",
        },
        {
          text: "CASH ADVANCES",
          value: "cashadvance",
        },
        {
          text: "BALANCE",
          value: "balance",
        },
        {
          text: "INCOMING",
          value: "incoming",
        },
           {
          text: "OUTGOING",
          value: "outgoing",
        },
           {
          text: "DATE CREATED",
          value: "created_at",
        },
         
      ],
      branch: "",
      search: "",
      dialogs: {
        edit_rf: false,
        summary_of_rf: false,
      },
      dialogHistory: false,
      fields: {
        fund: 0,
      },
      validation_errors: {},
      selected_index: -1,
      selected_branch: "",
      rvFundItemsPanel: [],
    };
  },
  methods: {
    refreshData() {
      this.$store.dispatch(
        "revolving_fund_avail_on_hand_reports/fetchAvailRvFundOnHandsReports"
      );
    },
    editDetails(item) {
      this.selected_index = this.items.indexOf(item);
      this.fields = {
        fund: item.revolving_fund,
        cash_advances: item.cash_advances,
        rv_fund_id: item.rv_fund_id,
        branch_id: item.id,
        cash_advances_or: item.or,
        incoming: 0,
        outgoing:  0
      };
      this.selected_branch = item.branch;
      this.dialogs.edit_rf = true;
    },
    saveCallRvOnHand(){
      
        this.$store
        .dispatch(
          "revolving_fund_avail_on_hand_reports/updateOrCreateRFund",
          this.fields
        )
        .then((res) => {
          this.validation_errors = {};
          let resStatus = res.status;
          let resData = res.data;
          if (resStatus == 422) {
            this.validation_errors = resData.errors;
          } else if (resStatus == 200) {
            let availRFOnHand = resData.availRVFundOnHand;
            let item = this.items[this.selected_index];
            item.rv_fund_id = availRFOnHand.id;
            item.revolving_fund = availRFOnHand.fund;
            item.cash_advances = availRFOnHand.cash_advances;
            item.avail_fund_on_hand = availRFOnHand.avail_fund_on_hand;
            let totalData = resData.totalData;
            if (totalData.rfTotal && totalData.availRfTotal) {
              this.$store.dispatch(
                "revolving_fund_avail_on_hand_reports/updateTotalData",
                totalData
              );
            }
            this.onCloseEditDetailsDialog();
          }
        });
    },
    saveDetailsDialog() {
      let ca = this.fields.cash_advances? this.fields.cash_advances: 0;
      if(ca == 0){
        this.fields.cash_advances = 0
        this.saveCallRvOnHand()
      }else{
        this.fields.cash_advances_or = null
        this.saveCallRvOnHand()
      }
      
    },
    onCloseEditDetailsDialog() {
      this.validation_errors = {};
      this.fields = {};
      this.dialogs.edit_rf = false;
    },
    viewHistory(item){
      this.$store.dispatch("revolving_fund_avail_on_hand_reports/historyData", item.branch)
      this.branch = item.branch
       this.dialogHistory = true
    },
    viewDetails(item) {
      if(! item.rv_fund_id) {
        this.$store.commit("SNACKBAR_STATUS", [
        {
          status: true,
          message: "Please set branch's revolving fund first.",
          timeout: 3000
        }
      ], { root: true });
      return
      }
      this.$store.dispatch("revolving_fund_list/viewRevolvingFund", {
        id: item.rv_fund_id,
      });
      this.dialogs.summary_of_rf = true;
    },
    printRvFundsSummary() {
      this.$store.dispatch("revolving_fund_list/printRvFundsSummary", {
        id: this.rv_fund_with_expense_items.id,
      });
    },
    printAvailRFOnHandReports(){
      this.$store.dispatch("revolving_fund_avail_on_hand_reports/printAvailRFOnHandReports");
    }
  },
  computed: {
    ...mapGetters({
      avail_rf_on_hands:
        "revolving_fund_avail_on_hand_reports/getAvailRvFundOnHands",
      rv_fund_with_expense_items:
        "revolving_fund_list/getRvFundWithExpenseItems",
      historyData: "revolving_fund_avail_on_hand_reports/getHistoryData"
    }),
    loadingStatus() {
      return this.$store.state.loading;
    },
    items() {
      return this.avail_rf_on_hands.items;
    },
    rvFundsTotal() {
      return this.avail_rf_on_hands.rf_total;
    },
    rvCashAdvTotal(){
      return this.avail_rf_on_hands.ca_total;
    },
    availRFundsTotal() {
      return this.avail_rf_on_hands.avail_rf_total;
    },
    getTotalOfRv() {
      let rv_fund = this.rv_fund_with_expense_items;
      return rv_fund
        ? parseFloat(
            parseFloat(rv_fund.fund || 0) +
              parseFloat(rv_fund.cash_advances || 0)
          ).toFixed(2)
        : 0;
    },
    getTotalOfRvFundItems() {
      return (
        parseFloat(this.chkVoucherVerificationsTotal) +
        parseFloat(this.chkVoucherForTransmittalsTotal) +
        parseFloat(this.expensesForChkPreparationsTotal)
      );
    },
    getAvailRVFundOnHand() {
      return parseFloat(this.getTotalOfRv - this.getTotalOfRvFundItems).toFixed(
        2
      );
    },
    chkVoucherVerifications() {
      return this.rv_fund_with_expense_items.check_voucher_verifications;
    },
    chkVoucherVerificationsTotal() {
      return this.rv_fund_with_expense_items.check_voucher_verifications_total;
    },
    chkVoucherForTransmittals() {
      return this.rv_fund_with_expense_items.check_voucher_for_transmittals;
    },
    chkVoucherForTransmittalsTotal() {
      return this.rv_fund_with_expense_items
        .check_voucher_for_transmittals_total;
    },
    expensesForChkPreparations() {
      return this.rv_fund_with_expense_items.expenses_for_check_preparations;
    },
    expensesForChkPreparationsTotal() {
      return this.rv_fund_with_expense_items
        .expenses_for_check_preparations_total;
    },
  },
};
</script>
<style scoped>
.v-row-group__header .v-icon.active {
  transform: rotate(-180deg);
}
</style>
