<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="creditstanding_data"
        :search="search"
        :loading="loadingStatus"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Credit Standing</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>Add</span>
            </v-tooltip>


            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  :disabled="!selected.length > 0"
                  text
                  icon
                  v-on="on"
                  @click="deleteAgency"
                  ><v-icon>delete</v-icon></v-btn
                >
              </template>
              <span>Delete</span>
            </v-tooltip> -->

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

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="refreshData">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh</span>
            </v-tooltip>
        
                 <h6>REGULAR CUSTOMER: <i  style="color: green;"> {{dates_regular[0]}} from {{dates_regular[1]}}</i> <br>LEGAL CUSTOMER: <i  style="color: green;">{{dates_legal[0]}} from {{dates_legal[1]}}</i> </h6> 
             
    

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
            <v-btn color="primary" text @click="generate"> Generate </v-btn>
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
      dates_regular: ["2019-09-10", "2019-09-20"],
      dates_legal: ["2019-09-10", "2019-09-20"],
      creditstandingData: [],
      create: false,
      reveal: false,
      search: "",
      selected: [],
      loader: null,
      loading: false,
      submitDisable: true,
      headers: [
        { text: "CATEGORY", align: "left", value: "Category" },
        { text: "BRANCH", align: "left", value: "Branch" },
        { text: "CUSTOMER NAME", align: "left", value: "Cardname" },
        { text: "BIRTHDAY", align: "left", value: "Bday" },
        { text: "REBATE", align: "left", value: "Rebate" },
        { text: "TERMS", align: "left", value: "Terms" },
        { text: "PAID MOUNT", align: "left", value: "Paid Amoun" },
        { text: "DOC TOTAL", align: "left", value: "DocTotal" },
        { text: "BALANCE", align: "left", value: "Balance" },
        { text: "CRITERIA", align: "left", value: "Criteria" },
        // { text: "Actions", align: "center", value: "action", sortable: false },
      ],
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
  },
  methods: {
    refreshData() {
      let dates = {
        regular: this.dates_regular,
        legal: this.dates_legal,
      };

      this.$store.dispatch("creditstanding/GenerateCreditStanding", dates);
    },
    openDialog() {
      this.create = true;
    },
    generate() {
      let dates = {
        regular: this.dates_regular,
        legal: this.dates_legal,
      };
      this.$store.dispatch("creditstanding/GenerateCreditStanding", dates);
      this.create = false;
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