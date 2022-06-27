<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="roles"
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
            <v-toolbar-title>Roles</v-toolbar-title>
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
                  @click="deleteRoles"
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
                <json-excel :data="roles">
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
                          v-model="editedRole.name"
                          :error-messages="nameErrors"
                          label="Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedRole.name.$touch()"
                          @keydown.enter="save"
                          @keydown.esc="close"
                        ></v-text-field>

                        <v-autocomplete
                          v-model="editedRole.permissions"
                          :error-messages="permErrors"
                          required
                          :items="perms"
                          item-text="name"
                          item-value="id"
                          multiple
                          chips
                          small-chips
                          label="Select Permissions"
                        >
                          <template v-slot:selection="{ item, index }">
                            <v-chip small v-if="index === 0">
                              <span>{{ item.name }}</span>
                            </v-chip>
                            <span v-if="index === 1" class="grey--text caption"
                              >(+{{
                                editedRole.permissions.length - 1
                              }}
                              others)</span
                            >
                          </template>
                        </v-autocomplete>
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
            :disabled="roles.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.name == 'Super Admin' || item.users.length > 0"
            :disabled="item.name == 'Super Admin' || item.users.length > 0"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.permissions="{ item }">
          <span
            style="cursor:pointer;"
            v-if="item.permissions.length > 0"
            @click="popPerm(item)"
          >
            <span
              v-for="(permission, index) in item.permissions"
              :key="permission.id"
            >
              <v-chip small color="primary darken-2" v-if="index === 0">
                {{ permission.name }}
              </v-chip>
            </span>
            <span v-if="item.permissions.length - 1 > 0">
              (+{{ item.permissions.length - 1 }} other{{
                item.permissions.length - 1 != 1 ? "s" : ""
              }})
            </span>
          </span>
          <v-chip small color="secondary" v-if="item.permissions.length <= 0">
            None
          </v-chip>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" title="Edit" @click="editRole(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editRole(item, 2)">
            mdi-content-duplicate
          </v-icon>
        </template>
      </v-data-table>
    </v-container>

    <PermissionsDialog />
    
  </div>
  
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import JsonExcel from "vue-json-excel";

import PermissionsDialog from "./templates/PermissionsDialog";

export default {
  components: {
    PermissionsDialog,
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
        { text: "Permissions", align: "left", value: "permissions" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedRole: {
        name: "",
        permissions: null
      },
      defaultRole: {
        name: "",
        permissions: null
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedRole: {
      name: {
        required,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isName = this.roles.filter(role => {
            return role.name == value;
          }).length;
          if (isName === 1) {
            return false;
          } else {
            return true;
          }
        }
      },
      permissions: { required }
    }
  },

  computed: {
    ...mapGetters({
      roles: "role/getRoles",
      perms: "perm/getPerms",
      roleErrors: "role/getRoleErrors"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New Role" : "Edit Role";
    },

    nameErrors() {
      const errors = [];
      if (!this.$v.editedRole.name.$dirty) return errors;

      var nameRequiredError = null;
      if (this.roleErrors["name|required"]) {
        nameRequiredError = this.roleErrors["name|required"];
      } else {
        nameRequiredError = "The name field is required.";
      }

      var nameUniqueError = null;
      if (this.roleErrors["name|unique"]) {
        nameUniqueError = this.roleErrors["name|unique"];
      } else {
        nameUniqueError = "The name already taken.";
      }

      !this.$v.editedRole.name.required && errors.push(nameRequiredError);
      !this.$v.editedRole.name.isUnique && errors.push(nameUniqueError);
      return errors;
    },

    permErrors() {
      const errors = [];
      if (!this.$v.editedRole.permissions.$dirty) return errors;

      var permRequiredError = null;
      if (this.roleErrors["permissions|required"]) {
        permRequiredError = this.roleErrors["permissions|required"];
      } else {
        permRequiredError = "The permission field is required.";
      }

      !this.$v.editedRole.permissions.required &&
        errors.push(permRequiredError);
      return errors;
    }
  },

  watch: {
    roles() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("role/fetchRoles");
    this.$store.dispatch("perm/fetchPerms");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("role/fetchRoles");
      this.$store.dispatch("perm/fetchPerms");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedRole = Object.assign({}, this.defaultRole); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editRole(role, action) {
      this.editedIndex = action == 2 ? -1 : this.roles.indexOf(role); // set index: important

      const permIds = role.permissions.map(perm => perm.id); // get permission ids
      console.log(permIds);
      this.editedRole = Object.assign(
        {},
        {
          id: role.id,
          name: role.name,
          permissions: permIds
        }
      );
      this.$store.dispatch("triggerDialog", true);
    },

    deleteRoles() {
      const roles = this.$data.selected;
      const roleIds = roles.map(role => {
        return role.id;
      });
      const roleNames = roles.map(role => {
        const lists = "<br />" + role.name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" + roleNames,
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
            this.$store.dispatch("role/deleteRoles", roleIds);
            this.$data.selected = []; // reset selected
          }
        });
    },

    close() {
      this.editedIndex = -1;
      this.editedRole = {};
      this.$v.$reset();
      this.$store.dispatch("triggerDialog", false);
    },

    save() {
      this.$v.$touch();
      if (this.editedIndex > -1) {
        // update role
        this.$store.dispatch("role/updateRole", this.editedRole);
      } else {
        // store role
        this.$store.dispatch("role/storeRole", this.editedRole);
      }
    },

    popPerm(item) {
      let payload = {
        dialog: true,
        item: item
      };
      this.$store.commit("role/SET_ROLE_ITEM", payload); // open dialog
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (!item.users.length > 0) {
            self.selected.push(item);
          }
        });
        self.disabledCount = this.current_items - this.selected.length;
      } else this.selected = [];
    },

    currentItems(props) {
      this.current_items = props.length;
    }
  }
};
</script>
