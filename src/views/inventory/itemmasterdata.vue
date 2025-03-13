<template>
  <v-container grid-list-md text-xs-center style="margin: 10px; " >
     <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
           
    <v-card class="mx-auto">
        <v-skeleton-loader
      class="mx-auto"
       type="table-heading, list-item-two-line, image, table-tfoot"
      :loading="loadingForTable"
      >
      <template>
         
        <v-row justify="end">
          <v-col cols="12" sm="2">
             
                   <v-autocomplete
                      v-model="sortBrand"
                      :items="manufacturer"
                      item-text="FirmName"
                      item-value="FirmCode"
                      dense
                      label="Sort Brand"
                      style="margin-top: 10px"
                      
                      @change="sort()"
                  ></v-autocomplete>

              
                     
          </v-col>
          <v-col cols="12" sm="2">
             
            <vs-input
              v-model="searchTerm2"
              @input="onSearch"
              placeholder="Search Brand"
            />
          </v-col>
            
          <v-col cols="12" sm="2">
            <vs-button style="margin-left: 10px" @click="addItem()">
               <span  >CREATE ITEM MASTER </span>
            </vs-button>
          </v-col>
        </v-row>
      </template>
      <!-- <input type="text" v-model="searchTerm" @input="onSearch" >   -->
    
      <vue-good-table
        :columns="columns"
        :rows="rows"
        :totalRows="totalRows"
        :pagination-options="{ enabled: true, perPage: perPage }"
        :mode="'server'"
        @on-page-change="onPageChange"
        :responsive="true"
      >
        <template slot="table-row" slot-scope="props">
              <span v-if="props.column.field == 'mod'">
                <button @click="customAction(props.row)" >   <span style="color: blue; text-decoration: underline;">{{props.row.ItemName}}</span></button>
              </span>
              <span v-if="props.column.field == 'brand'">
                {{brand}}
              </span>
              <span v-else>
                {{ props.formattedRow[props.column.field] }}
              </span>
            </template>
      </vue-good-table>
      </v-skeleton-loader>
    </v-card>
    <v-dialog
      v-model="dialog"
      persistent 
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card >
        <v-toolbar dense dark  style="background: linear-gradient(0deg, rgba(0,0,195,1) 0%, rgba(37,63,182,1) 72%, rgba(255,255,255,1) 100%); border-radius: 10px; "  v-if="identify != 0">
          <v-btn icon dark @click="dialog = false" >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title dark >Update Item</v-toolbar-title>
           
           
        </v-toolbar>
        <v-toolbar dense dark  style="background: linear-gradient(0deg, rgba(0,0,195,1) 0%, rgba(37,63,182,1) 72%, rgba(255,255,255,1) 100%); border-radius: 10px;"  v-if="identify == 0">
          <v-btn icon dark @click="dialog = false" >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title dark >Add Item</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <!-- :disabled="allError"   -->
            <v-btn  dark :disabled="allError || saveValue ==1"  text @click="save()"> Save </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader style="background: #E9F0F6">
          <v-subheader v-if="itemcode"><h3>{{itemcode}}</h3></v-subheader>
           <v-subheader>Item Master Data</v-subheader>
          <v-list-item>
            <v-list-item-content>
                  <v-col cols="12" sm="2" v-if="identify == 0">
                  <v-list-item-title>Database</v-list-item-title>
                      <v-list-item-subtitle>
                      <v-container fluid style="display: flex; flex-direction: column; gap: 0; ">
                     
                     <div v-for="(databaseList,index) in db" :key="index">
                      <v-checkbox
                        style="margin: -12px;"
                        v-model="databases"
                        :label="databaseList.dbname"
                        dense
                        :value="databaseList.dbname"
                      ></v-checkbox>
                    </div>
                      <!-- <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="STEADFORD"
                        value="STEADFORD"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="OUTEXCEL"
                        value="OUTEXCEL"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="APPLIANTECH"
                        value="APPLIANTECH"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="ELECTROLOOP"
                        value="ELECTROLOOP"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="THREATHONS"
                        value="THREATHONS"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="PANAPPLIANCE"
                        value="PANAPPLIANCE"
                      ></v-checkbox>
                       <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="EASYOWN"
                        value="EASYOWN"
                      ></v-checkbox>
                      <v-checkbox
                        v-model="databases"
                        style="margin: -12px;"
                        dense
                        label="METROILOCOS"
                        value="METROILOCOS"
                      ></v-checkbox> -->

                    </v-container>
                    </v-list-item-subtitle>
                  </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Model</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.model"
                          dense
                           
                          
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Product Category</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.prodcat"
                          dense
                           
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>  
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Item Group</v-list-item-title>
                      <v-list-item-subtitle>
                            <v-autocomplete
                            v-model="data.itmgroup"
                            :items="itemgroup"
                            item-text="ItmsGrpNam"
                            item-value="ItmsGrpCod"
                            dense
                            filled
                            label="Filled"
                              
                          ></v-autocomplete>
                        </v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>WithHolding Tax Liable</v-list-item-title>
                      <v-list-item-subtitle>
                         <v-checkbox
                          v-model="data.withHtaxt"
                          style="margin-left: 20px;"
                           
                        ></v-checkbox>
                         </v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Brand</v-list-item-title>
                      <v-list-item-subtitle>
                           <v-autocomplete
                            v-model="data.brand"
                            :items="manufacturer"
                            item-text="FirmName"
                            item-value="FirmCode"
                            dense
                            filled
                            label="Filled"
                             
                          ></v-autocomplete>
                         </v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Manage Item By {{managebyserial}}</v-list-item-title>
                      <v-list-item-subtitle>
                         <v-select
                                :items="batchnumber"
                                v-model="data.batchserial"
                                label="Select"
                                solo
                                dense
                                  
                              ></v-select>
                         </v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Warranty Template</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-autocomplete
                            v-model="data.warrantytemp"
                            :items="warrantyT"
                            item-text="TmpltName"
                            item-value="TmpltName"
                            dense
                            filled
                            label="Filled"
                             :disabled="managebyserial !== true"
                          ></v-autocomplete>
                        </v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Preferred Vendor</v-list-item-title>
                      <v-list-item-subtitle>
                         <v-autocomplete
                            v-model="data.preferredvendor"
                            :items="preferredv"
                            item-text="CardName"
                            item-value="CardCode"
                            dense
                            filled
                            label="Filled"
                            @change="handleAutocompleteChange"
                          ></v-autocomplete>
                       </v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Purchasing UoM</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.purchaseuom"
                          placeholder="UNIT"
                          dense
                            
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Inventory UoM</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                           placeholder="UNIT"
                           v-model="data.inventoryoum"
                          dense
                           
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                                  <v-col cols="12" sm="2">
                  <v-list-item-title>Sales UoM</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                           placeholder="UNIT"
                           v-model="data.salesoum"
                          dense
                           
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                <v-col cols="12" sm="2">
                  <v-list-item-title> </v-list-item-title>
                      <v-list-item-subtitle>
                         <vs-button color="rgb(59,222,200)" @click="properties()">
                         Properties
                        </vs-button>
                         </v-list-item-subtitle>
                 </v-col>
            </v-list-item-content>
          </v-list-item>
 
        </v-list>
        <v-subheader>UDF</v-subheader>
          <v-list-item style="background: #E9F0F6">
             <v-list-item-content>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Sell-Out</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                           v-model="data.sellout"
                          dense
                          @input="restrictToNumbers"
                          @keypress="onlyNumber"
                       
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Sub Category 1</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                           v-model="data.subcat1"
                          dense
                         
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Sub Category 2</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.subcat2"
                          dense
                         
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                  <v-col cols="12" sm="2">
                    <v-list-item-title>Gross Dealer Price</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.grossdealerprice"
                          @input="restrictToNumbers"
                          @keypress="onlyNumber"
                          dense
                         
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>SRP</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.srp"
                          dense
                          @input="restrictToNumbers"
                          @keypress="onlyNumber"
                        
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Regular Net Cost</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                           solo
                           v-model="data.regnetcost"
                           dense
                           @input="restrictToNumbers"
                           @keypress="onlyNumber"
                            
                        > </v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Present Net Cost</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                           solo
                           v-model="data.prenetcost"
                           dense
                           @input="restrictToNumbers"
                           @keypress="onlyNumber"
                          
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                  <v-col cols="12" sm="2">
                  <v-list-item-title>Freebies</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.freebies"
                          dense
                           
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Size Name</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                           solo
                           v-model="data.sizename"
                           dense
                           
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>SPECS1</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.specs1"
                          dense
                            
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>SPECS2</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.specs2"
                          dense
                            
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>SPECS3</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.specs3"
                          dense
                           
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Type</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.type"
                          dense
                           
                           v-uppercase
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>
                 <v-col cols="12" sm="2">
                  <v-list-item-title>Sizes</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                          solo
                          v-model="data.sizes"
                          dense
                           @input="restrictToNumbers"
                           @keypress="onlyNumber"
                            
                        ></v-text-field
                      ></v-list-item-subtitle>
                 </v-col>

                 <v-col cols="12" sm="2">
                  <v-list-item-title>Inst. Subsidy Amt.</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-text-field
                           solo
                           v-model="data.instsubamp"
                           dense
                           @input="restrictToNumbers"
                           @keypress="onlyNumber"
                           
                        ></v-text-field>
                        </v-list-item-subtitle>
                 </v-col>
                
                 <v-col cols="12" sm="2">
                   <v-list-item-title>Sub Category Group</v-list-item-title>
                      <v-list-item-subtitle>
                           <v-autocomplete
                            v-model="data.subcatgroup"
                            :items="subcatgroup"
                            item-text="CodeName"
                            item-value="CodeName"
                            dense
                            filled
                            label="Filled"
                            return-object
                             
                          ></v-autocomplete>
                         
                         </v-list-item-subtitle>
                 </v-col>
                  <v-col cols="12" sm="2">
                    <vs-button v-if="identify == 1" style="margin-left: 10px" @click="updateItem()">
                      <span>Update Item</span>
                    </vs-button>
                  </v-col>
              </v-list-item-content>
           </v-list-item>
      </v-card>

       <v-dialog
      v-model="itempropr"
      scrollable
      max-width="300px"
    >
 
      <v-card>
        <v-card-title>Select Item Properties</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 300px;">
              <v-data-table
              :headers="headers"
              :items="properties1"
              :items-per-page="10"
              class="elevation-1"
            >
             <template v-slot:item.action="{ item , index }">
             <!-- {{chek[index]}} -->
             <v-checkbox
             v-model="chek[index]"
             @click="saveProperty(item.ItmsTypCod, index)"
             
            >  </v-checkbox>
             </template>
            
            </v-data-table>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            text
            @click="itempropr = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="itempropr = false "
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
          <v-dialog
            v-model="isLoading"
            hide-overlay
            persistent
            width="240"
             
          >
            <v-card style="background: linear-gradient(180deg, rgba(112,43,43,0.05504208519345233) 2%, rgba(31,62,126,1) 17%);" >
            <v-img
            lazy-src="/syncing3.gif"
            max-height="60"
            max-width="240"
            src="/syncing3.gif"
          > </v-img>
          </v-card>
              <v-card-text>
                {{ animatedText }}
                 <v-progress-linear
                  v-model="progStatus"
                  color="blue-grey"
                  height="25"
                >
                   
                    <strong>{{ progStatus }}</strong>
                 
                </v-progress-linear>
                 
              </v-card-text>
            
          </v-dialog>
    </v-dialog>
  </v-container>
