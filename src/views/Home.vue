<template>
  <div>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex xs12>
          <h3>New Modules</h3>
          <p> 
          </p>
        </v-flex>
        <vs-button
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/grpo/po"
        animation-type="scale"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>SAP GRPO</strong>
        <template #animate>
          <strong style="margin-left: 10px">SERIAL MANAGER &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
     <vs-button
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/barcode/printing"
        animation-type="scale"
        
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>SAP BARCODE</strong>
        <template #animate>
          <strong style="margin-left: 10px">BARCODE PRINT &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>  
         <vs-button
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/itmmasterdata/create"
        animation-type="scale"
         :disabled="true"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>ITEM MASTER</strong>
        <template #animate>
          <strong style="margin-left: 10px">ITEM MASTER DATA &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button> 
      </v-layout>
       <v-layout row wrap>
        <v-flex xs12>
          <h3>Purchasing AP</h3>
 
          <p> 
          </p>
          
        </v-flex>
        
    
        <vs-button
        :disabled="false"
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/invt/purchasing/ap/creditmemo"
        animation-type="scale"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>APCM</strong>
        <template #animate>
          <strong style="margin-left: 10px">AP Credit Memo &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
      <vs-button
        :disabled="false"
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/invt/purchasing/ap/apinvoice"
        animation-type="scale"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>AP-Invoice</strong>
        <template #animate>
          <strong style="margin-left: 10px">AP Invoice&#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
      </v-layout >
         <v-layout row wrap>
        <v-flex xs12>
          <h3>Inventory Transactions</h3>
 
          <p> 
          </p>
          
        </v-flex>
        <vs-button 
        :disabled="true"
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/invt/transactions/goodsreceipt"
        animation-type="scale"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>GOODS RECEIPT</strong>
        <template #animate>
          <strong style="margin-left: 10px">GOODS RECEIPT &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
       <vs-button
       :disabled="true"
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/invt/transactions/goodsissue"
        animation-type="scale"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>GOODS ISSUE</strong>
        <template #animate>
          <strong style="margin-left: 10px">GOODS ISSUE &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
        <vs-button
        :disabled="false"
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/invt/transactions/inventorytransfer"
        animation-type="scale"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>INVENTORY TRANSFER</strong>
        <template #animate>
          <strong style="margin-left: 10px">INVENTORY TRANSFER &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
      </v-layout > 
      
      <v-layout row wrap>
        <v-flex xs12>
          <h3>Business Partner</h3>
          
          <p> 
          </p>
          
        </v-flex>
        <vs-button
        :disabled="true"
        style="background-color: white; min-width: 70px; color: black"
        to="/sapb1/businesspartner"
        animation-type="scale"
        >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>Customers/Vendor</strong>
        <template #animate>
          <strong style="margin-left: 10px">Business Partners &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
      </v-layout >  

    </v-container>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log("Home mounted.");
  }
};
</script>
