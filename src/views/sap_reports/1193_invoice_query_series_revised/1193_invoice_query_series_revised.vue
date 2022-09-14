<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="query"
        :search="search"
        :loading="loadingStatus"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Invoice Query Series Revised</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>Generate</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="printpre()"><v-icon>print</v-icon></v-btn>
              </template>
              <span>Print</span>
            </v-tooltip>  
    

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <json-excel :data="paymentcbr_data">
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
            <h6>
              DATE: <i style="font-size: 13px"> {{ dates_regular  }} </i>
              <br />SERIESNAME: <i style="font-size: 13px">{{ branch.SeriesName }} </i>
            </h6>
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
        <template v-slot:item.Date="{ item }">
          {{ moment(item.Date).format("MM.DD.YY") }}
        </template>
        <template v-slot:item.Amount="{ item }">
          <money-format
            :value="parseFloat(item.Amount)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
        <template v-slot:item.Interest="{ item }">
          <money-format
            :value="parseFloat(item.Interest)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
        <template v-slot:item.otherBranch_Acct="{ item }">
          <money-format
            :value="parseFloat(item.otherBranch_Acct)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
        <template v-slot:item.PaymtAcct="{ item }">
          <money-format
            :value="parseFloat(item.PaymtAcct)"
            locale="en"
            currency-code="PHP"
          >
          </money-format>
        </template>
      </v-data-table>
      <!-- <v-dialog v-model="create" width="500">
        <v-card>
          <v-card-title class="text-h5 dark lighten-2">
            Upload Black Listed Data
          </v-card-title>

          <v-file-input
            v-model="blacklistedData"
            placeholder="Upload xls document"
            prepend-icon="upload_file"
          >
            <template v-slot:selection="{ text }">
              <v-chip small label color="primary">
                {{ text }}
              </v-chip>
            </template>
          </v-file-input>

          
          <strong style="margin: 15px"
            >Download XLS Templates: <a href="#">Templates.xls</a></strong
          >
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="upload"> Upload </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog> -->
      <v-dialog v-model="create" width="800">
        <v-card>
          <v-card-title class="text-h5 dark lighten-2">
            Select Branch and Date
          </v-card-title>
          <!-- 
          <v-file-input
            v-model="creditstandingData"
            placeholder="Upload xls document"
            prepend-icon="upload_file"
          >
            <template v-slot:selection="{ text }">
              <v-chip small label color="primary">
                {{ text }}
              </v-chip>
            </template>
          </v-file-input> -->
          <!-- <strong style="margin: 15px"
            >Download XLS Templates: <a href="#">Templates.xls</a></strong
          > -->
          <v-row>
            <v-col cols="12" sm="6">
              <v-date-picker
                v-model="dates_regular"
                class="ma-4"
                year-icon="mdi-calendar-blank"
                prev-icon="mdi-skip-previous"
                next-icon="mdi-skip-next"
                range
              >
              </v-date-picker>
            </v-col>
            <v-col cols="12" sm="6">
              <v-autocomplete
                v-model="branch"
                :loading="loadingStatus"
                :items="branches"
                item-value="Name"
                item-text="SeriesName"
                return-object
                dense
                label="Select Branch"
                chips
                hide-details
                hide-selected
                solo
                class="mt-10 mr-5"
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="generate"> Generate </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
    <v-dialog
      v-model="printDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >

      <v-card>
        <v-toolbar
          dark
          style="background-color: #f2e7d0"
        >
          <v-btn
            icon
            dark
            @click="printDialog = false"
          >
            <v-icon style="color: black">mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title style="color: black">Invoice Query Series Revised Print Preview</v-toolbar-title>
          <v-spacer></v-spacer>
 
        </v-toolbar>
 
        <v-divider></v-divider>
        <iframe v-if="iden == 1" :src="printLink"  ref="myiframe"  style="width: 100%; height: 1000px;" title="Incoming Payment PrintPreview">
        
        

        </iframe> 
        <v-skeleton-loader
             v-if="iden == 0"
             max-height="100%"
             max-width="100%"
             
            type="card"
         ></v-skeleton-loader>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import MoneyFormat from "vue-money-format";
//import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import moment from "moment";
import JsonExcel from "vue-json-excel";
export default {
  components: {
    JsonExcel,
    "money-format": MoneyFormat,
  },

  data() {
    return {
      iden: 0,
      printLink: "",
      printDialog: false,
      branch: "Agoo",
      dates_regular:  ['2022-06-02','2022-06-30'],
      create: false,
      reveal: false,
      search: "",
      selected: [],
      loader: null,
      loading: false,
      submitDisable: true,
      headers: [
        { text: "INVOICE#", align: "left", value: "INVOICE" },
        { text: "DOCUMENT DATE", align: "left", value: "DOCUMENTDATE" },
        { text: "DOCUMENT NUMBER", align: "left", value: "DOCUMENTNUMBER" },
        { text: "NAME OF CUSTOMER", align: "left", value: "NAMEOFCUSTOMER" },
        { text: "INVOICE AMOUNT", align: "left", value: "INVOICEAMOUNT" },
        { text: "STATUS", align: "left", value: "STATUS" },
        { text: "PAYMENT TERM", align: "left", value: "PaymentTerms" },
        { text: "CLOSED TYPE", align: "left", value: "CLOSEDTYPE" },
      ],
    };
  },
  computed: {
    ...mapGetters({
      query: "invoice_query_series_revised/QUERY",
      permissions: "userPermissions/getPermission",
      branches: "invoice_query_series_revised/getBranchSegment",
    }),
  
    dialog() {
      return this.$store.state.dialog;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
  },
 
  created() {
     
    this.$store.dispatch("invoice_query_series_revised/fetchBranchSegment");
    this.$store.dispatch("userPermissions/fetchPermission");
  },
  methods: {
    printpre(){
        this.printLink = "";
        this.printDialog = true;
        this.iden = 0; 
        this.printLink = 'http://10.10.10.38:9999/api/public/reports/queries/invoicequeryseriesrevised?q=printing&datefrom='+this.dates_regular[0]+'&dateto='+this.dates_regular[1]+'&series='+this.branch.SeriesName+'';
        fetch('http://10.10.10.38:9999/api/public/reports/queries/invoicequeryseriesrevised?q=printing&datefrom='+this.dates_regular[0]+'&dateto='+this.dates_regular[1]+'&series='+this.branch.SeriesName+'').then((res)=>{
           this.iden = 1; 
           
        })
      },
 
    generate() {
      let data = {
        date: this.dates_regular,
        branch: this.branch,
      };
      this.$store.dispatch("invoice_query_series_revised/generatequery", data);
    },
    refreshData() {
      let data = {
        date: this.dates_regular,
        branch: this.branch,
      };
      this.$store.dispatch("invoice_query_series_revised/generatequery", data);
    },
    openDialog() {
      this.create = true;
    },
    upload() {
      this.$store.dispatch(
        "blacklisted/UploadBlacklisted",
        this.blacklistedData
      );
      this.refreshData();
    },
  },
};
</script>
<style>
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
 
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th {
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  font-size: 11px;
  font-weight: bold;
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