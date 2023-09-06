<template>
  <div>
    <v-container grid-list-md text-xs-center>
 
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="blacklisted_data.customer"
        :search="search"
        :loading="loadingStatus"
        class="elevation-1"
      >
     
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Black Listed Customer  {{blacklisted_data.fromto}}</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>Add</span>
            </v-tooltip> -->

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

            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="refreshData">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh</span>
            </v-tooltip> -->

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
      <v-dialog v-model="create" width="600">
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
              <v-date-picker v-model="dates_regular" class="ma-4" range>
              </v-date-picker>
            </v-col>
            <!-- <v-col cols="12" sm="6">
               
              <v-autocomplete
                v-model="branch"
                :loading="loadingStatus"
                :items="branches"
                item-value="U_Series2"
                item-text="U_Series2"
                return-object
                dense
                label="Select Branch"
                chips
                hide-details
                hide-selected
                solo
                class="mt-10 mr-5"
              ></v-autocomplete>
            </v-col> -->
          </v-row>
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="generate"> Sync </v-btn>
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
      branch: '',
      dates_regular: ["2023-01-01", "2024-01-01"],
      create: false,
      reveal: false,
      search: "",
      selected: [],
      loader: null,
      loading: false,
      submitDisable: true,
      headers: [
         { text: "BRANCH", align: "left", value: "branch" },
        { text: "CUSTOMER NAME", align: "left", value: "customername" },
        { text: "ADDRESS", align: "left", value: "address" },
        { text: "UNPAID BALANCE", align: "left", value: "balance" },
        // { text: "Actions", align: "center", value: "action", sortable: false },
      ],
    };
  },
  computed: {
    ...mapGetters({
        blacklisted_data: "blacklisted/getBlackListed",
        permissions: "userPermissions/getPermission",
        branches: "blacklisted/getBranchSeries",
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
    this.$store.dispatch("blacklisted/fetchBlackListed");
    this.$store.dispatch("blacklisted/fetchBranchSeries");
    this.$store.dispatch("userPermissions/fetchPermission");
  },
  methods: {
    generate(){
      let data = {
        date: this.dates_regular,
        branch: this.branch['Name']
      }
     this.$store.dispatch("blacklisted/searchBlacklisted", data);
    },
    refreshData() {
      this.$store.dispatch("blacklisted/fetchBlackListed");
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