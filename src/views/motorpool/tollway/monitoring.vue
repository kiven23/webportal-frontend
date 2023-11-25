<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-btn
        color="primary"
        dark
        @click="openUploadDialog()"
        style="margin: 10px"
      >
        create
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
          <v-data-table :headers="headers" :items="data" :search="search">
            <template v-slot:item.action="{ item }">
              <div class="my-2">
                <v-btn
                  x-small
                  color="white"
                  dark
                  style="margin: 2px"
                  @click="trash(item.uid)"
                >
                  <v-icon color="red" small>mdi-trash-can-outline</v-icon>
                </v-btn>
                <v-menu offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      x-small
                      color="white"
                      dark
                      dense
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon color="green" small
                        >mdi-eye-arrow-right-outline</v-icon
                      >
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item v-for="(itemA, index) in itemsA" :key="index">
                      <v-btn @click="view(item.id, itemA.val)">
                        {{ itemA.title }}
                      </v-btn>
                    </v-list-item>
                  </v-list>
                </v-menu>
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
          <v-toolbar dark style="background-color: #1b4475">
            <v-btn icon dark @click="printDialog = false">
              <v-icon style="color: white">mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title style="color: white"
              >ExpressWay Usage Print Preview</v-toolbar-title
            >
            <v-spacer></v-spacer>
          </v-toolbar>

          <v-divider></v-divider>
          <iframe
            :src="link"
            ref="myiframe"
            style="width: 100%; height: 1000px"
            title="Searching of Vehicle Parts PrintPreview"
          >
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
        v-model="createDialog"
        hide-overlay
        transition="dialog-bottom-transition"
        scrollable
      >
        <v-card tile>
          <v-toolbar flat dark color="primary">
            <v-btn icon dark @click="dialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>RUF USAGE FORM</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark text @click="save()"> Submit </v-btn>
            </v-toolbar-items>
            <v-menu bottom right offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn dark icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
            </v-menu>
          </v-toolbar>
          <v-card-text>
            <v-btn
              color="primary"
              dark
              class="ma-2"
              @click="dialog2 = !dialog2"
            >
              Select Driver
            </v-btn>

            <v-list three-line subheader>
              <v-subheader>INFO</v-subheader>
              <v-list-item>
                <v-row no-gutters>
                  <v-col cols="6" md="4">
                    <v-card class="pa-2" outlined tile>
                      <v-menu
                        v-model="menu2"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="auto"
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-text-field
                            v-model="date"
                            label="Date"
                            prepend-icon="mdi-calendar"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker
                          v-model="date"
                          @input="menu2 = false"
                        ></v-date-picker>
                      </v-menu>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-2" outlined tile>
                      <v-text-field
                        label="Destination"
                        solo
                        v-model="rufdata.destination"
                      ></v-text-field>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-2" outlined tile>
                      <v-text-field
                        label="Purpose"
                        solo
                        v-model="rufdata.purpose"
                      ></v-text-field>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-2" outlined tile>
                      <v-select
                        :items="rfidtype"
                        label="RFID TYPE"
                        solo
                        v-model="rufdata.rfidtype"
                      ></v-select>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-2" outlined tile>
                      <v-select
                        :items="exptype"
                        label="EXPRESSWAY TYPE"
                        solo
                        v-model="rufdata.exptype"
                        @change="expressways()"
                      ></v-select>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-1" outlined tile>
                      <v-select
                        :items="entrylist"
                        label="ENTRY"
                        solo
                        v-model="rufdata.entry"
                      ></v-select>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-1" outlined tile>
                      <v-select
                        :items="exitlist"
                        label="EXIT"
                        solo
                        v-model="rufdata.exit"
                      ></v-select>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-1" outlined tile>
                      <v-text-field
                        label="Amount"
                        solo
                        v-model="rufdata.amount"
                      ></v-text-field>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="4">
                    <v-card class="pa-1" outlined tile>
                      <v-btn color="primary" text @click="add()"> Add </v-btn>
                    </v-card>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
            <v-divider></v-divider>
            <v-list three-line subheader>
              <v-subheader>Data</v-subheader>

              <v-list-item>
                <v-simple-table dense>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">DESTINATION</th>
                        <th class="text-left">PURPOSE</th>
                        <th class="text-left">RFIDTYPE</th>
                        <th class="text-left">EXPRESSWAY TYPE</th>
                        <th class="text-left">ENTRY</th>
                        <th class="text-left">EXIT</th>
                        <th class="text-left">AMOUNT</th>
                        <th class="text-left">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(item, index) in tabledata"
                        :key="item.destination"
                      >
                        <td>{{ item.destination }}</td>
                        <td>{{ item.purpose }}</td>
                        <td>{{ item.rfidtype }}</td>
                        <td>{{ item.exptype }}</td>
                        <td>{{ item.entry }}</td>
                        <td>{{ item.exit }}</td>
                        <td>{{ item.amount }}</td>
                        <td>
                          <v-btn
                            color="primary"
                            text
                            @click="removeItem(index)"
                          >
                            x
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-list-item>
            </v-list>
          </v-card-text>

          <div style="flex: 1 1 auto"></div>
        </v-card>
      </v-dialog>

      <v-dialog v-model="dialog2" max-width="500px">
        <v-card>
          <v-card-title> Driver </v-card-title>
          <v-card-text>
            <v-select
              :items="driversdata"
              label="Select Driver"
              item-value="id"
              item-text="driver"
              v-model="driver"
            >
              <template v-slot:item="{ item }">
                {{ item.driver }} / {{ item.plate }}
              </template>
            </v-select>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" text @click="dialog2 = false"> Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import Axios from "axios";

