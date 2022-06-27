<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="regions"
        :items-per-page="itemsPerPage"
        :search="search"
        :loading="loadingStatus"
        show-select
        class="elevation-1"
        @toggle-select-all="selectAllToggle"
        @current-items="currentItems"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Regions</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog">
                  <v-icon>mdi-plus-circle</v-icon>
                </v-btn>
              </template>
              <span>Add</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  :disabled="!selected.length > 0"
                  text
                  icon
                  v-on="on"
                  @click="deleteRegions"
                  ><v-icon>mdi-delete</v-icon></v-btn
                >
              </template>
              <span>Delete</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on"><v-icon>print</v-icon></v-btn>
              </template>
              <span>Print</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <json-excel :data="regions">
                  <v-btn text icon v-on="on"
                    ><v-icon>mdi-file-export</v-icon></v-btn
                  >
                </json-excel>
              </template>
              <span>Export</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="refreshData">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Refresh</span>
            </v-tooltip>

            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>

            <v-dialog persistent :value="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-text-field
                          autofocus
                          v-model="editedRegion.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedRegion.name.$touch()"
                          @keydown.enter="save"
                          @keydown.esc="close"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="close">Cancel</v-btn>
                  <v-btn
                    color="blue"
                    text
                    @click="save"
                    :loading="loadingStatus"
                    >Save</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>

        <template v-slot:header.data-table-select="{ on, props }">
          <v-simple-checkbox
            v-bind="props"
            v-on="on"
            :disabled="regions.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.branches.length > 0"
            :disabled="item.branches.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.branches="{ item }">
          <span
            style="cursor:pointer;"
            v-if="item.branches.length > 0"
            @click="popBranch(item)"
          >
            <span v-for="(branch, index) in item.branches" :key="branch.id">
              <v-chip small color="primary darken-2" v-if="index === 0">
                {{ branch.name }}
              </v-chip>
            </span>
            <span v-if="item.branches.length - 1 > 0">
              (+{{ item.branches.length - 1 }} other{{
                item.branches.length - 1 != 1 ? "s" : ""
              }})
            </span>
          </span>
          <v-chip small color="secondary" v-if="item.branches.length <= 0">
            None
          </v-chip>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" title="Edit" @click="editRegion(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editRegion(item, 2)">
            mdi-content-duplicate
          </v-icon>
        </template>
      </v-data-table>
    </v-container>

    <BranchesDialog />
  </div>
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import JsonExcel from "vue-json-excel";

import BranchesDialog from "./templates/BranchesDialog";

export default {
  components: {
    BranchesDialog,
    JsonExcel
  },

  mixins: [validationMixin],

  data() {
    return {
      search: "",
      selected: [],
      disabledCount: 0,
      testData: 0,
      headers: [
        { text: "Name", align: "left", value: "name" },
        { text: "Branches", align: "left", value: "branches" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedRegion: {
        name: ""
      },
      defaultRegion: {
        name: ""
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedRegion: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.regions.filter(region => region.name == value)
            .length;
          if (isName === 1) {
            return false;
          } else {
            return true;
          }
        }
      }
    }
  },

  computed: {
    ...mapGetters({
      regions: "region/getRegions",
      regionErrors: "region/getRegionErrors"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Region" : "Edit Region";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedRegion.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.regionErrors["name|required"]) {
        nameRequiredError = this.regionErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.regionErrors["name|unique"]) {
        nameUniqueError = this.regionErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedRegion.name.required && errors.push(nameRequiredError);
      !this.$v.editedRegion.name.isUnique && errors.push(nameUniqueError);
      return errors;
    }
  },

  watch: {
    regions() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("region/fetchRegions");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("region/fetchRegions");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedRegion = Object.assign({}, this.defaultRegion); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editRegion(region, action) {
      this.editedIndex = action == 2 ? -1 : this.regions.indexOf(region); // set index: important
      this.editedRegion = Object.assign({}, region);
      this.$store.dispatch("triggerDialog", true);
    },

    deleteRegions() {
      const regions = this.$data.selected;
      const regionIds = regions.map(region => {
        return region.id;
      });
      const regionNames = regions.map(region => {
        const lists = "<br />" + region.name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            regionNames,
          title: "Confirm Delete",
          actions: {
            false: "Cancel",
            true: {
              text: "Confirm",
              color: "warning"
            }
          }
        })
        .then(state => {
          if (state) {
            this.$store.dispatch("region/deleteRegions", regionIds);
            this.$data.selected = []; // reset selected
          }
        });
    },

    close() {
      this.editedIndex = -1;
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },

    save() {
      this.$v.$touch();
      if (this.editedIndex > -1) {
        // update region
        this.$store.dispatch("region/updateRegion", this.editedRegion);
      } else {
        // store region
        this.$store.dispatch("region/storeRegion", this.editedRegion);
      }
    },

    popBranch(item) {
      let payload = {
        dialog: true,
        item: item
      };
      this.$store.commit("region/SET_REGION_ITEM", payload); // open dialog
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.branches.length > 0) {
            self.selected.push(item);
          }
        });
        self.disabledCount = this.current_items - this.selected.length;
      } else this.selected = [];
    },

    currentItems(items) {
      this.current_items = items.length;
    }
  }
};
</script>
