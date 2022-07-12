<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="overdues"
        :search="search"
        :loading="loadingStatus"
        item-key="index"
        sort-by="branch"
        class="elevation-1"
        group-by="branch"
        :custom-filter="customFilter"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Credit Dunning Letters</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
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
            <!-- <v-row>
              <v-col cols="12" sm="4">
                <v-autocomplete
                v-model="branch"
                :loading="loadingStatus"
                :items="branches"
                dense
                label="Select Branch"
                chips
                hide-details
                hide-selected
                solo
                @change="get()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="4">
                <v-autocomplete
                  v-model="aging"
                  :loading="loadingStatus"
                  :items="agings"
                  dense
                  item-value="value"
                  item-text="name"
                  label="Select Overdue"
                  chips
                  hide-details
                  hide-selected
                  solo
                  @change="get()"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="4">
                 <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
              </v-col>
            </v-row> -->
          </v-toolbar>
        </template>
        <template v-slot:group.header="{ toggle, isOpen, group}">
          <th colspan="3">    
            <v-icon :class="{active: isOpen}" class="mr-2" @click="toggle"
              >
                mdi-chevron-down
            </v-icon>
            {{ group.toUpperCase() }} BRANCH
          </th>
        </template>
        <template v-slot:item.aging="{ item }">
          {{ getOverdue(item.aging) }}
        </template>
        <template v-slot:item.action="{ item }">
          <v-btn
            small
            text
            depressed
            :loading="downloading[item.row_id]"
            :disabled="downloading[item.row_id]"
            
            @click="downloadLetters(item)"
          >
            <v-icon left>
              mdi-file-download-outline
            </v-icon>
            Download Letters
            <template v-slot:loader>
              <span class="mr-2">Dowloading... </span>
              <span class="custom-loader">
                <v-icon light>mdi-dots-circle</v-icon>
              </span>
            </template>
          </v-btn>
        </template>

      </v-data-table>
    </v-container>
  </div>
</template>

<script>
//import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      selected: [],
      search: "",
      headers: [
        { text: "BRANCH", align: "start", value: "branch" },
        { 
          text: "OVERDUE", 
          align: "start", 
          value: "aging", 
          groupable: false, 
        },
        { text: "OVERDUE TOTAL", align: "center", value: "aging_count", groupable: false, },
        { text: "ACTIONS", align: "start", value: "action", sortable: false, groupable: false, },
      ],
      // branch: "",
      // aging: "",
      //loader: null,
    };
  },

  computed: {
    ...mapGetters({
      overdues: "dunning/getOverdues",
      downloading: "dunning/getDownloadingStatus",
      // branches: "dunning/getBranches",
      // agings: "dunning/getAgings",
    }),
    loadingStatus() {
      return this.$store.state.loading;
    },
    getOverdue() {
      return (aging)  => {
        return aging.substring(aging.indexOf(" "), aging.length)
      }
    }
  },
  created() {
    //this.$store.dispatch("dunning/fetchBranches");
    //this.$store.dispatch("dunning/test")
    this.get()
  },

  methods: {
    customFilter (value, search, item) {
      
      if(value != null && item.aging == value) {
        value = this.getOverdue(value)
      }

      return value != null &&
        search != null &&
        typeof value === 'string' &&
        value.toString().toLocaleLowerCase().indexOf(search) !== -1
    
    },
    refreshData() {
      this.get()
    },
    downloadLetters({ branch, aging, row_id }){
      this.$store.dispatch("dunning/downloadLetters", { branch, aging, index: row_id })
    },
    get() {
      this.$store.dispatch("dunning/fetchOverdues");
    },
  },
}
</script>
<style scoped>
.v-row-group__header .v-icon.active {
  transform: rotate(-180deg);
}

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