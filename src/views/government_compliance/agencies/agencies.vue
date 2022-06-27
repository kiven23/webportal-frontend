<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="agencies_data"
        :search="search"
        :loading="loadingStatus"
        show-select
        class="elevation-1"
      >
    
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Agencies Document</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom v-if="userCanCreate_role">
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>Add</span>
            </v-tooltip>

            <v-tooltip bottom v-if="deleteAll">
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
            </v-tooltip>

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

            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            ></v-text-field>

            <v-dialog
              fullscreen
              persistent
              scrollable
              :value="dialog"
              max-width="500px"
              hide-overlay
              transition="dialog-bottom-transition"
            >
              <v-card>
                <v-car-title>
                  <v-toolbar>
                    <v-btn icon @click="close">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>

                    <v-toolbar-title v-if="viewOnly !== 1">
                      {{ formTitle }}</v-toolbar-title
                    >
                    <v-toolbar-title
                      v-if="viewOnly !== 0"
                      style="
                        text-transform: uppercase;
                        font-size: 12px;
                        font-weight: bold;
                      "
                      >{{ reportID }}</v-toolbar-title
                    >

                    <v-spacer></v-spacer>
                    <v-toolbar-items v-if="viewOnly !== 1">
                      <v-btn
                        color="blue-grey"
                        @click="save()"
                        v-if="viewMode !== true && userCanCreate_role"
                      >
                        {{
                          editedIndex === -1 ? "Upload" : "Update / Add Data"
                        }}</v-btn
                      >
                    </v-toolbar-items>
                  </v-toolbar>
                </v-car-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="4" v-if="viewOnly !== 1">
                        <v-card class="mx-auto" max-width="344">
                          <v-card-text>
                            <div>DOLE</div>
                          </v-card-text>
                          <v-col cols="12">
                            <v-file-input
                              v-model="uploadData.dole_file"
                              
                              chips
                              multiple
                              @change="check"
                              label="File input w/ chips"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12"> </v-col>
                        </v-card>
                      </v-col>
                      <v-col cols="4" v-if="viewOnly !== 1">
                        <v-card class="mx-auto" max-width="344">
                          <v-card-text>
                            <div>BIR</div>
                          </v-card-text>
                          <v-col cols="12">
                            <v-file-input
                              v-model="uploadData.bir_file"
                              chips
                              multiple
                              label="File input w/ chips"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12"> </v-col>
                        </v-card>
                      </v-col>
                      <v-col cols="4" v-if="viewOnly !== 1">
                        <v-card class="mx-auto" max-width="344">
                          <v-card-text>
                            <div>LGU</div>
                          </v-card-text>
                          <v-col cols="12">
                            <v-file-input
                              v-model="uploadData.lgu_file"
                              chips
                              multiple
                              label="File input w/ chips"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12"> </v-col>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="4"
                        v-if="editedIndex !== -1 || viewOnly !== 0"
                      >
                        <v-card class="mx-auto" max-width="344">
                          <v-card-text>
                            <div>ATTACHMENT - DOLE</div>
                          </v-card-text>
                          <v-col cols="12">
                            <div
                              v-for="(item, $index) in downloadData.data.dole"
                              :key="$index"
                            >
                              <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    x-small
                                    color="secondary"
                                    dark
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="download(item)"
                                    :disabled="Download_role == false"
                                  >
                                    <strong
                                      style="
                                        white-space: nowrap;
                                        width: 100px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                      "
                                      >{{ item.filename }}</strong
                                    >
                                    <strong style="color: orange"
                                      >~({{ item.size }})</strong
                                    ><v-icon right color="green"
                                      >mdi-download</v-icon
                                    >
                                  </v-btn>
                                </template>
                                <span>{{ item.filename }}</span>
                              </v-tooltip>

                              <v-icon
                                right
                                color="red"
                                small
                                dense
                                @click="trash(item, 'dole')"
                                v-if="viewOnly !== 1 && deleteAll"
                                >mdi-delete</v-icon
                              >
                            </div>
                          </v-col>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="4"
                        v-if="editedIndex !== -1 || viewOnly !== 0"
                      >
                        <v-card class="mx-auto" max-width="344">
                          <v-card-text>
                            <div>ATTACHMENT - BIR</div>
                          </v-card-text>
                          <v-col cols="12">
                            <div
                              v-for="(item, $index) in downloadData.data.bir"
                              :key="$index"
                            >
                              <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    x-small
                                    color="secondary"
                                    dark
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="download(item)"
                                    :disabled="Download_role == false"
                                  >
                                    <strong
                                      style="
                                        white-space: nowrap;
                                        width: 100px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                      "
                                      >{{ item.filename }}</strong
                                    >
                                    <strong style="color: orange"
                                      >~({{ item.size }})</strong
                                    ><v-icon right color="green"
                                      >mdi-download</v-icon
                                    >
                                  </v-btn>
                                </template>
                                <span>{{ item.filename }}</span>
                              </v-tooltip>

                              <v-icon
                                right
                                color="red"
                                small
                                dense
                                @click="trash(item, 'bir')"
                                v-if="viewOnly !== 1 && deleteAll"
                                >mdi-delete</v-icon
                              >
                            </div>
                          </v-col>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="4"
                        v-if="editedIndex !== -1 || viewOnly !== 0"
                      >
                        <v-card class="mx-auto" max-width="344">
                          <v-card-text>
                            <div>ATTACHMENT - LGU</div>
                          </v-card-text>
                          <v-col cols="12">
                            <div
                              v-for="(item, $index) in downloadData.data.lgu"
                              :key="$index"
                            >
                              <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    x-small
                                    color="secondary"
                                    dark
                                    v-bind="attrs"
                                    v-on="on"
                                    @click="download(item)"
                                    :disabled="Download_role == false"
                                  >
                                    <strong
                                      style="
                                        white-space: nowrap;
                                        width: 100px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                      "
                                      >{{ item.filename }}</strong
                                    >
                                    <strong style="color: orange"
                                      >~({{ item.size }})</strong
                                    ><v-icon right color="green"
                                      >mdi-download</v-icon
                                    >
                                  </v-btn>
                                </template>
                                <span>{{ item.filename }}</span>
                              </v-tooltip>

                              <v-icon
                                right
                                color="red"
                                small
                                dense
                                @click="trash(item, 'lgu')"
                                v-if="viewOnly !== 1 && deleteAll"
                                >mdi-delete</v-icon
                              >
                            </div>
                          </v-col>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>

        <!-- <template v-slot:header.data-table-select="{ on, props }">
          <v-simple-checkbox
            v-bind="props"
            v-on="on"
            :disabled="providers.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.connectivity_tickets.length > 0"
            :disabled="item.connectivity_tickets.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template> -->

        <template v-slot:item.action="{ item }">
          <v-dialog transition="dialog-bottom-transition" max-width="600">
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                v-on="on"
                small
                class="mr-2"
                @click="getdataDate(item.branch.id)"
              >
                mdi-check
              </v-icon>
            </template>
            <template v-slot:default="dialog">
              <v-card>
                <v-toolbar color="primary" dark>Upload History</v-toolbar>

                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Jan</th>
                        <th class="text-left">Feb</th>
                        <th class="text-left">Mar</th>
                        <th class="text-left">Apr</th>
                        <th class="text-left">May</th>
                        <th class="text-left">Jun</th>
                        <th class="text-left">Jul</th>
                        <th class="text-left">Aug</th>
                        <th class="text-left">Sept</th>
                        <th class="text-left">Oct</th>
                        <th class="text-left">Nov</th>
                        <th class="text-left">Dec</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- v-for="(items, $index) in date_history.data"
                              :key="$index" -->
                      <tr  >
                   
                          <td v-for="(items, $index) in date_history.data"
                          :key="$index"><v-icon v-if="items" color="success">mdi-check</v-icon></td>
                        
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <v-card-actions class="justify-end">
                  <v-btn text @click="dialog.value = false">Close</v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
          <v-icon
            small
            class="mr-2"
            @click="editArchived(item)"
            v-if="Editdoc_role"
          >
            mdi-pencil
          </v-icon>
          <v-icon small @click="viewArchived(item)" v-if="ShowDoc_role">
            mdi-content-duplicate
          </v-icon>
        </template>
      </v-data-table>
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
      reveal: false,
      search: "",
      selected: [],
      loader: null,
      loading: false,
      disabledCount: 0,
      submitDisable: true,
      headers: [
        { text: "DOC_CODE", align: "left", value: "doc_code" },
        { text: "BRANCH", align: "left", value: "branch.name" },
        { text: "UPLOAD_BY", align: "left", value: "upload_by" },
        { text: "FILE CREATED", align: "left", value: "created_at" },
        { text: "Actions", align: "center", value: "action", sortable: false },
      ],
      editedIndex: -1,
      viewMode: false,
      viewOnly: 0,
      reportID: "",
      downloadData: [],
      uploadData: {
        dole_file: [],
        bir_file: [],
        lgu_file: [],
        id: [],
      },
      document_id: "",
    };
  },
  validations: {
    test: { required },
  },
  computed: {
    ...mapGetters({
      agencies_data: "agencies/getAgencies",
      date_history: "agencies/getdate_history",
      permissions: "userPermissions/getPermission",
    }),
    deleteAll() {
      return this.permissions.includes("Delete Agencies File");
    },
    userCanCreate_role() {
      return this.permissions.includes("Create Agencies File");
    },
    ShowDoc_role() {
      return this.permissions.includes("Show Agencies File");
    },
    Editdoc_role() {
      return this.permissions.includes("Edit Agencies File");
    },
    Download_role() {
      return this.permissions.includes("Download Agencies Files");
    },
    dialog() {
      return this.$store.state.dialog;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
    formTitle() {
      return this.editedIndex === -1 ? "New Agencies" : "Edit Agencies";
    },
    // testErrors() {
    //   const errors = [];
    //   if (!this.$v.test.$dirty) return errors;
    //   var requiredError = null;

    //   requiredError = "The Dole field is required.";

    //   !this.$v.test.required && errors.push(requiredError);
    //   return errors;
    // },
  },

  watch: {
    providers() {
      this.$v.$reset(); // reset validation
    },
  },
  created() {
    this.$store.dispatch("agencies/fetchAgencies");
    this.$store.dispatch("userPermissions/fetchPermission");
  },

  methods: {
    deleteAgency() {
      const agency = this.$data.selected;
      const agencyIds = agency.map((agencies) => {
        return agencies.id;
      });
      
      const agencyNames = agency.map((agencies) => {
        const lists = "<br />" + agencies.doc_code;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            agencyNames,
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
            this.$store.dispatch("agencies/deleteAgencies", agencyIds);
            this.$data.selected = []; // reset selected
            this.refreshData();
          }
        });
    },
    refreshData() {
      this.$store.dispatch("agencies/fetchAgencies");
      this.uploadData = {
        dole_file: [],
        bir_file: [],
        lgu_file: [],
        id: [],
      };
    },
    openDialog() {
      this.viewOnly = 0;
      this.viewMode = false;
      this.refreshData();
      this.editedIndex = -1; // reset default
      this.$store.dispatch("triggerDialog", true);
    },
    getfile() {},
    editArchived(data) {
      this.document_id = data.unique_id;
      this.uploadData.id = [];
      this.uploadData.id.push(this.document_id);
      this.viewMode = false;
      this.viewOnly = 0;
      let index = this.agencies_data.indexOf(data);
      this.editedIndex = index;
      let dole = [],
        bir = [],
        lgu = [];
      data.dl_data.forEach((value, index) => {
        if (value.doc_type == 1) {
          dole.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 2) {
          bir.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 3) {
          lgu.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
      });
      this.downloadData = {
        data: {
          dole: dole,
          bir: bir,
          lgu: lgu,
        },
      };
      this.$store.dispatch("triggerDialog", true);
    },
    viewArchived(data) {
      this.editedIndex = -1;
      this.reportID = data.doc_code;
      this.viewOnly = 1;
      let dole = [],
        bir = [],
        lgu = [];
      data.dl_data.forEach((value, index) => {
        if (value.doc_type == 1) {
          dole.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 2) {
          bir.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 3) {
          lgu.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
      });
      this.downloadData = {
        data: {
          dole: dole,
          bir: bir,
          lgu: lgu,
        },
      };
      this.$store.dispatch("triggerDialog", true);
      // console.log(data);
    },
    check() {
      // console.log(this.uploadData);
    },
    download(data) {
      this.$store.dispatch("agencies/downloadAgencies", data);
    },
    getdataDate(data) {
      this.$store.dispatch("agencies/getDateAgencies", data);
    },
    trash(data, dataType) {
      let dole = this.downloadData.data[dataType];
      dole.forEach((value, index) => {
      
        if (value.id == data.id) {
          this.downloadData.data[dataType].splice(index, 1);
          this.$store.dispatch("agencies/trashAgencies", data);
          this.refreshData();
        }
      });
    },
    close() {
      this.editedIndex = -1;
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },
    save() {
      // this.$v.$touch();
      if (this.editedIndex === -1) {
        this.$store.dispatch("agencies/storeAgencies", this.uploadData);
        this.refreshData();
      } else {
        this.$store.dispatch("agencies/updateAgencies", this.uploadData);
        this.refreshData();
      }
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