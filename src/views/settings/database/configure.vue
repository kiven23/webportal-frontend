<template>
  <div>
    <v-container text-xs-center>
      <vs-button
        style="background-color: blanchedalmond; min-width: 70px; color: black"
        @click="dialog = true"
        animation-type="scale"
      >
        <v-img src="/sap.png" style="width: 100px"> </v-img
        ><strong>SAP B1 DATABASE</strong>
        <template #animate>
          <strong style="margin-left: 10px">CONFIGURE &#9881;</strong>
          <v-img src="/sap.png" style="width: 70px; height: 70px"></v-img>
        </template>
      </vs-button>
    </v-container>
    <v-dialog
      v-model="dialog"
 
      hide-overlay
      transition="dialog-bottom-transition"
      color="black"
    >
      <v-card color="#f2e7d0"  >
        <v-toolbar dark color="#f2e7d0" >
          <v-btn icon dark @click="dialog = false">
            <v-icon style="color: black">mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title style="color: black"
            >Database / Configure</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="submit()" style="color: black">
              Save
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-list three-line subheader>
          <v-subheader>Add Database</v-subheader>
          <v-list-item style="width: 50%">
            <v-list-item-content >
              <form >
                <v-text-field
                  v-model="host"
                  :error-messages="hostErrors"
                  label="Host"
                  required
                  @input="$v.host.$touch()"
                  @blur="$v.host.$touch()"
                ></v-text-field>
                <v-text-field
                  v-model="dbname"
                  :error-messages="dbnameErrors"
                  label="Database Name"
                  required
                  @input="$v.dbname.$touch()"
                  @blur="$v.dbname.$touch()"
                ></v-text-field>
                <v-text-field
                  v-model="username"
                  :error-messages="usernameErrors"
                  label="Username"
                  required
                  @input="$v.username.$touch()"
                  @blur="$v.username.$touch()"
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  :error-messages="passwordErrors"
                  label="Password"
                  required
                  @input="$v.password.$touch()"
                  @blur="$v.password.$touch()"
                ></v-text-field>
 
                <v-select
                  v-model="connections"
                  :items="connections"
                  :error-messages="connectionsErrors"
                  label="Connection"
                  item-text="name"
                  item-value="value"
                  required
                  @change="$v.connections.$touch()"
                  @blur="$v.connections.$touch()"
                ></v-select>
                <v-select
                  v-model="ports"
                  :items="ports"
                  :error-messages="portsErrors"
                  label="Port"
                  item-text="name"
                  item-value="value"
                  required
                  @change="$v.ports.$touch()"
                  @blur="$v.ports.$touch()"
                ></v-select>
 
              </form>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import { required, maxLength, email } from 'vuelidate/lib/validators'
export default {
    mixins: [validationMixin],
    validations: {
    host: {required},
    dbname: {required},
    username: {required},
    password:{required},
    connections: {required},
    ports: {required}
 
    },
  data() {
    return {
      dialog: false,
      host: "localhost",
      dbname: "test",
      username: "username",
      password: "password",
      connections: [
        { name: "Mssql", value: "sqlsrv" },
        { name: "mysql", value: "mysql" },
        { name: " PostgreSQL", value: "pgsql" },
      ],
      ports: [
        { name: "3306", value: "3306" },
        { name: "1433", value: "1433" },
      ],
    };
  },
  computed: {
      hostErrors () {
        const errors = []
        if (!this.$v.host.$dirty) return errors
        !this.$v.host.required && errors.push('Host is required')
        return errors
      },
      dbnameErrors () {
        const errors = []
        if (!this.$v.dbname.$dirty) return errors
        !this.$v.dbname.required && errors.push('Database Name is required')
        return errors
      },
      usernameErrors () {
        const errors = []
        if (!this.$v.username.$dirty) return errors
        !this.$v.username.required && errors.push('UserName is required')
        return errors
      },
      passwordErrors () {
        const errors = []
        if (!this.$v.password.$dirty) return errors
        !this.$v.password.required && errors.push('Password is required')
        return errors
      },
      connectionsErrors () {
        const errors = []
        if (!this.$v.connections.$dirty) return errors
        !this.$v.connections.required && errors.push('Connection is required')
        return errors
      },
      portsErrors () {
        const errors = []
        if (!this.$v.ports.$dirty) return errors
        !this.$v.ports.required && errors.push('POrt is required')
        return errors
      },
    },
    methods:{
        submit(){
            this.$v.$touch()
            let data = {
             host: this.host,                                
             dbname: this.dbname,
             username:  this.username,
             password: this.password,
             connection: this.connections,
             port: this.ports,
            }
            console.log(data)
        }
    }
};
</script>

<style>
</style>