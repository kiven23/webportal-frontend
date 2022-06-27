<template>
  <div>
    <v-container grid-list-md text-xs-center>
      <v-data-table
        v-model="selected"
        :headers="headers"
        :items="users"
        :items-per-page="itemsPerPage"
        :search="search"
        :loading="loadingStatus"
        single-expand
        show-expand
        show-select
        class="elevation-1"
        @toggle-select-all="selectAllToggle"
        @current-items="currentItems"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Users</v-toolbar-title>
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
                  @click="deleteUsers"
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
                <json-excel :data="users">
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

            <v-dialog scrollable persistent :value="dialog" max-width="500px">
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
                          v-model="editedUser.first_name"
                          :error-messages="firstNameErrors"
                          label="First Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedUser.first_name.$touch()"
                          @keydown.enter="save"
                        ></v-text-field>
                        <v-text-field
                          v-model="editedUser.last_name"
                          :error-messages="lastNameErrors"
                          label="Last Name"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedUser.last_name.$touch()"
                          @keydown.enter="save"
                        ></v-text-field>
                        <v-text-field
                          v-model="editedUser.email"
                          :error-messages="emailErrors"
                          label="Email"
                          required
                          :disabled="loadingStatus"
                          @input="$v.editedUser.email.$touch()"
                          @keydown.enter="save"
                        ></v-text-field>
                        <v-text-field
                          v-model="editedUser.password"
                          :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                          label="Password"
                          :type="showPass ? 'text' : 'password'"
                          required
                          :disabled="loadingStatus"
                          @keydown.enter="save"
                          @click:append="showPass = !showPass"
                        ></v-text-field>
                        <v-autocomplete
                          v-model="editedUser.branch"
                          :search-input="editedUser.branch"
                          :error-messages="branchErrors"
                          :items="branches"
                          item-text="name"
                          item-value="id"
                          label="Select Branch"
                          filled
                        ></v-autocomplete>
                        <v-autocomplete
                          v-model="editedUser.roles"
                          required
                          :items="roles"
                          item-text="name"
                          item-value="id"
                          multiple
                          chips
                          small-chips
                          label="Select Roles"
                          filled
                        >
                          <template v-slot:selection="{ item, index }">
                            <v-chip small v-if="index === 0">
                              <span>{{ item.name }}</span>
                            </v-chip>
                            <span v-if="index === 1" class="grey--text caption"
                              >(+{{ editedUser.roles.length - 1 }} others)</span
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

        <template v-slot:expanded-item="{ item }">
          <td :colspan="headers.length" class="text-xs-center">
            <v-list-item two-line="">
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.first_name.toUpperCase() }}&nbsp;{{
                    item.last_name.toUpperCase()
                  }}
                </v-list-item-title>
                <v-list-item-title>Branch</v-list-item-title>
                <v-list-item-subtitle>
                  {{ item.branch ? item.branch.name : "None" }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </td>
        </template>

        <template v-slot:header.data-table-select="{ on, props }">
          <v-simple-checkbox
            v-bind="props"
            v-on="on"
            :disabled="users.length === disabledCount"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.data-table-select="{ item, isSelected, select }">
          <v-simple-checkbox
            :value="isSelected"
            :readonly="item.email == 'alexela8882@gmail.com'"
            :disabled="item.email == 'alexela8882@gmail.com'"
            @input="select($event)"
          ></v-simple-checkbox>
        </template>

        <template v-slot:item.roles="{ item }">
          <span
            style="cursor:pointer;"
            v-if="item.roles.length > 0"
            @click="popRole(item)"
          >
            <span v-for="(role, index) in item.roles" :key="role.id">
              <v-chip small color="primary darken-2" v-if="index === 0">
                {{ role.name }}
              </v-chip>
            </span>
            <span v-if="item.roles.length - 1 > 0">
              (+{{ item.roles.length - 1 }} other{{
                item.roles.length - 1 != 1 ? "s" : ""
              }})
            </span>
          </span>
          <v-chip small color="secondary" v-if="item.roles.length <= 0">
            None
          </v-chip>
        </template>

        <template v-slot:item.action="{ item }">
          <v-icon small class="mr-2" title="Edit" @click="editUser(item, 1)">
            mdi-pencil
          </v-icon>
          <v-icon small title="Duplicate" @click="editUser(item, 2)">
            mdi-content-duplicate
          </v-icon>
        </template>
      </v-data-table>
      
    </v-container>

    <RolesDialog />
  </div>
</template>

<script>
// import { mapState } from 'vuex'
// import { mapActions } from 'vuex'
import { mapGetters } from "vuex";

import { validationMixin } from "vuelidate";
import { required, email } from "vuelidate/lib/validators";

import RolesDialog from "./templates/RolesDialog";

import JsonExcel from "vue-json-excel";

export default {
  components: {
    RolesDialog,
    JsonExcel
  },

  mixins: [validationMixin],

  data() {
    return {
      expand: false,
      showPass: false,
      search: "",
      disabledCount: 0,
      selected: [],
      headers: [
        { text: "Name", align: "left", value: "full_name" },
        { text: "Email", align: "left", value: "email" },
        { text: "Roles", align: "left", value: "roles" },
        { text: "Actions", align: "center", value: "action", sortable: false }
      ],
      editedIndex: -1,
      editedUser: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        branch: "",
        roles: [{ id: "", name: "" }]
      },
      defaultUser: {
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        branch: "",
        roles: []
      },
      itemsPerPage: 5,
      current_items: 0
    };
  },

  validations: {
    editedUser: {
      first_name: { required },
      last_name: { required },
      branch: { required },
      email: {
        required,
        email,
        isUnique(value) {
          // custom validation
          if (value === "") return true;

          const isEmail = this.users.filter(user => user.email == value).length;
          if (isEmail > 0) {
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
      users: "user/getUsers",
      branches: "branch/getBranches",
      roles: "role/getRoles",
      userErrors: "user/getUserErrors"
    }),

    dialog() {
      return this.$store.state.dialog;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    loggedUser() {
      return this.$store.state.currentUser;
    },

    formTitle() {
      return this.editedIndex === -1 ? "New User" : "Edit User";
    },

    firstNameErrors() {
      const errors = [];
      if (!this.$v.editedUser.first_name.$dirty) return errors;

      var firstNameRequiredError = null;
      if (this.userErrors["first_name|required"]) {
        firstNameRequiredError = this.userErrors["first_name|required"];
      } else {
        firstNameRequiredError = "The first name field is required.";
      }

      !this.$v.editedUser.first_name.required &&
        errors.push(firstNameRequiredError);
      return errors;
    },
    lastNameErrors() {
      const errors = [];
      if (!this.$v.editedUser.last_name.$dirty) return errors;

      var firstNameRequiredError = null;
      if (this.userErrors["last_name|required"]) {
        firstNameRequiredError = this.userErrors["last_name|required"];
      } else {
        firstNameRequiredError = "The last name field is required.";
      }

      !this.$v.editedUser.last_name.required &&
        errors.push(firstNameRequiredError);
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.editedUser.email.$dirty) return errors;

      var emailRequiredError = null;
      if (this.userErrors["email|required"]) {
        emailRequiredError = this.userErrors["email|required"];
      } else {
        emailRequiredError = "The email field is required.";
      }

      var emailUniqueError = null;
      if (this.userErrors["email|unique"]) {
        emailUniqueError = this.userErrors["email|unique"];
      } else {
        emailUniqueError = "The email has already been taken.";
      }

      !this.$v.editedUser.email.email && errors.push("Must be valid e-mail");
      !this.$v.editedUser.email.required && errors.push(emailRequiredError);
      !this.$v.editedUser.email.isUnique && errors.push(emailUniqueError);
      return errors;
    },
    branchErrors() {
      const errors = [];
      if (!this.$v.editedUser.branch.$dirty) return errors;

      var branchRequiredError = null;
      if (this.userErrors["branch|required"]) {
        branchRequiredError = this.userErrors["branch|required"];
      } else {
        branchRequiredError = "Please select branch.";
      }

      !this.$v.editedUser.branch.required && errors.push(branchRequiredError);
      return errors;
    }
  },

  watch: {
    users() {
      this.$v.$reset(); // reset validation
    }
  },

  created() {
    this.$store.dispatch("user/fetchUsers");
    this.$store.dispatch("branch/fetchBranches");
    this.$store.dispatch("role/fetchRoles");
  },

  methods: {
    refreshData() {
      this.$store.dispatch("user/fetchUsers");
      this.$store.dispatch("branch/fetchBranches");
      this.$store.dispatch("role/fetchRoles");
    },

    openDialog() {
      this.editedIndex = -1; // reset default: important
      this.editedUser = Object.assign({}, this.defaultUser); // reset to default
      this.$store.dispatch("triggerDialog", true);
    },

    editUser(user, action) {
      this.editedIndex = action == 2 ? -1 : this.users.indexOf(user); // set index: important

      const roleIds = user.roles.map(role => role.id); // get role ids
      this.editedUser = Object.assign(
        {},
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          branch: user.branch.id,
          roles: roleIds
        }
      );
      this.$store.dispatch("triggerDialog", true);
    },

    deleteUsers() {
      const users = this.$data.selected;
      const userIds = users.map(user => {
        return user.id;
      });
      const userNames = users.map(user => {
        const lists = "<br />" + user.first_name + " " + user.last_name;
        return lists;
      });

      this.$dialog
        .warning({
          text:
            "<h3><em>You are about to delete an item(s):</em></h3>" + userNames,
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
            this.$store.dispatch("user/deleteUsers", userIds);
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
        // update user
        this.$store.dispatch("user/updateUser", this.editedUser);
      } else {
        // store user
        this.$store.dispatch("user/storeUser", this.editedUser);
      }
    },

    popRole(item) {
      let payload = {
        dialog: true,
        item: item
      };
      this.$store.commit("user/SET_USER_ITEM", payload); // open dialog
    },

    selectAllToggle(props) {
      if (this.selected.length != this.current_items - this.disabledCount) {
        this.selected = [];
        const self = this;
        props.items.forEach(item => {
          if (item.email != "alexela8882@gmail.com") self.selected.push(item);
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
