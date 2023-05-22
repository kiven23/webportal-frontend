<template>
 
  <v-app style="background: #E9F0F6">
     <!-- <v-vanta v-if="this.$route.name == 'login'" effect="rings" :options="options">
      </v-vanta> -->
    <!-- Navbar -->
    <Navbar v-if="isLoggedIn" />

    <!-- Toolbar -->
    <Toolbar v-if="isLoggedIn" />

    <!-- Content -->
    <v-content>
      <router-view></router-view>
    </v-content>

    <!-- Footer -->
    <Footer v-if="isLoggedIn" />

    <!-- Snackbar -->
    <Snackbar />
       
  </v-app>
 
</template>

<script>
import Navbar from "./components/layouts/Navbar";
import Toolbar from "./components/layouts/Toolbar";
import Footer from "./components/layouts/Footer";
import Snackbar from "./components/layouts/Snackbar";
//import VVanta from 'vue-vanta';
export default {
  
  components: {
    // VVanta,
    Navbar,
    Toolbar,
    Footer,
    Snackbar
  },
   data(){
     return{
        options: {
            mouseControls: true,
            touchControls: true,
            minHeight: 800,
            minWidth: 100.00,
            scale: 1.00,
            scaleMobile: 1.00
        }
     }
   },
  
  created() {
     
    window.addEventListener("resize", this.handleResize);
    this.handleResize();

    const windowWidth = this.$store.state.windowSize.width;
    if (windowWidth < 769) {
      this.$store.commit("DRAWER_STATUS", false);
    }
  },

  destroyed() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    handleResize() {
      this.$store.commit("WINDOW_SIZE");
    }
  },

  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },

    goDark() {
      return this.$store.getters.goDark;
    }
  }
};
</script>
