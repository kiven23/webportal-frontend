<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <!-- Start - DataTable -->

      <v-data-table
        :headers="headers"
        :search="search"
        :items="revolving_funds"
        :loading="loadingStatus"
        group-by="branch"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            
            <v-toolbar-title>Revolving Fund</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <!-- <v-tooltip bottom v-if="canAddRvFunds">
              <template v-slot:activator="{ on }">
                <v-btn
                  text
                  icon
                  v-on="on"
                  @click="dialogs.add_revolving_fund = true"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>Add</span>
            </v-tooltip>
            <v-tooltip bottom v-if="canDeleteRvFunds">
              <template v-slot:activator="{ on }">
                <v-btn
                  :loading="deleting_on_progress"
                  :disabled="!selected_items.length > 0"
                  text
                  icon
                  v-on="on"
                  @click="deleteRvFunds()"
                  ><v-icon>delete</v-icon></v-btn
                >
              </template>
              <span>Delete</span>
            </v-tooltip> -->
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="refreshRvFunds()">
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
          </v-toolbar>
        </template>
        <template v-slot:group.header="{ toggle, isOpen, group }">
          <th colspan="6">
            <v-icon :class="{ active: isOpen }" class="mr-2" @click="toggle">
              mdi-chevron-down
            </v-icon>
            {{ group.toUpperCase() }} BRANCH
          </th>
        </template>
        <template v-slot:item.fund="{ item }">
          <money-format
            :value="parseFloat(item.fund)"
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
        <template v-slot:item.as_of="{ item }">
          {{ moment(item.as_of).format("MMM DD, YYYY") }}
        </template>
        <template v-slot:item.action="{ item }">
          <v-btn icon @click="viewRevolvingFund(item)"
            ><v-icon>mdi-eye</v-icon></v-btn
          >
        </template>
      </v-data-table>
      <!-- End - DataTable -->

      <!-- Start - Add Revolving Fund Dialog -->
      <!-- <v-dialog
        v-model="dialogs.add_revolving_fund"
        persistent
        max-width="400"
        v-if="canAddRvFunds"
      >
        <v-card>
          <v-card-title>Create New Record</v-card-title>
          <v-card-subtitle>Add new revolving fund</v-card-subtitle>
          <v-card-text>
            <v-menu
              ref="as_of_date_add_menu"
              v-model="menus_activator.as_of_date_add"
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
                  readonly
                  clearable
                  @click:clear="fields.rv_fund.as_of = null"
                  v-bind="attrs"
                  v-on="on"
                  :error-messages="validation_errors.rv_fund.as_of"
                ></v-text-field>
              </template>
              <v-date-picker v-model="fields.rv_fund.as_of" no-title scrollable>
                <v-spacer></v-spacer>
                <v-btn
                  text
                  color="primary"
                  @click="menus_activator.as_of_date_add = false"
                >
                  Cancel
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="$refs.as_of_date_add_menu.save(fields.rv_fund.as_of)"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
            <v-text-field
              v-model="fields.rv_fund.fund"
              label="Revolving Fund"
              prepend-icon="mdi-cash-multiple"
              :error-messages="validation_errors.rv_fund.fund"
            ></v-text-field>
            <v-text-field
              v-model="fields.rv_fund.cash_advances"
              label="Cash Advances"
              prepend-icon="mdi-cash-multiple"
              :error-messages="validation_errors.rv_fund.cash_advances"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseAddRVFundDialog()">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="addRevolvingFund()">
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
      <!-- End - Add Revolving Fund Dialog -->

      <!-- Start - Summary of Revolving Fund Dialog -->
      <v-dialog
        v-model="dialogs.view_revolving_fund"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar>
            <v-btn icon @click="onCloseViewRVFundDialog()">
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
                  <div class="d-inline-flex align-center ml-auto">
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
                  <div style="margin-right: 8.5em">
                    <money-format
                      class="d-inline-block"
                      :value="parseFloat(rv_fund_with_expense_items.fund)"
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                </div>
                <div class="d-flex align-center">
                  <div class="mr-auto d-flex align-center">
                    <span>CASH ADVANCES: Marketing Activities</span>
                    <v-btn
                      icon
                      small
                      @click="isEditingCashAdvances = true"
                      v-if="!isEditingCashAdvances && canEditCashAdvances"
                      ><v-icon small>mdi-pencil</v-icon></v-btn
                    >
                  </div>
                  <div style="margin-right: 3.4em">
                    <money-format
                      v-if="!isEditingCashAdvances"
                      class="d-inline-block"
                      :value="
                        parseFloat(rv_fund_with_expense_items.cash_advances)
                      "
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                    <div
                      class="d-flex align-center"
                      style="width: 160px"
                      v-if="isEditingCashAdvances && canEditCashAdvances"
                    >
                      <div class="align-self-center d-flex mt-1 ml-1">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              v-bind="attrs"
                              v-on="on"
                              @click="saveCashAdv()"
                              ><v-icon>mdi-content-save</v-icon></v-btn
                            >
                          </template>
                          <span>Save</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              icon
                              v-bind="attrs"
                              v-on="on"
                              @click="cancelUpdatingCashAdv()"
                              ><v-icon>mdi-close</v-icon></v-btn
                            >
                          </template>
                          <span>Cancel</span>
                        </v-tooltip>
                      </div>
                      <v-text-field
                        v-model="fields.rv_fund.cash_advances"
                        dense
                        reverse
                        single-line
                        hide-details="auto"
                        label="0.00"
                      ></v-text-field>
                    </div>
                  </div>
                  <div>
                    <money-format
                      class="d-inline-block"
                      :value="parseFloat(getTotalOfRv)"
                      locale="en"
                      currency-code="PHP"
                    >
                    </money-format>
                  </div>
                </div>
                <!-- <v-row>
                  <v-col cols="2">
                    <v-text-field
                      v-model="rv_fund_with_expense_items.fund"
                      label="Revolving Fund"
                      prepend-icon="mdi-cash-multiple"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-text-field
                      v-model="rv_fund_with_expense_items.cash_advances"
                      label="Cash Advances"
                      prepend-icon="mdi-cash-multiple"
                    ></v-text-field>
                  </v-col>
                </v-row> -->
                <!-- <v-row>
                  <v-col cols="2">
                    <v-text-field
                      v-model="fields.rv_fund.fund"
                      :disabled="!isEditingRVFund"
                      label="Revolving Fund"
                      prepend-icon="mdi-cash-multiple"
                      :error-messages="validation_errors.rv_fund.fund"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2">
                    <v-text-field
                      v-model="fields.rv_fund.cash_advances"
                      :disabled="!isEditingRVFund"
                      label="Cash Advances"
                      prepend-icon="mdi-cash-multiple"
                      :error-messages="validation_errors.rv_fund.cash_advances"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    class="align-center d-flex"
                    v-if="checkIfHasPermission('Edit Revolving Funds')"
                  >
                    <v-btn
                      v-if="!isEditingRVFund"
                      icon
                      class="align-self-center"
                      @click="isEditingRVFund = true"
                      ><v-icon>mdi-pencil</v-icon></v-btn
                    >
                    <div v-else>
                      <v-btn
                        icon
                        class="align-self-center"
                        @click="updateRevolvingFund()"
                        ><v-icon>mdi-content-save</v-icon></v-btn
                      >
                      <v-btn
                        icon
                        class="align-self-center"
                        @click="cancelUpdatingRvFund()"
                        ><v-icon>mdi-close</v-icon></v-btn
                      >
                    </div>
                  </v-col>
                </v-row> -->
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-expansion-panels
            class="mt-5 px-2"
            v-model="rvFundItemsPanel"
            multiple
          >
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div class="d-flex">
                  <div>
                    <span class="mr-1">Check Voucher Verification</span>
                    <v-btn
                      icon
                      @click.native.stop="
                        dialogs.add_edit_chk_voucher_verification = true
                      "
                      v-if="canAddRvFundExpenses"
                    >
                      <v-icon>mdi-plus-circle</v-icon>
                    </v-btn>
                  </div>
                  <div
                    class="ml-auto align-self-center"
                    style="margin-right: 6.5em"
                  >    
                  <v-btn @click="ckHistory()" style="margin: 5px"
                      >History</v-btn
                    >
                   <v-btn @click="Transmittal()" style="margin: 5px"
                      >Print Transmittal</v-btn
                    >
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
                        <th
                          class="text-left"
                          :style="
                            canHaveActionInRvFundExpenses ? '' : 'width:330px'
                          "
                        >
                          Date Transmitted
                        </th>
                        <th class="text-left" style="width: 350px">CK#</th>
                        <th
                          class="text-left"
                          :style="
                            canHaveActionInRvFundExpenses ? '' : 'width:300px'
                          "
                        >
                          Status
                        </th>
                        <th
                          class="text-left"
                          :style="
                            canHaveActionInRvFundExpenses ? 'width:268px' : ''
                          "
                        >
                          Amount
                        </th>
                        <th
                          :style="{
                            width:
                              (canHaveActionInRvFundExpenses ? '123' : '100') +
                              'px',
                          }"
                          class="text-left"
                          v-if="canHaveActionInRvFundExpenses"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="chkVoucherVerifications.length == 0">
                        <td :colspan="canHaveActionInRvFundExpenses ? 5 : 4">
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
                               <v-checkbox
                                v-model="toprintstat[item.id]"
                                @change="updatevalue(item.id)"
                                label="Print"
                              ></v-checkbox> 
                        </td>
                        <td>{{ item.ck_no }}</td>
                        <td>
                          {{ item.status }}
                          <v-btn
                            v-if="canEditRvFundExpensesStat"
                            icon
                            small
                            @click="editChkVoucherVerificationStatus(item)"
                            ><v-icon small>mdi-pencil</v-icon></v-btn
                          >
                        </td>
                        
                        <td>
                          <money-format
                            :value="parseFloat(item.amount)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </td>
                        <td v-if="canHaveActionInRvFundExpenses">
                          <v-btn
                            icon
                            small
                            @click="editCheckVoucherVerification(item)"
                            v-if="canEditRvFundExpenses"
                            :disabled="item.status == 'Transmittal'"
                            ><v-icon small>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            small
                            @click="deleteChkVerification(item)"
                            v-if="canDeleteRvFundExpenses"
                            :disabled="item.status == 'Pending'"
                            ><v-icon small>mdi-check</v-icon>
                          </v-btn>
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
                    <span class="mr-1">Check Voucher For Transmittal</span>
                    <v-btn
                      icon
                      @click.native.stop="
                        dialogs.add_edit_chk_voucher_for_trans = true
                      "
                      v-if="canAddRvFundExpenses"
                    >
                      <v-icon>mdi-plus-circle</v-icon>
                    </v-btn>
                  </div>
                  <div
                    class="ml-auto align-self-center"
                    style="margin-right: 6.5em"
                  >
                    <span class="mr-1"> Total : </span>
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
                        <th
                          class="text-left"
                          :style="{
                            width:
                              (canHaveActionInRvFundExpenses ? '370' : '328') +
                              'px',
                          }"
                        >
                          Check Voucher Date
                        </th>
                        <th class="text-left">CK#</th>
                        <th
                          class="text-left"
                          :style="{
                            width:
                              (canHaveActionInRvFundExpenses ? '270' : '376') +
                              'px',
                          }"
                        >
                          Amount
                        </th>
                        <th
                          style="width: 120px"
                          class="text-left"
                          v-if="canHaveActionInRvFundExpenses"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="chkVoucherForTransmittals.length == 0">
                        <td :colspan="canHaveActionInRvFundExpenses ? 4 : 3">
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
                        <td v-if="canHaveActionInRvFundExpenses">
                          <v-btn
                            v-if="canEditRvFundExpenses"
                            icon
                            small
                            @click="editCheckVoucherForTrans(item)"
                            ><v-icon small>mdi-pencil</v-icon></v-btn
                          >
                          <v-btn
                            v-if="canDeleteRvFundExpenses"
                            icon
                            small
                            @click="deleteChkVoucherForTrans(item)"
                            ><v-icon small>mdi-delete</v-icon></v-btn
                          >
                          <v-tooltip bottom v-if="canTransmitRvFundExpenses">
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                icon
                                small
                                v-bind="attrs"
                                v-on="on"
                                @click="transmitChkVoucher(item)"
                              >
                                <v-icon small>mdi-truck-outline</v-icon>
                              </v-btn>
                            </template>
                            <span>Transmit</span>
                          </v-tooltip>
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
                    <span class="mr-1">Expenses For Check Preparation</span>
                    <v-btn
                      class="mr-1"
                      icon
                      @click.native.stop="
                        dialogs.add_edit_expenses_for_chk_prep = true
                      "
                      v-if="canAddRvFundExpenses"
                    >
                      <v-icon>mdi-plus-circle</v-icon>
                    </v-btn>
                    <v-btn
                      class="align-self-center"
                      depressed
                      small
                      outlined
                      tile
                      @click.native.stop="dialogs.replenish_expenses = true"
                      :disabled="selected_expenses.length == 0"
                      v-if="canReplenishRvFundExpenses"
                      >Replenish</v-btn
                    >
                  </div>
                  <div
                    class="ml-auto align-self-center"
                    style="margin-right: 6.5em"
                  >
                    <v-btn @click="expensesHistory()" style="margin: 5px"
                      >History</v-btn
                    >
                    <span class="mr-1"> Total : </span>
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
                        <th
                          style="width: 5px"
                          v-if="canReplenishRvFundExpenses"
                        >
                          <v-checkbox
                            @click="selectAllExpenses()"
                            v-model="select_all_expenses"
                            :indeterminate="
                              selected_expenses.length > 0 &&
                              selected_expenses.length <
                                expensesForChkPreparations.length
                            "
                          ></v-checkbox>
                        </th>
                        <th
                          class="text-left"
                          :style="{
                            width:
                              (canHaveActionInRvFundExpenses ? '305' : '328') +
                              'px',
                          }"
                        >
                          PCV Date
                        </th>
                        <th
                          class="text-left"
                          :style="{
                            width:
                              (canHaveActionInRvFundExpenses ? '305' : '328') +
                              'px',
                          }"
                        >
                          PAYEE
                        </th>
                        <th
                          class="text-left"
                          :style="{
                            width:
                              (canHaveActionInRvFundExpenses ? '305' : '328') +
                              'px',
                          }"
                        >
                          GL Account
                        </th>
                        <th class="text-left">BIR</th>
                        <th
                          class="text-left"
                          :style="{
                            width:
                              (canHaveActionInRvFundExpenses ? '270' : '374') +
                              'px',
                          }"
                        >
                          Amount
                        </th>
                        <th
                          style="width: 120px"
                          class="text-left"
                          v-if="canHaveActionInRvFundExpenses"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-if="expensesForChkPreparations.length == 0">
                        <td :colspan="canHaveActionInRvFundExpenses ? 5 : 4">
                          No record found
                        </td>
                      </tr>
                      <tr
                        v-else
                        v-for="item in expensesForChkPreparations"
                        :key="`expenses_for_chk_preparation_${item.id}`"
                      >
                        <td v-if="canReplenishRvFundExpenses">
                          <v-checkbox
                            v-model="selected_expenses"
                            :value="item"
                          ></v-checkbox>
                        </td>
                        <td>
                          {{ moment(item.pcv_date).format("MM/DD/YY") }}
                        </td>
                        <td>{{ item.payee }}</td>
                        <td>{{ item.glaccounts }}</td>
                        <td>
                          <h1 v-if="item.tin == 1">&#10003;</h1>
                          <h3 v-if="item.tin == 0">None</h3>
                        </td>
                        <td>
                          <money-format
                            :value="parseFloat(item.amount)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </td>
                        <td v-if="canHaveActionInRvFundExpenses">
                          <v-btn
                            v-if="canEditRvFundExpenses"
                            icon
                            small
                            @click="editExpenseForChkPrep(item)"
                            ><v-icon small>mdi-pencil</v-icon></v-btn
                          >
                          <v-btn
                            v-if="canDeleteRvFundExpenses"
                            icon
                            small
                            @click="deleteExpenseForChkPrep(item)"
                            ><v-icon small>mdi-delete</v-icon></v-btn
                          >
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
                  <div class="font-weight-bold">
                    AVAILABLE REVOLVING FUND ON HAND
                  </div>
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

      <!-- Start - Add/Edit Check Voucher Verification Dialog -->
      <v-dialog
        v-if="canAddRvFundExpenses"
        v-model="dialogs.add_edit_chk_voucher_verification"
        max-width="400"
        persistent
      >
        <v-card>
          <v-card-title>{{
            !this.isEditingRVFundItems ? "Create New Record" : "Update Record"
          }}</v-card-title>
          <v-card-subtitle>{{
            !this.isEditingRVFundItems
              ? "Add new check voucher verification"
              : "Update check voucher verification"
          }}</v-card-subtitle>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-menu
                    ref="date_transmitted_menu"
                    v-model="menus_activator.date_transmitted"
                    :close-on-content-click="false"
                    :return-value.sync="
                      fields.chk_voucher_verification.date_transmitted
                    "
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        dense
                        :value="
                          formatDate(
                            fields.chk_voucher_verification.date_transmitted
                          )
                        "
                        label="As of Date"
                        prepend-icon="mdi-calendar"
                        readonly
                        clearable
                        hide-details="auto"
                        @click:clear="
                          fields.chk_voucher_verification.date_transmitted =
                            null
                        "
                        v-bind="attrs"
                        v-on="on"
                        :error-messages="
                          validation_errors.chk_voucher_verification
                            .date_transmitted
                        "
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="fields.chk_voucher_verification.date_transmitted"
                      no-title
                      scrollable
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="menus_activator.date_transmitted = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="
                          $refs.date_transmitted_menu.save(
                            fields.chk_voucher_verification.date_transmitted
                          )
                        "
                      >
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    dense
                    v-model="fields.chk_voucher_verification.ck_no"
                    label="Check no"
                    prepend-icon="mdi-checkbook"
                    hide-details="auto"
                    :error-messages="
                      validation_errors.chk_voucher_verification.ck_no
                    "
                  ></v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    dense
                    v-model="fields.chk_voucher_verification.amount"
                    :error-messages="
                      validation_errors.chk_voucher_verification.amount
                    "
                    label="Amount"
                    prepend-icon="mdi-cash-multiple"
                    hide-details="auto"
                  ></v-text-field>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseChkVoucherVerificationDialog()">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="saveCheckVoucherVerification()">
              {{ !this.isEditingRVFundItems ? "Add" : "Update" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End - Add/Edit Check Voucher Verification Dialog -->

      <!-- Start - Update Check Voucher Verification Status Dialog -->
      <v-dialog
        v-if="canEditRvFundExpensesStat"
        persistent
        max-width="320"
        v-model="dialogs.status_chk_voucher_verification"
      >
        <v-card>
          <v-card-title> Update Status </v-card-title>
          <v-card-subtitle>Update check verification status</v-card-subtitle>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-select
                    dense
                    v-model="fields.chk_voucher_verification.status"
                    hide-details="auto"
                    prepend-icon="mdi-truck-delivery"
                    :items="status"
                    label="Status"
                  ></v-select>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseChkVoucherVerificationStatDialog()">
              Cancel
            </v-btn>

            <v-btn
              color="primary"
              text
              @click="updateChkVoucherVerificationStatus()"
            >
              Update
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End - Update Check Voucher Verification Status Dialog -->

      <!-- Start - Add/Edit Check Voucher for Transmittal  Dialog -->
      <v-dialog
        v-if="canAddRvFundExpenses"
        v-model="dialogs.add_edit_chk_voucher_for_trans"
        max-width="400"
        persistent
      >
        <v-card>
          <v-card-title>{{
            !this.isEditingRVFundItems ? "Create New Record" : "Update Record"
          }}</v-card-title>
          <v-card-subtitle>{{
            !this.isEditingRVFundItems
              ? "Add new check voucher for transmittal"
              : "Update check voucher for transmittal"
          }}</v-card-subtitle>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-menu
                    ref="check_voucher_date_menu"
                    v-model="menus_activator.check_voucher_date"
                    :close-on-content-click="false"
                    :return-value.sync="
                      fields.chk_voucher_for_trans.check_voucher_date
                    "
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        dense
                        :value="
                          formatDate(
                            fields.chk_voucher_for_trans.check_voucher_date
                          )
                        "
                        label="Check Voucher Date"
                        prepend-icon="mdi-calendar"
                        readonly
                        clearable
                        hide-details="auto"
                        @click:clear="
                          fields.chk_voucher_for_trans.check_voucher_date = null
                        "
                        v-bind="attrs"
                        v-on="on"
                        :error-messages="
                          validation_errors.chk_voucher_for_trans
                            .check_voucher_date
                        "
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="fields.chk_voucher_for_trans.check_voucher_date"
                      no-title
                      scrollable
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="menus_activator.check_voucher_date = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="
                          $refs.check_voucher_date_menu.save(
                            fields.chk_voucher_for_trans.check_voucher_date
                          )
                        "
                      >
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    dense
                    v-model="fields.chk_voucher_for_trans.ck_no"
                    label="Check no"
                    prepend-icon="mdi-checkbook"
                    hide-details="auto"
                    :error-messages="
                      validation_errors.chk_voucher_for_trans.ck_no
                    "
                  ></v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    dense
                    v-model="fields.chk_voucher_for_trans.amount"
                    :error-messages="
                      validation_errors.chk_voucher_for_trans.amount
                    "
                    label="Amount"
                    prepend-icon="mdi-cash-multiple"
                    hide-details="auto"
                  ></v-text-field>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseChkVoucherForTransDialog()">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="saveCheckVoucherForTrans()">
              {{ !this.isEditingRVFundItems ? "Add" : "Update" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End - Add/Edit Check Voucher for Transmittal  Dialog -->

      <!-- Start - Add/Edit Expenses for Check Preparation Dialog -->
      <v-dialog
        v-if="canAddRvFundExpenses"
        v-model="dialogs.add_edit_expenses_for_chk_prep"
        max-width="400"
        persistent
      >
        <v-card>
          <v-card-title>{{
            !this.isEditingRVFundItems ? "Create New Record" : "Update Record"
          }}</v-card-title>
          <v-card-subtitle>{{
            !this.isEditingRVFundItems
              ? "Add new expense for check preparation"
              : "Update expense for check preparation"
          }}</v-card-subtitle>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-menu
                    ref="pcv_date_menu"
                    v-model="menus_activator.pcv_date"
                    :close-on-content-click="false"
                    :return-value.sync="fields.expense_for_chk_prep.pcv_date"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        dense
                        :value="
                          formatDate(fields.expense_for_chk_prep.pcv_date)
                        "
                        label="PCV Date"
                        prepend-icon="mdi-calendar"
                        readonly
                        clearable
                        hide-details="auto"
                        @click:clear="
                          fields.expense_for_chk_prep.pcv_date = null
                        "
                        v-bind="attrs"
                        v-on="on"
                        :error-messages="
                          validation_errors.expense_for_chk_prep.pcv_date
                        "
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="fields.expense_for_chk_prep.pcv_date"
                      no-title
                      scrollable
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="menus_activator.pcv_date = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="
                          $refs.pcv_date_menu.save(
                            fields.expense_for_chk_prep.pcv_date
                          )
                        "
                      >
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-menu>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-autocomplete
                    dense
                    v-model="fields.expense_for_chk_prep.glaccounts"
                    hide-details="auto"
                    prepend-icon="mdi-truck-delivery"
                    :items="glaccountList.data"
                    item-text="AcctName"
                    item-value="AcctName"
                    label="GL Account"
                  ></v-autocomplete>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <!-- <v-text-field
                    dense
                    v-model="fields.expense_for_chk_prep.particulars"
                    label="Particulars"
                    prepend-icon="mdi-clipboard-list-outline"
                    hide-details="auto"
                    :error-messages="
                      validation_errors.expense_for_chk_prep.particulars
                    "
                  ></v-text-field> -->
                  <v-checkbox
                    v-model="fields.expense_for_chk_prep.tin"
                    label="w/TIN"
                  ></v-checkbox>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    dense
                    v-model="fields.expense_for_chk_prep.payee"
                    :error-messages="
                      validation_errors.expense_for_chk_prep.amount
                    "
                    label="Payee"
                    prepend-icon="mdi-account"
                    hide-details="auto"
                  ></v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-text-field
                    dense
                    v-model="fields.expense_for_chk_prep.amount"
                    :error-messages="
                      validation_errors.expense_for_chk_prep.amount
                    "
                    label="Amount"
                    prepend-icon="mdi-cash-multiple"
                    hide-details="auto"
                  ></v-text-field>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseExpenseForChkPrepDialog()">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="saveExpenseForChkPrep()">
              {{ !this.isEditingRVFundItems ? "Add" : "Update" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End - Add/Edit Expenses for Check Preparation Dialog -->

      <!-- Start - Replenish Expenses Dialog -->
      <v-dialog v-model="dialogs.replenish_expenses" max-width="550" persistent>
        <v-card>
          <v-card-title>Replenish Expenses</v-card-title>
          <v-card-subtitle class="pb-1"
            >Replenishing expenses for check preparation</v-card-subtitle
          >
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-menu
                  ref="replenish_chk_voucher_date_menu"
                  v-model="menus_activator.replenish_chk_voucher_date"
                  :close-on-content-click="false"
                  :return-value.sync="
                    fields.replenish_expenses.check_voucher_date
                  "
                  transition="scale-transition"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      :value="
                        formatDate(fields.replenish_expenses.check_voucher_date)
                      "
                      label="Check Voucher Date"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      clearable
                      hide-details="auto"
                      @click:clear="
                        fields.replenish_expenses.check_voucher_date = null
                      "
                      v-bind="attrs"
                      v-on="on"
                      :error-messages="
                        validation_errors.replenish_expenses.check_voucher_date
                      "
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="fields.replenish_expenses.check_voucher_date"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="
                        menus_activator.replenish_chk_voucher_date = false
                      "
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="
                        $refs.replenish_chk_voucher_date_menu.save(
                          fields.replenish_expenses.check_voucher_date
                        )
                      "
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="fields.replenish_expenses.ck_no"
                  label="Check No"
                  prepend-inner-icon="mdi-checkbook"
                  hide-details="auto"
                  :error-messages="validation_errors.replenish_expenses.ck_no"
                ></v-text-field>
              </v-col>
            </v-row>
            <div class="text-body-1 mt-5 mb-1">Particulars</div>
            <div
              v-for="(item, index) in selected_expenses"
              :key="item.id"
              class="d-flex text-body-2"
            >
              <div class="mr-1">{{ `${index + 1}) ` }}</div>
              <div>{{ item.particulars }}</div>
              <div class="ml-auto">
                <money-format
                  :value="parseFloat(item.amount)"
                  locale="en"
                  currency-code="PHP"
                ></money-format>
              </div>
            </div>
            <v-divider></v-divider>
            <div class="d-flex mt-1 text-body-1">
              <div class="t">Total</div>
              <div class="ml-auto">
                <money-format
                  :value="parseFloat(getSelectedExpensesTotal)"
                  locale="en"
                  currency-code="PHP"
                ></money-format>
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="onCloseReplenishExpensesDialog()">
              Cancel
            </v-btn>

            <v-btn color="primary" text @click="replenishExpenses()">
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End - Replenish Expenses Dialog Dialog -->
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
            <v-toolbar-title
              >{{ rv_fund_with_expense_items.branch }} History</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-toolbar-item>
              <v-menu
               v-if="historyIdentify.iden == 0"
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                :return-value.sync="date"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="date"
                    prepend-icon="mdi-calendar"
                    readonly
                    dense

                    style="margin-top: 10px"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker v-model="date" type="month" no-title scrollable>
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="menu = false">
                    Cancel
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.menu.save(date) || searchDate()"
                  >
                    OK
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-toolbar-item>
            <v-toolbar-items>
              <v-btn  v-if="historyIdentify.iden == 0" text @click="printBIR(rv_fund_with_expense_items.branch)">
                Print
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-list three-line subheader>
            <v-subheader>{{historyIdentify.title}}</v-subheader>
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
                    <v-checkbox
                    v-if="historyIdentify.iden == 0"
                      v-model="FilterBIR"
                      :label="FilterBIR == true ? 'With BIR' : 'ALL/With BIR'"
                      @click="filterbir"
                    ></v-checkbox>
                  </v-card-title>
                  <v-data-table
                    :headers="headers2"
                    :items="historyDATA"
                    :search="search"
                  >
                    <template v-slot:item.tin="{ item }">
                      <strong>{{ item.tin == 1 ? "With BIR" : "None" }}</strong>
                    </template>
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
import moment from "moment";
import { mapGetters } from "vuex";
export default {
  components: {
    "money-format": MoneyFormat,
  },
  mounted() {
    //this.$store.dispatch("revolving_fund_list/resetRvFundWithExpenseItems")
    this.$store.dispatch("userPermissions/fetchPermission");
    this.refreshRvFunds();
    this.$store.dispatch("revolving_fund_list/fetchGLaccount");
  },
  data() {
    return {
      toprintstat: [],
      date: new Date().toISOString().substr(0, 7),
      menu: false,
      modal: false,
      value: { tin: 1, date: new Date().toISOString().substr(0, 7)},
      headers: [
        {
          text: "BRANCH",
          value: "branch",
        },
        {
          text: "REVOLVING FUND",
          value: "fund",
        },
        {
          text: "CASH ADVANCES",
          value: "cash_advances",
        },
        {
          text: "AS OF DATE",
          value: "as_of",
        },
        {
          text: "SUBMITTED DATE",
          value: "submitted_date",
        },
        {
          text: "ACTION",
          value: "action",
          sortable: false,
        },
      ],
      historyIdentify: {},
      headers2: [],
      historyDATA: [],
      FilterBIR: false,
      search: "",
      selected_items: [],
      withBIR: false,
      dialogHistory: false,
      dialogs: {
        // add_revolving_fund: false,
        view_revolving_fund: false,

        add_edit_chk_voucher_verification: false,
        status_chk_voucher_verification: false,

        add_edit_chk_voucher_for_trans: false,

        add_edit_expenses_for_chk_prep: false,
        replenish_expenses: false,
      },
      fields: {
        rv_fund: {
          cash_advances: 0.0,
        },
        chk_voucher_verification: {
          date_transmitted: null,
          ck_no: "",
          amount: "",
        },
        chk_voucher_for_trans: {
          check_voucher_date: null,
          ck_no: "",
          amount: "",
        },

        expense_for_chk_prep: {
          pcv_date: null,
          particulars: "",
          amount: "",
          glaccounts: "",
          tin: false,
          payee: "",
        },
        replenish_expenses: {
          check_voucher_date: null,
          ck_no: "",
          amount: "",
        },
      },
      validation_errors: {
        rv_fund: {},
        chk_voucher_verification: {},
        chk_voucher_for_trans: {},
        expense_for_chk_prep: {},
        replenish_expenses: {},
      },
      selected_index: {
        rv_fund: -1,
        rv_fund_items: -1,
      },
      menus_activator: {
        // as_of_date_add: false,
        //as_of_date_view: false,

        date_transmitted: false,
        check_voucher_date: false,
        pcv_date: false,

        replenish_chk_voucher_date: false,
      },
      isEditingCashAdvances: false,
      rvFundItemsPanel: [],
      status: ["Pending", "Transmittal"],
      selected_expenses: [],
      select_all_expenses: false,
      branch_selected: "",
    };
  },
  methods: {
    searchDate() {
        this.headers2 =[
              {
                text: "PCV DATE",
                align: "start",
                value: "pcv_date",
              },
              {
                text: "PAYEE",
                align: "start",
                value: "payee",
              },
              {
                text: "AMOUNT",
                align: "start",
                value: "amount",
              },
              {
                text: "BIR",
                align: "start",
                value: "tin",
              },
              {
                text: "GL ACCOUNT",
                align: "start",
                value: "glaccounts",
              },
              {
                text: "STATUS",
                align: "start",
                value: "status",
              },
      ],
      this.value.date = this.date;
      this.$store.dispatch(
        "revolving_fund_list/fetchPreparationHistory", this.value
      ).then((res)=>{
        this.historyDATA = res
      });
    },
    updatevalue(id){
        var data = {
          "id": id,
          "stat": this.toprintstat[id]
        }
        this.$store.dispatch("revolving_fund_list/toprint", data);
    },
    Transmittal(){
       
      this.$store.dispatch("revolving_fund_list/PrintTransmittal", this.rv_fund_with_expense_items.branch);
    },
    //PRINT BIR
    printBIR() {
      this.$store.dispatch("revolving_fund_list/PrintBIR", this.value);
    },
    //Revolving Fund CRUD Methods
    refreshRvFunds() {
      this.$store.dispatch("revolving_fund_list/fetchRevolvingFunds");
    },
    // addRevolvingFund() {
    //   this.$store
    //     .dispatch("revolving_fund_list/addRevolvingFund", this.fields.rv_fund)
    //     .then((res) => {
    //       console.log(res);
    //       let resStatus = res.status;
    //       let resData = res.data;
    //       this.resetValidationErrors();
    //       if (resStatus == 422) {
    //         this.validation_errors.rv_fund = resData.errors;
    //       } else if (resStatus == 200) {
    //         let rvFund = resData.rv_fund;
    //         this.revolving_funds.push(rvFund);
    //         this.viewRevolvingFund(rvFund);
    //         this.dialogs.add_revolving_fund = false;
    //       }
    //     });
    // },
    // onCloseAddRVFundDialog() {
    //   this.resetValidationErrors();
    //   this.fields.rv_fund = {
    //     cash_advances: 0,
    //   };
    //   this.dialogs.add_revolving_fund = false;
    // },
    viewRevolvingFund(item) {
      this.$store
        .dispatch("revolving_fund_list/viewRevolvingFund", { id: item.id })
        .then((data) => {
          this.setRvFieldsData(data);
        });
      this.selected_index.rv_fund = this.revolving_funds.indexOf(item);
      this.dialogs.view_revolving_fund = true;

      this.branch_selected = item;
    },
    saveCashAdv() {
      this.$store
        .dispatch("revolving_fund_list/updateCashAdvances", this.fields.rv_fund)
        .then((res) => {
          let resStatus = res.status;
          let resData = res.data;
          if (resStatus == 200) {
            let cashAdvances = resData.cashAdvances;
            this.revolving_funds[this.selected_index.rv_fund].cash_advances =
              cashAdvances;
            this.rv_fund_with_expense_items.cash_advances = cashAdvances;
            this.cancelUpdatingCashAdv();
          }
        });
    },
    cancelUpdatingCashAdv() {
      this.isEditingCashAdvances = false;
      this.setRvFieldsData(this.rv_fund_with_expense_items);
    },
    // updateRevolvingFund() {
    //   this.$store
    //     .dispatch(
    //       "revolving_fund_list/updateRevolvingFund",
    //       this.fields.rv_fund
    //     )
    //     .then((res) => {
    //       console.log(res, "res");
    //       let resStatus = res.status;
    //       let resData = res.data;
    //       this.resetValidationErrors();
    //       if (resStatus == 422) {
    //         this.validation_errors.rv_fund = resData.errors;
    //       } else if (resStatus == 200) {
    //         let rvFund = resData.rv_fund;

    //         this.revolving_funds.splice(this.selected_index.rv_fund, 1, rvFund);

    //         this.rv_fund_with_expense_items.as_of = rvFund.as_of;
    //         this.rv_fund_with_expense_items.fund = rvFund.fund;
    //         this.rv_fund_with_expense_items.cash_advances =
    //           rvFund.cash_advances;

    //         this.isEditingRVFund = false;
    //       }
    //     });
    // },
    // cancelUpdatingRvFund() {
    //   this.isEditingRVFund = false;
    //   this.setRvFieldsData(this.rv_fund_with_expense_items);
    //   this.resetValidationErrors();
    // },
    // deleteRvFunds() {
    //   this.$dialog
    //     .warning({
    //       text: "Are you sure to delete this item/s?",
    //       title: "Confirm Delete",
    //       actions: {
    //         false: "Cancel",
    //         true: {
    //           text: "Confirm",
    //           color: "warning",
    //         },
    //       },
    //     })
    //     .then((state) => {
    //       if (state) {
    //         let ids = this.selected_items.map((item) => item.id);
    //         this.$store
    //           .dispatch("revolving_fund_list/deleteRvFunds", { ids })
    //           .then((data) => {
    //             let rv_funds = this.revolving_funds;
    //             this.selected_items.forEach((item) => {
    //               rv_funds.splice(rv_funds.indexOf(item), 1);
    //             });
    //           });
    //       }
    //     });
    // },
    onCloseViewRVFundDialog() {
      this.resetValidationErrors();
      this.selected_index.rv_fund = -1;
      this.fields.rv_fund = {
        cash_advances: 0,
      };
      this.dialogs.view_revolving_fund = false;
      this.isEditingCashAdvances = false;
      this.rvFundItemsPanel = [];
    },
    setRvFieldsData(data) {
      this.fields.rv_fund = {
        id: data.id,
        cash_advances: data.cash_advances,
      };
    },
    printRvFundsSummary() {
      this.$store.dispatch("revolving_fund_list/printRvFundsSummary", {
        id: this.rv_fund_with_expense_items.id,
      });
    },
    //Revolving Fund Check Voucher Verification CRUD Methods
    saveCheckVoucherVerification() {
      if (!this.isEditingRVFundItems) {
        this.fields.chk_voucher_verification.rv_fund_id =
          this.rv_fund_with_expense_items.id;
      }
      this.$store
        .dispatch(
          "revolving_fund_list/" +
            (!this.isEditingRVFundItems
              ? "createCheckVoucherVerification"
              : "updateCheckVoucherVerification"),
          this.fields.chk_voucher_verification
        )
        .then((res) => {
          console.log(res);
          let resStatus = res.status;
          let resData = res.data;
          this.resetValidationErrors();
          if (resStatus == 422) {
            this.validation_errors.chk_voucher_verification = resData.errors;
          } else if (resStatus == 200) {
            let item = resData.item;
            if (this.isEditingRVFundItems) {
              this.chkVoucherVerifications.splice(
                this.selected_index.rv_fund_items,
                1,
                item
              );
            } else {
              this.chkVoucherVerifications.push(item);
            }

            if (!this.rvFundItemsPanel.includes(0)) {
              this.rvFundItemsPanel.push(0);
            }

            this.$store.commit(
              "revolving_fund_list/setChkVoucherVerificationsTotal",
              resData.totalthis.value
            );
            // this.chkVoucherVerificationsTotal = this.chkVoucherVerificationsTotal +
            //   resData.item.amount;
            this.onCloseChkVoucherVerificationDialog();
          }
        });
    },
    onCloseChkVoucherVerificationDialog() {
      this.resetValidationErrors();
      this.fields.chk_voucher_verification = {};
      this.dialogs.add_edit_chk_voucher_verification = false;
      this.selected_index.rv_fund_items = -1;
    },
    editCheckVoucherVerification(item) {
      this.selected_index.rv_fund_items =
        this.chkVoucherVerifications.indexOf(item);
      this.fields.chk_voucher_verification = {
        id: item.id,
        date_transmitted: item.date_transmitted,
        ck_no: item.ck_no,
        amount: item.amount,
      };
      this.dialogs.add_edit_chk_voucher_verification = true;
    },
    editChkVoucherVerificationStatus(item) {
      this.selected_index.rv_fund_items =
        this.chkVoucherVerifications.indexOf(item);
      this.fields.chk_voucher_verification = {
        id: item.id,
        status: item.status,
      };
      this.dialogs.status_chk_voucher_verification = true;
    },
    updateChkVoucherVerificationStatus() {
      this.$store
        .dispatch(
          "revolving_fund_list/updateChkVoucherVerificationStatus",
          this.fields.chk_voucher_verification
        )
        .then((res) => {
          let resStatus = res.status;
          let resData = res.data;
          if (resStatus == 200) {
            this.chkVoucherVerifications.splice(
              this.selected_index.rv_fund_items,
              1,
              resData.item
            );
            this.onCloseChkVoucherVerificationStatDialog();
          }
        });
    },
    onCloseChkVoucherVerificationStatDialog() {
      this.dialogs.status_chk_voucher_verification = false;
      this.fields.chk_voucher_verification = {};
      this.selected_index.rv_fund_items = -1;
    },
    deleteChkVerification(item) {
      this.$dialog
        .warning({
          text: "Check Voucher Acceptance",
          title: "Confirm Accept",
          actions: {
             
            true: {
              text: "Accept",
              color: "success",
            },
          },
        })
        .then((state) => {
          if (state) {
            this.$store
              .dispatch("revolving_fund_list/deleteChkVoucherVerification", {
                id: item.id,
              })
              .then((res) => {
                let resStatus = res.status;
                let resData = res.data;
                if (resStatus == 200) {
                  this.chkVoucherVerifications.splice(
                    this.chkVoucherVerifications.indexOf(item),
                    1
                  );
                  this.$store.commit(
                    "revolving_fund_list/setChkVoucherVerificationsTotal",
                    resData.total
                  );

                  this.viewRevolvingFund(this.branch_selected);
                }
              });
          }
        });
    },
    //Revolving Fund Check Voucher For Transmittal CRUD Methods
    saveCheckVoucherForTrans() {
      if (!this.isEditingRVFundItems) {
        this.fields.chk_voucher_for_trans.rv_fund_id =
          this.rv_fund_with_expense_items.id;
      }
      this.$store
        .dispatch(
          "revolving_fund_list/" +
            (!this.isEditingRVFundItems
              ? "createCheckVoucherForTransmittal"
              : "updateCheckVoucherForTransmittal"),
          this.fields.chk_voucher_for_trans
        )
        .then((res) => {
          console.log(res);
          let resStatus = res.status;
          let resData = res.data;
          this.resetValidationErrors();
          if (resStatus == 422) {
            this.validation_errors.chk_voucher_for_trans = resData.errors;
          } else if (resStatus == 200) {
            let item = resData.item;
            if (this.isEditingRVFundItems) {
              this.chkVoucherForTransmittals.splice(
                this.selected_index.rv_fund_items,
                1,
                item
              );
            } else {
              this.chkVoucherForTransmittals.push(item);
            }

            if (!this.rvFundItemsPanel.includes(1)) {
              this.rvFundItemsPanel.push(1);
            }

            this.$store.commit(
              "revolving_fund_list/setChkVoucherForTransmittalTotal",
              resData.total
            );
            this.onCloseChkVoucherForTransDialog();
          }
        });
    },
    onCloseChkVoucherForTransDialog() {
      this.resetValidationErrors();
      this.fields.chk_voucher_for_trans = {};
      this.dialogs.add_edit_chk_voucher_for_trans = false;
      this.selected_index.rv_fund_items = -1;
    },
    editCheckVoucherForTrans(item) {
      this.selected_index.rv_fund_items =
        this.chkVoucherForTransmittals.indexOf(item);
      this.fields.chk_voucher_for_trans = {
        id: item.id,
        check_voucher_date: item.check_voucher_date,
        ck_no: item.ck_no,
        amount: item.amount,
      };
      this.dialogs.add_edit_chk_voucher_for_trans = true;
    },
    deleteChkVoucherForTrans(item) {
      this.$dialog
        .warning({
          text: "Are you sure to delete this item?",
          title: "Confirm Delete",
          actions: {
            false: "Cancel",
            true: {
              text: "Confirm",
              color: "warning",
            },
          },
        })
        .then((state) => {
          if (state) {
            this.$store
              .dispatch("revolving_fund_list/deleteChkVoucherForTransmittal", {
                id: item.id,
              })
              .then((res) => {
                let resStatus = res.status;
                let resData = res.data;
                if (resStatus == 200) {
                  this.chkVoucherForTransmittals.splice(
                    this.chkVoucherForTransmittals.indexOf(item),
                    1
                  );
                  this.$store.commit(
                    "revolving_fund_list/setChkVoucherForTransmittalTotal",
                    resData.total
                  );
                }
              });
          }
        });
    },
    transmitChkVoucher(item) {
      this.$dialog
        .info({
          text: "Are you sure to trasmit this item?",
          title: "Confirm Transmit",
          actions: {
            false: "Cancel",
            true: {
              text: "Confirm",
              color: "info",
            },
          },
        })
        .then((state) => {
          if (state) {
            console.log(state);
            this.$store
              .dispatch("revolving_fund_list/transmitChkVoucher", {
                id: item.id,
              })
              .then((res) => {
                let resStatus = res.status;
                let resData = res.data;
                if (resStatus == 200) {
                  let chkVoucherForTrans = this.chkVoucherForTransmittals;
                  chkVoucherForTrans.splice(
                    chkVoucherForTrans.indexOf(item),
                    1
                  );
                  this.chkVoucherVerifications.push(resData.item);

                  this.viewRevolvingFund(this.branch_selected);
                }
              });
          }
        });
    },
    ckHistory() {
       this.historyIdentify = {
        title: "Check Voucher Verification History",
        iden: 1
       }
       this.headers2 =[
              {
                text: "DATE TRANSMITTED",
                align: "start",
                value: "DATETRANSMITTED",
              },
              {
                text: "CK#",
                align: "start",
                value: "ck_no",
              },
              {
                text: "AMOUNT",
                align: "start",
                value: "AMOUNT",
              },
              {
                text: "FUND",
                align: "start",
                value: "fund",
              },
              {
                text: "BRANCH",
                align: "start",
                value: "BRANCH",
              },
              {
                text: "STATUS",
                align: "start",
                value: "status",
              },
      ],
  
        
      this.value = {
           branch: this.rv_fund_with_expense_items.branch
        }
      this.$store.dispatch("revolving_fund_list/fetchckHistory", this.value).then((res)=>{
       this.historyDATA = res
      });
      this.dialogHistory = true;
      
    },
    expensesHistory() {
       this.historyIdentify = {
        title: "Expenses For Check Preparation History",
        iden: 0
       }
      this.headers2 =[
              {
                text: "PCV DATE",
                align: "start",
                value: "pcv_date",
              },
              {
                text: "PAYEE",
                align: "start",
                value: "payee",
              },
              {
                text: "AMOUNT",
                align: "start",
                value: "amount",
              },
              {
                text: "BIR",
                align: "start",
                value: "tin",
              },
              {
                text: "GL ACCOUNT",
                align: "start",
                value: "glaccounts",
              },
              {
                text: "STATUS",
                align: "start",
                value: "status",
              },
      ],
         
        this.value = {
           tin: 1,
           date: this.date,
           branch: this.rv_fund_with_expense_items.branch
        }
      this.$store.dispatch("revolving_fund_list/fetchPreparationHistory",this.value).then((res)=>{
        this.historyDATA = res;
      });
      this.dialogHistory = true;
    },
    filterbir() {
      if (this.FilterBIR == true) {
        this.value = {
           tin: 1,
           date: this.date,
           branch: this.rv_fund_with_expense_items.branch
        }
      } else {
         this.value = {
           tin: 0,
           date: this.date,
           branch: this.rv_fund_with_expense_items.branch
        }
      }
       this.headers2 =[
              {
                text: "PCV DATE",
                align: "start",
                value: "pcv_date",
              },
              {
                text: "PAYEE",
                align: "start",
                value: "payee",
              },
              {
                text: "AMOUNT",
                align: "start",
                value: "amount",
              },
              {
                text: "BIR",
                align: "start",
                value: "tin",
              },
              {
                text: "GL ACCOUNT",
                align: "start",
                value: "glaccounts",
              },
              {
                text: "STATUS",
                align: "start",
                value: "status",
              },
      ],
         
      this.$store.dispatch(
        "revolving_fund_list/fetchPreparationHistory",
        this.value
      ).then((res)=>{
        this.historyDATA = res
      });
    },
    //Revolving Fund Expenses For Check Preparation CRUD Methods
    saveExpenseForChkPrep() {
      if (!this.isEditingRVFundItems) {
        this.fields.expense_for_chk_prep.rv_fund_id =
          this.rv_fund_with_expense_items.id;
      }
      this.$store
        .dispatch(
          "revolving_fund_list/" +
            (!this.isEditingRVFundItems
              ? "createExpenseForChkPreparation"
              : "updateExpenseForChkPreparation"),
          this.fields.expense_for_chk_prep
        )
        .then((res) => {
          let resStatus = res.status;
          let resData = res.data;
          this.resetValidationErrors();
          if (resStatus == 422) {
            this.validation_errors.expense_for_chk_prep = resData.errors;
          } else if (resStatus == 200) {
            let item = resData.item;
            if (this.isEditingRVFundItems) {
              this.expensesForChkPreparations.splice(
                this.selected_index.rv_fund_items,
                1,
                item
              );
            } else {
              this.expensesForChkPreparations.push(item);
            }

            if (!this.rvFundItemsPanel.includes(2)) {
              this.rvFundItemsPanel.push(2);
            }

            this.$store.commit(
              "revolving_fund_list/setExpensesForChkPreparationTotal",
              resData.total
            );
            this.onCloseExpenseForChkPrepDialog();
          }
          this.fields.expense_for_chk_prep.tin = false;
          this.selected_expenses = [];
          this.$store.dispatch("revolving_fund_list/fetchRevolvingFunds");
        });
    },
    onCloseExpenseForChkPrepDialog() {
      this.resetValidationErrors();
      this.fields.expense_for_chk_prep = {};
      this.dialogs.add_edit_expenses_for_chk_prep = false;
      this.selected_index.rv_fund_items = -1;
    },
    editExpenseForChkPrep(item) {
      this.selected_index.rv_fund_items =
        this.expensesForChkPreparations.indexOf(item);
      this.fields.expense_for_chk_prep = {
        id: item.id,
        glaccounts: item.glaccounts,
        pcv_date: item.pcv_date,
        particulars: 1,
        payee: item.payee,
        tin: item.tin == 1 ? true : false,
        amount: item.amount,
      };
      this.dialogs.add_edit_expenses_for_chk_prep = true;
    },
    deleteExpenseForChkPrep(item) {
      this.$dialog
        .warning({
          text: "Are you sure to delete this item?",
          title: "Confirm Delete",
          actions: {
            false: "Cancel",
            true: {
              text: "Confirm",
              color: "warning",
            },
          },
        })
        .then((state) => {
          if (state) {
            this.$store
              .dispatch("revolving_fund_list/deleteExpenseForChkPreparation", {
                id: item.id,
              })
              .then((res) => {
                let resStatus = res.status;
                let resData = res.data;
                if (resStatus == 200) {
                  this.expensesForChkPreparations.splice(
                    this.expensesForChkPreparations.indexOf(item),
                    1
                  );
                  this.$store.commit(
                    "revolving_fund_list/setExpensesForChkPreparationTotal",
                    resData.total
                  );
                }
              });
          }
        });
    },
    selectAllExpenses() {
      if (this.select_all_expenses) {
        this.expensesForChkPreparations.forEach((item) => {
          if (!this.selected_expenses.includes(item)) {
            this.selected_expenses.push(item);
          }
        });
      } else {
        this.selected_expenses = [];
      }
    },
    replenishExpenses() {
      let replenish_fields = this.fields.replenish_expenses;
      replenish_fields.rv_fund_id = this.rv_fund_with_expense_items.id;
      replenish_fields.amount = this.getSelectedExpensesTotal;
      replenish_fields.items = this.selected_expenses;
      console.log(replenish_fields);
      this.$store
        .dispatch("revolving_fund_list/replenishExpenses", replenish_fields)
        .then((res) => {
          this.select_all_expenses = false;

          let resStatus = res.status;
          let resData = res.data;
          this.resetValidationErrors();
          if (resStatus == 422) {
            this.validation_errors.replenish_expenses = resData.errors;
          } else if (resStatus == 200) {
            let expenses = this.expensesForChkPreparations;
            this.selected_expenses.forEach((item) => {
              expenses.splice(expenses.indexOf(item), 1);
            });
            this.chkVoucherForTransmittals.push(resData.item);
            this.dialogs.replenish_expenses = false;

            this.viewRevolvingFund(this.branch_selected);
          }
          this.selected_expenses.length = [];
        });
    },
    onCloseReplenishExpensesDialog() {
      this.resetValidationErrors();
      this.dialogs.replenish_expenses = false;
      this.branch_selected = "";
    },

    resetValidationErrors() {
      this.validation_errors = {
        rv_fund: {},
        chk_voucher_verification: {},
        chk_voucher_for_trans: {},
        expense_for_chk_prep: {},
        replenish_expenses: {},
      };
    },
  },
  computed: {
    ...mapGetters({
      glaccountList: "revolving_fund_list/getGlAccount",
      revolving_funds: "revolving_fund_list/getRevolvingFunds",
      historydata: "revolving_fund_list/getHistory",
      ckhistory: "revolving_fund_list/getckHistory",
      rv_fund_with_expense_items:
        "revolving_fund_list/getRvFundWithExpenseItems",
      // deleting_on_progress: "revolving_fund_list/getDeletingOnProgress",
      permissions: "userPermissions/getPermission",
    }),
    currentUser() {
      return this.$store.getters.currentUser;
    },
    formatDate() {
      return (date) => {
        return date ? moment(date).format("MMMM DD, YYYY") : "";
      };
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
    isEditingRVFundItems() {
      return this.selected_index.rv_fund_items >= 0;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
    checkIfHasPermission() {
      return (permission) => {
        return this.permissions.includes(permission);
      };
    },
    // canAddRvFunds() {
    //   return this.checkIfHasPermission("Add Revolving Funds");
    // },
    // canDeleteRvFunds() {
    //   return this.checkIfHasPermission("Delete Revolving Funds");
    // },
    canEditCashAdvances() {
      return this.checkIfHasPermission("Edit Revolving Fund Cash Advances");
    },
    canAddRvFundExpenses() {
      return this.checkIfHasPermission("Add Revolving Fund Expenses");
    },
    canEditRvFundExpenses() {
      return this.checkIfHasPermission("Edit Revolving Fund Expenses");
    },
    canDeleteRvFundExpenses() {
      return this.checkIfHasPermission("Delete Revolving Fund Expenses");
    },
    canEditRvFundExpensesStat() {
      return this.checkIfHasPermission("Edit Revolving Fund Expenses Status");
    },
    canReplenishRvFundExpenses() {
      return this.checkIfHasPermission("Replenish Revolving Fund Expenses");
    },
    canTransmitRvFundExpenses() {
      return this.checkIfHasPermission("Transmit Revolving Fund Expenses");
    },
    canHaveActionInRvFundExpenses() {
      return this.canEditRvFundExpenses || this.canDeleteRvFundExpenses;
    },
    getSelectedExpensesTotal() {
      let total = 0;
      this.selected_expenses.forEach((item) => {
        total += parseFloat(item.amount);
      });
      return total;
    },
  },
  watch: {
    getAvailRVFundOnHand(val) {
      if (
        this.permissions.includes("Update Available Revolving Fund On Hand")
      ) {
        console.log(val, "val");
        this.$store.dispatch(
          "revolving_fund_list/updateAvailRevolvingFundOnHand",
          {
            id: this.rv_fund_with_expense_items.id,
            avail_fund_on_hand: val,
          }
        );
      }
    },
    selected_expenses(newVal, oldVal) {
      this.select_all_expenses =
        newVal.length === this.expensesForChkPreparations.length;
    },
  },
};
</script>
<style scoped>
.v-row-group__header .v-icon.active {
  transform: rotate(-180deg);
}
</style>
