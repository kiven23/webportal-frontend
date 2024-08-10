<template>
  <v-container grid-list-md text-xs-center>
    <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
    <v-card color="white lighten-2">
      <v-card-title class="text-h5 lighten-3"> BARCODE PRINTING (Invty Transfer)</v-card-title>
      <v-card-text> Barcode Printing </v-card-text>
      <v-card-text>
         <strong>Page: {{this.currentpage}} To: {{this.topage}} Total: {{this.totalpage}}</strong>
      </v-card-text>
        <v-text-field
          v-model="search"
          label="Search (DocNumber)"
          class="mx-4"
          dense
        ></v-text-field> 
      <v-card-text >
         
         <v-btn x-small @click="searchfunction()" dense> SEARCH </v-btn>
         <v-btn x-small @click="searchfunction(1)" dense  > ALL </v-btn>
         <v-btn x-small @click="modulesativator(1)" dense :style="'color: ' + (invtymap == 1 ? 'red' : '')"> Invty Transfer </v-btn>
         <v-btn x-small @click="modulesativator(2)" dense :style="'color: ' + (invtymap == 2 ? 'red' : '')">  A/R Invoice </v-btn>
         <v-btn x-small @click="modulesativator(3)" dense :style="'color: ' + (invtymap == 3 ? 'red' : '')">  Goods Receipt </v-btn>

 
        <v-btn  x-small @click="prev()" dense> PREV </v-btn>
        <v-btn  x-small @click="next()" dense> NEXT </v-btn>
      </v-card-text>
      
     
      
      <v-card-actions>
        
        <v-data-table
          dense
          :headers="headers"
          :items="owtr.data"
          item-key="DocEntry"
          hide-default-footer
          class="elevation-1"
        >
        <template v-slot:item.action="{ item }">
             <v-btn
              x-small
              color="blue-grey"
              @click="getDocEntry(item.DocEntry)"
              >
              View Item
             </v-btn>
          </template>
        </v-data-table>

      </v-card-actions>
      
      <v-divider></v-divider>
    </v-card>
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
        > <v-btn
            icon
            @click="printdialog = false"
          > <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Print Barcode</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-card-actions>
        </v-card-actions>
        </v-toolbar>
           <iframe :src="printlink"   width="100%" height="650"></iframe>
      </v-card>
    </v-dialog>
     <v-dialog
      v-model="getItem"
      persistent
      max-width="690"
    >
       
      <v-card>
        <v-card-title class="text-h6">
          Invetory Transfer Items
        </v-card-title>
        <v-data-table
                  dense
                  :headers="headers2"
                  :items="wtr1"
                  item-key="DocEntry"
                  hide-default-footer
                  class="elevation-1"
        >
        <template v-slot:item.action="{ item }">
             
             <v-btn
              x-small
              color="blue-grey"
              @click="print(item)"
               
              >
              print
             </v-btn>
          </template>
        </v-data-table>
        <v-card-actions>
          <v-spacer></v-spacer>
          
          <v-btn
            color="green darken-1"
            text
            @click="getItem = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
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
      
    },
  },
  data() {
    return {
      invtymap: 1,
      printlink: '',
      printdialog: false,
      wtr1: [],
      getItem: false,
      path: '',
      search: '',
      documentno: '2222',
      nextv: '',
      prevv: '',
      currentpage: '',
      topage: '',
      totalpage: '',
      owtr: [],
      breadcrums: [
        {
          text: "Dashboard",
          disabled: false,
          href: "/",
        },
        {
          text: "BARCODE PRINTING",
          disabled: true,
          href: "/sapb1/barcode/printing",
        },
      ],
      headers: [
         {
          text: "DocNumber",
          align: "start",
          sortable: false,
          value: "DocNum",
         },
         { text: "Branch", value: "U_Name" },
         { text: "Comments", value: "Comments" },
         { text: "Action", value: "action" },
      ]
      ,
      headers2: [
         {
          text: "DocEntry",
          align: "start",
          sortable: false,
          value: "DocEntry",
         },
         { text: "ItemCode", value: "ItemCode" },
         { text: "Brand", value: "Brand" },
         { text: "Dscription", value: "Dscription" },
         { text: "Quantity", value: "Quantity" },
         { text: "DocDate", value: "DocDate" },
         { text: "WhsCode", value: "WhsCode" },
         { text: "Action", value: "action" },

      ]
    };
  },
 
  computed: {
    
  },
  created() {},

  methods: {
      print(i){
        console.log(i)
        this.printlink = ''
        this.printdialog = true
         this.getItem = true
          axios
          .get( this.$URLs.backend + "/api/inventory/transfer/printing/getserial?whscode="+i.WhsCode+"&itemcode="+i.ItemCode+"&baseline="+i.LineNum+"&brand="+i.Brand+"&model="+i.Dscription+"&qty="+i.Quantity+"&indate="+i.DocDate )
          .then((res) => {
              
              const blob = new Blob([res.data], { type: 'text/html' });
              this.printlink = URL.createObjectURL(blob)
              console.log(URL.createObjectURL(blob))
          });
      },
      
      getDocEntry(i){
          this.getItem = true
          axios
          .get( this.$URLs.backend + "/api/inventory/transfer/printing/getitem?item="+i )
          .then((res) => {
              this.wtr1 = res.data
               
          });
      },
      modulesativator(i){
          axios
          .get( this.$URLs.backend + "/api/inventory/transfer/printing/activate?routeid="+i )
          .then((res) => {
              this.invtymap = i
               axios
              .get(
                this.$URLs.backend + "/api/inventory/transfer/printing"  
              )
              .then((res) => {
                  this.owtr = res.data
                  this.nextv = res.data.next_page_url
                  this.prevv = res.data.prev_page_url
                  this.currentpage = res.data.current_page
                  this.topage = res.data.to
                  this.totalpage = res.data.total
                  this.path = res.data.path
              });  
          });
      },
      searchfunction(i){
          var searchurl =  this.path +"?search="+this.search
          this.callurl(searchurl)
          if(i == 1){
             this.callurl(this.path)
          }
      },
      callurl(url){
          axios
          .get(url)
          .then((res) => {
              this.owtr = res.data
              this.nextv = res.data.next_page_url
              this.prevv = res.data.prev_page_url
              this.currentpage = res.data.current_page
              this.topage = res.data.to
              this.totalpage = res.data.total
              this.path = res.data.path
          });
      },
      next(){
        this.callurl(this.nextv)
      },
      prev(){ 
        this.callurl(this.prevv)
      }
  },
  mounted() {
    
        axios
          .get(
            this.$URLs.backend + "/api/inventory/transfer/printing"  
          )
          .then((res) => {
              console.log(res.data)
              this.owtr = res.data
              this.nextv = res.data.next_page_url
              this.prevv = res.data.prev_page_url
              this.currentpage = res.data.current_page
              this.topage = res.data.to
              this.totalpage = res.data.total
              this.path = res.data.path
          });
          this.modulesativator(1)
  },
};
</script>
 

<style>
</style>