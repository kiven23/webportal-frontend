<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="cdr_data"
        :search="search"
        :loading="loadingStatus"
        show-select
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Customer Digitized Requirements</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom v-if="userCanCreate_role">
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
              </template>
              <span>Add</span>
            </v-tooltip>

            <v-tooltip bottom   v-if="deleteAll">
              <template v-slot:activator="{ on }">
                <v-btn
                  :disabled="!selected.length > 0"
                  text
                  icon
                  v-on="on"
                  @click="deleteCDR"
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
                        v-if="viewMode !== true"
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
                      <v-col
                        cols="6"
                        v-if="editedIndex === -1 || viewOnly == 0"
                        
                      >
                        <v-card  class="pa-6">
                          <v-card-text>
                            <div>CUSTOMER INFO</div>
                          </v-card-text>
                          <v-text-field
                            label="Name of Customer"
                            :rules="rules"
                            hide-details="auto"
                            :disabled="viewOnly == 1 ? true : false"
                            v-model="uploadData.custormer_info.customer_name"
                          ></v-text-field>
                          <v-menu
                            ref="menu"
                            v-model="menu"
                            :close-on-content-click="false"
                            :return-value.sync="date"
                            transition="scale-transition"
                            offset-y
                            min-width="auto"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-text-field
                                v-model="uploadData.custormer_info.birthday"
                                label="Birthday"
                                prepend-icon="mdi-calendar"
                                readonly
                                v-bind="attrs"
                                v-on="on"
                                :disabled="viewOnly == 1 ? true : false"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="uploadData.custormer_info.birthday"
                              no-title
                              scrollable
                            >
                              <v-spacer></v-spacer>
                              <v-btn text color="primary" @click="menu = false">
                                Cancel
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="
                                  $refs.menu.save(
                                    uploadData.custormer_info.birthday
                                  )
                                "
                              >
                                OK
                              </v-btn>
                            </v-date-picker>
                          </v-menu>

                          <v-autocomplete
                            v-model="uploadData.custormer_info.branch"
                            :items="branches"
                            item-value="value"
                            item-text="name"
                            return-object
                            dense
                            filled
                            :disabled="viewOnly == 1 ? true : false"
                            label="Branch"
                          ></v-autocomplete>

                          <v-text-field
                            label="Unit Availed (Model)"
                            :rules="rules"
                            hide-details="auto"
                            v-model="uploadData.custormer_info.unit_avail"
                            :disabled="viewOnly == 1 ? true : false"
                          ></v-text-field>
                        </v-card>
                      </v-col>
                      <v-col cols="6">
                        <v-card
                          class="d-flex align-center flex-column mb-6"
                          v-if="viewOnly == 1 || editedIndex !== -1"
                        >
                          <v-card-text>
                            <div>PREVIEW / PDF / JPEG / PNG</div>
                            <vs-button
                              icon
                              color="danger"
                              border
                              @click="print()"
                              v-if="printing == true"
                            >
                              <v-icon>print</v-icon>
                            </vs-button>
                          </v-card-text>
                          <!-- <v-img
                            max-height="150"
                            max-width="250"
                            :src="attachment_data"
                            style="margin: 10px"
                          ></v-img> -->
                          <div id="printer">
                            <iframe
                              class="embed-responsive-item"
                              :src="attachment_data"
                              allowfullscreen
                              frameborder="0"
                              style="margin: 10px; width: 550px; height: 400px"
                            ></iframe>
                          </div>
                        </v-card>
                      </v-col>

                      <v-col cols="3" v-if="viewOnly !== 1">
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>APPLICATION FORM</div>
                          </v-card-text>
                          <v-col cols="12">
                            <v-file-input
                              v-model="uploadData.application_file"
                              chips
                              @change="check"
                              label="Application Form"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12"> </v-col>
                        </v-card>
                      </v-col>
                      <v-col cols="3" v-if="viewOnly !== 1">
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>PICTURE 2x2</div>
                          </v-card-text>
                          <v-col cols="12">
                            <v-file-input
                              v-model="uploadData.picture_file"
                              chips
                              label="2X2 Picture"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12"> </v-col>
                        </v-card>
                      </v-col>
                      <v-col cols="3" v-if="viewOnly !== 1">
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>VALID ID</div>
                          </v-card-text>
                          <v-col cols="12">
                            <v-file-input
                              v-model="uploadData.validID_file"
                              chips
                              multiple
                              label="Valid ID Passport, Drivers License..etc"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12"> </v-col>
                        </v-card>
                      </v-col>
                      <v-col cols="3" v-if="viewOnly !== 1">
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>PROOF OF BILLING</div>
                          </v-card-text>
                          <v-col cols="12">
                            <v-file-input
                              v-model="uploadData.proof_of_billing"
                              chips
                              multiple
                              label="Proof of bill"
                            ></v-file-input>
                          </v-col>
                          <v-col cols="12"> </v-col>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="3"
                        v-if="editedIndex !== -1 || viewOnly !== 0"
                      >
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>ATTACHMENT - APPLICATION FORM</div>
                          </v-card-text>
                          <v-col cols="12">
                            <div
                              v-for="(item, $index) in downloadData.data
                                .application"
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
                                    v-if="Download_role"
                                  >
                                    <strong
                                      style="
                                        white-space: nowrap;
                                        width: 60px;
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
                                @click="trash(item, 'application')"
                                v-if="viewOnly !== 1 && deleteAll"
                                >mdi-delete</v-icon
                              >
                              <v-icon
                                right
                                color="green"
                                small
                                dense
                                @click="preview(item)"
                                >mdi-eye</v-icon
                              >
                            </div>
                          </v-col>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="3"
                        v-if="editedIndex !== -1 || viewOnly !== 0"
                      >
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>ATTACHMENT - 2X2 PICTURE</div>
                          </v-card-text>
                          <v-col cols="12">
                            <div
                              v-for="(item, $index) in downloadData.data
                                .picture"
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
                                    v-if="Download_role"
                                  >
                                    <strong
                                      style="
                                        white-space: nowrap;
                                        width: 60px;
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
                                @click="trash(item, 'picture')"
                                v-if="viewOnly !== 1 && deleteAll"
                                >mdi-delete</v-icon
                              >
                              <v-icon
                                right
                                color="green"
                                small
                                dense
                                @click="preview(item)"
                                >mdi-eye</v-icon
                              >
                            </div>
                          </v-col>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="3"
                        v-if="editedIndex !== -1 || viewOnly !== 0"
                      >
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>ATTACHMENT - VALID ID</div>
                          </v-card-text>
                          <v-col cols="12">
                            <div
                              v-for="(item, $index) in downloadData.data
                                .valid_ids"
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
                                    v-if="Download_role"
                                  >
                                    <strong
                                      style="
                                        white-space: nowrap;
                                        width: 60px;
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
                                @click="trash(item, 'valid_ids')"
                                v-if="viewOnly !== 1 && deleteAll"
                                >mdi-delete</v-icon
                              >
                              <v-icon
                                right
                                color="green"
                                small
                                dense
                                @click="preview(item)"
                                >mdi-eye</v-icon
                              >
                            </div>
                          </v-col>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="3"
                        v-if="editedIndex !== -1 || viewOnly !== 0"
                      >
                        <v-card class="mx-auto" max-width="330">
                          <v-card-text>
                            <div>ATTACHMENT - PROOF OF BILLING</div>
                          </v-card-text>
                          <v-col cols="12">
                            <div
                              v-for="(item, $index) in downloadData.data.proof"
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
                                    v-if="Download_role"
                                  >
                                    <strong
                                      style="
                                        white-space: nowrap;
                                        width: 60px;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                      "
                                      >{{ item.filename }}</strong
                                    >
                                    <strong style="color: orange"
                                      >~({{ item.size }})</strong
                                    >
                                    <v-icon right color="green"
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
                                @click="trash(item, 'proof')"
                                v-if="viewOnly !== 1 && deleteAll"
                                >mdi-delete</v-icon
                              >
                              <v-icon
                                right
                                color="green"
                                small
                                dense
                                @click="preview(item)"
                                >mdi-eye</v-icon
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
          <v-icon small class="mr-2" @click="editCDR(item)" v-if="Editdoc_role">
            mdi-pencil
          </v-icon>
          <v-icon small @click="viewCDR(item)" v-if="ShowDoc_role">
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
      menu: false,
      modal: false,
      menu2: false,
      reveal: false,
      printing: false,
      search: "",
      selected: [],
      loader: null,
      loading: false,
      disabledCount: 0,
      submitDisable: true,
      headers: [
        { text: "NAME OF CUSTOMER", align: "left", value: "customer_name" },
        { text: "BIRTHDAY", align: "left", value: "birthday" },
        { text: "BRANCH", align: "left", value: "branch.name" },
        { text: "UNIT AVAILED", align: "left", value: "unit_availed" },
        { text: "DATE CREATED", align: "left", value: "created_at" },
        { text: "Actions", align: "center", value: "action", sortable: false },
      ],
      editedIndex: -1,
      viewMode: false,
      viewOnly: 0,
      reportID: "",
      downloadData: [],
      uploadData: {
        application_file: [],
        picture_file: [],
        validID_file: [],
        proof_of_billing: [],
        id: [],
        custormer_info: {
          customer_name: "",
          birthday: new Date(
            Date.now() - new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .substr(0, 10),
          branch: "",
          unit_avail: "",
        },
      },
      document_id: "",
    };
  },
  validations: {
    test: { required },
  },

  computed: {
    ...mapGetters({
      cdr_data: "digitized/getCdr",
      branches: "digitized/getBranches",
      attachment_data: "digitized/getAttachment",
      permissions: "userPermissions/getPermission",
    }),
    deleteAll() {
      return this.permissions.includes("Delete CDR");
    },
    userCanCreate_role() {
      return this.permissions.includes("Create CDR");
    },
    ShowDoc_role() {
      return this.permissions.includes("Show CDR");
    },
    Editdoc_role() {
      return this.permissions.includes("Edit CDR");
    },
    Download_role() {
      return this.permissions.includes("Download CDR");
    },
    attachdata() {
      return this.$store.state.attachment_data;
    },
    dialog() {
      return this.$store.state.dialog;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
    formTitle() {
      return this.editedIndex === -1
        ? "New Customer Requirement"
        : "Edit Customer Requirement";
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
    this.$store.dispatch("digitized/fetchCDR");
    this.$store.dispatch("digitized/fetchbranches");

    this.$store.dispatch("userPermissions/fetchPermission");
  },

  methods: {
    deleteCDR() {
      const CDR = this.$data.selected;
      const CDRIds = CDR.map((customer) => {
        return customer.id;
      });
      const CDRNames = CDR.map((customer) => {
        const lists = "<br />" + customer.doc_id;
        return lists;
      });
      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" + CDRNames,
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
            this.$store.dispatch("digitized/deleteCDR", CDRIds);
            this.$data.selected = []; // reset selected
            this.refreshData();
          }
        });
    },
   async print(){
      await this.$htmlToPaper('printer');
    },
    refreshData() {
      this.$store.dispatch("digitized/fetchCDR");
      this.$store.dispatch("digitized/fetchbranches");
      this.uploadData.custormer_info = {
        customer_name: "",
        birthday: "",
        branch: "",
        unit_avail: "",
      };
      this.downloadData = {
        data: {
          application: [],
          picture: [],
          valid_ids: [],
          proof: [],
        },
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
    editCDR(data) {
      this.document_id = data.doc_id;
      this.uploadData.id = [];
      this.uploadData.id.push(this.document_id);
      this.viewMode = false;
      this.viewOnly = 0;
      let index = this.cdr_data.indexOf(data);
      this.editedIndex = index;
      let application = [],
        picture = [],
        valid_ids = [],
        proof_of_billing = [];
      data.dl_data.forEach((value, index) => {
        if (value.doc_type == 1) {
          application.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 2) {
          picture.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 3) {
          valid_ids.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 4) {
          proof_of_billing.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
      });
      this.uploadData.custormer_info = {
        customer_name: data.customer_name,
        birthday: data.birthday,
        branch: data.branch.id,
        unit_avail: data.unit_availed,
      };
      this.downloadData = {
        data: {
          application: application,
          picture: picture,
          valid_ids: valid_ids,
          proof: proof_of_billing,
        },
      };

      this.$store.dispatch("triggerDialog", true);
    },
    viewCDR(data) {
      this.editedIndex = -1;
      this.reportID = data.doc_id;
      this.viewOnly = 1;
      let application = [],
        picture = [],
        valid_ids = [],
        proof_of_billing = [];
      data.dl_data.forEach((value, index) => {
        if (value.doc_type == 1) {
          application.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 2) {
          picture.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 3) {
          valid_ids.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
        if (value.doc_type == 4) {
          proof_of_billing.push({
            filename: value.filename,
            id: value.id,
            size: value.size,
          });
        }
      });
      this.uploadData.custormer_info = {
        customer_name: data.customer_name,
        birthday: data.birthday,
        branch: data.branch.id,
        unit_avail: data.unit_availed,
      };
      this.downloadData = {
        data: {
          application: application,
          picture: picture,
          valid_ids: valid_ids,
          proof: proof_of_billing,
        },
      };
      this.$store.dispatch("triggerDialog", true);
    },
    check() {
      // console.log(this.uploadData);
    },
    download(data) {
      this.$store.dispatch("digitized/download", data);
    },
    preview(data) {
      this.$store.dispatch("digitized/preview", data);
      var extension = data.filename.split('.').pop(); 
      console.log(extension);
      if(extension !== 'pdf'){
        this.printing = true
      }else{
         this.printing = false
      }
 
    },
    trash(data, dataType) {
      let dole = this.downloadData.data[dataType];
      dole.forEach((value, index) => {
        if (value.id == data.id) {
          this.downloadData.data[dataType].splice(index, 1);
          this.$store.dispatch("digitized/trashCDR", data);
         
        }
      });
    },
    close() {
      this.editedIndex = -1;
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },
    save() {
      this.$v.$touch();
      if (this.editedIndex === -1) {
        this.$store.dispatch("digitized/storeCDR", this.uploadData);
        this.refreshData();
      } else {
        this.$store.dispatch("digitized/updateCDR", this.uploadData);
        this.refreshData();
      }
      this.refreshData();
      console.log(this.uploadData)
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