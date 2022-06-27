import Vue from "vue";
import Vuetify from "vuetify/lib";
import VuetifyDialog from "vuetify-dialog";
import { Ripple } from "vuetify/lib/directives";
import "vuetify-dialog/dist/vuetify-dialog.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
Vue.use(Vuetify, {
  directives: { Ripple }
});
const vuetify = new Vuetify({
  theme: { dark: true }
});
Vue.use(VuetifyDialog, {
  context: {
    vuetify
  }
});
export default vuetify;
