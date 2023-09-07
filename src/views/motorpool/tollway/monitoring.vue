<template>
  <div>
    <v-container grid-list-md text-xs-center>
       <v-card>
            <v-card-title>
            <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
            ></v-text-field>
            </v-card-title>
            <v-data-table
            :headers="headers"
            :items="data"
            :search="search"
            >
            <template v-slot:item.action="{ item }">
                           <div class="my-2">
                                <v-btn
                                x-small
                                color="secondary"
                                dark
                                @click="view(item.uid)"
                                >
                               View
                                </v-btn>
                            </div>
             </template>
            
            </v-data-table>
        </v-card>
    </v-container>
  </div>
</template>

<script>
 
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
 

export default {
 
  data() {
    return {
      search: '',
        headers: [
          {
            text: 'UID',
            align: 'start',
            filterable: false,
            value: 'uid',
          },
          { text: 'PDF-FILES', value: 'pdfname' },
          { text: 'ASOF', value: 'asof' },
          { text: 'DATE UPLOADED', value: 'created_at' },
          { text: 'ACTION', value: 'action' },
          
        ],
        data: [
            {   "id": 1,
                "uid": "5a6acf1b7eca9535f3d0755f3963ff57",
                "pdfname": "sample.pdf",
                "path": "local/path/sample.pdf",
                "asof": "2023-08-02 -> 2023-08-16",
                "created_at": "2023-09-07 11:11:48",
                "updated_at": "2023-09-07 11:11:48"}
        ]
    };
  },

  
  created() {
  
  },

  methods: { 

  }
};
</script>
