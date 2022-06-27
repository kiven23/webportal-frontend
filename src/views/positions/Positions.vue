<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="positions"
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
            <v-toolbar-title>Positions</v-toolbar-title>
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
                  @click="deletePositions"
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
                <json-excel :data="positions">
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
                          v-model="editedPosition.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedPosition.name.$touch()"
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
            :disabled="positions.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.employees.length > 0"
            :disabled="item.employees.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon
            small
            class="mr-2"
            title="Edit"
            @click="editPosition(item, 1)"
          >
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editPosition(item, 2)">
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
      disabledCount: 0,
      selected: [],
      headers: [
        { text: "Name", align: "left", value: "name" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedPosition: {
        name: ""
      },
      defaultPosition: {
        name: ""
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedPosition: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.positions.filter(
            position => position.name == value
          ).length;
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
      positions: "position/getPositions",
      positionErrors: "position/getPositionErrors"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Position" : "Edit Position";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedPosition.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.positionErrors["name|required"]) {
        nameRequiredError = this.positionErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.positionErrors["name|unique"]) {
        nameUniqueError = this.positionErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedPosition.name.required && errors.push(nameRequiredError);
      !this.$v.editedPosition.name.isUnique && errors.push(nameUniqueError);
      return errors;
    }
  },

  watch: {
    positions() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("position/fetchPositions");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("position/fetchPositions");
    },

    openDialog() {
      console.log(this.disabledCount + "/" + this.positions.length);
      this.editedIndex = -1; // reset default: important
      this.editedPosition = Object.assign({}, this.defaultPosition); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editPosition(position, action) {
      this.editedIndex = action == 2 ? -1 : this.positions.indexOf(position); // set index: important
      this.editedPosition = Object.assign({}, position);
      this.$store.dispatch("triggerDialog", true);
    },

    deletePositions() {
      const positions = this.$data.selected;
      const positionIds = positions.map(position => {
        return position.id;
      });
      const positionNames = positions.map(position => {
        const lists = "<br />" + position.name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            positionNames,
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
            this.$store.dispatch("position/deletePositions", positionIds);
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
        // update position
        this.$store.dispatch("position/updatePosition", this.editedPosition);
      } else {
        // store position
        this.$store.dispatch("position/storePosition", this.editedPosition);
      }
    },

    selectAllToggle(props) {
      console.log(props);
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.employees.length > 0) {
            self.selected.push(item);
          }
        });
        self.disabledCount = this.current_items - this.selected.length;
      } else {
        this.selected = [];
      }
    },

    currentItems(items) {
      this.current_items = items.length;
    }
  }
};
</script>
