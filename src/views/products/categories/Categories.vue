<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="categories"
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
            <v-toolbar-title>Product Categories</v-toolbar-title>
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
                  @click="deleteCategories"
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
                <json-excel :data="categories">
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
                          v-model="editedCategory.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedCategory.name.$touch()"
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
            :disabled="categories.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.items.length > 0"
            :disabled="item.items.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon
            small
            class="mr-2"
            title="Edit"
            @click="editCategory(item, 1)"
          >
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editCategory(item, 2)">
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
      editedCategory: {
        name: ""
      },
      defaultCategory: {
        name: ""
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedCategory: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.categories.filter(
            category => category.name == value
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
      categories: "productCategory/getCategories",
      categoryErrors: "productCategory/getCategoryErrors"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1
        ? "New Product Category"
        : "Edit Product Category";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedCategory.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.categoryErrors["name|required"]) {
        nameRequiredError = this.categoryErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.categoryErrors["name|unique"]) {
        nameUniqueError = this.categoryErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedCategory.name.required && errors.push(nameRequiredError);
      !this.$v.editedCategory.name.isUnique && errors.push(nameUniqueError);
      return errors;
    }
  },

  watch: {
    categories() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("productCategory/fetchCategories");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("productCategory/fetchCategories");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedCategory = Object.assign({}, this.defaultCategory); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editCategory(category, action) {
      this.editedIndex = action == 2 ? -1 : this.categories.indexOf(category); // set index: important
      this.editedCategory = Object.assign({}, category);
      this.$store.dispatch("triggerDialog", true);
    },

    deleteCategories() {
      const categories = this.$data.selected;
      const categoryIds = categories.map(category => {
        return category.id;
      });
      const categoryNames = categories.map(category => {
        const lists = "<br />" + category.name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            categoryNames,
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
            this.$store.dispatch(
              "productCategory/deleteCategories",
              categoryIds
            );
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
        // update product category
        this.$store.dispatch(
          "productCategory/updateCategory",
          this.editedCategory
        );
      } else {
        // store product category
        this.$store.dispatch(
          "productCategory/storeCategory",
          this.editedCategory
        );
      }
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.items.length > 0) {
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
