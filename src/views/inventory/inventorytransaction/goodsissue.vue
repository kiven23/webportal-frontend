<template>
  <v-container grid-list-md text-xs-center>
    <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
    <v-card color="white lighten-2">
      <v-card-title class="text-h5 lighten-3">Goods Issue</v-card-title>
      <v-card-text>
        
      </v-card-text>
  
      <v-card-text >
         
         <v-btn x-small @click="selectitem()" dense> SELECT ITEM </v-btn>
         
         <!-- <v-btn x-small @click="searchfunction(1)" dense  > ALL </v-btn>
         
 
        <v-btn  x-small @click="prev()" dense> PREV </v-btn>
        <v-btn  x-small @click="next()" dense> NEXT </v-btn> -->
      </v-card-text>
      
     
      
      <v-card-actions>
        
        <v-data-table
          dense
          :headers="headers"
          :items="goodsissue"
          item-key="ItemCode"
          hide-default-footer
          class="elevation-1"
        >
        <template v-slot:item.Quantity="{item, index}">
          <v-text-field
            :label="index"
            placeholder="Quantity"
            dense
          >{{item}}</v-text-field>
        </template>
     
       <template v-slot:item.whse="{item, index}">
          <v-text-field
            placeholder="Warehouse"
            dense
            v-model="warehouseModel[index]"
            @click="getwhs(item.ItemCode, index)"
          >{{item}}</v-text-field>
         
        </template>
        <template v-slot:item.serial="{item, index}">
        <v-text-field
          :label="index"
          placeholder="Serial"
          dense
          @click="getsn(item, index)"
        >{{item}}
        </v-text-field>
           <v-select
      v-model="selectedSerial"
      :items="sn"
      label="Serial"
      multiple
    >
      <template v-slot:prepend-item>
        <v-list-item
          ripple
          @mousedown.prevent
          @click="toggle"
        >
          <v-list-item-action>
            <v-icon :color="selectedSerial.length > 0 ? 'indigo darken-4' : ''">
              {{ icon }}
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              Select All
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="mt-2"></v-divider>
      </template>
        </v-select>
      </template>
        </v-data-table>

      </v-card-actions>
      
      <v-divider></v-divider>
    </v-card>
      
     <v-dialog
      v-model="getItem"
      persistent
      max-width="900"
    >
      <v-card>
         <v-card-title >
          List of Items
           </v-card-title > 
         <v-card-title >   
        <v-text-field
          v-model="search"
          label="Search (Item Name)"
          dense
        >
        </v-text-field> 
        <v-btn x-small @click="searchfunction()" dense> SEARCH </v-btn>
        <br>
        <v-btn  x-small @click="prev()" dense> PREV </v-btn>
        <v-btn  x-small @click="next()" dense> NEXT </v-btn>
        </v-card-title>
        <v-data-table
          dense
          :headers="headers2"
          :items="oitm"
          item-key="ItemCode"
          hide-default-footer
          class="elevation-1"
        >
        <template v-slot:item.Action="{ item }">
             <v-btn
              x-small
              color="blue-grey"
              @click="getItemData(item)"
              >
              Select
             </v-btn>
          </template>
        </v-data-table>
        <v-card-actions>
             <strong> Page: {{this.currentpage}} To: {{this.topage}} Total: {{this.totalpage}}</strong>
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

    <v-dialog
      v-model="warehouseDialog"
      persistent
      max-width="900"
    >
      <v-card>
         <v-card-title >
          List of Warehouse
           </v-card-title > 
         <v-card-title >   
        <v-text-field
          v-model="search"
          label="Search (Warehouse Code)"
          dense
        >
        </v-text-field> 
        <v-btn x-small @click="searchfunction()" dense> SEARCH </v-btn>
        <br>
        <v-btn  x-small @click="prev()" dense> PREV </v-btn>
        <v-btn  x-small @click="next()" dense> NEXT </v-btn>
        </v-card-title>
        <v-data-table
          dense
          :headers="warehouseHeader"
          :items="oitw"
          item-key="ItemCode"
          hide-default-footer
          class="elevation-1"
        >
        <template v-slot:item.Action="{ item }">
             <v-btn
              x-small
              color="blue-grey"
              @click="getWarehouse(item)"
              >
              Select
             </v-btn>
          </template>
        </v-data-table>
        <v-card-actions>
             <strong> Page: {{this.currentpage}} To: {{this.topage}} Total: {{this.totalpage}}</strong>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="warehouseDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
     
  </v-container>
