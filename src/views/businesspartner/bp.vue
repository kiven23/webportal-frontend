<template>
  <v-container grid-list-md text-xs-center>
    <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
    <v-card color="white lighten-2">
    <v-toolbar
  
      flat
      prominent
    >
      <v-text-field
        class="mx-4"
        flat
        hide-details
        label="Search"
        prepend-inner-icon="mdi-magnify"
        solo-inverted
      ></v-text-field>

      <template v-slot:extension>
        <v-tabs
          v-model="tabs"
          centered
        >
          <v-tab>
            General 
          </v-tab>
          <v-tab>
            Address
          </v-tab>
          <v-tab>
            Payment Terms
          </v-tab>
          <v-tab>
            Payment Run
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tabs">

      <v-tab-item>
        <v-card flat>
           <v-card>
            <v-list-item three-line>
            <v-list-item-content>
            <div class="text-overline mb-4">
            GENERAL
            </div>
            <v-row>
                <v-col
                cols="12"
                sm="6"
                md="4"
                >
                <v-text-field
                    dense
                    label="MOBILE PHONE"
                ></v-text-field>
                 <v-select
                :items="salesemployeelist"
                label="SALES EMPLOYEE"
                ></v-select>
                </v-col>
                
            </v-row>
            </v-list-item-content>
            
            </v-list-item>
            </v-card>
        </v-card>
      </v-tab-item>

      <v-tab-item>
          <v-card flat>
           <v-card>
            <v-list-item three-line>
            <v-list-item-content>
            <div class="text-overline mb-4">
            ADDRESS
            </div>
            <v-row>
                <v-col
                cols="12"
                sm="6"
                md="4"
                >
                <v-text-field
                    dense
                    label="ADDRESS ID"
                ></v-text-field>
                  <v-text-field
                    dense
                    label="STREET/PO Box"
                ></v-text-field>
                  <v-text-field
                    dense
                    label="BARANGAY"
                ></v-text-field>
                <v-text-field
                    dense
                    label="CITY"
                ></v-text-field>
                 <v-text-field
                    dense
                    label="AREA CODE"
                ></v-text-field>
               
                </v-col>
                
                 <v-col
                cols="12"
                sm="6"
                md="4"
                >
                
                 <v-select
                :items="provincelist"
                label="PROVINCE"
                ></v-select>
                 <v-select
                :items="countrylist"
                label="PROVINCE"
                ></v-select>
                 <v-select
                :items="regionlist"
                label="REGION"
                ></v-select>
                </v-col>
                
            </v-row>
            </v-list-item-content>
            
            </v-list-item>
            </v-card>
        </v-card>
      </v-tab-item>

      <v-tab-item>
         <v-card flat>
           <v-card>
            <v-list-item three-line>
            <v-list-item-content>
            <div class="text-overline mb-4">
            PAYMENT TERMS
            </div>
            <v-row>
                <v-col
                cols="12"
                sm="6"
                md="4"
                >
                   <v-select
                :items="paymenttermslist"
                label="PAYMENT TERMS"
                ></v-select>
                 <v-select
                :items="pricelist"
                label="PAYMENT TERMS"
                ></v-select>
                </v-col>
                
            </v-row>
            </v-list-item-content>
            
            </v-list-item>
            </v-card>
        </v-card>
      </v-tab-item>

       <v-tab-item>
         <v-card flat>
           <v-card>
            <v-list-item three-line>
            <v-list-item-content>
            <div class="text-overline mb-4">
            PAYMENT RUN 
            </div>
            <v-row>
                <v-col
                cols="12"
                sm="6"
                md="4"
                >
                <v-text-field
                    dense
                    label="MOBILE PHONE"
                ></v-text-field>
                 <v-select
                :items="salesemployeelist"
                label="SALES EMPLOYEE"
                ></v-select>
                </v-col>
                
            </v-row>
            </v-list-item-content>
            
            </v-list-item>
            </v-card>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    </v-card>
 
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
      pricelist: ['Price List 01','Price List 02','Price List 03','Price List 04','Price List 05'],
      paymenttermslist: ['CASH','CHECK','INST12','INST15','INST12'],
      provincelist: ['BATAAN','BULACAN','METRO MANILA','NUEJA ECIJA','PAMPANGA','PANGASINAN','TARLAC'],
      countrylist: ['Philippines'],
      regionlist: ['NCR','REION I','REGION II','REGION III','REGION IV','REGION V'],
      salesemployeelist: ['HENS-SS-01','HENS-TCL-01'],
      tabs: null,
      text: ' ',
      breadcrums: [
        {
          text: "Dashboard",
          disabled: false,
          href: "/",
        },
        {
          text: "Business Partner",
          disabled: true,
          href: "/sapb1/businesspartner",
        },
      ],
      headers: [
         {
          text: "DocNumber",
          align: "start",
          sortable: false,
          value: "DocNum",
         },
        
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