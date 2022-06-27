<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        :headers="headers"
        :items="pendingtrans"
        :items-per-page="itemsPerPage"
        :search="search"
        show-expand
        single-expand
        :loading="loadingStatus"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Pending Transactions</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on"><v-icon>print</v-icon></v-btn>
              </template>
              <span>Print</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <json-excel :data="pendingtrans">
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
            <v-menu
              v-model="dateMenu3"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              single-line
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="filterDate"
                  label="Date"
                  prepend-icon="event"
                  readonly
                  single-line
                  hide-details
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                @change="filterWithDate"
                v-model="filterDate"
                @input="dateMenu3 = false"
              ></v-date-picker>
            </v-menu>

            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-toolbar>
        </template>

        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length + 1" class="text-xs-center">
            <v-list-item two-line="">
              <v-list-item-content>
                <v-list-item-subtitle>
                  <v-simple-table dense>
                    <thead class="text-center">
                      <tr>
                        <th>DATE</th>
                        <th>LSU(OR)</th>
                        <th>OR</th>
                        <th>LSU(CI)</th>
                        <th>CI</th>
                        <th>LSU(CH)</th>
                        <th>CH</th>
                        <th>DEP</th>
                        <th>CLA</th>
                        <th>GRPO</th>
                        <th>SI</th>
                        <th>SO</th>
                        <th>STS</th>
                        <th>DISB</th>
                        <th>ARCM</th>
                        <th>APCM</th>
                        <th>INT</th>
                        <th>RC</th>
                        <th>SC</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody v-if="!checkSched(item)" class="text-center">
                      <tr v-for="pending in item.pendings" :key="pending.id">
                        <td>{{ moment(pending.docdate).format("D") }}</td>
                         <td>{{ pending.ls_or }}</td>
                        <td>{{ pending.por }}</td>
                        <td>{{ pending.ls_ci }}</td>
                        <td>{{ pending.ci }}</td>
                        <td>{{ pending.ls_ch }}</td>
                        <td>{{ pending.ch }}</td>
                        <td>{{ pending.dep }}</td>
                        <td>{{ pending.cla }}</td>
                        <td>{{ pending.grpo }}</td>
                        <td>{{ pending.si }}</td>
                        <td>{{ pending.so }}</td>
                        <td>{{ pending.sts }}</td>
                        <td>{{ pending.disb }}</td>
                        <td>{{ pending.arcm }}</td>
                        <td>{{ pending.apcm }}</td>
                        <td>{{ pending.pint }}</td>
                        <td>{{ pending.rc_cash }}</td>
                        <td>{{ pending.sc }}</td>
                      </tr>
                      <tr v-if="canAdd" class="text-left">
                        <td colspan="18" style="padding: 10px;">
                          <v-spacer></v-spacer>
                          <v-btn
                            @click="addAll(item)"
                            :loading="loadingStatus"
                            small
                          >
                            Add all to current pending
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                    <tbody v-if="checkSched(item)" class="text-center">
                      <tr v-for="pending in item.pendings" :key="pending.id">
                        <td>
                          <v-edit-dialog
                            :return-value.sync="
                              moment(pending.docdate).format('D')
                            "
                            large
                            @save="
                              update(pending.id, 'docdate', pending.docdate)
                            "
                          >
                            <div>{{ moment(pending.docdate).format("D") }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-menu
                                v-model="dateMenu2"
                                :close-on-content-click="true"
                                transition="scale-transition"
                                offset-y
                              >
                                <template v-slot:activator="{ on }">
                                  <v-text-field
                                    v-model="pending.docdate"
                                    label="Edit"
                                    single-line
                                    counter
                                    autofocus
                                    dense
                                    readonly
                                    v-on="on"
                                  ></v-text-field>
                                </template>
                                <v-date-picker
                                  v-model="pending.docdate"
                                ></v-date-picker>
                              </v-menu>
                            </template>
                          </v-edit-dialog>
                        </td>
                          <td>
                          <v-edit-dialog
                            :return-value.sync="pending.ls_or"
                            large
                            @save="update(pending.id, 'ls_or', pending.ls_or)"
                          >
                            <div>{{ pending.ls_or }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.ls_or"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.por"
                            large
                            @save="update(pending.id, 'por', pending.por)"
                          >
                            <div>{{ pending.por }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.por"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.ls_ci"
                            large
                            @save="update(pending.id, 'ls_ci', pending.ls_ci)"
                          >
                            <div>{{ pending.ls_ci }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.ls_ci"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.ci"
                            large
                            @save="update(pending.id, 'ci', pending.ci)"
                          >
                            <div>{{ pending.ci }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.ci"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.ls_ch"
                            large
                            @save="update(pending.id, 'ls_ch', pending.ls_ch)"
                          >
                            <div>{{ pending.ls_ch }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.ls_ch"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.ch"
                            large
                            @save="update(pending.id, 'ch', pending.ch)"
                          >
                            <div>{{ pending.ch }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.ch"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.dep"
                            large
                            @save="update(pending.id, 'dep', pending.dep)"
                          >
                            <div>{{ pending.dep }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.dep"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.cla"
                            large
                            @save="update(pending.id, 'cla', pending.cla)"
                          >
                            <div>{{ pending.cla }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.cla"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.grpo"
                            large
                            @save="update(pending.id, 'grpo', pending.grpo)"
                          >
                            <div>{{ pending.grpo }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.grpo"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.si"
                            large
                            @save="update(pending.id, 'si', pending.si)"
                          >
                            <div>{{ pending.si }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.si"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.so"
                            large
                            @save="update(pending.id, 'so', pending.so)"
                          >
                            <div>{{ pending.so }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.so"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.sts"
                            large
                            @save="update(pending.id, 'sts', pending.sts)"
                          >
                            <div>{{ pending.sts }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.sts"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.disb"
                            large
                            @save="update(pending.id, 'disb', pending.disb)"
                          >
                            <div>{{ pending.disb }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.disb"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.arcm"
                            large
                            @save="update(pending.id, 'arcm', pending.arcm)"
                          >
                            <div>{{ pending.arcm }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.arcm"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.apcm"
                            large
                            @save="update(pending.id, 'apcm', pending.apcm)"
                          >
                            <div>{{ pending.apcm }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.apcm"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.pint"
                            large
                            @save="update(pending.id, 'pint', pending.pint)"
                          >
                            <div>{{ pending.pint }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.pint"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.rc_cash"
                            large
                            @save="
                              update(pending.id, 'rc_cash', pending.rc_cash)
                            "
                          >
                            <div>{{ pending.rc_cash }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.rc_cash"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog
                            :return-value.sync="pending.sc"
                            large
                            @save="update(pending.id, 'sc', pending.sc)"
                          >
                            <div>{{ pending.sc }}</div>
                            <template v-slot:input>
                              <div class="mt-4 title">Update</div>
                            </template>
                            <template v-slot:input>
                              <v-text-field
                                @keypress="isNumber($event)"
                                v-model="pending.sc"
                                :rules="[required]"
                                label="Edit"
                                single-line
                                counter
                                autofocus
                              ></v-text-field>
                            </template>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-icon
                            v-if="checkSched(item)"
                            :disabled="loadingStatus"
                            small
                            class="mr-2"
                            title="Copy"
                            @click="copyPendingTran(pending)"
                          >
                            mdi-content-copy
                          </v-icon>
                          <v-icon
                            v-if="checkSched(item)"
                            :disabled="loadingStatus"
                            small
                            class="mr-2"
                            title="Delete"
                            @click="deletePendingTran(pending)"
                          >
                            mdi-delete
                          </v-icon>
                        </td>
                      </tr>
                      <tr v-if="checkSched(item)">
                        <td>
                          <v-menu
                            v-model="dateMenu"
                            :close-on-content-click="true"
                            transition="scale-transition"
                            offset-y
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                dense
                                v-model="computedDateFormatted"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="editedPendingTran.docdate"
                            ></v-date-picker>
                          </v-menu>
                        </td>
                                                <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.ls_or"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.por"
                            required
                          ></v-text-field>
                        </td>
                                                <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.ls_ci"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.ci"
                            required
                          ></v-text-field>
                        </td>
                                                <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.ls_ch"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.ch"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.dep"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.cla"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.grpo"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.si"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.so"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.sts"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.disb"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.arcm"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.apcm"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.pint"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.rc_cash"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-text-field
                            @keypress="isNumber($event)"
                            dense
                            v-model="editedPendingTran.sc"
                            required
                          ></v-text-field>
                        </td>
                        <td>
                          <v-icon
                            v-if="checkSched(item)"
                            :disabled="loadingStatus"
                            small
                            class="mr-2"
                            title="Add"
                            @click="save(item)"
                          >
                            mdi-plus-circle
                          </v-icon>
                          <v-icon
                            v-if="checkSched(item)"
                            :disabled="loadingStatus"
                            small
                            class="mr-2"
                            title="Reset"
                            @click="reset()"
                          >
                            mdi-refresh
                          </v-icon>
                        </td>
                      </tr>
                      <tr v-if="checkSched(item)">
                        <td colspan="18">
                          <v-text-field
                            dense
                            v-model="editedPendingTran.reason"
                            required
                            label="Reason"
                            single-line
                          ></v-text-field>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </td>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import JsonExcel from "vue-json-excel";

export default {
  components: {
    JsonExcel
  },

  mixins: [validationMixin],

  data() {
    return {
      search: "",
      dateMenu: false,
      dateMenu2: false,
      dateMenu3: false,
      canAdd: false,
      filterDate: null,
      required: v => v.length > 0 || "Field required!",
      headers: [
        { text: "Branch", align: "left", value: "name" },
        { text: "Date", align: "left", value: "date" }
      ],
      editedIndex: -1,
      editedPendingTran: {
        docdate: null,
         ls_or: 0,
        ls_ch:0,
        ls_ci: 0,
        por: 0,
        ci: 0,
        ch: 0,
        dep: 0,
        cla: 0,
        grpo: 0,
        si: 0,
        so: 0,
        sts: 0,
        disb: 0,
        arcm: 0,
        apcm: 0,
        pint: 0,
        rc_cash: 0,
        sc: 0,
        reason: null
      },
      defaultPendingTran: {
        docdate: null,
        ls_or: 0,
        ls_ch:0,
        ls_ci: 0,
        por: 0,
        ci: 0,
        ch: 0,
        dep: 0,
        cla: 0,
        grpo: 0,
        si: 0,
        so: 0,
        sts: 0,
        disb: 0,
        arcm: 0,
        apcm: 0,
        pint: 0,
        rc_cash: 0,
        sc: 0,
        reason: null
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedPendingTran: {
      docdate: { required },
      ls_or: { required },
      por: { required },
      ci: { required },
      ch: { required },
      dep: { required },
      cla: { required },
      grpo: { required },
      si: { required },
      so: { required },
      sts: { required },
      disb: { required },
      arcm: { required },
      apcm: { required },
      pint: { required },
      rc_cash: { required },
      sc: { required },
      reason: { required }
    }
  },

  computed: {
    ...mapGetters({
      pendingtrans: "pendingTran/getPendingTrans",
      pendingtranErrors: "pendingTran/getPendingTranErrors",
      serverdate: "serverDate"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    computedDateFormatted() {
      let date = null;
      if (this.editedPendingTran.docdate) {
        date = this.moment(this.editedPendingTran.docdate).format("DD");
      } else {
        date = null;
      }
      return date;
    }
  },

  watch: {
    pendingtrans() {
      this.$v.$reset(); // reset validation
    },
    serverdate(data) {
      this.filterDate = this.moment(data.date).format("YYYY-MM-DD");
    }
  },

  created() {
    var data = {
      date: this.filterDate
    };
    this.$store.dispatch("pendingTran/fetchPendingTrans", data);
    this.$store.dispatch("fetchDate"); // get server date
  },

  methods: {
    refreshData() {
      var data = {
        date: this.filterDate
      };
      this.$store.dispatch("pendingTran/fetchPendingTrans", data);
      this.$store.dispatch("fetchDate"); // get server date
    },

    checkSched(item) {
      // if today's date
      if (
        this.moment(item.date).format("YYYY-MM-DD") ==
        this.moment(this.serverdate.date).format("YYYY-MM-DD")
      ) {
        if (item.schedule === 1) {
          // if today's time is met from backend (14:00-23:00)
          this.canAdd = false;
          return true;
        } else {
          this.canAdd = false;
          return false;
        }
      } else {
        // if yesterday's date
        if (
          this.moment(item.date).format("YYYY-MM-DD") ==
          this.moment(this.serverdate.date)
            .subtract(1, "days")
            .format("YYYY-MM-DD")
        ) {
          if (item.schedule === 0) {
            // if today's time is not met from backend (14:00-23:00)
            this.canAdd = false;
            return true;
          } else {
            this.canAdd = true;
            return false;
          } // if today's time is met from backend (14:00-23:00)
        } else {
          this.canAdd = true;
          return false;
        } // date beyond yesterday's date
      }
    },

    filterWithDate() {
      var data = {
        date: this.filterDate
      };
      this.$store.dispatch("pendingTran/fetchPendingTrans", data);
    },

    isNumber: function(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    reset() {
      this.editedPendingTran = this.defaultPendingTran;
    },

    deletePendingTran(item) {
      this.$store.dispatch("pendingTran/deletePendingTran", item);
    },

    copyPendingTran(item) {
      console.log(item);
      this.editedPendingTran = Object.assign({}, item);
    },

    update(pendingId, key, value) {
      let payload = {
        id: pendingId,
        key: key,
        value: value
      };
      console.log(payload)
      this.$store.dispatch("pendingTran/updatePendingTran", payload);
    },

    save(item) {
      this.editedPendingTran.branch = item.id; // add branch to object
      this.editedPendingTran.date = this.moment(item.date).format("YYYY-MM-DD"); // add date to object
      console.log(this.editedPendingTran);
      // store pending transaction
      this.$store.dispatch(
        "pendingTran/storePendingTran",
        this.editedPendingTran
      );
    },

    addAll(item) {
      this.$store.dispatch("pendingTran/addAllPendingTran", item);
    }
  }
};
</script>
