<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="queries"
        :search="search"
        :loading="loadingStatus"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Searching of Vehicle Parts</v-toolbar-title>
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
                <json-excel :data="queries">
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
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-toolbar>
        </template>
          
      </v-data-table>
      <v-dialog
            v-model="create"
            max-width="500px"
          >
            <v-card>

              <v-card-title>
                Select Vehicle Parts & Type
              </v-card-title>
              <v-card-text>
                <v-select
                  :items="parts"
                  label="Parts"
                  v-model="vpart"
                  item-value="name"
                  item-text="name"
                 ></v-select>
            
                 <v-select
                  :items="types"
                  v-model="vtype"
                  label="Type"
                  item-text="U_vRMExpTyp"
                  item-value="U_vRMExpTyp"
                 ></v-select>
              </v-card-text>
              <v-card-actions right>
                <v-btn
                  color="primary"
                  text
                  @click="generate()"
                  
                >
                  Generate
                </v-btn>
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
          <v-toolbar-title style="color: black">Searching of Vehicle Parts Print Preview</v-toolbar-title>
          <v-spacer></v-spacer>
 
        </v-toolbar>
 
        <v-divider></v-divider>
        <iframe v-if="iden == 1" :src="printLink"  ref="myiframe"  style="width: 100%; height: 1000px;" title="Searching of Vehicle Parts PrintPreview">
        
        

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
      vpart: '',
      vtype: '',
      itemsdata: [],
      iden: 0,
      printLink: "",
      printDialog: false,
      create: false,
      reveal: false,
      search: "",
      selected: [],
      loader: null,
      loading: false,
      submitDisable: true,
      headers: [
        { text: "CATEGORY", align: "left", value: "CATEGORY" },
        { text: "VEHICLE PART", align: "left", value: "VEHICLE PART" },
        { text: "BODY TYPE", align: "left", value: "BODY TYPE" },
        { text: "EXPENSE TYPE", align: "left", value: "EXPENSE TYPE" },
        { text: "LIFE SPAN", align: "left", value: "LIFE SPAN" },
      ],
    };
  },
  computed: {
    ...mapGetters({
      parts: "searching_of_vehicles_parts/PARTS",
      types: "searching_of_vehicles_parts/TYPES",
      queries: "searching_of_vehicles_parts/QUERIES",
      permissions: "userPermissions/getPermission",
      currentUser: "currentUser",
   
    }),
    dialog() {
      return this.$store.state.dialog;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
  },
  created() {
    this.$store.dispatch("searching_of_vehicles_parts/fetchVEHICLEPARTS");
    this.$store.dispatch("searching_of_vehicles_parts/fetchVEHICLETYPE");
    this.$store.dispatch("userPermissions/fetchPermission");
  },
  methods: {
    printpre(){
        this.printLink = "";
        this.printDialog = true;
        this.iden = 0; 
        // this.printLink = 'http://192.168.1.19:7771/api/public/reports/queries/searchofvehicleparts?q=printing&part='+this.vpart+'&type='+this.vtype+'';
        // fetch('http://192.168.1.19:7771/api/public/reports/queries/searchofvehicleparts?q=printing&part='+this.vpart+'&type='+this.vtype+'').then((res)=>{
        //    this.iden = 1; 
        // })
        async function getSrc(token, vpart, vtype) {
              const res = await fetch('http://192.168.1.19:7771/api/public/reports/queries/searchofvehicleparts?q=printing&part='+vpart+'&type='+vtype+'', {
              method: 'GET',
              headers: {
                'Authorization' : `Bearer ${ token }`
              }
              });
              const blob = await res.blob();
              const urlObject = URL.createObjectURL(blob);
              document.querySelector('iframe').setAttribute("src", urlObject)
              
        }
         getSrc(this.currentUser.token, this.vpart, this.vtype);
         this.iden = 1; 
      },
  async  generate() {
      this.itemsdata = {
        type: this.vtype,
        part: this.vpart
      }
      await this.$store.dispatch("searching_of_vehicles_parts/GenerateVEHICLETQUERIES", this.itemsdata);
       this.create = false;
    },
     refreshData() {
      this.$store.dispatch("searching_of_vehicles_parts/GenerateVEHICLETQUERIES", this.itemsdata);
    },
    openDialog() {
      
      this.create = true;
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