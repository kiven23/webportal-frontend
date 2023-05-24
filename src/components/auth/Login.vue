<template>
  <v-container fluid fill-height style="background: linear-gradient(180deg, rgba(112,43,43,0.05504208519345233) 2%, rgba(31,62,126,1) 17%); " >
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md5>
        <v-card class="elevation-12">
          <v-toolbar dark  style="background: linear-gradient(180deg, rgba(112,43,43,0.05504208519345233) 2%, rgba(31,62,126,1) 17%); " >
            <v-img
              src="/addessa_logo.png"
              max-width="50"
              max-height="50"
              class="mr-2"
            ></v-img
            ><v-toolbar-title
              ><strong>Webportal Pro V1</strong></v-toolbar-title
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
              color="primary"
              @click="authenticate"
              :loading="loadingStatus"
              >Login</v-btn
            >
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
