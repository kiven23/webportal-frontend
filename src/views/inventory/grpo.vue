<template>
  <v-container grid-list-md text-xs-center>
   <v-row align="center" no-gutters>
      <v-col cols="auto">
        <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
      </v-col>
      <v-col class="text-right" >
        <v-btn
          color="teal"
          dark
          @click="createdgrpo"
          v-if="searchPO"
        >
          CREATED GRPO's
        </v-btn>
      </v-col>
    </v-row>
    <v-card color="white lighten-2">
      <v-card-title class="text-h5 lighten-3"> SyncMaster Pro V1.2.4
        </v-card-title>
   
      <v-card-text>
        Ultimate SAP GRPO & Barcode Integration  
          
      </v-card-text>
      
      <v-card-text>
        <v-text-field
          placeholder="SEARCH PO #"
          v-model="searchPO"
          :loading="loading"
          dense
        >
        </v-text-field>
         <v-card-text>
      Recent PO's:<br>
      <a @click="historyclick(ponumber)" v-for="(ponumber, index) in history" :key="index">
        {{ ponumber }}
        <span v-if="index < history.length - 1">, </span>
      </a>
    </v-card-text>
    
        <div class="d-flex justify-end">
          <v-chip
            class="ma-2"
            color="teal"
            text-color="white"
            @click="searchpo()"
          >
            <v-avatar left>
              <v-icon>mdi-search-web</v-icon>
            </v-avatar>
            Search
          </v-chip>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <!-- <v-btn @click="viewpo()" dense  > POs </v-btn>  -->
        <div v-if="creator">
          <v-btn @click="createAtion()" dense v-if="!ccheckbox"> CREATE </v-btn>
        </div>
      </v-card-actions>
      <v-divider></v-divider>

      <v-card-actions>
        <v-skeleton-loader
          :loading="loadingPosList"
          type="table-heading, list-item-two-line, image, table-tfoot"
        > 
          <v-data-table
            dense
            :headers="headers"
            :items="podata"
            item-key="LineNum"
            show-select
            v-model="selected"
          > 
            <!-- <template v-slot:item.Selection="{ item }" v-if="creator">
              <v-checkbox
                v-model="selected"
                :value="item.LineNum"
                v-if="
                  !checkerifexist(item.DocEntry + item.ItemCode + item.LineNum)
                "
                :disabled="item.LineStatus == 'C'"
                dense
              ></v-checkbox>
            </template> -->
            <template v-slot:item.Quantity="{ item,index }">
              <vs-input
               
                type="number"
                v-model="items[item.LineNum]"
                max="5"
                @input="checkqty(item.Quantity,item.OpenQty,index)"
                v-if="getqty(item.DocEntry + item.ItemCode + item.LineNum) == 0"
               
              />
            
            </template>
            <template v-slot:item.Status="{ item }">
              {{ item.LineStatus == "C" ? "Closed" : "Open" }}
            </template>
            <template v-slot:item.DocEntry="{ item }">
              <!-- <v-btn
                x-small
                color="blue-grey"
                v-if="
                  checkerifexist(
                    item.DocEntry + item.ItemCode + item.LineNum ||
                      item.LineStatus == 'C'
                  )
                "
                @click="handleDocEntryClick(item)"
                class="mr-2"
              > -->
                <!-- :disabled="checkerifexist(item.DocEntry + item.ItemCode + item.LineNum) == true" -->
                <!-- v-if="item.LineStatus !== 'O'" -->
                <!-- <strong> MANUAL SERIAL </strong> -->
                <!-- {{checkerifexist(item.DocEntry + item.ItemCode + item.LineNum)}} -->
              <!-- </v-btn> -->
              <!-- <v-btn
                x-small
                color="orange"
                v-if="
                  checkerifexist(
                    item.DocEntry + item.ItemCode + item.LineNum ||
                      item.LineStatus == 'C'
                  )
                "
                @click="handleDocEntryClick(item, 1)"
              >
                <strong> AUTO SN </strong>
              </v-btn> -->
              <v-btn
                :loading="reportsloading"
                x-small
                icon
                class="ml-2"
                fab
                v-if="
                  checkerifexist(
                    item.DocEntry + item.ItemCode + item.LineNum ||
                      item.LineStatus == 'C'
                  )
                "
                @click="reports(item)"
              >
              <v-icon>mdi-file-document</v-icon> 
              </v-btn>
            </template>
          </v-data-table>
        </v-skeleton-loader>
      </v-card-actions>
      <v-divider></v-divider>
    </v-card>
    <v-dialog v-model="pos" width="500">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          <v-text-field
            v-model="searchPOs"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>

        <v-card-text>
          <v-skeleton-loader
            :loading="loadingPos"
            type="table-heading, list-item-two-line, image, table-tfoot"
          >
            <v-data-table
              :headers="poheaders"
              :items="allpos"
              :search="searchPOs"
            >
              <template v-slot:item.DocEntry="{ item }">
                <v-btn
                  x-small
                  color="blue-grey"
                  @click="getDocEntry(item.DocEntry)"
                >
                  {{ item.DocEntry }}
                </v-btn>
              </template>
            </v-data-table>
          </v-skeleton-loader>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="pos = false"> close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="serialmanageDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      @click="focusNextEmptyField(index)"
    >
      <v-card>
        <v-toolbar
          style="
            background: linear-gradient(
              180deg,
              rgba(112, 43, 43, 0.05504208519345233) 2%,
              rgba(31, 62, 126, 1) 17%
            );
            border-radius: 10px;
          "
        >
          <v-btn icon @click="closedserialm">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>
            <v-text-field
              v-model="vendorref"
              label="Vendor Ref No"
              dense
              solo
              style="margin-top: 19px"
              @input="inforeset"
              :error-messages="errorvendor"
              :disabled="!creator"
            ></v-text-field>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items v-if="creator">
            <v-btn
              text
              @click="verifydata()"
              dense
              v-if="this.errorSN.filter((item) => item).length == 0 ? true : false"
              :disabled="sncheck != parseFloat(listing.quantity).toFixed(0)"
               
            >
               <v-icon color="teal">mdi-content-save-all</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line>
          <v-list-item-content class="ml-2">
            <br />
            Purchased Order Number#: {{ listing.po }} <br />
            Quantity: {{ listing.quantity }} <br />Line#: {{ listing.linenum
            }}<br />Model: {{ listing.model }}
          </v-list-item-content>

          <v-spacer></v-spacer>
          <v-textarea
            v-model="remarks"
            outlined
            label="Remarks"
            class="ml-2 mr-2"
            :error-messages="errorremarks"
            @input="inforeset"
            :disabled="!creator"
            
          ></v-textarea>
          <v-card-title
            >Serial &nbsp;&nbsp;  
            <v-icon @click="print()" dense color="black"  :disabled="sncheck != parseFloat(listing.quantity).toFixed(0)">mdi-printer</v-icon>
          </v-card-title>
          <div v-for="index in generateRange(listing.quantity)" :key="index">
            <v-col cols="12">
              <v-text-field
                clearable
                dense
                :label="
                  'SN' +
                  index +
                  (br[index - 1] ? ' BARCODER: ' + br[index - 1] : '')
                "
                v-model="sn[index - 1]"
                @input="validateField(index - 1, listing.quantity)"
                @click:clear="validateField(index - 1, 0)"
                @focus="focusNextEmptyField(index)"
                @click="focusNextEmptyField(index)"
              
                color="green"
                :error-messages="errorSN[index - 1]"
                
                 @keydown.tab.prevent="focusNextEmptyField(index)"
                 :ref="'textField' + index"

              >
              
              
              </v-text-field>
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

    <v-dialog
      v-model="printdialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dense color="white">
          <v-btn icon @click="printdialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Print Barcode</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-card-actions>
            <!-- <v-btn
            color="primary"
            text
            @click="download()"
          >
            Print
          </v-btn> -->
          </v-card-actions>
        </v-toolbar>
        <iframe :src="printlink" width="100%" height="650"></iframe>
      </v-card>
    </v-dialog>

    <v-dialog v-model="Verifysync" persistent>
      <v-card>
        <v-card-title class="text-h8"> Review Breakdown </v-card-title>
        <v-card-text>
          <strong>PO:</strong> {{ verifiedSerial.listing.po }} <br />
          <strong>Quantity:</strong>
          {{ parseFloat(verifiedSerial.listing.quantity).toFixed(0) }} <br />
          <strong>Line Number:</strong> {{ verifiedSerial.listing.linenum }}
          <br />
          <strong>Item Code:</strong> {{ verifiedSerial.listing.itemcode }}
          <br />
          <strong>Unique ID:</strong> {{ verifiedSerial.listing.uniqueid }}
          <br />
          <strong>Warehouse:</strong> {{ verifiedSerial.listing.whs }} <br />
          <strong>Model:</strong> {{ verifiedSerial.listing.model }} <br />
          <strong>Brand:</strong> {{ verifiedSerial.listing.brand }} <br />
          <strong>Vendor Reference:</strong> {{ verifiedSerial.vendorref
          }}<br />
          <strong>Remarks:</strong> {{ verifiedSerial.remarks }}
           <v-card-title class="text-h8">Serial</v-card-title>
          <ul>
            <li v-for="serial in verifiedSerial.serial" :key="serial.index">
              <strong>{{ serial.index + 1 }}. SN:</strong> {{ serial.sn }},
            </li>
          </ul>
        </v-card-text>
        <v-card-text>
          You cannot edit the document once it is submitted successfully.
        </v-card-text>
        <v-card-actions>
           
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="Verifysync = false">
            Cancel
          </v-btn>
          <v-btn color="green darken-1" text @click="send">
            Sync & Closed
          </v-btn>
        </v-card-actions>
         
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="logsDialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="primary"
        dark
      >
        <v-card-text>
  <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>

  <div
    style="max-height: 200px; overflow-y: auto; font-size: small; font-weight: bold;"
  >
    {{logsData}}
  </div>
