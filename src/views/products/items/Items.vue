<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="items"
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
            <v-toolbar-title>Product Items</v-toolbar-title>
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
                  @click="deleteItems"
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
                <json-excel :data="items">
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
                          v-model="editedItem.model"
                          :error-messages="modelErrors"
                          label="Model"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedItem.model.$touch()"
                          @keydown.enter="save"
                          @keydown.esc="close"
                        ></v-text-field>
                        <v-autocomplete
                          v-model="editedItem.brand"
                          :search-input="editedItem.brand.toString()"
                          :error-messages="brandErrors"
                          :items="brands"
                          item-text="name"
                          item-value="id"
                          label="Select Brand"
                          filled
                        ></v-autocomplete>
                        <v-autocomplete
                          v-model="editedItem.category"
                          :search-input="editedItem.category.toString()"
                          :error-messages="categoryErrors"
                          :items="categories"
                          item-text="name"
                          item-value="id"
                          label="Select Category"
                          filled
                        ></v-autocomplete>
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
            :disabled="items.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.computerwares > 0"
            :disabled="item.computerwares > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" title="Edit" @click="editItem(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editItem(item, 2)">
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
        { text: "Model", align: "left", value: "model" },
        { text: "Brand", align: "left", value: "brand" },
        { text: "Category", align: "left", value: "category" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        model: "",
        brand: "",
        category: ""
      },
      defaultItem: {
        model: "",
        brand: "",
        category: ""
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedItem: {
      model: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isModel = this.items.filter(item => item.model == value).length;
          if (isModel === 1) {
            return false;
          } else {
            return true;
          }
        }
      },
      brand: { required },
      category: { required }
    }
  },

  computed: {
    ...mapGetters({
      items: "productItem/getItems",
      itemErrors: "productItem/getItemErrors",
      brands: "productBrand/getBrands",
      categories: "productCategory/getCategories"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Product Item" : "Edit Product Item";
    },

    modelErrors() {
      const errors = [];
      if (!this.$v.editedItem.model.$dirty) return errors;

      var modelRequiredError = null;
      if (this.itemErrors["model|required"]) {
        modelRequiredError = this.itemErrors["model|required"];
      } else {
        modelRequiredError = "The model field is required.";
      }

      var modelUniqueError = null;
      if (this.itemErrors["model|unique"]) {
        modelUniqueError = this.itemErrors["model|unique"];
      } else {
        modelUniqueError = "The model already taken.";
      }

      !this.$v.editedItem.model.required && errors.push(modelRequiredError);
      !this.$v.editedItem.model.isUnique && errors.push(modelUniqueError);
      return errors;
    },

    brandErrors() {
      const errors = [];
      if (!this.$v.editedItem.brand.$dirty) return errors;

      var brandRequiredError = null;
      if (this.itemErrors["brand|required"]) {
        brandRequiredError = this.itemErrors["brand|required"];
      } else {
        brandRequiredError = "The brand field is required.";
      }

      !this.$v.editedItem.brand.required && errors.push(brandRequiredError);
      return errors;
    },

    categoryErrors() {
      const errors = [];
      if (!this.$v.editedItem.category.$dirty) return errors;

      var categoryRequiredError = null;
      if (this.itemErrors["category|required"]) {
        categoryRequiredError = this.itemErrors["category|required"];
      } else {
        categoryRequiredError = "The category field is required.";
      }

      !this.$v.editedItem.category.required &&
        errors.push(categoryRequiredError);
      return errors;
    }
  },

  watch: {
    items() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("productItem/fetchItems");
    this.$store.dispatch("productBrand/fetchBrands");
    this.$store.dispatch("productCategory/fetchCategories");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("productItem/fetchItems");
      this.$store.dispatch("productBrand/fetchBrands");
      this.$store.dispatch("productCategory/fetchCategories");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedItem = Object.assign({}, this.defaultItem); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editItem(item, action) {
      this.editedIndex = action == 2 ? -1 : this.items.indexOf(item); // set index: important
      this.editedItem = Object.assign(
        {},
        {
          id: item.id,
          model: item.model,
          brand: item.brand_id,
          category: item.category_id
        }
      );
      this.$store.dispatch("triggerDialog", true);
    },

    deleteItems() {
      const items = this.$data.selected;
      const itemIds = items.map(item => {
        return item.id;
      });
      const itemModels = items.map(item => {
        const lists = "<br />" + item.model;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" +
            itemModels,
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
            this.$store.dispatch("productItem/deleteItems", itemIds);
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
        // update product item
        this.$store.dispatch("productItem/updateItem", this.editedItem);
      } else {
        // store product item
        this.$store.dispatch("productItem/storeItem", this.editedItem);
      }
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.computerwares > 0) {
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
