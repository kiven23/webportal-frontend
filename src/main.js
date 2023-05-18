import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import moment from "moment";
import { initialize } from "./helpers/general";
import Vuesax from 'vuesax'
import VueHtmlToPaper from 'vue-html-to-paper';
import 'vuesax/dist/vuesax.css' //Vuesax styles
import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'
 
 
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import VueGoodTable from 'vue-good-table';
Vue.use(VueGoodTable);
import 'vue-good-table/dist/vue-good-table.css';
import VueSweetalert2 from 'vue-sweetalert2';

// If you don't need the styles, do not connect
import 'sweetalert2/dist/sweetalert2.min.css';

Vue.use(VueSweetalert2);
 
AOS.init();
/* Establish Connection */
// const socketConnection = SocketIO('http://192.168.1.19:3378');
// Vue.use(new VueSocketIO({
//     debug: false,
//     connection:socketConnection 
//   })
// );
var vueAwesomeCountdown = require('vue-awesome-countdown').default;

Vue.use(vueAwesomeCountdown);

Vue.use(Vuesax, {
  // options here
})
 
Vue.use(VueHtmlToPaper);
Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.prototype.moment = moment;

initialize(store, router);

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount("#app");
