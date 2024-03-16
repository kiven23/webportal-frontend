<template>
  <v-container grid-list-md text-xs-center>
    <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
    <v-card color="white lighten-2">
      <v-card-title class="text-h5 lighten-3"> SyncMaster Pro V1 </v-card-title>
      <v-card-text> Ultimate SAP GRPO & Barcode Integration </v-card-text>
      <v-card-text>
        <v-text-field
          placeholder="SEARCH PO #"
          v-model="searchPO"
          :loading="loading"
          dense
        >
        </v-text-field>
      </v-card-text>

      <v-card-actions>
 
        <v-spacer></v-spacer>
        <v-btn @click="createAtion()" dense v-if="!ccheckbox"> CREATE  </v-btn
        ><v-btn @click="searchpo()" dense> SEARCH PO # </v-btn>
      </v-card-actions>
      <v-divider></v-divider>
    
      <v-card-actions>
        <v-data-table
          dense
          :headers="headers"
          :items="podata"
          item-key="DocEntry"
        >
          <template v-slot:item.Selection="{ item }">
            <v-checkbox
              v-model="selected"
              :value="item.LineNum"
              v-if="item.LineStatus == 'O'"
              dense
            ></v-checkbox>
          </template>
          <template v-slot:item.Status="{ item }">
            {{ item.LineStatus == "C" ? "Closed" : "Open" }}
          </template>
          <template v-slot:item.DocEntry="{ item }">
           
            <v-btn
              x-small
              color="blue-grey"
               v-if="item.LineStatus !== 'O'"
              @click="handleDocEntryClick(item)"
            >
              <strong> MANAGE SERIAL  </strong>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-actions>
      <v-divider></v-divider>
    </v-card>
    <v-dialog
      v-model="serialmanageDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          style=" background: linear-gradient( 180deg,rgba(112, 43, 43, 0.05504208519345233) 2%,
              rgba(31, 62, 126, 1) 17%
            );
            border-radius: 10px;
          "
        >
          <v-btn icon  @click="serialmanageDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title  
            >Serial Manager
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn  text @click="send()" dense> GRPO SAVE </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader dense>
            <strong> Purchased Order Number#: {{ listing.po }} </strong>
          </v-subheader>
          <v-subheader dense>
            <strong>Quantity: {{ listing.quantity }} </strong>
          </v-subheader>
          <v-subheader dense>
            <strong>Line#: {{ listing.linenum }}</strong>
          </v-subheader>

          <div v-for="index in generateRange(listing.quantity)" :key="index">
            <v-col cols="12">
              <v-text-field
                dense
                :label="'SN' + index"
                v-model="sn[index - 1]"
              ></v-text-field>
            </v-col>
          </div>
        </v-list>
        <v-divider></v-divider>
      </v-card>
    </v-dialog>
    <v-dialog v-model="isProgress" hide-overlay persistent width="240">
      <v-card
        style="
          background: linear-gradient(
            180deg,
            rgba(112, 43, 43, 0.05504208519345233) 2%,
            rgba(31, 62, 126, 1) 17%
          );
        "
      >
        <v-img
          lazy-src="/syncing3.gif"
          max-height="60"
          max-width="240"
          src="/syncing3.gif"
        >
        </v-img>
      </v-card>
      <v-card-text>
        {{ animatedText }}
        <v-progress-linear v-model="progStatus" color="blue-grey" height="25">
          <strong>{{ progStatus }}</strong>
        </v-progress-linear>
      </v-card-text>
    </v-dialog>
  </v-container>
</template>

