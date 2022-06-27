<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="tct_data"
        :search="search"
        :loading="loadingStatus"
        show-select
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Land Docs Archived</v-toolbar-title>
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
                  @click="deleteItem()"
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

                    <v-toolbar-title v-if="viewMode !== true">
                      {{ formTitle }}</v-toolbar-title
                    >
                    <v-toolbar-title
                      v-if="viewMode !== false"
                      style="
                        text-transform: uppercase;
                        font-size: 12px;
                        font-weight: bold;
                      "
                      >{{ reportID }}</v-toolbar-title
                    >

                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                      <v-btn text @click="save" v-if="viewMode !== true">
                        {{ editedIndex === -1 ? "Submit" : "Update" }}</v-btn
                      >
                      <!-- <v-btn text @click="save" v-if="viewMode !== false">
                        SEARCH</v-btn
                      > -->
                    </v-toolbar-items>
                  </v-toolbar>
                </v-car-title>
                <v-card-text>
                  <v-container>
                    <v-row no-gutters>
                      <v-col cols="12" sm="4">
                        <v-card class="pa-2" outlined tile>
                          <fieldset class="pa-4">
                            <legend>TCT DETAILS</legend>
                            <v-text-field
                              v-model="archivedData.tctinfo.tctNumber"
                              :disabled="loadingStatus"
                              label="TCT No:"
                              @input="
                                $v.archivedData.tctinfo.tctNumber.$touch()
                              "
                              :error-messages="tctNumberError"
                              required
                            ></v-text-field>
                            <v-text-field
                              v-model="archivedData.tctinfo.area"
                              :disabled="loadingStatus"
                              :error-messages="areaError"
                              label="Area:"
                            ></v-text-field>
                            <v-text-field
                              v-model="archivedData.tctinfo.location"
                              :disabled="loadingStatus"
                              :error-messages="locationError"
                              label="Location:"
                            ></v-text-field>
                            <v-dialog
                              ref="dialog"
                              v-model="dateAquredM"
                              :return-value.sync="
                                archivedData.tctinfo.dateAquired
                              "
                              persistent
                              width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="archivedData.tctinfo.dateAquired"
                                  label="Date Acquired"
                                  prepend-icon="mdi-calendar"
                                  :error-messages="dateAquiredError"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="archivedData.tctinfo.dateAquired"
                                scrollable
                              >
                                <v-spacer></v-spacer>
                                <v-btn
                                  text
                                  color="primary"
                                  @click="dateAquredM = false"
                                >
                                  Cancel
                                </v-btn>
                                <v-btn
                                  text
                                  color="primary"
                                  @click="
                                    $refs.dialog.save(
                                      archivedData.tctinfo.dateAquired
                                    )
                                  "
                                >
                                  OK
                                </v-btn>
                              </v-date-picker>
                            </v-dialog>
                          </fieldset>
                          <fieldset class="pa-4">
                            <legend>TAX DECLARATION DETAILS</legend>
                            <v-text-field
                              v-model="archivedData.taxDecInfo.taxDecNumber"
                              :disabled="loadingStatus"
                              :error-messages="taxDecNumberError"
                              label="Tax Declaration No:"
                            ></v-text-field>
                            <v-text-field
                              v-model="archivedData.taxDecInfo.owner"
                              :disabled="loadingStatus"
                              :error-messages="ownerError"
                              label="Owner:"
                            ></v-text-field>
                            <v-text-field
                              v-model="archivedData.taxDecInfo.previousOwner"
                              :disabled="loadingStatus"
                              :error-messages="previousOwnerError"
                              label="Previous Owner:"
                            ></v-text-field>
                            <label>Type</label>
                            <v-radio-group
                              v-model="archivedData.taxDecInfo.taxDecOption"
                              :error-messages="taxDecOptionError"
                              row
                            >
                              <v-radio
                                label="Land"
                                value="tax-dec-land"
                              ></v-radio>
                              <v-radio
                                label="Building"
                                value="tax-dec-building"
                              ></v-radio>
                            </v-radio-group>
                          </fieldset>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-card class="pa-2" outlined tile>
                          <fieldset class="pa-4">
                            <legend>REAL PROPERTY TAX DETAILS</legend>
                            <v-text-field
                              v-model="
                                archivedData.realProInfo.realPropertyTaxNumber
                              "
                              :disabled="loadingStatus"
                              :error-messages="realPropertyTaxNumberError"
                              label="Real Property Tax No:"
                            ></v-text-field>
                            <v-dialog
                              ref="dialog3"
                              v-model="realPropDM"
                              :return-value.sync="
                                archivedData.realProInfo.realPropertyTaxDate
                              "
                              persistent
                              width="290px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                  v-model="
                                    archivedData.realProInfo2.realPropertyTaxDate
                                  "
                                  :error-messages="realPropertyTaxDateError"
                                  label="Date"
                                  prepend-icon="mdi-calendar"
                                  readonly
                                  v-bind="attrs"
                                  v-on="on"
                                ></v-text-field>
                              </template>
                              <v-date-picker
                                v-model="
                                  archivedData.realProInfo2.realPropertyTaxDate
                                "
                                scrollable
                              >
                                <v-spacer></v-spacer>
                                <v-btn
                                  text
                                  color="primary"
                                  @click="realPropDM = false"
                                >
                                  Cancel
                                </v-btn>
                                <v-btn
                                  text
                                  color="primary"
                                  @click="
                                    $refs.dialog3.save(
                                      archivedData.realProInfo2
                                        .realPropertyTaxDate
                                    )
                                  "
                                >
                                  OK
                                </v-btn>
                              </v-date-picker>
                            </v-dialog>
                            <v-radio-group
                              v-model="
                                archivedData.realProInfo.realPropertyTaxOption
                              "
                              :error-messages="realPropertyTaxOptionError"
                              row
                              ><v-radio
                                label="Land"
                                value="real-proper-land"
                              ></v-radio>
                              <v-radio
                                label="Building"
                                value="real-proper-building"
                              ></v-radio>
                            </v-radio-group>
                            <v-text-field
                              v-model="
                                archivedData.realProInfo.realPropertyTaxAmount
                              "
                              :error-messages="realPropertyTaxAmountError"
                              :disabled="loadingStatus"
                              label="Amount:"
                            ></v-text-field>
                            <v-text-field
                              v-model="archivedData.zonalValue"
                              :disabled="loadingStatus"
                              :error-messages="zonalValueError"
                              label="Zonal Value:"
                            ></v-text-field>
                          </fieldset>
                        </v-card>
                        <v-card class="pa-2" outlined tile>
                          <fieldset class="pa-4">
                            <legend>REAL PROPERY TAX / TAX DECLARATION</legend>
                            <!-- DIALOG ADDITIONAL DATA -->
                            <v-dialog transition="dialog-bottom-transition">
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn color="primary" v-bind="attrs" v-on="on"
                                  >{{ viewMode == true? 'View Additional Data': editedIndex === -1 ? 'Create Additional Data':'Update Additional Data' }}</v-btn
                                >
                              </template>
                              <template v-slot:default="dialog">
                                <v-card>
                                  <v-toolbar dark
                                    >Real Property / Tax Declaration /
                                    Attachment</v-toolbar
                                  >
                                  <v-card-text>
                                    <div class="pa-12">
                                      <v-row no-gutters>
                                        <v-col>
                                          <v-card class="pa-2" outlined tile>
                                            <fieldset class="pa-4">
                                              <legend>
                                                TAX DECLARATION DETAILS
                                              </legend>
                                              <v-text-field
                                                v-model="
                                                  archivedData.taxDecInfo2
                                                    .taxDecNumber
                                                "
                                                :disabled="loadingStatus"
                                                label="Tax Declaration No:"
                                              ></v-text-field>
                                              <v-text-field
                                                v-model="
                                                  archivedData.taxDecInfo2.owner
                                                "
                                                :disabled="loadingStatus"
                                                label="Owner:"
                                              ></v-text-field>
                                              <v-text-field
                                                v-model="
                                                  archivedData.taxDecInfo2
                                                    .previousOwner
                                                "
                                                :disabled="loadingStatus"
                                                label="Previous Owner:"
                                              ></v-text-field>
                                              <label>Type</label>
                                              <v-radio-group
                                                v-model="
                                                  archivedData.taxDecInfo2
                                                    .taxDecOption
                                                "
                                                row
                                              >
                                                <v-radio
                                                  label="Land"
                                                  value="tax-dec-land"
                                                ></v-radio>
                                                <v-radio
                                                  label="Building"
                                                  value="tax-dec-building"
                                                ></v-radio>
                                              </v-radio-group>
                                            </fieldset>
                                          </v-card>
                                        </v-col>
                                        <v-col order="12">
                                          <v-card class="pa-2" outlined tile>
                                            <fieldset class="pa-4">
                                              <legend>
                                                {{
                                                  viewMode == true
                                                    ? "DOWNLOAD"
                                                    : ""
                                                }}
                                                ATTACHMENT
                                              </legend>
                                              <v-file-input
                                                v-if="viewMode == false"
                                                v-model="
                                                  archivedData.tctinfo2.tctFile
                                                "
                                                placeholder="Transfer Certificate Of Title"
                                                multiple
                                                dense
                                                prepend-icon="mdi-paperclip"
                                                @change="getfile"
                                                @click:clear="deleteattachment({ name: 'tct_data' ,id: archivedData.tctinfo2.id, iden: 1})"
                                              >
                                                <template
                                                  v-slot:selection="{ text }"
                                                >
                                                  <v-chip
                                                    small
                                                    label
                                                    color="primary"
                                                  >
                                                    {{ text }}
                                                  </v-chip>
                                                </template>
                                              </v-file-input>
                                              <v-file-input
                                                v-model="
                                                  archivedData.taxDecInfo2
                                                    .taxdecFile
                                                "
                                                dense
                                                placeholder="Tax Declaration"
                                                multiple
                                                v-if="viewMode == false"
                                                prepend-icon="mdi-paperclip"
                                                @click:clear="deleteattachment({ name: 'tax_dec_data' ,id: archivedData.tctinfo2.id, iden: 1})"
                                              >
                                                <template
                                                  v-slot:selection="{ text }"
                                                >
                                                  <v-chip
                                                    small
                                                    label
                                                    color="primary"
                                                  >
                                                    {{ text }}
                                                  </v-chip>
                                                </template>
                                              </v-file-input>
                                              <v-file-input
                                                v-if="viewMode == false"
                                                v-model="
                                                  archivedData.realProInfo2
                                                    .realPropertyTaxFile
                                                "
                                                placeholder="Real Property Tax"
                                                multiple
                                                dense
                                                prepend-icon="mdi-paperclip"
                                                @click:clear="deleteattachment({ name: 'real_property_tax_data' ,id: archivedData.tctinfo2.id, iden: 1})"
                                                ><template
                                                  v-slot:selection="{ text }"
                                                >
                                                  <v-chip
                                                    small
                                                    label
                                                    color="primary"
                                                  >
                                                    {{ text }}
                                                  </v-chip>
                                                </template>
                                              </v-file-input>
                                              <v-file-input
                                                v-if="viewMode == false"
                                                v-model="
                                                  archivedData.deedOfSaleFile2
                                                "
                                                placeholder="Deed Of Sale"
                                                multiple
                                                dense
                                                prepend-icon="mdi-paperclip"
                                                @click:clear="deleteattachment({ name: 'deed_of_sale_data' ,id: archivedData.tctinfo2.id, iden: 1})"
                                                ><template
                                                  v-slot:selection="{ text }"
                                                >
                                                  <v-chip
                                                    small
                                                    label
                                                    color="primary"
                                                  >
                                                    {{ text }}
                                                  </v-chip>
                                                </template>
                                              </v-file-input>
                                              <v-file-input
                                                v-if="viewMode == false"
                                                v-model="
                                                  archivedData.vicinityMapFile2
                                                "
                                                label="Vicinity Map"
                                                filledtctFile
                                                prepend-icon="mdi-camera"
                                                @click:clear="deleteattachment({ name: 'vicinity_map_data' , id: archivedData.tctinfo2.id, iden: 1})"
                                              >
                                              </v-file-input>
                                              <div v-if="viewMode == true">
                                                <div
                                                  v-for="(
                                                    item, $index
                                                  ) in downloadData2.data"
                                                  :key="$index"
                                                >
                                                  <v-btn
                                                    x-small
                                                    color="secondary"
                                                    dark
                                                    :disabled="
                                                      Download_role == false
                                                    "
                                                    v-if="item.id !== 'update'"
                                                    @click="download(item)"
                                                  >
                                                    <strong
                                                      style="
                                                        white-space: nowrap;
                                                        width: 150px;
                                                        overflow: hidden;
                                                        text-overflow: ellipsis;
                                                      "
                                                      >{{ item.name }}
                                                    </strong>
                                                    <strong
                                                      style="color: orange"
                                                      >~(
                                                      {{ item.size }})</strong
                                                    ><v-icon right color="green"
                                                      >mdi-download</v-icon
                                                    >
                                                  </v-btn>
                                                </div>
                                              </div>
                                            </fieldset>
                                          </v-card>
                                        </v-col>
                                        <v-col order="1">
                                          <v-card class="pa-2" outlined tile>
                                            <fieldset class="pa-4">
                                              <legend>
                                                REAL PROPERTY TAX DETAILS
                                              </legend>
                                              <v-text-field
                                                v-model="
                                                  archivedData.realProInfo2
                                                    .realPropertyTaxNumber
                                                "
                                                :disabled="loadingStatus"
                                                label="Real Property Tax No:"
                                              ></v-text-field>
                                              <v-dialog
                                                ref="dialog2"
                                                v-model="realPropDM"
                                                :return-value.sync="
                                                  archivedData.realProInfo2
                                                    .realPropertyTaxDate
                                                "
                                                persistent
                                                width="290px"
                                              >
                                                <template
                                                  v-slot:activator="{
                                                    on,
                                                    attrs,
                                                  }"
                                                >
                                                  <v-text-field
                                                    v-model="
                                                      archivedData.realProInfo2
                                                        .realPropertyTaxDate
                                                    "
                                                    label="Date"
                                                    prepend-icon="mdi-calendar"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"
                                                  ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                  v-model="
                                                    archivedData.realProInfo2
                                                      .realPropertyTaxDate
                                                  "
                                                  scrollable
                                                >
                                                  <v-spacer></v-spacer>
                                                  <v-btn
                                                    text
                                                    color="primary"
                                                    @click="realPropDM = false"
                                                  >
                                                    Cancel
                                                  </v-btn>
                                                  <v-btn
                                                    text
                                                    color="primary"
                                                    @click="
                                                      $refs.dialog2.save(
                                                        archivedData
                                                          .realProInfo2
                                                          .realPropertyTaxDate
                                                      )
                                                    "
                                                  >
                                                    OK
                                                  </v-btn>
                                                </v-date-picker>
                                              </v-dialog>
                                              <v-radio-group
                                                v-model="
                                                  archivedData.realProInfo2
                                                    .realPropertyTaxOption
                                                "
                                                row
                                                ><v-radio
                                                  label="Land"
                                                  value="real-proper-land"
                                                ></v-radio>
                                                <v-radio
                                                  label="Building"
                                                  value="real-proper-building"
                                                ></v-radio>
                                              </v-radio-group>
                                              <v-text-field
                                                v-model="
                                                  archivedData.realProInfo2
                                                    .realPropertyTaxAmount
                                                "
                                                :disabled="loadingStatus"
                                                label="Amount:"
                                              ></v-text-field>
                                              <v-text-field
                                                v-model="
                                                  archivedData.zonalValue2
                                                "
                                                :disabled="loadingStatus"
                                                label="Zonal Value:"
                                              ></v-text-field>
                                            </fieldset>
                                          </v-card>
                                        </v-col>
                                      </v-row>
                                    </div>
                                  </v-card-text>
                                  <v-card-actions class="justify-end">
                                    <v-btn text @click="dialog.value = false"
                                      >Close</v-btn
                                    >
                                  </v-card-actions>
                                </v-card>
                              </template>
                            </v-dialog>
                            <!--DIALOG ADDITIONAL DATA END-->
                          </fieldset>
                        </v-card>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-card class="pa-2" outlined tile>
                          <fieldset class="pa-4">
                            <legend>
                              {{ viewMode == true ? "DOWNLOAD" : "" }}
                              ATTACHMENT
                            </legend>
                            <v-file-input
                              v-if="viewMode == false"
                              v-model="archivedData.tctinfo.tctFile"
                              placeholder="Transfer Certificate Of Title"
                              multiple
                              dense
                              prepend-icon="mdi-paperclip"
                              @change="getfile"
                              @click:clear="deleteattachment({ name: 'tct_data' ,id: archivedData.tctinfo.id, iden: 0})"
                            >
                              <template v-slot:selection="{ text }">
                                <v-chip small label color="primary">
                                  {{ text }}
                                </v-chip>
                              </template>
                            </v-file-input>
                            <v-file-input
                              v-model="archivedData.taxDecInfo.taxdecFile"
                              dense
                              placeholder="Tax Declaration"
                              multiple
                              v-if="viewMode == false"
                              prepend-icon="mdi-paperclip"
                                @click:clear="deleteattachment({ name: 'tax_dec_data' ,id: archivedData.tctinfo.id , iden: 0})"
                            >
                              <template v-slot:selection="{ text }">
                                <v-chip small label color="primary">
                                  {{ text }}
                                </v-chip>
                              </template>
                            </v-file-input>
                            <v-file-input
                              v-if="viewMode == false"
                              v-model="
                                archivedData.realProInfo.realPropertyTaxFile
                              "
                              placeholder="Real Property Tax"
                              multiple
                              dense
                              prepend-icon="mdi-paperclip"
                                @click:clear="deleteattachment({ name: 'real_property_tax_data' ,id: archivedData.tctinfo.id , iden: 0})"
                              ><template v-slot:selection="{ text }">
                                <v-chip small label color="primary">
                                  {{ text }}
                                </v-chip>
                              </template>
                            </v-file-input>
                            <v-file-input
                              v-if="viewMode == false"
                              v-model="archivedData.deedOfSaleFile"
                              placeholder="Deed Of Sale"
                              multiple
                              dense
                              prepend-icon="mdi-paperclip"
                                @click:clear="deleteattachment({ name: 'deed_of_sale_data' ,id: archivedData.tctinfo.id , iden: 0})"
                              ><template v-slot:selection="{ text }">
                                <v-chip small label color="primary">
                                  {{ text }}
                                </v-chip>
                              </template>
                            </v-file-input>
                            <v-file-input
                              v-if="viewMode == false"
                              v-model="archivedData.vicinityMapFile"
                              label="Vicinity Map"
                              filledtctFile
                              prepend-icon="mdi-camera"
                                @click:clear="deleteattachment({ name: 'vicinity_map_data' ,id: archivedData.tctinfo.id , iden: 0})"
                            >
                            </v-file-input>
                            <div v-if="viewMode == true">
                              <div
                                v-for="(item, $index) in downloadData.data"
                                :key="$index"
                              >
                                <v-btn
                                  x-small
                                  color="secondary"
                                  dark
                                  :disabled="Download_role == false"
                                  v-if="item.id !== 'update'"
                                  @click="download(item)"
                                >
                                  <strong
                                    style="
                                      white-space: nowrap;
                                      width: 150px;
                                      overflow: hidden;
                                      text-overflow: ellipsis;
                                    "
                                    >{{ item.name }}
                                  </strong>
                                  <strong style="color: orange"
                                    >~( {{ item.size }})</strong
                                  ><v-icon right color="green"
                                    >mdi-download</v-icon
                                  >
                                </v-btn>
                              </div>
                            </div>
                          </fieldset>
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
      search: "",
      selected: [],
      disabledCount: 0,
      headers: [
        { text: "TCT_NO", align: "left", value: "tct_no" },
        { text: "OWNER", align: "left", value: "owner" },
        { text: "LOCATION", align: "left", value: "location" },
        { text: "FILE CREATED", align: "left", value: "created_at" },
        { text: "Actions", align: "center", value: "action", sortable: false },
      ],
      editedIndex: -1,
      editedProvider: {
        name: "",
      },
      defaultProvider: {
        name: "",
      },
      dateAquredM: false,
      realPropDM: false,

      archivedData: {
        tctinfo: {
          tctNumber: "",
          location: "",
          dateAquired: new Date(
            Date.now() - new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .substr(0, 10),
          tctFile: [],
        },
        tctinfo2: {
          tctFile: [],
        },
        taxDecInfo: {
          taxDecNumber: "",
          taxDecOption: "tax-dec-land",
          owner: "",
          previousOwner: "",
          taxdecFile: [],
        },
        taxDecInfo2: {
          taxDecNumber: "",
          taxDecOption: "tax-dec-land",
          owner: "",
          previousOwner: "",
          taxdecFile: [],
        },
        realProInfo: {
          realPropertyTaxNumber: "",
          realPropertyTaxDate: new Date(
            Date.now() - new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .substr(0, 10),
          realPropertyTaxOption: "real-proper-land",
          realPropertyTaxFile: [],
          realPropertyTaxAmount: "",
        },
        realProInfo2: {
          realPropertyTaxNumber: "",
          realPropertyTaxDate: new Date(
            Date.now() - new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .substr(0, 10),
          realPropertyTaxOption: "real-proper-land",
          realPropertyTaxFile: [],
          realPropertyTaxAmount: "",
        },
        zonalValue: "",
        deedOfSaleFile: [],
        vicinityMapFile: [],

        zonalValue2: "",
        deedOfSaleFile2: [],
        vicinityMapFile2: [],
      },
      viewMode: false,
      reportID: "",
      downloadData: [],
      downloadData2: [],
    };
  },
  validations: {
    archivedData: {
      tctinfo: {
        tctNumber: { required },
        location: { required },
        dateAquired: { required },
        area: { required },
      },
      taxDecInfo: {
        taxDecNumber: { required },
        taxDecOption: { required },
        owner: { required },
        previousOwner: { required },
      },
      realProInfo: {
        realPropertyTaxNumber: { required },
        realPropertyTaxDate: { required },
        realPropertyTaxOption: { required },
        realPropertyTaxAmount: { required },
      },
      zonalValue: { required },
    },
  },
  computed: {
    ...mapGetters({
      tct_data: "archived/getArchived",
      response: "archived/getResponse",
      permissions: "userPermissions/getPermission",
    }),
    deleteAll() {
      return this.permissions.includes("Delete Archived");
    },
    userCanCreate_role() {
      return this.permissions.includes("Create Archived");
    },
    ShowDoc_role() {
      return this.permissions.includes("Show Archived");
    },
    Editdoc_role() {
      return this.permissions.includes("Edit Archived");
    },
    Download_role() {
      return this.permissions.includes("Download Archived Files");
    },

    tctNumberError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.tctinfo.tctNumber.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.tctinfo.tctNumber.required &&
        errors.push(RequiredError);
      return errors;
    },
    areaError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.tctinfo.area.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.tctinfo.area.required && errors.push(RequiredError);
      return errors;
    },
    locationError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.tctinfo.location.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.tctinfo.location.required &&
        errors.push(RequiredError);
      return errors;
    },

    dateAquiredError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.tctinfo.dateAquired.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.tctinfo.dateAquired.required &&
        errors.push(RequiredError);
      return errors;
    },
    taxDecNumberError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.taxDecInfo.taxDecNumber.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.taxDecInfo.taxDecNumber.required &&
        errors.push(RequiredError);
      return errors;
    },
    taxDecOptionError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.taxDecInfo.taxDecOption.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.taxDecInfo.taxDecOption.required &&
        errors.push(RequiredError);
      return errors;
    },
    ownerError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.taxDecInfo.owner.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.taxDecInfo.owner.required &&
        errors.push(RequiredError);
      return errors;
    },
    previousOwnerError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.taxDecInfo.previousOwner.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.taxDecInfo.previousOwner.required &&
        errors.push(RequiredError);
      return errors;
    },
    realPropertyTaxNumberError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.realProInfo.realPropertyTaxNumber.$dirty)
        return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.realProInfo.realPropertyTaxNumber.required &&
        errors.push(RequiredError);
      return errors;
    },
    realPropertyTaxDateError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.realProInfo.realPropertyTaxDate.$dirty)
        return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.realProInfo.realPropertyTaxDate.required &&
        errors.push(RequiredError);
      return errors;
    },
    realPropertyTaxOptionError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.realProInfo.realPropertyTaxOption.$dirty)
        return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.realProInfo.realPropertyTaxOption.required &&
        errors.push(RequiredError);
      return errors;
    },
    realPropertyTaxAmouonalValuentError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.realProInfo.realPropertyTaxAmount.$dirty)
        return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.realProInfo.realPropertyTaxAmount.required &&
        errors.push(RequiredError);
      return errors;
    },
    zonalValueError() {
      const errors = [];
      var RequiredError = null;
      if (!this.$v.archivedData.zonalValue.$dirty) return errors;
      RequiredError = "This field is required.";
      !this.$v.archivedData.zonalValue.required && errors.push(RequiredError);
      return errors;
    },
    dialog() {
      return this.$store.state.dialog;
    },
    loadingStatus() {
      return this.$store.state.loading;
    },
    formTitle() {
      return this.editedIndex === -1 ? "New Achived" : "Edit Achived";
    },
  },
  watch: {
    providers() {
      this.$v.$reset(); // reset validation
    },
  },
  created() {
    this.$store.dispatch("userPermissions/fetchPermission");
    this.$store.dispatch("archived/fetchArchived");
  },
  methods: {
    refreshData() {
      console.log("dd");
      this.$store.dispatch("archived/fetchArchived");
      this.archivedData = {
        tctinfo: {
          id: "",
          tctNumber: "",
          location: "",
          dateAquired: "",
          tctFile: [],
          tctFileID: "",
          area: "",
        },
        tctinfo2: {
          id: "",
          tctFile: [],
          tctFileID2: "",
        },
        taxDecInfo: {
          taxDecNumber: "",
          taxDecOption: "",
          owner: "",
          previousOwner: "",
          taxdecFile: [],
          taxdecFileID: "",
        },
        taxDecInfo2: {
          taxDecNumber: "",
          taxDecOption: "",
          owner: "",
          previousOwner: "",
          taxdecFile: [],
          taxdecFileID: "",
        },
        realProInfo: {
          realPropertyTaxNumber: "",
          realPropertyTaxDate: "",
          realPropertyTaxOption: "",
          realPropertyTaxFile: [],
          realPropertyTaxFileID: "",
          realPropertyTaxAmount: "",
        },
        realProInfo2: {
          realPropertyTaxNumber: "",
          realPropertyTaxDate: "",
          realPropertyTaxOption: "",
          realPropertyTaxFile: [],
          realPropertyTaxFileID: "",
          realPropertyTaxAmount: "",
        },

        zonalValue: "",
        deedOfSaleFile: [],
        deedOfSaleFileID: "",
        vicinityMapFile: [],
        vicinityMapFileID: "",

        zonalValue2: "",
        deedOfSaleFile2: [],
        deedOfSaleFileID2: "",
        vicinityMapFile2: [],
        vicinityMapFileID2: "",
      };
    },
    openDialog() {
      this.viewMode = false;
      this.refreshData();
      this.editedIndex = -1; // reset default
      this.$store.dispatch("triggerDialog", true);
    },
    getfile() {
      console.log(this.archivedData.tctinfo.tctFile);
    },
    deleteattachment(data){
       this.$store.dispatch("archived/attachmentDeletions", data);
    },
    editArchived(data) {
    
      this.viewMode = false;
      let index = this.tct_data.indexOf(data);
      this.editedIndex = index;
      console.log(this.editedIndex);
      let taxdecdata, tctdata, realpropdata, vicinitydata, deedofdata;
      let taxdecdata2, tctdata2, realpropdata2, vicinitydata2, deedofdata2;
      if (data.tax_dec_data[0]) {
        taxdecdata = data.tax_dec_data[0];
      } else {
        taxdecdata = { filename: "Empty Data", id: "update" };
      }
      if (data.tct_data[0]) {
        tctdata = data.tct_data[0];
      } else {
        tctdata = { filename: "Empty Data", id: "update" };
      }
      if (data.real_property_data[0]) {
        realpropdata = data.real_property_data[0];
      } else {
        realpropdata = { filename: "Empty Data", id: "update" };
      }
      if (data.vicinity_map_data[0]) {
        vicinitydata = data.vicinity_map_data[0];
      } else {
        vicinitydata = { filename: "Empty Data", id: "update" };
      }
      if (data.deed_of_sale_data[0]) {
        deedofdata = data.deed_of_sale_data[0];
      } else {
        deedofdata = { filename: "Empty Data", id: "update" };
      }

      if (data.archived_new[0].tax_dec_data2[0]) {
        taxdecdata2 = data.archived_new[0].tax_dec_data2[0];
      } else {
        taxdecdata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].tct_data2[0]) {
        tctdata2 = data.archived_new[0].tct_data2[0];
      } else {
        tctdata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].real_property_data2[0]) {
        realpropdata2 = data.archived_new[0].real_property_data2[0];
      } else {
        realpropdata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].vicinity_map_data2[0]) {
        vicinitydata2 = data.archived_new[0].vicinity_map_data2[0];
      } else {
        vicinitydata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].deed_of_sale_data2[0]) {
        deedofdata2 = data.archived_new[0].deed_of_sale_data2[0];
      } else {
        deedofdata2 = { filename: "Empty Data", id: "update" };
      }
      this.archivedData = {
        tctinfo: {
          id: data.id,
          tctNumber: data.tct_no,
          location: data.location,
          dateAquired: data.date_aquired,
          tctFile: [{ name: tctdata.filename }],
          tctFileID: tctdata.id,
          area: data.area,
        },
        tctinfo2: {
          id: data.archived_new[0].id,
          tctFile: [{ name: tctdata2.filename }],
          tctFileID: tctdata2.id,
        },
        taxDecInfo: {
          taxDecNumber: data.tax_dec_no,
          taxDecOption: data.tax_dec_option,
          owner: data.owner,
          previousOwner: data.previous_owner,
          taxdecFile: [{ name: taxdecdata.filename }],
          taxdecFileID: taxdecdata.id,
        },
        taxDecInfo2: {
          taxDecNumber: data.archived_new[0].tax_dec_no,
          taxDecOption: data.archived_new[0].tax_dec_option,
          owner: data.archived_new[0].owner,
          previousOwner: data.archived_new[0].previous_owner,
          taxdecFile: [{ name: taxdecdata2.filename }],
          taxdecFileID: taxdecdata2.id,
        },
        realProInfo: {
          realPropertyTaxNumber: data.real_property_tax_no,
          realPropertyTaxDate: data.real_property_tax_date,
          realPropertyTaxOption: data.real_property_tax_option,
          realPropertyTaxFile: [{ name: realpropdata.filename }],
          realPropertyTaxFileID: realpropdata.id,
          realPropertyTaxAmount: data.real_property_tax_amount,
        },
        realProInfo2: {
          realPropertyTaxNumber: data.archived_new[0].real_property_tax_no,
          realPropertyTaxDate: data.archived_new[0].real_property_tax_date,
          realPropertyTaxOption: data.archived_new[0].real_property_tax_option,
          realPropertyTaxFile: [{ name: realpropdata2.filename }],
          realPropertyTaxFileID: realpropdata2.id,
          realPropertyTaxAmount: data.archived_new[0].real_property_tax_amount,
        },
        zonalValue: data.zonal_value,
        deedOfSaleFile: [{ name: deedofdata.filename }],
        deedOfSaleFileID: deedofdata.id,
        vicinityMapFile: [{ name: vicinitydata.filename }],
        vicinityMapFileID: vicinitydata.id,

        zonalValue2: data.archived_new[0].zonal_value,
        deedOfSaleFile2: [{ name: deedofdata2.filename }],
        deedOfSaleFileID2: deedofdata2.id,
        vicinityMapFile2: [{ name: vicinitydata2.filename }],
        vicinityMapFileID2: vicinitydata2.id,

      };
      this.$store.dispatch("triggerDialog", true);
    },
    viewArchived(data) {
     
      this.reportID = data.reportid;
      this.viewMode = true;
      let taxdecdata, tctdata, realpropdata, vicinitydata, deedofdata;
      let taxdecdata2, tctdata2, realpropdata2, vicinitydata2, deedofdata2;
      if (data.tax_dec_data[0]) {
        taxdecdata = data.tax_dec_data[0];
      } else {
        taxdecdata = { filename: "Empty Data", id: "update" };
      }
      if (data.tct_data[0]) {
        tctdata = data.tct_data[0];
      } else {
        tctdata = { filename: "Empty Data", id: "update" };
      }
      if (data.real_property_data[0]) {
        realpropdata = data.real_property_data[0];
      } else {
        realpropdata = { filename: "Empty Data", id: "update" };
      }
      if (data.vicinity_map_data[0]) {
        vicinitydata = data.vicinity_map_data[0];
      } else {
        vicinitydata = { filename: "Empty Data", id: "update" };
      }
      if (data.deed_of_sale_data[0]) {
        deedofdata = data.deed_of_sale_data[0];
      } else {
        deedofdata = { filename: "Empty Data", id: "update" };
      }
 
 
      if(data.archived_new[0]){
      if (data.archived_new[0].tax_dec_data2[0]) {
        taxdecdata2 = data.archived_new[0].tax_dec_data2[0];
      } else {
        taxdecdata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].tct_data2[0]) {
        tctdata2 = data.archived_new[0].tct_data2[0];
      } else {
        tctdata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].real_property_data2[0]) {
        realpropdata2 = data.archived_new[0].real_property_data2[0];
      } else {
        realpropdata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].vicinity_map_data2[0]) {
        vicinitydata2 = data.archived_new[0].vicinity_map_data2[0];
      } else {
        vicinitydata2 = { filename: "Empty Data", id: "update" };
      }
      if (data.archived_new[0].deed_of_sale_data2[0]) {
        deedofdata2 = data.archived_new[0].deed_of_sale_data2[0];
      } else {
        deedofdata2 = { filename: "Empty Data", id: "update" };
      }
      }
 
      this.downloadData = {
        data: [
          { name: tctdata.filename, id: tctdata.id, size: tctdata.size },
          {
            name: taxdecdata.filename,
            id: taxdecdata.id,
            size: taxdecdata.size,
          },
          {
            name: realpropdata.filename,
            id: realpropdata.id,
            size: realpropdata.size,
          },
          {
            name: deedofdata.filename,
            id: deedofdata.id,
            size: deedofdata.size,
          },
          {
            name: vicinitydata.filename,
            id: vicinitydata.id,
            size: vicinitydata.size,
          },
        ],
      };
      this.downloadData2 = {
        data: [
          { name: tctdata2.filename, id: tctdata2.id, size: tctdata2.size },
          {
            name: taxdecdata2.filename,
            id: taxdecdata2.id,
            size: taxdecdata2.size,
          },
          {
            name: realpropdata2.filename,
            id: realpropdata2.id,
            size: realpropdata2.size,
          },
          {
            name: deedofdata2.filename,
            id: deedofdata2.id,
            size: deedofdata2.size,
          },
          {
            name: vicinitydata2.filename,
            id: vicinitydata2.id,
            size: vicinitydata2.size,
          },
        ],
      };

      this.archivedData = {
        tctinfo: {
          id: data.id,
          tctNumber: data.tct_no,
          location: data.location,
          dateAquired: data.date_aquired,
          tctFile: [{ name: tctdata.filename }],
          tctFileID: tctdata.id,
          area: data.area,
        },
        tctinfo2: {
          tctFile: [{ name: tctdata2.filename }],
          tctFileID: tctdata2.id,
        },

        taxDecInfo: {
          taxDecNumber: data.tax_dec_no,
          taxDecOption: data.tax_dec_option,
          owner: data.owner,
          previousOwner: data.previous_owner,
          taxdecFile: [{ name: taxdecdata.filename }],
          taxdecFileID: taxdecdata.id,
        },
        taxDecInfo2: {
          taxDecNumber: data.archived_new[0].tax_dec_no,
          taxDecOption: data.archived_new[0].tax_dec_option,
          owner: data.archived_new[0].owner,
          previousOwner: data.archived_new[0].previous_owner,
          taxdecFile: [{ name: taxdecdata2.filename }],
          taxdecFileID: taxdecdata2.id,
        },
        realProInfo: {
          realPropertyTaxNumber: data.real_property_tax_no,
          realPropertyTaxDate: data.real_property_tax_date,
          realPropertyTaxOption: data.real_property_tax_option,
          realPropertyTaxFile: [{ name: realpropdata.filename }],
          realPropertyTaxFileID: realpropdata.id,
          realPropertyTaxAmount: data.real_property_tax_amount,
        },
        realProInfo2: {
          realPropertyTaxNumber: data.archived_new[0].real_property_tax_no,
          realPropertyTaxDate: data.archived_new[0].real_property_tax_date,
          realPropertyTaxOption: data.archived_new[0].real_property_tax_option,
          realPropertyTaxFile: [{ name: realpropdata2.filename }],
          realPropertyTaxFileID: realpropdata2.id,
          realPropertyTaxAmount: data.archived_new[0].real_property_tax_amount,
        },

        zonalValue: data.zonal_value,
        deedOfSaleFile: [{ name: deedofdata.filename }],
        deedOfSaleFileID: deedofdata.id,
        vicinityMapFile: [{ name: vicinitydata.filename }],
        vicinityMapFileID: vicinitydata.id,

        zonalValue2: data.archived_new[0].zonal_value,
        deedOfSaleFile2: [{ name: deedofdata2.filename }],
        deedOfSaleFileID2: deedofdata2.id,
        vicinityMapFile2: [{ name: vicinitydata2.filename }],
        vicinityMapFileID2: vicinitydata2.id,
      };
      this.$store.dispatch("triggerDialog", true);
      console.log(data.archived_new[0]);
    },
    download(data) {
      this.$store.dispatch("archived/downloadArchived", data);
    },
    create_add() {
      alert();
    },
    close() {
      this.editedIndex = -1;
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },
    save() {
     
      // this.$v.$touch();
      // if (!this.$v.$error) {
        if (this.editedIndex === -1) {
          this.$store.dispatch("archived/storeArchived", this.archivedData);
           
        } else {
          this.$store.dispatch("archived/updateArchived", this.archivedData);
        }
        this.refreshData();
      // }
      // this.$store.dispatch("archived/fetchArchived");
      // console.log(this.response.data.msg)
    },
    deleteItem() {
      const archived = this.$data.selected;
      const archivedIds = archived.map((archives) => {
        return archives.id;
      });

      const archivedNames = archived.map((archives) => {
        const lists = "<br />" + archives.tct_no;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            archivedNames,
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
            this.$store.dispatch("archived/deleteArchived", archivedIds);
            this.$data.selected = []; // reset selected
            this.refreshData();
          }
        });
    },
  },
};
</script>
