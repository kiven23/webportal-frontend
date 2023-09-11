<template>
  <div>
    <v-container grid-list-md text-xs-center>
        <v-btn
          color="primary"
          dark
          @click="openUploadDialog()"
          style="margin: 10px;"
        >
         UPLOAD
        </v-btn>
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
        <v-skeleton-loader
          :loading="skeleton"
          type="table-heading, list-item-two-line, image, table-tfoot"
        >
          
          <v-data-table
            :headers="headers"
            :items="data"
            :search="search"
            >
            <template v-slot:item.action="{ item }">
                <div class="my-2">
                <v-btn
                    x-small
                    color="white"
                    dark
                    dense
                    @click="view(item.uid, item.asof)"
                    >
                     <v-icon  color="green" small
                                      >mdi-eye-arrow-right-outline</v-icon
                                    > 
                </v-btn>
                <v-btn
                    x-small
                    color="white"
                    dark
                    style="margin: 2px;"
 
                    @click="trash(item.uid)"
                    >
                    <v-icon  color="red" small
                                      >mdi-trash-can-outline</v-icon
                                    > 
                </v-btn>
                </div>
             </template>
            
            </v-data-table>
          
       
        </v-skeleton-loader>
             
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
    <v-dialog
      v-model="uploadDialog"
      persistent
      max-width="290"
    >
     
      <!-- <v-card>
        <v-card-title class="text-h5">
          Upload PDF 
        </v-card-title>
        <v-card-text>

           <v-file-input
              label="PDF"
              outlined
              dense
              v-model="files"
             ></v-file-input>  
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="uploadDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="upload()"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card> -->

       <v-card
    class="mx-auto mt-6"
    width="344"
  >
    <v-system-bar>
      <v-spacer></v-spacer>
      <v-icon>mdi-square</v-icon>
      <v-icon>mdi-circle</v-icon>
      <v-icon>mdi-triangle</v-icon>
    </v-system-bar>

    <v-toolbar>
      <v-btn icon @click="uploadDialog = false">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-toolbar-title>Upload PDF </v-toolbar-title>

      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        bottom
        color="deep-purple accent-4"
      ></v-progress-linear>

      <v-spacer></v-spacer>
 
    </v-toolbar>

    <v-container style="height: 282px;">
      <v-row
        class="fill-height"
        align="center"
        justify="center"
      >
        <v-scale-transition>
          <div
            v-if="!loading"
            class="text-center"
          >
             

           <v-file-input
              label="PDF"
              v-model="files"
             ></v-file-input>  
        
            <v-btn
              color="primary"
               @click="upload()"
            >
              Proceed 
            </v-btn>
          </div>
        </v-scale-transition>
      </v-row>
    </v-container>
  </v-card>
    </v-dialog>
    </v-container>
  </div>
</template>

<script>
 
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import Axios from 'axios';
 

export default {
 
  data() {
    return { 
        skeleton: false,
        loading: false,
        uploadDialog: false,
        printDialog: false,
        search: '',
        link: '',
        files: '',
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
        
    },
    openUploadDialog(){
      this.uploadDialog = true;
    }
    ,
    upload(){
      this.loading = true
      this.$store.dispatch("motorpool_expressway/upload", this.files)
        .then(response => {
           
         if(response == 0){
             
            this.loading = false
            alert("Uploaded..!")
            this.refresh()
         }else if(response == 2){
           this.loading = false
            alert("The file is not supported. Please try using another document as recommended by the developers.")
            this.refresh()
         }else{
            this.loading = false
            alert("File Already Exists")
         }
        })
        .catch(error => {
          console.error(error);
        });
 
    },
    trash(id){
        this.$swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
              this.$store.dispatch("motorpool_expressway/trash", id)
              this.$swal.fire(
                  'Deleted!',
                  'Your file has been deleted.',
                  'success'
                )
                this.refresh();  
              
           
        }
      })

      
    },
    refresh(){
          this.skeleton = true
          this.$store.dispatch("motorpool_expressway/monitoring").then((res)=>{
          this.data = res.data
          this.skeleton = false
          })
    }

  }
};
</script>
