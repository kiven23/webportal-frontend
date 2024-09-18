<template>
  <v-container grid-list-md text-xs-center>
    <v-breadcrumbs :items="breadcrums"></v-breadcrumbs>
    <v-card color="white lighten-2">
         
      <v-toolbar flat>
        <v-text-field
          flat
          hide-details
          label="Search"
          prepend-inner-icon="mdi-magnify"
          v-model="search"
        ></v-text-field>

        <template v-slot:extension>
          <v-tabs v-model="tabs" centered>
            <v-tab> BUSINESS PARTNER </v-tab>
          </v-tabs>
        </template>
       
      </v-toolbar>
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
         
           <v-col class="d-flex justify-end">
         <v-btn x-small @click="submit()" dense > SUBMIT ITEM </v-btn>
           </v-col>
             </v-row> 
          <!-- <v-btn x-small @click="searchfunction(1)" dense  > ALL </v-btn> -->
      </v-card-text>
      {{ this.bp }}
      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <v-card flat>
            <v-card>
              <v-list-item three-line>
                <v-list-item-content>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <div class="text-overline mb-4">Customer/Vendor Info</div>
                      <v-select
                        :items="cardtypelist"
                        v-model="cardtype"
                        label="CARDTYPE"
                        dense
                      ></v-select>
            
                      <v-select
                        :items="serieslist"
                        label="SERIES/CODE"
                        item-text="SeriesName"
                        item-value="Series"
                        v-model="series"
                        dense
                      ></v-select>

                      <v-select
                        :items="groupcodelist"
                        label="Group"
                        item-text="GroupName"
                        item-value="GroupCode"
                        v-model="group"
                        dense
                      ></v-select>

                      <v-text-field dense label="NAME" v-model="fullname"></v-text-field>
                      <div class="text-overline mb-4">PAYMENT TERMS</div>
                      <v-select
                        :items="paymenttermslist"
                        label="PAYMENT TERMS"
                        dense
                        item-text="PymntGroup"
                        item-value="GroupNum"
                        v-model="paymentterm"
                      ></v-select>
                      <v-select
                        :items="pricelist"
                        label="PRICE LIST"
                        dense
                        v-model="pricelistdata"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" sm="6" md="4">
                      <div class="text-overline mb-4">GENERAL</div>
                      <v-text-field dense label="MOBILE PHONE" v-model="mobile"></v-text-field>
                      <v-select
                        :items="salesemployeelist"
                        label="SALES EMPLOYEE"
                        item-text="SlpName"
                        item-value="SlpCode"
                        v-model="salesemployee"
                        dense
                      ></v-select>
                      <div class="text-overline mb-4">ADDRESS/BILL TO</div>
                      <v-text-field
                        dense
                        label="ADDRESS ID"
                        v-model="addressid"
                        :disabled="true"
                      ></v-text-field>
                      <v-text-field dense label="STREET/PO Box" v-model="streetpobox"></v-text-field>
                      <v-text-field dense label="BARANGAY" v-model="barangay"></v-text-field>
                      <v-text-field dense label="CITY" v-model="city"></v-text-field>
                      <v-text-field dense label="AREA CODE" v-model="areacode"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <div class="text-overline mb-4">
                        PAYMENT RUN / HOUSE BANK
                      </div>
                      <v-select :items="BankList" item-text="BankName"
                        @change="getBankDetails()"
                        item-value="BankCode" label="Bank" v-model="bankname"></v-select>
                      <v-text-field
                        dense
                        label="Account"
                        :disabled="true"
                        v-model="account"
                      ></v-text-field>
                      <v-text-field
                        dense
                        label="Branch"
                        :disabled="true"
                        v-model="branch"
                      ></v-text-field>
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
    data: {},
  },
  data() {
    return {
      next_page_url: '',
      last_page_url: '',
      prev_page_url: '',
      path: '',
      bp: [],
      summary: {},
      //MODELS
      cardtype: '',
      series: '',
      search: '',
      group: '',
      fullname:'',
      paymentterm: '',
      pricelistdata: '',
      salesemployee: '',
      addressid: '',
      streetpobox: '',
      barangay: '',
      city: '' ,
      areacode: '',
      bankname: '',
      account: '',
      branch: '',
      mobile: '',
      birthday: '02/23/1996',
      bank:'',

 
      //LISTDOWN
      serieslist: [],
      salesemployeelist: [],
      groupcodelist: [],
      BankList: [],
      cardtypelist: ['CUSTOMER','VENDOR'],
      pricelist: [
        "Price List 01",
        "Price List 02",
        "Price List 03",
        "Price List 04",
        "Price List 05",
      ],
      paymenttermslist: [],
      provincelist: [
        "BATAAN",
        "BULACAN",
        "METRO MANILA",
        "NUEJA ECIJA",
        "PAMPANGA",
        "PANGASINAN",
        "TARLAC",
      ],
      countrylist: ["Philippines"],
      regionlist: [
        "NCR",
        "REION I",
        "REGION II",
        "REGION III",
        "REGION IV",
        "REGION V",
      ],
    
      tabs: null,
      text: " ",
      routers: "",
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
    };
  },

  computed: {},
  created() {},

  methods: {
    async basementUrl(item) {
      try {
          if(this.path){
            const res = await axios.get(this.route);
            return res.data;
          }else{
            const res = await axios.get(`http://192.168.1.19:7771/api/inventory/businesspartner/getters?${item}`);
            return res.data;
 
          }
         
      } catch (error) {
        console.error("Error fetching data:", error);
          this.next_page_url = ''
          this.prev_page_url = ''
          this.last_page_url = ''
          this.path = ''
          this.route = ''
        return null;
      }
    },
    async nextline(){
      
       const data = await this.basementUrl('item=bp');
       this.next_page_url = data.next_page_url
       this.prev_page_url = data.prev_page_url
       this.last_page_url = data.last_page_url
       this.path = data.path
       this.route = this.next_page_url + '&item=bp'
       this.bp = data.data
        // this.cardtype CardType
        // this.series  Series
        // this.group GroupCode
        // this.fullname
        // this.paymentterm
        // this.pricelistdata
        // this.salesemployee
        // this.fullname
        // this.streetpobox
        // this.barangay
        // this.city
        // this.areacode
        // this.bankname
        // this.account
        // this.branch
        // this.mobile Cellular
        // this.birthday
    },
    async previous(){
       const data = await this.basementUrl('item=bp');
       this.next_page_url = data.next_page_url
       this.prev_page_url = data.prev_page_url
       this.last_page_url = data.last_page_url
       this.path = data.path
       this.route = this.prev_page_url + '&item=bp'
       this.bp = data.data
    },
    getBankDetails(){
   
      this.BankList.forEach((element,value) => {
       console.log(this.BankList)
          if(element.BankCode === this.bankname){
            this.account = element.DfltAcct
            this.branch = element.DfltBranch
            
          }
      });
    },
    async listData() {
      this.serieslist = await this.basementUrl('item=series');
      this.groupcodelist = await this.basementUrl('item=groupcode');
      this.paymenttermslist = await this.basementUrl('item=paymentterm');
      this.salesemployeelist = await this.basementUrl('item=salesemployee');
      this.BankList = await this.basementUrl('item=bank');
 
    },
    async submit(){
       
      this.summary = {
          cardtype: this.cardtype == 'CUSTOMER'? 'C': 'S',
          series: this.series,
          group: this.group,
          name: this.fullname,
          paymentterm: this.paymentterm,
          pricelistdata: this.pricelistdata,
          salesemployee: this.salesemployee,
          addressid:  this.fullname,
          streetpobox: this.streetpobox,
          barangay: this.barangay,
          city:  this.city,
          areacode: this.areacode,
          bankname:  this.bankname,
          account: this.account,
          branch: this.branch,
          mobile: this.mobile,
          birthday: this.birthday
      }
        const loading = this.$vs.loading({
        progress1: 0,
      });
      
        if(this.summary){
            await axios.post('http://192.168.1.19:7771/api/inventory/businesspartner/submit', this.summary).then((res)=>{
                this.$swal("Sync!", "" + res.data.message + "", res.data.status);
                loading.close()
  
            })

     }
     
    }
  },
 async mounted() {
    this.listData();
  },
};
</script>
 

<style>
</style>