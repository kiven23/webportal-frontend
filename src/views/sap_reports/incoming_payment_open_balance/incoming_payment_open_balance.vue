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
            <v-toolbar-title>Incoming Payment Open Balance</v-toolbar-title>
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
             
               BRANCH: <i style="font-size: 13px">{{ branch.SeriesName }} </i>
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
      <v-dialog v-model="create" width="800" >
        <v-card >
          <v-card-title class="dark lighten-2">
            Select Branch 
          </v-card-title>
   
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
                style="margin: 10px;"
              ></v-autocomplete>
         
 
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
          <v-toolbar-title style="color: black">Incoming Payment Open Balance Print Preview</v-toolbar-title>
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
import { mapGetters } from "vuex";
 
import JsonExcel from "vue-json-excel";
export default {
  components: {
    JsonExcel,
 
  },

  data() {
    return {
      iden: 0,
      printLink: "",
      printDialog: false,
      branch: "Agoo",
      create: false,
      reveal: false,
      search: "",
      selected: [],
      loader: null,
      loading: false,
      submitDisable: true,
      headers: [
        { text: "SERIES NAME", align: "left", value: "SeriesName" },
        { text: "SERIES", align: "left", value: "Series" },
        { text: "DOCDATE", align: "left", value: "DocDate" },
        { text: "DOCNUM", align: "left", value: "DocNum" },
        { text: "CARDNAME", align: "left", value: "CardName" },
        { text: "COUNTER REF", align: "left", value: "CounterRef" },
        { text: "OPEN BALANCE AMOUNT", align: "left", value: "OpenBal" },
      ],
    };
  },
  computed: {
    ...mapGetters({
      query: "incoming_payment_open_balance/QUERY",
      permissions: "userPermissions/getPermission",
      branches: "incoming_payment_open_balance/getBranchSegment",
    }),
     
    dialog() {
      return this.$store.state.dialog;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
  },
  watch: {
    providers() {
      this.$v.$reset(); // reset validation
    },
  },
  created() {
    this.$store.dispatch("incoming_payment_open_balance/fetchBranchSegment");
    this.$store.dispatch("userPermissions/fetchPermission");
  },
  methods: {
    printpre(){
        this.printLink = "";
        this.printDialog = true;
        this.iden = 0; 
        this.printLink = 'http://192.168.1.19:7771/api/public/reports/queries/incomingpaymentopenbalance?q=printing&series='+this.branch.SeriesName+'';
        fetch('http://192.168.1.19:7771/api/public/reports/queries/incomingpaymentopenbalance?q=printing&&series='+this.branch.SeriesName+'').then((res)=>{
           this.iden = 1; 
        })
      },
 
    generate() {
      let data = {
        branch: this.branch,
      };
      this.$store.dispatch("incoming_payment_open_balance/generatequery", data);
    },
    refreshData() {
      let data = {
        branch: this.branch,
      };
      this.$store.dispatch("incoming_payment_open_balance/generatequery",data);
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