</template>

<script>
function getName(firmcode,manufacturer){
              var name;
              manufacturer.forEach((value, index)=>{
                      if(value.FirmCode == firmcode){
                       
                        return  name = value.FirmName
                      }
                      
              })
              return name
         }
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
          model: {required},
          prodcat: {required},
          itmgroup: {required},
          withHtaxt: {required},
          brand: {required},
          batchserial: {required},
         // warrantytemp: {required},
          preferredvendor: {required},
          purchaseuom: {required},
          inventoryoum: {required}
    }
    
  },
  data() {
    return {
         saveValue: 0,
         newlink: '',
         db: [],
         loadingForTable: true,
         databases: [],
         chek: [],
         text: "Connecting to SAP B1 Integration",
         dots: "",

         breadcrumbs: [
        { text: 'Home', disabled: false, href: '/' },
        { text: 'Inventory', disabled: true, href: '/' },
        { text: 'Item Master Data', disabled: true },
        { text: 'Create', disabled: true },
      ],
        itemcode: '',
        identify: 0,
        isLoading: false,
        progStatus: 0,
        clearInterval: '',
        brand: '',
        sortBrand: '',
       //FIELDS
       data: {
          subcatgroup: '',
          oldmodels:  '',
          sortBrand: '',
          model: '',
          prodcat: '',
          itmgroup: '',
          withHtaxt: '',
          brand: '',
          batchserial: '',
          warrantytemp: '',
          preferredvendor: '',
          prevendor: '',
          purchaseuom: '',
          inventoryoum: '',
          salesoum: '',
          sellout: '00.0',
          subcat1: '',
          subcat2: '',
          grossdealerprice: '00.0',
          srp: '00.0',
          regnetcost: '00.0',
          prenetcost: '00.0',
          freebies: '',
          sizename: '',
          specs1: '',
          specs2: '',
          specs3: '',
          type: '',
          sizes: '00.0',
          instsubamp: "00.0",
          uniqueID: ''
       },
       checkboxStatus: [],
       ItmsTypCod: false,
       properties1: [],
       headers: [
          {
            text: 'ItmsGrpNam',
            sortable: true,
            value: 'ItmsGrpNam',
          },
          {
            text: 'action',
            value: 'action',
          }],
      subcatgroup: [],
      warrantyT: [],
      itemgroup: [],
      manufacturer: [],
      preferredv: [],
      batchnumber: ['None','Serial Number', 'Batches'],
      dialog: false,
      itempropr: false,
      columns: [
        {
          label: "Model",
          field: "mod",
        },
        {
          label: "Brand",
          field: "brand",
        },
        
        {
          label: "Item Code",
          field: "ItemCode",
        },
        {
          label: "Category",
          field: "FrgnName",
        },
        {
          label: "Srp",
          field: "U_srp",
        },
        {
          label: "GDP",
          field: "U_GDP",
        },
         {
          label: "RNC",
          field: "U_RegNC",
        },
         {
          label: "PNC",
          field: "U_PresentNC",
        },
        
      ],
      rows: [],
      totalRows: 0,
      currentPage: 1,
      perPage:7,
      searchTerm: "",
      searchTerm2: ""
    };
  },
 
  computed: {
    animatedText() {
      return this.text + this.dots;
    },
    allError(){
      this.$v.data.$touch();
       if (!this.$v.data.$error) {
           return false;
      }else{
           return true;
      }
      
    },
    managebyserial(){
      if(this.data.batchserial == 'None' || this.data.batchserial == 'Batches'|| this.data.batchserial == ''){
         return false
      }else{
         return true
      }
    }

  },
   
   created() {
   // this.animateText();

  },
  methods: {
    updateItem(){
    
       this.data.uniqueID = Math.floor(Math.random() * 99999099) + 1;
       this.progress(this.data.uniqueID)
       this.isLoading = true
       const all = {
          data: this.data,
          prop: this.checkboxStatus
       }
       axios.post("http://192.168.1.19:7771/api/itemmasterdata/oitm/update", {
          all
       }).then((res)=>{
                clearInterval(this.interval)
                this.data.uniqueID = ''
                this.isLoading = false
                var msg;
                if(res.data.identify == 1){
                  msg = 'error'
                }else{
                  msg = 'success'
                }
                var text = JSON.stringify(res.data);
                this.$swal('Update Sync!',
                ''+text+'',
                ''+msg+'');
                if(res.data.identify !== 1){
                 // console.log({ currentPage: this.currentPage, perPage: this.perPage })
                 // this.refresh();
                  //this.getFields()
                  this.onPageCurrent({ currentPage: this.currentPage });
                  this.dialog = false;
                } 
               
          })
    },
    sort(){
          
         
        this.loadingForTable = true
        axios
        .get(
          "http://192.168.1.19:7771/api/itemmasterdata/oitm/index?page=" +
            this.currentPage +
            "&search=" +
            this.sortBrand + "&search2=2" + "&brand=" + getName(this.sortBrand, this.manufacturer)
        )
        .then((response) => {
          this.brand = response.data.brand
          this.rows = response.data.data.data;
          this.totalRows = response.data.data.total;
          this.currentPage = response.data.data.current_page;
          console.log(this.currentPage)
          this.perPage = response.data.data.per_page;
          this.loadingForTable = false
        });
      return "";
    },
    animateText() {
      setInterval(() => {
        this.dots += "*";
        if (this.dots.length > 10) {
          this.dots = "";
        }
      }, 500); // Adjust the interval as needed
    },
    handleAutocompleteChange() {
      const selectedValue = this.data.preferredvendor;
      const selectedVendor = this.preferredv.find(
        (vendor) => vendor.CardCode === selectedValue
      );

      if (selectedVendor) {
        const selectedText = selectedVendor.CardName;
        this.data.prevendor = selectedText
      }
    },
     restrictToNumbers() {
      if(this.data.instsubamp == ""){
            this.data.instsubamp = "00.0"
      }
      if(this.data.srp == ""){
            this.data.srp = "00.0"
      }
      if(this.data.sizes == ""){
            this.data.sizes = "00.0"
      }
      if(this.data.regnetcost == ""){
            this.data.regnetcost = "00.0"
      }
      if(this.data.prenetcost == ""){
            this.data.prenetcost = "00.0"
      }
      if(this.data.sellout == ""){
            this.data.sellout = "00.0"
      }
       if(this.data.grossdealerprice == ""){
            this.data.grossdealerprice = "00.0"
      }
      
    },
    save(){
      console.log(this.data.itmgroup)
         // Suriin kung walang napiling database
        if (this.databases.length === 0) {
        this.$swal('No Database selected', 'Please select database', 'error');
        return;
      }

      // Suriin ang kondisyon para sa subcatgroup at itmgroup
      if (this.data.itmgroup !==  103 && this.data.subcatgroup.length === 0) {
        this.$swal('UDF-Sub Category Group', 'Required', 'warning');
        return;
      }
       this.data.uniqueID = Math.floor(Math.random() * 99999099) + 1;
       this.progress(this.data.uniqueID)
       this.isLoading = true
        
       const all = {
          data: this.data,
          prop: this.checkboxStatus,
          database: this.databases
       }
       this.saveValue = 1
       axios.post("http://192.168.1.19:7771/api/itemmasterdata/oitm/create", {
          all
       }).then((res)=>{
                clearInterval(this.interval)
                this.data.uniqueID = ''
                this.isLoading = false
                var msg;
                if(res.data.identify == 1){
                  msg = 'error'
                  
                }else{
                  msg = 'success'
                }
                var text = JSON.stringify(res.data);
                this.$swal('Sync!',
                ''+text+'',
                ''+msg+'');
                this.saveValue = 0
                if(res.data.identify !== 1){
                  
                  this.refresh();
                  this.getFields()
                  this.onPageChange({ currentPage: this.currentPage, perPage: this.perPage });
                } 
               
          })
       
       
    },
    progress(uniqueID){
      this.interval = setInterval(() => {
         axios.get("http://192.168.1.19:7771/api/itemmasterdata/oitm/progress?uniqueid="+uniqueID).then((res)=>{
           this.progStatus = res.data.status +' %'
           if(Math.round(res.data.status) === 100){
               clearInterval(this.interval)
           }
        })
      }, 2000);
      
    },
    saveProperty(query,index){
      this.checkboxStatus[index] = {query: query, status: this.chek[index] };
      
      console.log(this.checkboxStatus)
    },
    properties(){
      this.itempropr = true;
    },
    getFields(){
      this.loadingForTable = true
      axios.get("http://192.168.1.19:7771/api/itemmasterdata/oitm/fields").then((res)=>{
          this.manufacturer = res.data.firmcode
          this.preferredv = res.data.preferredv
          this.itemgroup = res.data.oitb
          this.warrantyT = res.data.warrantyt
          this.properties1 = res.data.oitg
          this.subcatgroup = res.data.subcatgroup
          this.loadingForTable = false
          this.warrantyT.push({'TmpltName':''})
      }).catch((error) => {
           this.$swal('Sap Database Error', 'Please Check Database Connection '+error, 'error')
      });
       axios.get("http://192.168.1.19:7771/api/itemmasterdata/oitm/db").then((res)=>{
          this.db = res.data
         
      }).catch((error) => {
           this.$swal('Sap Database Error', 'Please Check Database Connection '+error, 'error')
      });

     
    },
    addItem() {
      this.identify = 0
      this.dialog = true;
      this.refresh();
       this.getFields()
    },
    refresh(){
       this.data = {
          model: '',
          prodcat: '',
          itmgroup: '',
          withHtaxt: '',
          brand: '',
          batchserial: '',
          warrantytemp: '',
          preferredvendor: '',
          purchaseuom: '',
          inventoryoum: '',
          sellout: '00.0',
          subcat1: '',
          subcat2: '',
          grossdealerprice: '00.0',
          srp: '00.0',
          regnetcost: '00.0',
          prenetcost: '00.0',
          freebies: '',
          sizename: '',
          specs1: '',
          specs2: '',
          specs3: '',
          type: '',
          sizes: '00.0',
          instsubamp: "00.0",
          subcatgroup: ''
      }
      this.properties1 = []
      this.itemcode = ''
    },
    onSearch() {
     
      axios
        .get(
          "http://192.168.1.19:7771/api/itemmasterdata/oitm/index?page=" +
            this.currentPage +
            "&search=" +
             this.sortBrand + "&search2=" + this.searchTerm2 + "&brand=" + getName(this.sortBrand, this.manufacturer)
        )
        .then((response) => {
          this.rows = response.data.data.data;
          this.totalRows = response.data.data.total;
          this.currentPage = response.data.data.current_page;
          this.perPage = response.data.data.per_page;
        });
      return "";
    },
    customAction(row) {
      
      oldmodel = row.ItemName
      
      this.itemcode = 'ITEMCODE: '+row.ItemCode
      this.identify = 1
      this.dialog = true
       
      this.data = {
          oldmodels: oldmodel,
          grossdealerprice:  row.U_GDP,
          freebies: row.U_Freebies,
          model: row.ItemName,
          prodcat: row.FrgnName,
          itmgroup: parseInt(row.ItmsGrpCod),
          withHtaxt: row.WTLiable == 'Y'? true:false,
          brand:  {FirmCode: row.FirmCode },
          batchserial: row.ManSerNum == 'Y'? 'Serial Number':row.ManBtchNum == 'N' && row.ManSerNum == 'N'? 'None':'Batches',
          warrantytemp: row.WarrntTmpl,
          preferredvendor: row.CardCode,
          purchaseuom: row.BuyUnitMsr,
          inventoryoum: row.InvntryUom,
          salesoum: row.SalUnitMsr,
          sellout: row.U_BA_LVAFrom,
          subcat1: row.U_U_Subcat1,
          subcat2: row.U_U_Subcat2,
          srp: row.U_srp,
          regnetcost: row.U_RegNC,
          prenetcost: row.U_PresentNC,
          sizename: row.U_rSubCat,
          specs1: row.U_cPanel,
          specs2: row.U_cContent,
          specs3: row.U_cTransmission,
          type: row.U_cType,
          sizes: row.U_cSizes,
          instsubamp: row.U_SubsidyAmt,
          subcatgroup: row.U_SubCatGroup
      }
      this.properties1 = 
      [{ItmsGrpNam: 'Items Property 1', value: row.QryGroup1 == 'Y'? 'checked':''},
       {ItmsGrpNam: 'Items Property 2' , value: row.QryGroup2 == 'Y'? 'checked':''},
       {ItmsGrpNam: 'Items Property 3', value: row.QryGroup3 == 'Y'? 'checked':''},
       {ItmsGrpNam: 'Items Property 4' , value: row.QryGroup4 == 'Y'? 'checked':''},
       {ItmsGrpNam: 'Items Property 5', value: row.QryGroup5 == 'Y'? 'checked':''},
       {ItmsGrpNam: 'Items Property 6' , value: row.QryGroup6 == 'Y'? 'checked':''},
       {ItmsGrpNam: 'Items Property 7', value: row.QryGroup7 == 'Y'? 'checked':''},
       {ItmsGrpNam: 'Items Property 8' , value: row.QryGroup8 == 'Y'? 'checked':''}]
      this.properties1.forEach((item, index) => {
        this.chek[index] = item.value == 'checked'? true:false;
      });
       
      this.handleAutocompleteChange()
      
      
 
      // Perform your custom action here
    },
    onButtonClick(id) {
      console.log(`Button clicked for row with id ${id}`);
      // Handle button click here
    },
     onPageCurrent(pageInfo) {
      
      // make a request to the server for the data
      axios
        .get(this.newlink)
        .then((response) => {
          console.log(response)
          // this.rows = response.data.data.data;
          // this.totalRows = response.data.data.total;
          // this.currentPage = pageInfo.currentPage;
          // this.perPage = pageInfo.currentPerPage;
     
        });
    },
    onPageChange(pageInfo) {
 
      // make a request to the server for the data
      axios
        .get(
          "http://192.168.1.19:7771/api/itemmasterdata/oitm/index?page=" + pageInfo.currentPage + "&search=" +this.sortBrand + "&search2=" + this.searchTerm2 + "&brand=" + getName(this.sortBrand, this.manufacturer)
        )
        .then((response) => {
          console.log(response.data.data)
          this.rows = response.data.data.data;
          this.totalRows = response.data.data.total;
          this.currentPage = pageInfo.currentPage;
          this.perPage = pageInfo.currentPerPage;
          this.newlink = response.data.data.path+'?page='+ response.data.data.current_page+ "&search=" +this.sortBrand + "&search2=" + this.searchTerm2 + "&brand=" + getName(this.sortBrand, this.manufacturer);
        });
    },
       onlyNumber($event) {
     
       
      //console.log($event.keyCode); //keyCodes value
     let keyCode = $event.keyCode ? $event.keyCode : $event.which;
        if ((keyCode < 48 || keyCode > 57) && keyCode !== 44 && keyCode !== 46) {
          // 46 is dot, 44 is comma
          $event.preventDefault();
        }

    },
  },
  mounted() {
    this.getFields()
    this.onPageChange({ currentPage: this.currentPage, perPage: this.perPage });
  },
};
</script>

<style>
</style>