</template>

<script>
 
 
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
      fruits: [
        'Apples',
        'Apricots'],
       selectedFruits: [],
      activewhsfields: 0,
      activeModal: 0,
      activevalue: 0,
      currentpage: '',
      topage: '',
      totalpage: '',
      nextt: '',
      prevtt: '',
      getItem: false,
      warehouseDialog: false,
      serialDialog: false,
      
      dialogs: ['items','itembywarehouse','availablesn'],
      activeRouteBase: '',
      oitm: [],
      oitw: [],
      goodsissue: [],
      sn: [],
      selectedSerial: [],
      
      warehouseModel: [],

      breadcrums: [
        {
          text: "Dashboard",
          disabled: false,
          href: "/",
        },
        {
          text: "Transactions",
          disabled: true,
          href: "/sapb1/invt/transactions/goodsissue",
        },
        {
          text: "Goods Issue",
          disabled: true,
          href: "/sapb1/invt/transactions/goodsissue",
        },
      ],
      warehouseHeader:[
         {
          text: "WhsCode",
          align: "start",
          sortable: false,
          value: "WhsCode",
         },
         { text: "ItemCode", value: "ItemCode" },
         { text: "Stocks", value: "OnHand" },
         { text: "IsCommited", value: "IsCommited" },
         { text: "OnOrder", value: "OnOrder" },
         { text: "Action", value: "Action" },
      ],
      headers: [
         {
          text: "Item No.",
          align: "start",
          sortable: false,
          value: "ItemCode",
         },
         { text: "Item Description", value: "ItemName" },
         { text: "Quantity", value: "Quantity" },
         { text: "Whse", value: "whse" },
         { text: "Serial", value: "serial" },
         { text: "Inventory Offset - Decrease Account", value: "glaccount" },
      ]
      ,
         headers2: [
         {
          text: "Item No.",
          align: "start",
          sortable: false,
          value: "ItemCode",
         },
         { text: "ItemName", value: "ItemName" },
         { text: "FrgnName", value: "FrgnName" },
         { text: "Stocks", value: "OnHand" },
         { text: "SRP", value: "U_srp" },
         { text: "Reg NC", value: "U_RegNC" },
         { text: "Present NC", value: "U_PresentNC" },
         { text: "Freebies", value: "U_Freebies" },
         { text: "Sizes", value: "U_cSizes" },
         { text: "Action", value: "Action" }

      ]
    
    };
  },
 
  computed: {
    
  },
  created() {},

  methods: {
   async controller(data,i,itemcode) {
    try {
        var baselink;
        if(i == 1){
          baselink = 'http://192.168.1.19:7771/api/inventory/goodsissue/getters?' + this.activeRouteBase  
        }else if(i == 2){
          baselink = this.nextt 
        }else if(i == 3){
          baselink = this.prevtt
        }else if(i == 4){
          baselink = 'http://192.168.1.19:7771/api/inventory/goodsissue/getters?get=' + data +'&search='+this.search;
        } 
        const res = await axios.get(baselink);
        return res.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;  
    }
  },
  Getactivemodals(i){
    return this.dialogs[i];
  },
  async selectitem() {
   
     
    this.activevalue = 0
    this.getItem = true; 
    this.activeModal = 0
    this.activeRouteBase = '&get='+this.Getactivemodals(this.activeModal)
    try {
        const data = await this.controller(this.Getactivemodals(this.activeModal),1);
        this.oitm = data.data
        this.nextt = data.next_page_url +  this.activeRouteBase 
        this.prevtt = data.prev_page_url +  this.activeRouteBase 

        this.currentpage = data.current_page
        this.topage = data.to
        this.totalpage = data.total
    } catch (error) {
        console.error('Error in selectitem:', error);  
   }
  },
  async next() {
    
    try {
        const data2 = await this.controller(this.Getactivemodals(this.activeModal),2);
        this.oitm = data2.data
        this.oitw = data2.data
        this.nextt = data2.next_page_url + this.activeRouteBase
        this.prevtt = data2.prev_page_url + this.activeRouteBase
         this.currentpage = data2.current_page
        this.topage = data2.to
        this.totalpage = data2.total
    } catch (error) {
        console.error('Error in selectitem:', error);  
   }

 } ,
 async prev() {
    try {
        const data2 = await this.controller(this.Getactivemodals(this.activeModal),3);
        this.oitm = data2.data
        this.oitw = data2.data
        this.nextt = data2.next_page_url +  this.activeRouteBase
        this.prevtt = data2.prev_page_url +  this.activeRouteBase
        this.currentpage = data2.current_page
        this.topage = data2.to
        this.totalpage = data2.total
    } catch (error) {
        console.error('Error in selectitem:', error);  
   }
 },
 async searchfunction() {
    this.activeRouteBase = this.activeRouteBase +  '&search=' +this.search
  
    try {
        this.activevalue = 4
        const data2 = await this.controller(this.Getactivemodals(this.activeModal),4);
        this.oitm = data2.data
        this.oitw = data2.data
        this.nextt = data2.next_page_url + this.activeRouteBase 
        this.prevtt = data2.prev_page_url +  this.activeRouteBase 
        this.currentpage = data2.current_page
        this.topage = data2.to
        this.totalpage = data2.total
    } catch (error) {
        console.error('Error in selectitem:', error);  
   }

 },
 getItemData(data){
   this.goodsissue.push(data)
   console.log(data)
 },
 async getwhs(itemcode, index){
    
    this.activewhsfields = index
    this.search = ''
    this.activeModal = 1
    this.warehouseDialog = true
    console.log(this.Getactivemodals(this.activeModal))
    if(this.search){
      this.activeRouteBase = '&itemcode='+itemcode+'&search='+this.search+'&get='+this.Getactivemodals(this.activeModal)
    }else{
      this.activeRouteBase = '&get='+this.Getactivemodals(this.activeModal)+'&itemcode='+itemcode
    }
    console.log(this.activeRouteBase)
    try {
        const data = await this.controller(this.Getactivemodals(this.activeModal),1,itemcode);
        this.oitw = data.data
         
        this.nextt = data.next_page_url + this.activeRouteBase
        this.prevtt = data.prev_page_url + this.activeRouteBase

        this.currentpage = data.current_page
        this.topage = data.to
        this.totalpage = data.total
    } catch (error) {
        console.error('Error in selectitem:', error);  
   }
 },
 async getWarehouse(data){
  this.$set(this.warehouseModel, this.activewhsfields, data.WhsCode);
  this.warehouseModel[this.activewhsfields] = data.WhsCode
   
 },
async getsn(item,i){
    this.activeModal = 2
    this.activeRouteBase = '&get='+this.Getactivemodals(this.activeModal)+'&itemcode='+item.ItemCode+'&warehouse='+ this.warehouseModel[i]
    this.serialDialog = true
   try {
        const data = await this.controller(this.Getactivemodals(this.activeModal),1);
        
        this.sn = [];
        data.forEach((res) => {
           console.log(res.IntrSerial)
           this.sn.push(res.IntrSerial)
        });
      console.log(this.sn)
    } catch (error) {
        console.error('Error in selectitem:', error);  
   }
  },
 
 
  },
  mounted() {
    
        
         
  },
};
</script>
 

<style>
</style>