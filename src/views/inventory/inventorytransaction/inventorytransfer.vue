<template>
  <v-container grid-list-md text-xs-center>
    <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
    <v-card color="white lighten-2">
      
      <v-card-title class="text-h5 lighten-3">Inventory Transfer   <v-col class="d-flex justify-end">
          <v-chip
            color="green"
            text-color="white"
            v-if="creation == 1 ? true : false"
          >
          <strong>FROM: {{frommwh}}</strong>
          </v-chip>
         </v-col></v-card-title>
       
       <v-card-text>
        
        <v-row> 
          
          <v-col class="d-flex justify-start">
            <v-btn @click="previous()" dense> PREVIOUS </v-btn>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn @click="nextline()" dense> NEXT </v-btn>
          </v-col>
        </v-row>
        
      </v-card-text>
      
      <v-card-text >
        
         <v-row> 
          
         <v-col class="d-flex justify-start">
         <v-btn x-small @click="selectitem()" dense > SELECT ITEM </v-btn>
         </v-col>
         <v-col class="d-flex justify-end">
         <v-btn x-small @click="submit()" dense  :disabled="creation == 1 ? true : false " > SUBMIT ITEM </v-btn>
           
         </v-col>
         
         </v-row> 
          <!-- <v-btn x-small @click="searchfunction(1)" dense  > ALL </v-btn> -->
        
      </v-card-text>
      
     
      
      <v-card-actions>
        {{goodsissuelist}}
        <v-data-table
          dense
          :headers="headers"
          :items="goodsissue"
          item-key="ItemCode"
          hide-default-footer
          class="elevation-1"
          :key="componentKey"
        >
        <template v-slot:item.Quantity="{item, index}">
          <v-text-field
            :disabled="true"
            placeholder="Quantity"
            dense
             v-model="qtyModel[index]"
            :key="componentKey"
          >{{index}}
          {{qtyModel}}
          </v-text-field>
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
  
           <v-btn x-small color="success" v-if="creation == 1" @click="viewSerial(item)">Serial</v-btn>
           <v-select
            v-model="selectedSerial[index]"
            :items="sn[index]"
            label="Serial"
            multiple
            :key="componentKey"
            @change="getQty(index)"
            v-if="sn[index] && creation == 0"
          >
          
              <template v-slot:prepend-item>
                <v-list-item
                >
                  
                  <v-list-item-content>
                    <v-list-item-title>
                        <v-checkbox
                        v-model="selectall[index]"
                        label="Select All"
                        :key="componentKey"
                        @click="toggle(index)"
                      ></v-checkbox>  
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider class="mt-2"></v-divider>
              </template>
         </v-select>
      </template>
         <template v-slot:item.towarehouse="{item, index}">
            <v-autocomplete
            chips
            clearable
            deletable-chips
            dense
            small-chips
            v-model="whsModel[index]"
            :items="owhslist"
            item-value="WhsCode"
            item-text="WhsCode"
            label="TO WAREHOUSE"
            :disabled="creation == 1 ? true : false " 
           >{{index}}</v-autocomplete>
          </template>

        </v-data-table>
        
      </v-card-actions>
      
      <v-divider></v-divider>
       <v-row>
        <v-col
          cols="6"
          md="3"
          style="margin: 5px;"
        >
        <v-textarea
          outlined
          name="input-7-4"
          label="Remarks"
          :value="listgoodsissue.Comments"
          v-model="remarksModel"
        > </v-textarea> 
       
      </v-col>
       
       <v-col
          cols="6"
          md="3"
          style="margin: 5px;"
        >
        <v-textarea
          
          outlined
          name="input-7-4"
          label="Journal Remarks"
          v-model="JrnlMemo"
          :value="listgoodsissue.JrnlMemo"
        > </v-textarea> 
       
      </v-col>
      </v-row>
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
        <template v-slot:item.Action="{ item,index }">
             <!-- <v-btn
              class="ma-2"
              x-small
              color="success"
              @click="getItemData(item)  "
              >
              Select
             </v-btn> -->
             <v-checkbox
                v-model="checkbox[index]"
                 @click="getItemData(item,index)  "
              ></v-checkbox>
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
        
          hide-default-footer
          class="elevation-1"
        >
        <template v-slot:item.Action="{ item}">
             <v-btn
              x-small
              color="blue-grey"
              @click="getWarehouse(item)  "
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
      <v-dialog v-model="viewSerialNumbers" max-width="290">
  <v-card>
    <v-card-title class="text-h6 py-2 px-3">Serial</v-card-title>

    <v-card-text class="py-0 px-3" style="max-height: 200px; overflow-y: auto;">
      <div v-for="(sn, index) in closeserial" :key="index" class="my-1">
        <strong>
          <p class="mb-1 text-caption">{{ sn.IntrSerial }}</p>
        </strong>
      </div>
    </v-card-text>

    <v-card-actions class="py-1 px-3">
      <v-spacer />
      <v-btn text color="primary" @click="viewSerialNumbers = false">Close</v-btn>
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
      JrnlMemo: '',
      frommwh: [],
      owhslist: [],
      loading2: false,
      loader: null,
      creation: 0,
      search: '',
      selectall: [],
      activewhsfields: 0,
      activeModal: 4,
      activevalue: 0,
      currentpage: '',
      topage: '',
      totalpage: '',
      nextt: '',
      prevtt: '',
      getItem: false,
      warehouseDialog: false,
      serialDialog: false,
      viewSerialNumbers: false,
      nextpages: '',
      prevpages: '',
      lastpages: '',
      checkbox: [],

      dialogs: ['items','itembywarehouse','availablesn','gl','inventorytransferlist','whslist'],
      activeRouteBase: '',
      oitm: [],
      oitw: [],
      goodsissue: [],
      sn: [],
      selectedSerial: [],
      glAccount: [],
      whsModel: [],
      warehouseModel: [],
      qtyModel: [],
      remarksModel: [],
      listgoodsissue: {},
      closeserial: [],
      

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
         { text: "To Warehouse", value: "towarehouse" },
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

      ],
      componentKey: 0,
      selectedIndex: -1,
      page: 0,
    
    };
  },
  watch: {
      loader () {
        const l = this.loader
        this[l] = !this[l]

        setTimeout(() => (this[l] = false), 3000)

        this.loader = null
      },
    },
  computed: {
     
  },

  created() {},
  
  methods: {
   async controller(data,i,docentry) {
    try {
        var baselink;
        if(i == 1){
          baselink = 'http://192.168.1.19:7771/api/inventory/transfer/getters?' + this.activeRouteBase  
        }else if(i == 2){
          baselink = this.nextt 
        }else if(i == 3){
          baselink = this.prevtt
        }else if(i == 4){
          baselink = 'http://192.168.1.19:7771/api/inventory/transfer/getters?get=' + data +'&search='+this.search;
        } else if(i == 5){
          baselink = 'http://192.168.1.19:7771/api/inventory/transfer/getters?get=' + data +'&docentry='+docentry;
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
    
    this.refresh() 
    this.creation = 0
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
        this.listgoodsissue = await data2.data[0]
        console.log(this.listgoodsissue)
        this.nextt = data2.next_page_url + this.activeRouteBase
        this.prevtt = data2.prev_page_url + this.activeRouteBase
         this.currentpage = data2.current_page
        this.topage = data2.to
        this.totalpage = data2.total
    
        this.goodsissue = await this.controller('index',5,data2.data[0].DocEntry);
        await this.goodsissue.forEach((res,index)=>{
        this.qtyModel[index] = res.Quantity
        this.warehouseModel[index] = res.WhsCode
       // this.whsModel[index] = res.WhsCode
        this.remarksModel = this.listgoodsissue.Comments
        this.frommwh = this.listgoodsissue.Filler
        this.JrnlMemo = this.listgoodsissue.JrnlMemo
      })
    } catch (error) {
        console.error('Error in selectitem:', error);  
   }

 } ,
 async prev() {
    try {
        const data2 = await this.controller(this.Getactivemodals(this.activeModal),3);
        this.oitm = data2.data
        this.oitw = data2.data
        this.listgoodsissue = await data2.data[0]
        this.nextt = data2.next_page_url +  this.activeRouteBase
        this.prevtt = data2.prev_page_url +  this.activeRouteBase
        this.currentpage = data2.current_page
        this.topage = data2.to
        this.totalpage = data2.total
        this.goodsissue = await this.controller('index',5,data2.data[0].DocEntry);
        await this.goodsissue.forEach((res,index)=>{
        this.qtyModel[index] = res.Quantity
        this.warehouseModel[index] = res.WhsCode
        this.glModel[index] = res.AcctCode
        this.remarksModel = this.listgoodsissue.Comments
        this.frommwh = this.listgoodsissue.Filler
        this.JrnlMemo = this.listgoodsissue.JrnlMemo
      })
     
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
 getItemData(data,i){
  // this.goodsissue.push(data);
   this.selectall.push(false);  
   this.qtyModel.push(null)
  //  if(this.checkbox[i] ==true){
  //   //HOW TO REMOVE THE PUSHES ARRAY USING SPLICE BASE ON I INDEX
  //      this.goodsissue.push(data);
  //  }
   if (this.checkbox[i] === true) {
    
           
    this.goodsissue.push(data);
  } else {
      // Remove the item from goodsissue array based on index i
      // First, find the index of the item in goodsissue array (if it was already added)
     this.goodsissue.splice(i, 1);
  }
 },
 async getwhs(itemcode, index){
 
    this.selectedIndex = index;
    this.activewhsfields = index
    this.search = ''
    this.activeModal = 1
    this.warehouseDialog = true
     
    if(this.search){
      this.activeRouteBase = '&itemcode='+itemcode+'&search='+this.search+'&get='+this.Getactivemodals(this.activeModal)
    }else{
      this.activeRouteBase = '&get='+this.Getactivemodals(this.activeModal)+'&itemcode='+itemcode
    }
    
    this.oitm = []
    this.oitw = []
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
  
  await this.$set(this.warehouseModel, this.activewhsfields, data.WhsCode);
  this.warehouseModel[this.activewhsfields] = await data.WhsCode
  await this.getsn(data, this.selectedIndex);
  this.componentKey += await 1;
  this.warehouseDialog = false
 },
async getsn(item,i){
    this.activeModal = 2
    this.activeRouteBase = '&status=0&get='+this.Getactivemodals(this.activeModal)+'&itemcode='+item.ItemCode+'&warehouse='+ this.warehouseModel[i]
    this.serialDialog = true
   try {
        const data = await this.controller(this.Getactivemodals(this.activeModal),1);
   
        this.sn[i] = [];
        data.forEach((res) => {
        
           this.sn[i].push(res.IntrSerial)
        });
    } catch (error) {
        console.error('Error in selectitem:', error);  
    }
 

  },
async getItemData2(docentry){


},
  toggle (i) {
          
          if(this.selectall[i] == true){
            this.selectedSerial[i] = this.sn[i].slice()
            this.componentKey += 1;
          }else{
            this.selectedSerial[i] = []
            this.componentKey += 1;
          }
           this.getQty(i)
          
    
  },
  async getQty(index){      
      this.qtyModel[index] =  this.selectedSerial[index].length
  },
  async getGL(){
      const gl = await this.controller(this.activeRouteBase, 1);
      return this.glAccount = gl
  },
  async getOwhs(){
      const whs = await this.controller(this.activeRouteBase, 1);
      return this.owhslist = whs
  },
  async getGoodsIssue(i){
     
     if(!this.page){
      
      const data = await this.controller(this.activeRouteBase, 1);
      this.listgoodsissue = data.data[0]
      
      this.nextt = data.next_page_url +  this.activeRouteBase
      this.prevtt = data.prev_page_url +  this.activeRouteBase
      this.lastpages = data.last_page_urld
      this.goodsissue = await this.controller('index',5,data.data[0].DocEntry);
      this.goodsissue.forEach((res,index)=>{
        this.qtyModel[index] = res.Quantity
        this.warehouseModel[index] = res.WhsCode
        //this.glModel[index] = res.AcctCode
         
      })
      this.remarksModel = this.listgoodsissue.Comments
      this.frommwh = this.listgoodsissue.Filler
      this.JrnlMemo = this.listgoodsissue.JrnlMemo
     }
     else{
  
      if(i == 1){
        
        this.next()
        
      }else{
        this.prev()
        
      }
      
     }
     
  },
  arrange(myserialnumber,warehouse, MyItemCode, Quantity, towarehouse,Model, Remarks, JrnlMemo){
     const arr = {
                    myserialnumber:  myserialnumber,
                    fromMWH:  warehouse,
                    MyItemCode: MyItemCode,
                    Quantity:  Quantity,
                    toMWH: towarehouse,
                    Model:  Model,
                    Remarks: Remarks,
                    JrnlMemo: JrnlMemo
                  }
      return arr
  },
 async submit(){
    const loading = this.$vs.loading({
        progress1: 0,
      });
      var data = []
      await  this.goodsissue.forEach((value,index) => {
            data.push(this.arrange( this.selectedSerial[index], this.warehouseModel[index],value.ItemCode, this.qtyModel[index],this.whsModel[index],value.ItemName,this.remarksModel,this.JrnlMemo))
        });
        console.log(data)
        if(data){
            await axios.post('http://192.168.1.19:7771/api/inventory/transfer/submit', data).then((res)=>{
                this.$swal("Sync!", "" + res.data.message + "", res.data.status);
                loading.close()
                // if(res.data.status !== 'warning'){
                //     this.refresh()
                // }
               
            })

     }
  },
  nextline(){
   
   this.activeModal = 4
   this.activeRouteBase = '&get='+this.Getactivemodals(this.activeModal,1)
   this.getGoodsIssue(1)
   console.log(this.activeRouteBase)
   this.creation = 1;
   this.page += 1;
  },
  previous(){
   this.activeModal = 4
   this.activeRouteBase = '&get='+this.Getactivemodals(this.activeModal,1)
   this.getGoodsIssue(2)
    
   this.creation = 1
   this.page -= 1;
  },
  async viewSerial(i){
    this.activeModal = 2
    this.activeRouteBase = '&status=1&get='+this.Getactivemodals(this.activeModal)+'&itemcode='+i.ItemCode+'&warehouse='+ i.WhsCode
    this.viewSerialNumbers = true
   try {
        const data = await this.controller(this.Getactivemodals(this.activeModal),1);
        this.closeserial = data
    } catch (error) {
        console.error('Error in selectitem:', error);  
    }
   
  },
  refresh(){
      this.page = 0
      this.search=''
      this.selectall=[]
      this.activewhsfields=0
      this.activeModal=4
      this.activevalue=0,
      this.currentpage=''
      this.topage=''
      this.totalpage=''
      this.nextt=''
      this.prevtt=''
      this.getItem=false
      this.warehouseDialog=false
      this.serialDialog=false
      this.activeRouteBase=  ''
      this.oitm=[]
      this.oitw=[]
      this.goodsissue=[]
      this.sn=[]
      this.selectedSerial=[]
      this.glModel=[]
      this.warehouseModel=[]
      this.qtyModel=[]
      this.listgoodsissue={}
      
  }
  },
  async mounted() {
    this.activeModal = await  5
    this.activeRouteBase = await '&get='+this.Getactivemodals(this.activeModal)
    
    this.getOwhs()
    
  
     
   
  },
};
</script>
 

<style>
</style>