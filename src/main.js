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
import AxiosPlugin from 'vue-axios-cors';
Vue.use(Vuesax, {
  // options here
})
Vue.use(AxiosPlugin)
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
