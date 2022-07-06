<template>
  <nav>
    <v-app-bar app clipped-left isDark>
      <!-- <v-app-bar-nav-icon @click.stop="drawer"></v-app-bar-nav-icon> -->
      <v-btn icon @click.stop="drawer">
        <v-icon>{{ toggleDrawer ? "mdi-menu" : "mdi-menu-open" }}</v-icon>
      </v-btn>
      <v-img
        src="/addessa_logo.png"
        max-width="40"
        max-height="40"
        style="margin: 5px"
      ></v-img>
      <v-toolbar-title> <strong>Addessa Portal</strong></v-toolbar-title>

      <v-spacer></v-spacer>
      <v-tooltip-title class="flex text-end">
        <strong style="text-align: center">Addessa {{currentUser.branch.name}}</strong>
      </v-tooltip-title>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="goDark">
            <v-icon>
              {{ isDark ? "mdi-brightness-4" : "mdi-brightness-7" }}
            </v-icon>
          </v-btn>
        </template>
        <span>{{ isDark ? "Go Dark" : "Go Light" }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="logout">
            <v-icon>logout</v-icon>
          </v-btn>
        </template>
        <span>Logout</span>
      </v-tooltip>
    </v-app-bar>
  </nav>
</template>

<script>
export default {
  methods: {
    drawer() {
      this.$store.state.drawer = !this.$store.state.drawer;
    },

    logout() {
      this.$store.commit("logout");
      this.$router.push("/login");
    },

    goDark() {
      this.$store.state.goDark = !this.$store.state.goDark;
    },
  },

  created() {
    console.log(this.$store.getters.currentUser);
  },

  computed: {
    currentUser() {
      return this.$store.getters.currentUser;
    },

    loadingStatus() {
      return this.$store.state.loading;
    },

    isDark() {
      return this.$store.state.goDark;
    },

    toggleDrawer() {
      return this.$store.state.drawer;
    },
  },
};
</script>
