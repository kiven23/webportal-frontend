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
                    @click="view(item.uid, item.asof)"
                    >
                    View
                </v-btn>
                </div>
             </template>
            
            </v-data-table>
        </v-card>
        <v-dialog
              v-model="printDialog"
              fullscreen
              hide-overlay
              transition="dialog-bottom-transition"
            >

              <v-card>
                <v-toolbar
                  dark
                  style="background-color: #1b4475"
                >
                  <v-btn
                    icon
                    dark
                    @click="printDialog = false"
                  >
                    <v-icon style="color: white">mdi-close</v-icon>
                  </v-btn>
                  <v-toolbar-title style="color: white">ExpressWay Usage Print Preview</v-toolbar-title>
                  <v-spacer></v-spacer>
        
                </v-toolbar>
        
                <v-divider></v-divider>
                <iframe  :src="link"  ref="myiframe"  style="width: 100%; height: 1000px;" title="Searching of Vehicle Parts PrintPreview">
                
                

                </iframe> 
                <v-skeleton-loader
                    v-if="iden == 0"
                    max-height="100%"
                    max-width="100%"
                    
                    type="card"
                ></v-skeleton-loader>
      </v-card>
    </v-dialog>
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
        printDialog: false,
        search: '',
        link: '',
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
        ]
    };
  },

  
  created() {
      this.$store.dispatch("motorpool_expressway/monitoring").then((res)=>{
          this.data = res.data
      })
  },

  methods: { 
    view(map, asof){
       const date = btoa(asof)
       this.link = 'http://192.168.1.19:7771/api/expressway/monitoring/view?map='+map+'&query='+date
      
       this.printDialog = true
        
    }

  }
};
</script>
