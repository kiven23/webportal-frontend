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
            <v-toolbar-title>Incoming Payment</v-toolbar-title>
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
            ></v-autocomplete> 
          <v-spacer></v-spacer> -->
 
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Customer Name / Invoice"
              single-line
              hide-details
            ></v-text-field>
            <v-dialog
              scrollable
              :value="dialog"
              width="700"
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
                      <v-chip class="ma-5" color="green"
                      >PRICELIST CODE:<strong > {{ pricelist }}</strong>
                    </v-chip>
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
                        :headers="headers2"
                        :items="installment"
                        :items-per-page="13"
                        class="elevation-1"
                        :loading="loadingStatus"
                      >
                        <template v-slot:item.Date="{ item }">
                          {{ item.Date == ''? '' : new Date(item.Date).toDateString()}}
                        </template>
                        <template v-slot:item.OverDueDays="{ item }">
                          <v-chip
                            :color="item.check !== '' ? 'red' : 'green'"
                            class="ma-2"
                            label
                            small
                            dense
                          >
                            {{ item.OverDueDays }}
                          </v-chip>
                        </template>
                        <template v-slot:item.Total="{ item }">
                          <money-format
                            :value="parseInt(item.Total)"
                            locale="en"
                            currency-code="PHP"
                          >
                          </money-format>
                        </template>
                        <template v-slot:item.Interest="{ item }">
                          <money-format
                            :value="parseInt(item.Interest)"
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
        <template v-slot:item.Total="{ item }">
          <money-format
            :value="parseInt(item.Total)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
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
      pricelist: '',
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
         { text: "PRICELIST", align: "left", value: "PriceList" },
        { text: "TOTAL", align: "left", value: "Total" },
        { text: "STATUS", align: "left", value: "Status" },
        { text: "ACTIONS", align: "center", value: "action", sortable: false },
      ],
      headers2: [
        { text: "DOCUMENT NO", align: "left", value: "DocumentNo" },
        { text: "INSTALLMENT", align: "left", value: "Intallment" },
        { text: "DUEDATE", align: "left", value: "Date" },
        { text: "OVERDUEDAYS", align: "left", value: "OverDueDays" },
        { text: "TOTAL", align: "left", value: "Total" },
        { text: "INTEREST", align: "left", value: "Interest" },
        
      ],
      editedIndex: -1,
      viewMode: false,
      viewOnly: 0,
      reportID: "",
      
    };
  },

  computed: {
    ...mapGetters({
      branches: "digitized/getBranches",
      incoming: "incomingpayment/getIncoming",
      installment: "incomingpayment/getInstallment",
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
     this.$store.dispatch("incomingpayment/fetchIncoming");
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
 
      let prilist, pricePercent;
      if(data.PriceList == '0% SPL' ||  data.PriceList == '0% REG'){
        prilist = 0.05;
        pricePercent = '5%';
      }else{
        prilist = 0.07;
        pricePercent = '7%';
      }
      this.pricelist = data.PriceList +' '+ pricePercent;
      console.log(prilist);
      this.name = data.CustomerName;
      this.address = data.Address;
      this.$store.dispatch("incomingpayment/fetchInstallment", data);
      this.$store.dispatch("triggerDialog", true);
    },
    check() {
      // console.log(this.uploadData);
    },

    get() {
      this.$store.dispatch("incomingpayment/fetchIncoming", this.branch);
    },

    close() {
      this.editedIndex = -1;

      this.$store.dispatch("triggerDialog", false);
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