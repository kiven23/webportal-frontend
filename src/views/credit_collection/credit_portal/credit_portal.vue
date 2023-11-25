<template>
  <div>
    <v-container grid-list-md text-xs-center>
       <template>
 
          <v-col cols="12" sm="2">
             
            <vs-input
              v-model="search"
              @input="onSearch"
              placeholder="Customer Name"
            />
          </v-col>
            
          <!-- <v-col cols="12" sm="2">
            <vs-button style="margin-left: 10px" @click="addItem()">
               <span  >CREATE ITEM MASTER </span>
            </vs-button>
          </v-col> -->
        
      </template>
      <v-skeleton-loader
    class="mx-auto"
    elevation="12"
    
    type="table-heading, list-item-two-line, image, table-tfoot"
    :loading='skeletonsk'
  >
    <vue-good-table
      :columns="columns"
      :rows="rows"
      :totalRows="totalRows"
      :pagination-options="{ enabled: true, perPage: perPage }"
      :mode="'server'"
      @on-page-change="onPageChange"
      :responsive="true"
      class="custom-table"
    ></vue-good-table>
    </v-skeleton-loader>
      <v-dialog v-model="create" width="800">
        <v-card>
          <v-card-title class="text-h5 dark lighten-2">
            Select Date Range to Generate
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
              <v-date-picker v-model="dates_regular" class="ma-4" range
                ><h4>REGULAR CUSTOMER</h4></v-date-picker
              >
            </v-col>
            <v-col cols="12" sm="6">
              <v-date-picker v-model="dates_legal" class="ma-4" range>
                <h4>LEGAL CUSTOMER</h4></v-date-picker
              >
            </v-col>
          </v-row>
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="generate" > Generate </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
//import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
//import JsonExcel from "vue-json-excel";
export default {
  // components: {
  //   JsonExcel,
  // },

  mixins: [validationMixin],

  data() {
    return {
       columns: [
        { label: "CATEGORY", field: "category" },
        { label: "BRANCH", field: "branch" },
        { label: "CUSTOMER NAME", field: "cardname" },
        { label: "BIRTHDAY", field: "bday" },
        { label: "REBATE", field: "rebate" },
        { label: "TERMS", field: "terms" },
        { label: "PAID MOUNT", field: "paidamoun" },
        { label: "DOC TOTAL", field: "doctotal" },
        { label: "BALANCE", field: "balance" },
        { label: "CRITERIA", field: "criteria" },
        // { text: "Actions", align: "center", value: "action", sortable: false },
      ],
      rows: [],
      totalRows: 0,
      currentPage: 1,
      perPage:7,
      search: '',

      dates_regular: ["2022-01-01", "2019-09-20"],
      dates_legal: ["2022-01-01", "2019-09-20"],
      creditstandingData: [],
      create: false,
      reveal: false,
       
      selected: [],
      loader: null,
      loading: false,
      submitDisable: true,

      skeletonsk: false
       
    };
  },
  computed: {
    ...mapGetters({
      creditstanding_data: "creditstanding/getCreditStanding",
      permissions: "userPermissions/getPermission",
    }),
    // deleteAll() {
    //   return this.permissions.includes("Delete Agencies File");
    // },
    userCanCreate_role() {
      return this.permissions.includes("Create BlackListed CCS Portal");
    },
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
 
  },
  watch: {
    providers() {
      this.$v.$reset(); // reset validation
    },
  },
  created() {
    this.$store.dispatch("userPermissions/fetchPermission");
        // Parse the dates in the array to JavaScript Date objects
    const parsedDates = this.dates_regular.map((date) => new Date(date));
    // Findthe latest date from the array
    const latestDate = new Date();
 
    // Convert the latest date back to "yyyy-MM-dd" format
    const latestDateString = latestDate.toISOString().slice(0, 10);
    
    // Find the index of "2019-09-20" in the array and update it with the latest date
    const indexOfOldDate = this.dates_regular.indexOf("2019-09-20");
    if (indexOfOldDate !== -1) {
      this.dates_regular.splice(indexOfOldDate, 1, latestDateString);
      this.dates_legal.splice(indexOfOldDate, 1, latestDateString)
    }

    this.onPageChange({ currentPage: this.currentPage, perPage: this.perPage });
  },
  methods: {

     onPageChange(pageInfo) {
         var data = {
          page: pageInfo.currentPage,
          search:  this.search
        }
       
        this.$store.dispatch("creditstanding/fetchCreditStanding", data).then((response)=>{
            this.rows = response.data.data.data;
            this.totalRows = response.data.data.total;
         
            this.currentPage = pageInfo.current_page;
            this.perPage = pageInfo.per_page;
            this.skeletonsk = false
        })
        
     
    },
    onSearch(){
        var data = {
          page: this.currentPage,
          search:  this.search
        }
        this.$store.dispatch("creditstanding/fetchCreditStanding", data).then((response)=>{
          this.rows = response.data.data.data;
          this.totalRows = response.data.data.total;
          this.currentPage = response.data.data.current_page;
          this.perPage = response.data.data.per_page;
         
        })
    }
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
  .custom-table {
    font-family: Nunito, sans-serif; /* Use the desired font */
    font-size: 2px; /* Customize the font size */
   
    /* Add any other custom styling you want, such as background colors, etc. */
  }
   /* Style the table header (th) */
  .custom-table thead th  {
    
    font-size: 15px;
    padding: 1px; /* Add padding to the header cells */
    text-align: left; /* Align the header text to the left */
  }

  /* Style the table body (td) */
  .custom-table tbody tr  {
    border: 2px solid #b19c9c; /* Add a border to the body cells */
    padding: 1px; /* Add padding to the body cells */
    font-size: 10px;
    font-family: Nunito, sans-serif;
  }
  div .vgt-clearfix{
    padding: 2px; /* Add padding to the body cells */
    font-size: 5px;
     
  }
 .vs-input{
     padding: 2px; /* Add padding to the body cells */
    font-size: 10px;
      
  }
</style>