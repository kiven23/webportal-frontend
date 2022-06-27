<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="types"
        :search="search"
        :loading="loadingStatus"
        show-select
        class="elevation-1"
        @toggle-select-all="selectAllToggle"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Service Types</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text icon v-on="on" @click="openDialog"
                  ><v-icon>mdi-plus-circle</v-icon></v-btn
                >
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
                  @click="deleteTypes"
                  ><v-icon>delete</v-icon></v-btn
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
                <json-excel :data="types">
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
              append-icon="search"
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
                          v-model="editedType.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedType.name.$touch()"
                          @keydown.enter="save"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text @click="close">Cancel</v-btn>
                  <v-btn
                    color="blue darken-1"
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
            :disabled="types.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.connectivity_tickets.length > 0"
            :disabled="item.connectivity_tickets.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" @click="editType(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small @click="editType(item, 2)">
            mdi-content-duplicate
          </v-icon>
        </template>
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import JsonExcel from "vue-json-excel";

export default {
  components: {
    JsonExcel
  },

  mixins: [validationMixin],

  data() {
    return {
      search: "",
      selected: [],
      disabledCount: 0,
      headers: [
        { text: "Name", align: "left", value: "name" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedType: {
        name: ""
      },
      defaultType: {
        name: ""
      }
    };
  },

  validations: {
    editedType: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.types.filter(type => type.name == value).length;
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
      types: "serviceType/getTypes",
      typeErrors: "serviceType/getTypeErrors"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Service Type" : "Edit Service Type";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedType.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.typeErrors["name|required"]) {
        nameRequiredError = this.typeErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.typeErrors["name|unique"]) {
        nameUniqueError = this.typeErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedType.name.required && errors.push(nameRequiredError);
      !this.$v.editedType.name.isUnique && errors.push(nameUniqueError);
      return errors;
    }
  },

  watch: {
    types() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("serviceType/fetchTypes");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("serviceType/fetchTypes");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedType = Object.assign({}, this.defaultType); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editType(type, action) {
      this.editedIndex = action == 2 ? -1 : this.types.indexOf(type); // set index: important
      this.editedType = Object.assign({}, type);
      this.$store.dispatch("triggerDialog", true);
    },

    deleteTypes() {
      const types = this.$data.selected;
      const typeIds = types.map(type => {
        return type.id;
      });
      const typeNames = types.map(type => {
        const lists = "<br />" + type.name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" + typeNames,
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
            this.$store.dispatch("serviceType/deleteTypes", typeIds);
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
        // update service type
        this.$store.dispatch("serviceType/updateType", this.editedType);
      } else {
        // store service type
        this.$store.dispatch("serviceType/storeType", this.editedType);
      }
    },

    selectAllToggle(props) {
      if (this.selected.length != this.types.length - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.connectivity_tickets.length > 0) {
            self.selected.push(item);
          }
        });
        self.disabledCount = this.types.length - this.selected.length;
      } else this.selected = [];
    }
  }
};
</script>