</v-card-text>
      </v-card>
    </v-dialog>
    <!-- Dialog -->
    <v-dialog v-model="selectedDialogs" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h6">Item Details</span>
        </v-card-title>

        <v-card-text>
          <v-data-table
            :headers="selecteditemsheader"
            :items="selectedItems"
            dense
            class="elevation-1"
          ></v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="selectedDialogs = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
var oldmodel;
import { mapGetters } from "vuex";
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
      color: "",
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
      selectedDialogs: false,
      selecteditemsheader: [ 
        
        { text: "Description", value: "Dscription" },
        { text: "Quantity", value: "qty" },
        { text: "PO-Quantity", value: "OpenQty" }],
      selectedItems: [],
      resubmit: false,
      intervalId: null,
      logsData: '',
      logsDialog: false,
      randomID: null,
      items: [],
      mapid: '',
      status: '',
      reportsloading: false,
      companies: '',
      history: [],
      q: '',
      countserial: '',
      verifiedSerial: [],
      Verifysync: false,
      perm: ["Create GRPO"],
      loadingPos: false,
      loadingPosList: false,
      br: [],
      reportsdata: '',
      barcoder: "",
      printlink: "",
      printdialog: false,
      realdata: [],
      errorremarks: "",
      errorvendor: "",
      sndisable: [],
      errorSN: [],
      vendorref: "",
      remarks: "",
      sndata: [],
      qoutes: "",
      pos: false,
      qty: 1,
      qtydialog: false,
      checker: [],
      key: [],
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
        { text: "Original Quantity", value: "Quantity" },
        { text: "OpenQty", value: "OpenQty" },
        { text: "Status", value: "Status" },
      ],
      poheaders: [
        { text: "CardCode", value: "CardCode" },
        { text: "CardName", value: "CardName" },
        { text: "PO#", value: "DocEntry" },
      ],
      allpos: [],
      searchPOs: "",
      opentQTY: 0,
      liveQTY: 0
    };
  },

  computed: {
    ...mapGetters({
      permissions: "userPermissions/getPermission",
    }),
    creator() {
      return this.permissions.includes("Master GRPO");
    },
    animatedText() {
      return this.text + this.dots;
    },
    ccheckbox() {
      return this.selected.length === 0 ? true : false;
    },
    checkerror() {
      return this.errorSN;
    },
    sncheck(){
      return this.sn.filter((item) => item !== null).length;
    }
  },
  created() {},

  methods: {
     generateRandomNumber() {
      this.randomID = Math.floor(1000000000 + Math.random() * 9000000000);
     },
     checkqty(q,openqty,index){
      let open = parseInt(openqty)
      let qty = parseInt(q)
      this.opentQTY = open
      this.liveQTY = qty
      this.disableNumberInput(q,index)
    },
    disableNumberInput(event,index) {
       const inputRef = this.items[index];
      if (  inputRef > this.opentQTY ) {
        alert('Quantity exceed')
        this.items[index] = this.opentQTY
      }
     },

    createdgrpo(){
      
      this.$router.push('/sapb1/grpo/po/created/'+this.searchPO);
    },
    back(){
      this.$router.push('/sapb1/grpo/po');
    },
    historyclick(po){
      this.searchPO = po
      this.searchpo()
    },
    //REPORTS
    reports(data){
       this.reportsloading = true
       const basemap = data.DocEntry +
              "-" +
              parseInt(
                this.getqty(data.DocEntry + data.ItemCode + data.LineNum)
              ) +
              "-" +
              data.LineNum 
      axios
          .get(
            this.$URLs.backend +
              "/api/gen/grporeceiving?data=" +
              data.DocEntry +
              "-" +
              parseInt(
                this.getqty(data.DocEntry + data.ItemCode + data.LineNum)
              ) +
              "-" +
              data.LineNum,
              { responseType: 'blob' }
          )
          .then((res) => {
           
             this.reportsdata = window.URL.createObjectURL(new Blob([res.data],  { type: 'application/pdf' }));
        
             const link = document.createElement('a');
            link.href =  this.reportsdata ;
            link.target = '_blank';
            link.setAttribute('download', 'receivingreports.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            this.reportsloading = false
                 
          });

    },

    //END REPORTS
    focusNextEmptyField() {
       const emtysnIndex = this.sn.findIndex(value => value === null || value === '') +1;
       this.$refs['textField' + emtysnIndex][0].focus();
    },
    closedserialm(){
       this.serialmanageDialog = false
     
       this.errorSN = []
    },
    validateField(key, qty) {
      
      this.q = parseFloat(qty);
      this.countserial = this.sn.filter((item) => item !== "").length;
      console.log(this.countserial + "-" + this.q);
      if (this.hasDuplicates(this.sn)) {
        this.errorSN[key] = "Duplicate entries are not allowed.";
      } else if (this.countserial !== this.q) {
        this.errorSN[key] = "Don't Blank";
      } else {
        this.errorSN[key] = "";
      }
      var data = {
        key: key,
        sn: this.sn[key],
        id: this.listing.po,
        uniqueid: this.listing.uniqueid,
        barcoder: this.barcoder,
      };

      //this.$socket.emit("serialized", data);
    },
    hasDuplicates(array) {
      if (
        array.filter(
          (item) => item !== null && item !== undefined && item !== ""
        ).length !== 1
      ) {
        var d = array.filter(Boolean);
        return new Set(d).size !== d.length;
      } else {
        return false;
      }
    },
    checkerifexist(data) {
      var dd;
      this.key.forEach((i, index) => {
        if (i == data) {
          dd = true;
        }
      });
      return dd == true ? true : false;
    },
    ifsn(data) {
      var dd;
      this.checker.forEach((i, index) => {
        if (i.key == data) {
          dd = i.sn;
        }
      });
      return dd ? dd : false;
    },
    getqty(data) {
      var dd;
      this.checker.forEach((i, index) => {
        if (i.key == data) {
          dd = i.qty;
        }
      });
      return dd ? dd : 0;
    },
    getDocEntry(data) {
      this.pos = false;

      this.searchpo(data);
    },
  async  viewpo(status) {
      //this.loadingPos = true;
      //this.pos = true;
      await  axios
        .get(this.$URLs.backend + "/api/inventory/grpo/viewpos?status="+status)
        .then((res) => {
         this.allpos = res.data;
         // this.loadingPos = false;
        });
  
      await this.allpos.forEach((value,index)=>{
           if (!this.history.includes(this.history)) {
            this.history.push(value.DocEntry)
            console.log(value.DocEntry)
          }
      })
    },
    progress(uniqueID) {
      console.log(uniqueID);
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
      }, 20000);
    },
    verifydata() {
      this.Verifysync = true;
      const data = this.alldata();
      this.verifiedSerial = data;
    },
    send() {
      this.isProgress = true;
      const data = this.alldata();
      this.creategrpo(data);
      this.progress(this.systemID);
       
    },
    alldata() {
      if (this.vendorref.length == 0 || this.remarks.length == 0) {
        this.errorvendor = "Required";
        this.errorremarks = "Required";
      } else {
        var serial = [];
        var data;
        this.sn.forEach((data, index) => {
          serial.push({ sn: data, index: index });
        });
        data = {
          listing: this.listing,
          serial: serial,
          vendorref: this.vendorref,
          remarks: this.remarks,
        };
        return data;
      }
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
          this.refresh2();
          var text = JSON.stringify(res.data);
          this.$swal("Sync!", "" + res.data.message + "", res.data.status);
          this.Verifysync = false
          console.log(res.data.message+'-----'+ res.data.status)
        });
    },
    searchpo(po) {
      this.$socket.emit("history", this.companies);
      var data = po;
      if (!po) {
        data = this.searchPO;
      }
      this.loadingPosList = true;
      // this.searchPO = po
      this.loading = true;

      axios
        .post(this.$URLs.backend + "/api/inventory/grpo/search?status="+this.status, {
          data,
        })
        .then((res) => {
          this.barcoder = res.data.barcoder;
          this.podata = res.data.data;
          this.loading = false;
          this.loadingPosList = false;
          this.key = [];
          this.checker = [];
          res.data.key.forEach((keying, index) => {
            this.key.push(keying[3]);
            this.checker.push({
              key: keying[3],
              sn: keying[7],
              qty: keying[8],
            });
          });
        });
    },
    inforeset() {
      // if(this.remarks.length !== 0){
      //     this.errorremarks  = ''
      // }else{
      //    this.errorremarks  = 'Required'
      // }
      // if(this.vendorref.length !== 0){
      //     this.errorvendor = ''
      // }else{
      //     this.errorvendor  = 'Required'
      // }
      //  this.$socket.emit("serialized", this.remarks);
      //     var data = {
      //     vendor: this.vendorref,
      //     remark: this.remarks,
      //     id: this.listing.po,
      //     uniqueid: this.listing.uniqueid
      //  }
      //  this.$socket.emit("serialized", data);
    },
    handleDocEntryClick(data, i) {
      const whs = data.WhsCode.split("-");
      this.listing = {
        po: data.DocEntry,
        quantity: this.getqty(data.DocEntry + data.ItemCode + data.LineNum),
        linenum: data.LineNum,
        itemcode: data.ItemCode,
        uniqueid: data.DocEntry + data.ItemCode + data.LineNum + data.OpenQty,
        whs: whs[0],
        model: data.Dscription,
        brand: data.FirmName,
      };

      if (i == 1) {
        const autoserial = new Date();
        const month = (autoserial.getMonth() + 1).toString().padStart(2, "0");
        const day = autoserial.getDate().toString().padStart(2, "0");
        const year = autoserial.getFullYear().toString();
        const hour = autoserial.getHours();
        const minute = autoserial.getMinutes();

        const m =
          year.slice(-2) +
          "" +
          month +
          "" +
          day +
          "" +
          hour +
          "" +
          minute +
          this.listing.whs;
        this.sn = [];
        this.generateRange(this.listing.quantity).forEach((data, index) => {
          this.sn[index] = m + data;
        });
        this.systemID = this.listing.uniqueid;
        this.serialmanageDialog = true;
      } else {
        axios
          .get(
            this.$URLs.backend +
              "/api/inventory/grpo/getlines?data=" +
              data.DocEntry +
              "-" +
              parseInt(
                this.getqty(data.DocEntry + data.ItemCode + data.LineNum)
              ) +
              "-" +
              data.LineNum
          )
          .then((res) => {
            this.remarks = "";
            this.vendorref = "";
            console.log(
              this.checkerifexist(data.DocEntry + data.ItemCode + data.LineNum)
            );
            if (
              this.checkerifexist(
                data.DocEntry + data.ItemCode + data.LineNum
              ) == true
            ) {
              this.systemID = this.listing.uniqueid;
              this.sn = [];
              this.sndata = res.data;
              this.serialmanageDialog = true;
              res.data["sn"].forEach((data, index) => {
                this.sn[data[2]] = data[3];
              });
              this.remarks = res.data["info"][3];
              this.vendorref = res.data["info"][2];
            } else {
              alert("@Stevefox_Linux 404");
            }
          });
      }
    },
    fetchLogs(id){
        axios.get(this.$URLs.backend +
              "/api/getlogs/grpo?data="+id).then((res)=>{
                this.logsData = res.data

        })
    },
    logsIinterVal(logid){
      this.intervalId = setInterval(() => {
           this.fetchLogs(logid); 
    }, 10000);
    },
    // createAtion() {
    //   if(this.resubmit == false){
    //     // alert('generate ulit'+ this.resubmit)
    //       this.generateRandomNumber()
    //   }
       
    
    //   const loading = this.$vs.loading({
    //     progress1: 0,
    //   });
    //   const interval = setInterval(() => {
    //     if (this.progress <= 100) {
    //       loading.changeProgress(this.progress++);
    //     }
    //   }, 1000);
    //   this.logsDialog =true
    //   const INFO = [];
    //   const itempo = this.items.filter(item => item !== '');
    //   console.log(itempo)
    //   this.podata.forEach((data, index) => {
    //     this.selected.forEach((selected, index) => {
    //       if (selected == data.LineNum) {
    //         console.log(itempo[index])
    //         INFO.push({
    //               DocEntry: data.DocEntry,
    //               LineNum: data.LineNum,
    //               TargetType: data.TargetType,
    //               TrgetEntry: data.TrgetEntry,
    //               BaseRef: data.BaseRef,
    //               BaseType: data.BaseType,
    //               BaseEntry: data.BaseEntry,
    //               BaseLine: data.BaseLine,
    //               LineStatus: data.LineStatus,
    //               ItemCode: data.ItemCode,
    //               Dscription: data.Dscription,
    //               qty: itempo[index]?itempo[index]:data.OpenQty,
    //               ShipDate: data.ShipDate,
    //               OpenQty: data.OpenQty,
    //               Price: data.Price,
    //               Currency: data.Currency,
    //               Rate: data.Rate,
    //               DiscPrcnt: data.DiscPrcnt,
    //               LineTotal: data.LineTotal,
    //               TotalFrgn: data.TotalFrgn,
    //               OpenSum: data.OpenSum,
    //               OpenSumFC: data.OpenSumFC,
    //               VendorNum: data.VendorNum,
    //               SerialNum: data.SerialNum,
    //               WhsCode: data.WhsCode,
    //               SlpCode: data.SlpCode,
    //               Commission: data.Commission,
    //               TreeType: data.TreeType,
    //               AcctCode: data.AcctCode,
    //               TaxStatus: data.TaxStatus,
    //               GrossBuyPr: data.GrossBuyPr,
    //               PriceBefDi: data.PriceBefDi,
    //               DocDate: data.DocDate,
    //               Flags: data.Flags,
    //               OpenCreQty: data.OpenCreQty,
    //               UseBaseUn: data.UseBaseUn,
    //               SubCatNum: data.SubCatNum,
    //               BaseCard: data.BaseCard,
    //               TotalSumSy: data.TotalSumSy,
    //               OpenSumSys: data.OpenSumSys,
    //               InvntSttus: data.InvntSttus,
    //               OcrCode: data.OcrCode,
    //               Project: data.Project,
    //               CodeBars: data.CodeBars,
    //               VatPrcnt: data.VatPrcnt,
    //               VatGroup: data.VatGroup,
    //               PriceAfVAT: data.PriceAfVAT,
    //               Height1: data.Height1,
    //               FirmName: data.FirmName
    //           });
    //       }
    //     });
    //   });
    //   this.logsIinterVal(this.randomID)
    //   var systemID2 = btoa(JSON.stringify(INFO));
    //   var data = { hash: INFO, line: this.selected, logsID: this.randomID };
    //   console.log(data)
    //   axios
    //     .post(this.$URLs.backend + "/api/inventory/grpo/createpo", {
    //       data,
    //     })
    //     .then((res) => {
    //       clearInterval(interval);
    //       clearInterval(this.intervalId)
    //       this.logsDialog = false
    //       this.progress = 0;
    //       var text = JSON.stringify(res.data);
    //       this.$swal("Grpo Creation", "" + res.data.message + "", res.data.status);
    //       this.resubmit = false
    //       this.createdgrpo()
    //       loading.close();
          
          
    //    }).catch((error) => {
    //         if(error.message == 'Request failed with status code 500'){
    //           this.resubmit = true
    //           this.createAtion()
    //           //alert('The System Resubmit Please Ok')
    //           clearInterval(this.intervalId)
    //           // console.error("An error occurred:", error);
    //           // this.$swal("Error!", "Failed to sync data: " + error.message, "error");
    //           loading.close();
    //           clearInterval(interval);
    //         }else{
    //           clearInterval(interval);
    //           clearInterval(this.intervalId)
    //         }
            
          
             
    //    });
    // },
    createAtion() {
  if (!this.resubmit) {
    this.generateRandomNumber();
  }
   
  
  const INFO = [];
  const itempo = this.items.filter((item) => item !== '');
  const mini = [];
  this.selected.forEach((data, index)=>{
            mini.push({
            DocEntry: data.DocEntry,
            ItemCode: data.ItemCode,
            qty: this.items[data.LineNum]?this.items[data.LineNum]: data.OpenQty,
            WhsCode: data.WhsCode,
            Dscription: data.Dscription,
            OpenQty: data.OpenQty})
            INFO.push({
              DocEntry: data.DocEntry,
              LineNum: data.LineNum,
              TargetType: data.TargetType,
              TrgetEntry: data.TrgetEntry,
              BaseRef: data.BaseRef,
              BaseType: data.BaseType,
              BaseEntry: data.BaseEntry,
              BaseLine: data.BaseLine,
              LineStatus: data.LineStatus,
              ItemCode: data.ItemCode,
              Dscription: data.Dscription,
              qty: this.items[data.LineNum]?this.items[data.LineNum]: data.OpenQty,
              ShipDate: data.ShipDate,
              OpenQty: data.OpenQty,
              Price: data.Price,
              Currency: data.Currency,
              Rate: data.Rate,
              DiscPrcnt: data.DiscPrcnt,
              LineTotal: data.LineTotal,
              TotalFrgn: data.TotalFrgn,
              OpenSum: data.OpenSum,
              OpenSumFC: data.OpenSumFC,
              VendorNum: data.VendorNum,
              SerialNum: data.SerialNum,
              WhsCode: data.WhsCode,
              SlpCode: data.SlpCode,
              Commission: data.Commission,
              TreeType: data.TreeType,
              AcctCode: data.AcctCode,
              TaxStatus: data.TaxStatus,
              GrossBuyPr: data.GrossBuyPr,
              PriceBefDi: data.PriceBefDi,
              DocDate: data.DocDate,
              Flags: data.Flags,
              OpenCreQty: data.OpenCreQty,
              UseBaseUn: data.UseBaseUn,
              SubCatNum: data.SubCatNum,
              BaseCard: data.BaseCard,
              TotalSumSy: data.TotalSumSy,
              OpenSumSys: data.OpenSumSys,
              InvntSttus: data.InvntSttus,
              OcrCode: data.OcrCode,
              Project: data.Project,
              CodeBars: data.CodeBars,
              VatPrcnt: data.VatPrcnt,
              VatGroup: data.VatGroup,
              PriceAfVAT: data.PriceAfVAT,
              Height1: data.Height1,
              FirmName: data.FirmName,
              Comments: data.Comments
            });
             
  })
   
      // this.podata.forEach((data, index) => {
      //   this.selected.forEach((selected, index) => {
      //     if (selected == data.LineNum) {
      //       mini.push({
      //       DocEntry: data.DocEntry,
      //       ItemCode: data.ItemCode,
      //       qty: itempo[index] ? itempo[index] : data.OpenQty,
      //       WhsCode: data.WhsCode,
      //       Dscription: data.Dscription,
      //       OpenQty: data.OpenQty})
            
      //       INFO.push({
      //         DocEntry: data.DocEntry,
      //         LineNum: data.LineNum,
      //         TargetType: data.TargetType,
      //         TrgetEntry: data.TrgetEntry,
      //         BaseRef: data.BaseRef,
      //         BaseType: data.BaseType,
      //         BaseEntry: data.BaseEntry,
      //         BaseLine: data.BaseLine,
      //         LineStatus: data.LineStatus,
      //         ItemCode: data.ItemCode,
      //         Dscription: data.Dscription,
      //         qty: itempo[index] ? itempo[index] : data.OpenQty,
      //         ShipDate: data.ShipDate,
      //         OpenQty: data.OpenQty,
      //         Price: data.Price,
      //         Currency: data.Currency,
      //         Rate: data.Rate,
      //         DiscPrcnt: data.DiscPrcnt,
      //         LineTotal: data.LineTotal,
      //         TotalFrgn: data.TotalFrgn,
      //         OpenSum: data.OpenSum,
      //         OpenSumFC: data.OpenSumFC,
      //         VendorNum: data.VendorNum,
      //         SerialNum: data.SerialNum,
      //         WhsCode: data.WhsCode,
      //         SlpCode: data.SlpCode,
      //         Commission: data.Commission,
      //         TreeType: data.TreeType,
      //         AcctCode: data.AcctCode,
      //         TaxStatus: data.TaxStatus,
      //         GrossBuyPr: data.GrossBuyPr,
      //         PriceBefDi: data.PriceBefDi,
      //         DocDate: data.DocDate,
      //         Flags: data.Flags,
      //         OpenCreQty: data.OpenCreQty,
      //         UseBaseUn: data.UseBaseUn,
      //         SubCatNum: data.SubCatNum,
      //         BaseCard: data.BaseCard,
      //         TotalSumSy: data.TotalSumSy,
      //         OpenSumSys: data.OpenSumSys,
      //         InvntSttus: data.InvntSttus,
      //         OcrCode: data.OcrCode,
      //         Project: data.Project,
      //         CodeBars: data.CodeBars,
      //         VatPrcnt: data.VatPrcnt,
      //         VatGroup: data.VatGroup,
      //         PriceAfVAT: data.PriceAfVAT,
      //         Height1: data.Height1,
      //         FirmName: data.FirmName,
      //         Comments: data.Comments
      //       });
      //     }
      //   });
      // });
   
  const parsedMini = mini;
  console.log(parsedMini)
  let tableRows = "";  
  parsedMini.forEach(item => {
    tableRows += `
      <tr>
        <td style="padding: 1px; border: 1px solid #ccc;">${item.DocEntry}</td>
        <td style="padding: 1px; border: 1px solid #ccc;">${item.ItemCode}</td>
        <td style="padding: 1px; border: 1px solid #ccc;">${item.qty}</td>
        <td style="padding: 1px; border: 1px solid #ccc;">${item.WhsCode}</td>
        <td style="padding: 1px; border: 1px solid #ccc;">${item.Dscription}</td>
        <td style="padding: 1px; border: 1px solid #ccc;">${item.OpenQty}</td>
      </tr>
    `;
  });
 
  
  this.$swal({
    title: "Confirm GRPO Creation",
      
      html: `
      <table style="width: 100%; border-collapse: collapse; margin: 5px 0; border: 1px solid #ddd;">
      <thead>
        <strong>Once submitted, this action cannot be retrieved or undone. Are you sure you want to proceed?</strong><br>
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 5px; text-align: left;">Doc#</th>
          <th style="padding: 5px; text-align: left;">Item</th>
          <th style="padding: 5px; text-align: left;">Qty</th>
          <th style="padding: 5px; text-align: left;">Whs</th>
           
          <th style="padding: 5px; text-align: left;">Dsc</th>
          <th style="padding: 5px; text-align: left;">OPenty</th>
          
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, proceed",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
    
      const loading = this.$vs.loading({
        progress1: 0,
      });

      const interval = setInterval(() => {
        if (this.progress <= 100) {
          loading.changeProgress(this.progress++);
        }
      }, 1000);

      this.logsDialog = true;
       

      this.logsIinterVal(this.randomID);
      var systemID2 = btoa(JSON.stringify(INFO));
      var data = { hash: systemID2, line: this.selected, logsID: this.randomID };

      axios
        .post(this.$URLs.backend + "/api/inventory/grpo/createpo", { data })
        .then((res) => {
          clearInterval(interval);
          clearInterval(this.intervalId);
          this.logsDialog = false;
          this.progress = 0;
          this.$swal("GRPO Creation", res.data.message, res.data.status);
          this.resubmit = false;
          this.createdgrpo();
          loading.close();
        })
        .catch((error) => {
          if (error.message == "Request failed with status code 500") {
            this.resubmit = true;
            this.createAtion();
            clearInterval(this.intervalId);
            loading.close();
            clearInterval(interval);
          } else {
            clearInterval(interval);
            clearInterval(this.intervalId);
          }
        });
    } else {
      // Cancelled by user
      this.$swal("Cancelled", "GRPO creation was cancelled.", "info");
    }
  });
},


    refresh2() {
      this.listing = {};
      this.systemID = "";
      this.isProgress = false;
      this.serialmanageDialog = false;
      this.selected = [];
      this.searchpo(this.searchPO);
    },
    refresh() {
      this.listing = {};
      this.systemID = "";
      this.isProgress = false;
      this.serialmanageDialog = false;
      this.selected = [];
      this.searchpo(this.searchPO);
      this.$socket.emit("refresh", this.searchPO);
    },
    print() {
      this.printlink = "";
      this.printdialog = true;

      this.printlink =
        this.$URLs.backend +
        "/api/grpo/print?id=" +
        btoa(JSON.stringify(this.sn)) +
        "&brand=" +
        this.listing.brand +
        "&model=" +
        this.listing.model;
    },
    download() {
      this.$store.dispatch("printgrpobarcode/download", this.sn).then((res) => {
        var url = res;
        window.open(url, "_blank");
      });
    },
  },
  mounted() {

    this.mapid = this.$route.params.mapid;
    
    if(this.mapid){
       
      this.status = 'O'
      this.searchPO = this.mapid
      this.viewpo('O')
      this.searchpo(this.searchPO)
    }else{
      this.viewpo('O')
      this.status = 'O'
    }
   
    
    var user = localStorage.getItem('user');
    this.companies = JSON.parse(user).branch.companies
    this.verifiedSerial = {
      listing: {
        po: "",
        quantity: "",
        linenum: "",
        itemcode: "",
        uniqueid: "",
        whs: "",
        model: "",
        brand: "",
      },
      serial: [],
      vendorref: "",
      remarks: "",
    };
    this.$store.dispatch("userPermissions/fetchPermission");

    //this.creategrpo();
    this.sockets.subscribe("refresh", (res) => {
      if (this.searchPO == res) {
        this.listing = {};
        this.systemID = "";
        this.isProgress = false;
        this.serialmanageDialog = false;
        this.selected = [];
        this.searchpo(this.searchPO);
      }
    });

    this.sockets.subscribe("serialized", (res) => {
      if (res.uniqueid == this.listing.uniqueid) {
        if (res.id == this.listing.po) {
          this.sn = [
            ...this.sn.slice(0, res.key),
            res.sn,
            ...this.sn.slice(res.key + 1),
          ];
          this.br[res.key] = res.barcoder;
          this.remarks = res.remark;
          this.vendorref = res.vendor;
       
          this.focusNextEmptyField()
        }
          
      }
     
    });
    this.sockets.subscribe("history", (res) => {
      console.log(res.company+'-'+this.companies)
      if(res.company == this.companies){
        if (!this.history.includes(res.po)) {
            this.history.push(res.po)
          }
      }
       
    });
  },
};
</script>
 

<style>
</style>