<script>
var oldmodel;
import { validationMixin } from "vuelidate";
import {
  required,
  maxLength,
  email,
  minLength,
  numeric,
} from "vuelidate/lib/validators";
import axios from "axios";
export default {
  mixins: [validationMixin],
  validations: {
    data: {
      model: { required },
      prodcat: { required },
      itmgroup: { required },
      withHtaxt: { required },
      brand: { required },
      batchserial: { required },
      warrantytemp: { required },
      preferredvendor: { required },
      purchaseuom: { required },
      inventoryoum: { required },
    },
  },
  data() {
    return {
      selected: [],
      breadcrums: [
        {
          text: "Dashboard",
          disabled: false,
          href: "/",
        },
        {
          text: "GRPO",
          disabled: true,
          href: "/sapb1/grpo/po",
        },
      ],
      progress1: 0,
      isProgress: false,
      systemID: "",
      search: "",
      podata: [],
      searchPO: "",
      loading: false,
      listing: {},
      serialmanageDialog: false,
      sn: [],
      text: "Connecting to SAP B1 Integration",
      dots: "",
      progStatus: "",
      interval: "",
      headers: [
        { text: "Selection", value: "Selection" },
        {
          text: "Action",
          align: "start",
          sortable: false,
          value: "DocEntry",
        },
        { text: "WhsCode", value: "WhsCode" },
        { text: "ItemCode", value: "ItemCode" },
        { text: "Dscription", value: "Dscription" },
        // { text: "Quantity", value: "Quantity" },
        // { text: "ShipDate", value: "ShipDate" },
        // { text: "Price", value: "Price" },
        // { text: "Status", value: "Status" },
      ],
    };
  },

  computed: {
    animatedText() {
      return this.text + this.dots;
    },
    ccheckbox(){
      return this.selected.length === 0? true:false; 
    }
  },
  created() {},

  methods: {
    progress(uniqueID) {
      this.interval = setInterval(() => {
        axios
          .get(
            this.$URLs.backend + "/api/inventory/grpo/progress?data=" + uniqueID
          )
          .then((res) => {
            this.progStatus = res.data.status + " %";
            if (Math.round(res.data.status) === 100) {
              clearInterval(this.interval);
            }
          });
      }, 2000);
    },
    send() {
      this.isProgress = true;
      console.log(this.sn);
      var serial = [];
      var data;
      this.sn.forEach((data, index) => {
        serial.push({ sn: data, index: index });
      });
      data = {
        listing: this.listing,
        serial: serial,
      };

      this.creategrpo(data);
      this.progress(this.systemID);
    },
    generateRange(quantity) {
      return Array.from({ length: quantity }, (v, k) => k + 1);
    },
    creategrpo(data) {
     
      axios
        .post(this.$URLs.backend + "/api/inventory/grpo/create", {
          data,
        })
        .then((res) => {
          console.log(res.data);
          this.refresh();
          var text = JSON.stringify(res.data);
          this.$swal("Sync!", "" + text + "", "success");
        });
    },
    searchpo() {
      this.loading = true;
      const data = this.searchPO;
      axios
        .post(this.$URLs.backend + "/api/inventory/grpo/search", {
          data,
        })
        .then((res) => {
          this.podata = res.data.data;
          this.loading = false;
        });
    },
    handleDocEntryClick(data) {
      this.listing = {
        po: data.DocEntry,
        quantity: data.Quantity,
        linenum: data.LineNum,
        itemcode: data.ItemCode,
        uniqueid: data.DocEntry + data.ItemCode + data.LineNum
         
      };
      
      this.systemID = this.listing.uniqueid;
      this.serialmanageDialog = true;
    },
 
    createAtion() {
        const loading = this.$vs.loading({
            progress1: 0
          })
          const interval = setInterval(() => {
            if (this.progress <= 100) {
              loading.changeProgress(this.progress++)
            }
          }, 40)
            
      const INFO = [];
      this.podata.forEach((data, index) => {
        this.selected.forEach((selected, index) => {
          if (selected == data.LineNum) {
            INFO.push({  ItemCode: data.ItemCode, LineNum: data.LineNum, DocEntry: data.DocEntry });
          }
        });
      });
      var systemID2 = btoa( JSON.stringify(INFO)) ;
      var data = { hash: systemID2, line: this.selected}
         axios
        .post(this.$URLs.backend + "/api/inventory/grpo/createpo", {
          data,
        })
        .then((res) => {
          console.log(res.data);
          this.refresh();
           loading.close()
            clearInterval(interval)
            this.progress = 0
          var text = JSON.stringify(res.data);
          this.$swal("Sync!", "" + text + "", "success");
        });
    },

    refresh() {
      this.listing = {};
      this.systemID = "";
      this.isProgress = false;
      this.serialmanageDialog = false;
      this.selected = [];
      this.searchpo();
    },
  },
  mounted() {
    //this.creategrpo();
  },
};
</script>
 

<style>
</style>