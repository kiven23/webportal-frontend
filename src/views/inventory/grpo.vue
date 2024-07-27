<template>
  <v-container grid-list-md text-xs-center>
    <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
    <v-card color="white lighten-2">
      <v-card-title class="text-h5 lighten-3"> SyncMaster Pro V1  </v-card-title>
      <v-card-text> Ultimate SAP GRPO & Barcode Integration  {{ creator }}  </v-card-text>
      <v-card-text>
         
        <v-text-field
          placeholder="SEARCH PO #"
          v-model="searchPO"
          :loading="loading"
          dense
        >
        </v-text-field>
      </v-card-text>

      <v-card-actions >
 
        <v-spacer></v-spacer>
        <v-btn @click="viewpo()" dense  > POs </v-btn>
        <div v-if="creator">
        <v-btn @click="createAtion()" dense v-if="!ccheckbox"> CREATE  </v-btn
        >
        </div>
        <!-- <v-btn @click="searchpo()" dense> SEARCH PO # </v-btn> -->
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
          item-key="DocEntry"
        >
          <template v-slot:item.Selection="{ item }" v-if="creator">
            <v-checkbox
              v-model="selected"
              :value="item.LineNum"
              v-if="!checkerifexist(item.DocEntry + item.ItemCode + item.LineNum) "
              :disabled="item.LineStatus == 'C'"
              dense
            ></v-checkbox>
          </template>
          <template v-slot:item.Quantity="{ item }">
              
              <vs-input
              type="number"
              v-model="item.Quantity"
              max="5"
              v-if="getqty(item.DocEntry + item.ItemCode + item.LineNum) == 0"
            /> 
 
          </template>
          <template v-slot:item.Status="{ item }">
            {{ item.LineStatus == "C" ? "Closed" : "Open" }}
          </template>
          <template v-slot:item.DocEntry="{ item }">
           
            <v-btn
              x-small
              color="blue-grey"
              v-if="checkerifexist(item.DocEntry + item.ItemCode + item.LineNum || item.LineStatus == 'C')"
              @click="handleDocEntryClick(item)"
              class="mr-2"
            >
          
            <!-- :disabled="checkerifexist(item.DocEntry + item.ItemCode + item.LineNum) == true" -->
              <!-- v-if="item.LineStatus !== 'O'" -->
              <strong> MANUAL SERIAL    </strong>
              <!-- {{checkerifexist(item.DocEntry + item.ItemCode + item.LineNum)}} -->
            
            </v-btn>
              <v-btn
              x-small
              color="orange"
              v-if="checkerifexist(item.DocEntry + item.ItemCode + item.LineNum || item.LineStatus == 'C')"
              @click="handleDocEntryClick(item,1)"
             
            >
              <strong> AUTOSN   </strong>
            </v-btn>
          </template>
        </v-data-table>
        </v-skeleton-loader>
      </v-card-actions>
      <v-divider></v-divider>
    </v-card>
     <v-dialog
      v-model="pos"
      width="500"
    >
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
              {{item.DocEntry}}
             </v-btn>
          </template>
          
          </v-data-table>
           </v-skeleton-loader>

         </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="pos = false"
          >
            close
          </v-btn>
        </v-card-actions>
      </v-card>

      
    </v-dialog>
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
            > <v-text-field
                v-model="vendorref"
                label="Vendor Ref No"
                dense
                solo
                style="margin-top: 19px "
                @input="inforeset"
                :error-messages="errorvendor"
                :disabled="!creator"
          ></v-text-field>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items v-if="creator">
            <v-btn  text @click="verifydata()" dense v-if="this.errorSN.filter(item => item).length == 0? true: false" > GRPO SAVE    </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line >
          <v-list-item-content class="ml-2">
           
             <br> Purchased Order Number#: {{ listing.po }} <br> Quantity: {{ listing.quantity }} <br>Line#: {{ listing.linenum }}<br>Model: {{ listing.model }}
            
           
              
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
          <v-card-title>Serial
            &nbsp;&nbsp;   <v-icon @click="print()" dense color="black">mdi-printer</v-icon> 
          </v-card-title>
          <div v-for="index in generateRange(listing.quantity)" :key="index">
            <v-col cols="12">

              <v-text-field
                dense
                 :label="'SN' + index + (br[index - 1] ? ' BARCODER: ' + br[index - 1] : '')"
                v-model="sn[index - 1]"
                @input="validateField(index - 1,listing.quantity)"
                color="green"
                :error-messages="errorSN[index - 1]"
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
    

     <v-dialog
      v-model="printdialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      
      <v-card>
         <v-toolbar
          dense
          color="white"
        >
          <v-btn
            icon
           
            @click="printdialog = false"
          >
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
           <iframe :src="printlink"   width="100%" height="650"></iframe>
         
      </v-card>
       
    </v-dialog>


    <v-dialog
      v-model="Verifysync"
      persistent
     
    >
   
      <v-card>
        <v-card-title class="text-h8">
          Review Breakdown
        </v-card-title>
         
         <v-card-text>
        <strong>PO:</strong> {{ verifiedSerial.listing.po }} <br>
        <strong>Quantity:</strong> {{ parseFloat(verifiedSerial.listing.quantity).toFixed(0) }} <br>
        <strong>Line Number:</strong> {{ verifiedSerial.listing.linenum }} <br>
        <strong>Item Code:</strong> {{ verifiedSerial.listing.itemcode }} <br>
        <strong>Unique ID:</strong> {{ verifiedSerial.listing.uniqueid }} <br>
        <strong>Warehouse:</strong> {{ verifiedSerial.listing.whs }} <br>
        <strong>Model:</strong> {{ verifiedSerial.listing.model }} <br>
        <strong>Brand:</strong> {{ verifiedSerial.listing.brand }} <br>
        <strong>Vendor Reference:</strong> {{ verifiedSerial.vendorref }}<br>
        <strong>Remarks:</strong> {{ verifiedSerial.remarks }}
      
        <h1>Serial Numbers</h1>
        <ul>
          <li v-for="serial in verifiedSerial.serial" :key="serial.index">
            <strong>{{ serial.index+1 }}. SN:</strong> {{ serial.sn }},  
          </li>
        </ul>
      
      
        </v-card-text>
        
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="Verifysync = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="send()"
          >
            Sync & Closed
          </v-btn>
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
      
      color: '',
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
      verifiedSerial: [  ],
      Verifysync: false,
      perm: ['Create GRPO'],
      loadingPos: false,
      loadingPosList: false,
      br:[],
      barcoder: '',
      printlink: '',
      printdialog: false,
      realdata: [],
      errorremarks: '',
      errorvendor: '',
      sndisable: [],
      errorSN: [],
      vendorref: '',
      remarks: '',
      sndata: [],
      qoutes: '',
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
        { text: "Quantity", value: "Quantity" },
        { text: "Status", value: "Status" },
      ],
      poheaders: [
          
         { text: "CardCode", value: "CardCode" },
         { text: "CardName", value: "CardName" },
         { text: "PO#", value: "DocEntry" }
      ],
      allpos: [],
      searchPOs: ''
    };
  },
 
  computed: {
    ...mapGetters({
      permissions: "userPermissions/getPermission",
    }),
    creator(){
      return this.permissions.includes("Master GRPO")
    },
    animatedText() {
      return this.text + this.dots;
    },
    ccheckbox(){
      return this.selected.length === 0? true:false; 
    },
    checkerror(){
      return this.errorSN;
    },
    
  },
  created() {},

  methods: {
    validateField(key,qty) {
      const q = parseFloat(qty)
      const countserial = this.sn.filter(item => item !=="").length
      console.log(countserial+'-'+q)
      if (this.hasDuplicates(this.sn)) {
 
          this.errorSN[key] = 'Duplicate entries are not allowed.'
          
          
      }else if(countserial !== q){
          this.errorSN[key] = "Don't Blank"
      }else{
     
        this.errorSN[key] = ''
      }
       var data = {
          key: key,
          sn: this.sn[key],
          id: this.listing.po,
          uniqueid: this.listing.uniqueid,
          barcoder: this.barcoder
       }
       
       this.$socket.emit("serialized", data);
    },
    hasDuplicates(array) {
      
      if(array.filter(item => item !== null && item !== undefined && item !== '').length !== 1){
          var d = array.filter(Boolean)
        return new Set(d).size !== d.length;
      }else{
        return false;
      }
      
    },
    checkerifexist(data){
      var dd;
       this.key.forEach((i, index)=>{
           if(i == data){
             dd =  true
           }
        })
       return dd == true? true:false;
    },
    ifsn(data){
      var dd;
        this.checker.forEach((i, index)=>{
          
           if(i.key == data){
             
             dd =  i.sn;
           }
        })
        return dd?dd:false
    },
    getqty(data){
      var dd;
        this.checker.forEach((i, index)=>{
          
           if(i.key == data){
             
             dd =  i.qty;
           }
        })
        return dd?dd:0
    },
    getDocEntry(data){
      this.pos = false
       
      this.searchpo(data)
    },
    viewpo(){
      this.loadingPos = true
      this.pos = true
      axios
          .get(
            this.$URLs.backend + "/api/inventory/grpo/viewpos"
          )
          .then((res) => {
               this.allpos = res.data
               this.loadingPos = false
          });
    },
    progress(uniqueID) {
      console.log(uniqueID)
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
    verifydata(){
      
      this.Verifysync = true
      const data = this.alldata()
      this.verifiedSerial = data
    },
    send() {
       const data = this.alldata()
       this.creategrpo(data);
       this.progress(this.systemID);
       this.Verifysync = false
      },
    alldata(){
       if(this.vendorref.length == 0 || this.remarks.length == 0){
        this.errorvendor = "Required"
        this.errorremarks = "Required"
        
      }else{

      this.isProgress = true;
      
      var serial = [];
      var data;
      this.sn.forEach((data, index) => {
        serial.push({ sn: data, index: index });
      });
      data = {
        listing: this.listing,
        serial: serial,
        vendorref: this.vendorref,
        remarks: this.remarks
      };
      return data
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
          this.$swal("Sync!", "" + text + "", "success");
        });
    },
    searchpo(po) {
      this.loadingPosList = true
      this.searchPO = po
      this.loading = true;
      const data = po;
      axios
        .post(this.$URLs.backend + "/api/inventory/grpo/search", {
          data,
        })
        .then((res) => {
          this.barcoder = res.data.barcoder
          this.podata = res.data.data;
          this.loading = false;
          this.loadingPosList = false
          this.key = [];
          this.checker = [];
          res.data.key.forEach((keying, index)=>{
            this.key.push(keying[3])
            this.checker.push({key: keying[3], sn: keying[7], qty: keying[8]})
          })
         
        });
    },
    inforeset(){
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
            uniqueid: data.DocEntry + data.ItemCode + data.LineNum,
            whs: whs[0],
            model: data.Dscription,
            brand: data.FirmName
          };
          
      if(i == 1){
        
        const autoserial = new Date()
        const month = (autoserial.getMonth() + 1).toString().padStart(2, '0'); 
        const day = autoserial.getDate().toString().padStart(2, '0'); 
        const year = autoserial.getFullYear().toString();
        const hour = autoserial.getHours();
        const minute = autoserial.getMinutes();  
    
        const m = year.slice(-2)+''+month+''+day+''+hour+''+minute+this.listing.whs;
        this.sn = []
        this.generateRange(this.listing.quantity).forEach((data, index)=>{
          this.sn[index] = m+data
        })
        this.systemID = this.listing.uniqueid;
        this.serialmanageDialog = true;
        
      }else{
         
      axios
          .get(
            this.$URLs.backend + "/api/inventory/grpo/getlines?data=" + data.DocEntry+'-'+parseInt(this.getqty(data.DocEntry + data.ItemCode + data.LineNum))+'-'+data.LineNum
          )
          .then((res) => {
            this.remarks = ''
            this.vendorref = ''
            console.log(this.checkerifexist(data.DocEntry + data.ItemCode + data.LineNum))
            if(this.checkerifexist(data.DocEntry + data.ItemCode + data.LineNum) == true){
                  this.systemID = this.listing.uniqueid;
                  this.sn = []
                  this.sndata = res.data
                  this.serialmanageDialog = true;
                  res.data['sn'].forEach((data, index)=>{
                    this.sn[data[2]] = data[3]
                  })
                  this.remarks = res.data['info'][3]
                  this.vendorref = res.data['info'][2]

            }else{
                  alert('@Stevefox_Linux 404');
            }
          });
      }
      
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
            INFO.push({  ItemCode: data.ItemCode, LineNum: data.LineNum, DocEntry: data.DocEntry , qty: data.Quantity});
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
    print(){
     this.printlink = '';  
     this.printdialog = true

     

     this.printlink = this.$URLs.backend +'/api/grpo/print?id='+btoa( JSON.stringify(this.sn))+'&brand='+this.listing.brand+'&model='+this.listing.model
    },
    download(){
     this.$store.dispatch('printgrpobarcode/download', this.sn).then((res)=>{
         var url =  res;
         window.open(url, '_blank');
      })
    }
  },
   mounted() {
    this.verifiedSerial = {
       "listing": 
       { "po": "", 
         "quantity": "",
          "linenum": "",
          "itemcode": "",
          "uniqueid": "",
          "whs": "", 
          "model": "",
          "brand": "" },
          "serial": [], "vendorref": "", "remarks": "" }
    this.$store.dispatch("userPermissions/fetchPermission") 
     
    //this.creategrpo();
    this.sockets.subscribe("refresh", (res) => {
      if(this.searchPO == res){
            this.listing = {};
            this.systemID = "";
            this.isProgress = false;
            this.serialmanageDialog = false;
            this.selected = [];
            this.searchpo(this.searchPO);
      }
       
    })
    
    this.sockets.subscribe("serialized", (res) => {
      if(res.uniqueid == this.listing.uniqueid){
          if(res.id == this.listing.po){
                        this.sn = [
                              ...this.sn.slice(0, res.key),
                              res.sn,
                              ...this.sn.slice(res.key + 1)
                          ];
                        this.br[res.key] = res.barcoder
                        this.remarks = res.remark
                        this.vendorref = res.vendor
                }
      }
        
     
    })
  },
};
</script>
 

<style>
</style>