export default {
  data() {
    return {
      driver: "",
      driversdata: [],
      tabledata: [],
      rufdata: [
        {
          destination: "",
          purpose: "",
          rfidtype: "",
          exptype: "",
          entry: "",
          exit: "",
          amount: "",
        },
      ],
      entrylist: [],
      exitlist: [],
      rfidtype: ["AutoSweep", "EasyTrip"],
      exptype: [
        "TPLEX",
        "NLEX/SCTEX",
        "SLEX",
        "METRO MANILA SKYWAY STAGE 3",
        "STAR",
      ],
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      menu: false,
      modal: false,
      menu2: false,
      itemsA: [
        { title: "AUTOSWEEP", val: 0 },
        { title: "EASYTRIP", val: 1 },
      ],
      skeleton: false,
      loading: false,
      createDialog: false,
      printDialog: false,
      dialog2: false,
      search: "",
      link: "",
      files: "",
      headers: [
        {
          text: "CREATOR ID",
          align: "start",
          filterable: false,
          value: "uid",
        },
        { text: "PLATE NO.", value: "plateno" },
        { text: "DRIVER", value: "name" },
        { text: "ASOF", value: "asof" },
        { text: "DATE UPLOADED", value: "created_at" },
        { text: "ACTION", value: "action" },
      ],
      data: [],
    };
  },

  created() {
    this.$store.dispatch("motorpool_expressway/monitoring").then((res) => {
      this.data = res.data;
    });
    this.$store.dispatch("motorpool_expressway/drivers").then((res) => {
      this.driversdata = res.data;
    });
  },

  methods: {
   
     removeItem(index){
            this.tabledata.splice(index, 1);
      },
    expressways() {
     
      if (this.rufdata.exptype == "TPLEX") {
        this.entrylist = [
          "La Paz, Tarlac",
          "Victoria, Tarlac",
          "Gerona, Tarlac",
          "Paniqui, Tarlac",
          "Rosales, Pangasinan",
          "Urdaneta, Pangasinan",
          "Binalonan, Pangasinan",
          "Pozorrubio, Pangasinan",
          "Sison, Pangasinan",
          "Rosario, La Union",
        ];
        this.exitlist = this.entrylist;
      } else if (this.rufdata.exptype == "NLEX/SCTEX") {
        this.entrylist = [
          "Mindanao Avenue",
          "Karuhatan",
          "Valenzuela",
          "Lawang Bato",
          "Meycauayan",
          "Marilao",
          "Ciudad de Victoria",
          "Bocaue",
          "Tambubong",
          "Balagtas",
          "Tabang",
          "Sta. Rita",
          "Pulilan",
          "San Simon",
          "San Fernando",
          "Mexico",
          "Angeles",
          "Dau",
          "Sta. Ines",
          "Tipo/SFEX",
          "Dinalupihan",
          "Floridablanca",
          "Porac",
          "Clark South",
          "Mabalacat (Mabiga)",
          "Clark North",
          "Dolores",
          "Concepcion",
          "San Miguel",
          "Tarlac",
        ];
        this.exitlist = this.entrylist;
      } else if (this.rufdata.exptype == "METRO MANILA SKYWAY STAGE 3") {
        this.entrylist = [
          "Buendia",
          "Plaza Azul/Nagtahan",
          "E. Rodriguez",
          "Quezon Avenue",
          "NLEX",
          "Balintawak-A.Bonifacio",
          "Quezon Avenue",
          "Plaza Dilao",
        ];
        this.exitlist = this.entrylist;
      } else if (this.rufdata.exptype == "SLEX") {
        this.entrylist = [
          "Merville",
          "Bicutan",
          "Sucat",
          "Alabang",
          "Filinvest",
          "MCX",
          "Susana Heights",
          "San Pedro",
          "Southwoods",
          "Carmona",
          "Mamplasan",
          "Sta. Rosa",
          "ABI/Greenfield",
          "Cabuyao",
          "Silangan",
          "Calamba",
          "Sto. Tomas",
        ];
        this.exitlist = this.entrylist;
      } else if (this.rufdata.exptype == "STAR") {
        this.entrylist = [
          "STO.TOMAS",
          "TANAUAN",
          "MALVAR",
          "STO.TORIBIO",
          "LIPA",
          "IBAAN",
          "BATANGAS",
        ];
        this.exitlist = this.entrylist;
      }
    },
    add() {
      if(this.driver !==""){
// Your new object
      var newElement = {
        destination: this.rufdata.destination,
        purpose: this.rufdata.purpose,
        rfidtype: this.rufdata.rfidtype,
        exptype: this.rufdata.exptype,
        entry: this.rufdata.entry,
        exit: this.rufdata.exit,
        amount: this.rufdata.amount,
      };

      // Check if the object already exists in the array
      var exists = this.tabledata.some(
        (item) =>
          item.destination === newElement.destination &&
          item.purpose === newElement.purpose &&
          item.rfidtype === newElement.rfidtype &&
          item.exptype === newElement.exptype &&
          item.entry === newElement.entry &&
          item.exit === newElement.exit &&
          item.amount === newElement.amount
      );

      // If the object doesn't exist, push it into the array
      if (!exists) {
        this.tabledata.push(newElement);
      } else {
        console.log("Object already exists in the array.");
      }
      }else{
        alert("Please Select Driver")
      }
       
    },
    view(id, val) {
      this.link =
        "http://192.168.1.19:7771/api/expressway/monitoring/view?uid=" +
        id +
        "&type=" +
        val;
      this.printDialog = true;
    },
    openUploadDialog() {
      this.createDialog = true;
    },
    save() {
      const data = {
        driver:  this.driver,
        ruf: this.tabledata,
        date: this.date
      }
      this.$store.dispatch("motorpool_expressway/newruf", data)
      
    },
    upload() {
      this.loading = true;
      this.$store
        .dispatch("motorpool_expressway/upload", this.files)
        .then((response) => {
          if (response == 0) {
            this.loading = false;
            alert("Uploaded..!");
            this.refresh();
          } else if (response == 2) {
            this.loading = false;
            alert(
              "The file is not supported. Please try using another document as recommended by the developers."
            );
            this.refresh();
          } else {
            this.loading = false;
            alert("File Already Exists");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    trash(id) {
      this.$swal
        .fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.$store.dispatch("motorpool_expressway/trash", id);
            this.$swal.fire(
              "Deleted!",
              "Your file has been deleted.",
              "success"
            );
            this.refresh();
          }
        });
    },
    refresh() {
      this.skeleton = true;
      this.$store.dispatch("motorpool_expressway/monitoring").then((res) => {
        this.data = res.data;
        this.skeleton = false;
      });
    },
  },
};
</script>
