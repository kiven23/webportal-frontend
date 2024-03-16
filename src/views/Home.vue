<template>
  <div>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex xs12>
          <h3>Modules</h3>
          <!-- <h2>This is the best home ever!</h2> -->
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
      </v-layout>
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
