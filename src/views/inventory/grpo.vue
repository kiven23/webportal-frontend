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
        <v-btn @click="viewpo()" dense  > POs </v-btn>
        <v-btn @click="createAtion()" dense v-if="!ccheckbox"> CREATE  </v-btn
        >
        <!-- <v-btn @click="searchpo()" dense> SEARCH PO # </v-btn> -->
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
             
            >
          
            <!-- :disabled="checkerifexist(item.DocEntry + item.ItemCode + item.LineNum) == true" -->
              <!-- v-if="item.LineStatus !== 'O'" -->
              <strong> MANAGE SERIAL    </strong>
              <!-- {{checkerifexist(item.DocEntry + item.ItemCode + item.LineNum)}} -->
            
            </v-btn>
          </template>
        </v-data-table>
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
                style="margin-top: 25px "
          ></v-text-field>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn  text @click="send()" dense> GRPO SAVE </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          
          <v-subheader dense>
            <strong><br> Purchased Order Number#: {{ listing.po }} <br> Quantity: {{ listing.quantity }} <br>Line#: {{ listing.linenum }}
            <br>
            </strong> 
            
          </v-subheader>
        <v-spacer></v-spacer>
         
           


          <div v-for="index in generateRange(listing.quantity)" :key="index">
            <v-col cols="12">
              <v-text-field
                dense
                :label="'SN' + index"
                v-model="sn[index - 1]"
              ></v-text-field>
            {{index - 1}}
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
    animatedText() {
      return this.text + this.dots;
    },
    ccheckbox(){
      return this.selected.length === 0? true:false; 
    }
     
  },
  created() {},

  methods: {
    
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
      this.pos = true
      axios
          .get(
            this.$URLs.backend + "/api/inventory/grpo/viewpos"
          )
          .then((res) => {
               this.allpos = res.data
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
    searchpo(po) {
      this.searchPO = po
      this.loading = true;
      const data = po;
      axios
        .post(this.$URLs.backend + "/api/inventory/grpo/search", {
          data,
        })
        .then((res) => {
          this.podata = res.data.data;
          this.loading = false;
 
          this.key = [];
          this.checker = [];
          res.data.key.forEach((keying, index)=>{
            this.key.push(keying[3])
            this.checker.push({key: keying[3], sn: keying[7], qty: keying[8]})
          })
         
        });
    },
     
    handleDocEntryClick(data) {
      this.listing = {
        po: data.DocEntry,
        quantity: this.getqty(data.DocEntry + data.ItemCode + data.LineNum),
        linenum: data.LineNum,
        itemcode: data.ItemCode,
        uniqueid: data.DocEntry + data.ItemCode + data.LineNum
      };
      axios
          .get(
            this.$URLs.backend + "/api/inventory/grpo/getlines?data=" + data.DocEntry+'-'+parseInt(this.getqty(data.DocEntry + data.ItemCode + data.LineNum))+'-'+data.LineNum
          )
          .then((res) => {
            console.log(this.checkerifexist(data.DocEntry + data.ItemCode + data.LineNum))
            if(this.checkerifexist(data.DocEntry + data.ItemCode + data.LineNum) == true){
                  this.systemID = this.listing.uniqueid;
                  this.sn = []
                  this.sndata = res.data
                  this.serialmanageDialog = true;
                  res.data.forEach((data, index)=>{
                    this.sn[data[2]] = data[3]
                  })
            }else{
                  alert('@Stevefox_Linux 404');
            }
          });
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

    refresh() {
      this.listing = {};
      this.systemID = "";
      this.isProgress = false;
      this.serialmanageDialog = false;
      this.selected = [];
      this.searchpo(this.searchPO);
      this.$socket.emit("refresh", this.searchPO); 
    },
  },
  mounted() {
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
  },
};
</script>
 

<style>
</style>