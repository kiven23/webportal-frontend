<template>
  <v-container fluid fill-height style="background:linear-gradient(0deg, rgba(0,0,195,1) 0%, rgba(37,63,182,1) 72%, rgba(255,255,255,1) 100%); " >
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md5>
        <v-card class="elevation-12">
          <v-toolbar dark  style="background: linear-gradient(0deg, rgba(0,0,195,1) 0%, rgba(37,63,182,1) 72%, rgba(255,255,255,1) 100%); " >
            <v-img
              src="/addessa_logo.png"
              max-width="50"
              max-height="50"
              class="mr-2"
            ></v-img
            ><v-toolbar-title
              ><strong>Webportal Pro V1.2</strong></v-toolbar-title
            >
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                autofocus
                prepend-icon="person"
                v-model="form.email"
                label="Username"
                type="text"
                @keydown.enter="authenticate"
              ></v-text-field>
              <v-text-field
                prepend-icon="lock"
                v-model="form.password"
                label="Password"
                type="password"
                @keydown.enter="authenticate"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
           <v-btn
  :style="{
    background: 'linear-gradient(45deg, #42a5f5, #7e57c2)',
    color: 'white'
  }"
  @click="authenticate"
  :loading="loadingStatus"
>
  <v-icon left>mdi-login</v-icon>Login
</v-btn>

          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { login } from "../../helpers/auth";

export default {
  name: "login",
  data() {
    return {
      form: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    authenticate() {
      this.$store.dispatch("login");

      login(this.$data.form)
        .then((response) => {
          this.$store.commit("loginSuccess", response);
          this.$router.push({ path: "/" });
        })
        .catch((error) => {
          const networkError = error;
          let payload = [
            { status: true, message: networkError, timeout: 3000 },
          ];
          this.$store.commit("SNACKBAR_STATUS", payload, { root: true });
        });
    },
  },

  computed: {
    loadingStatus() {
      return this.$store.state.loading;
    },
  },

  created() {
    this.$store.commit("LOADING_STATUS", false, { root: true });
  },
};
</script>
