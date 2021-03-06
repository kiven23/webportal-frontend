import Vue from "vue";
import Vuex from "vuex";

import axios from "axios";

import rootUrl from "./rootUrl";
const dateUrl = rootUrl + "/api/date";

import user from "./modules/user/index";
import employment from "./modules/user/employment/index";
import branch from "./modules/branch/index";
import bsched from "./modules/branch/schedule/index";
import region from "./modules/region/index";
import division from "./modules/division/index";
import department from "./modules/department/index";
import position from "./modules/position/index";
import role from "./modules/role/index";
import permission from "./modules/permission/index";

// Products
import productItem from "./modules/product/item/index";
import productBrand from "./modules/product/brand/index";
import productCategory from "./modules/product/category/index";

// Services
import serviceType from "./modules/service/type/index";
import serviceCategory from "./modules/service/category/index";
import serviceProvider from "./modules/service/provider/index";

// Tickets
import computerwareTicket from "./modules/ticket/computerware/index";
import connectivityTicket from "./modules/ticket/connectivity/index";

// Power Interruptions
import PowerInterruption from "./modules/power_interruption/index";

// Pending Transactions
import PendingTran from "./modules/pending_tran/index";

// Archived
import Archived from "./modules/government_compliance/archived/index";
// Agencies
import Agencies from "./modules/government_compliance/agencies/index";

// GetUserPermission
import UsersPermissions from "./modules/user_roles/index";
import { getLocalUser } from "../helpers/auth";
// BlackLIsted
import BlackListed from "./modules/ccs_portal/blacklisted/index";
// Digitized
import Digitized from "./modules/ccs_portal/customer_digitized/index";
const localUser = getLocalUser();
// Credit Standing
import CreditStanding from "./modules/ccs_portal/creditportal/index";
// IncomingPayment
import IncomingPayment from "./modules/ccs_portal/installment/index";
// Reconciliation
import AgingRecon from "./modules/ccs_portal/aging_recon/index";

import DunningLetters from "./modules/ccs_portal/dunning_letters/index";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    user: user,
    employment: employment,
    branch: branch,
    bsched: bsched,
    region: region,
    division: division,
    department: department,
    position: position,
    role: role,
    perm: permission,
    productItem: productItem,
    productBrand: productBrand,
    productCategory: productCategory,
    serviceType: serviceType,
    serviceCategory: serviceCategory,
    serviceProvider: serviceProvider,
    computerwareTicket: computerwareTicket,
    connectivityTicket: connectivityTicket,
    powerInterruption: PowerInterruption,
    pendingTran: PendingTran,
    userPermissions: UsersPermissions,
    //Govt' Compliance
     archived: Archived,
     agencies: Agencies,
    //BlackListed
     blacklisted: BlackListed,
    //Digitized
     digitized:  Digitized,
    //CreditPortal 
     creditstanding: CreditStanding,
    //Incoming Payment
     incomingpayment: IncomingPayment,
    //Aging Reconciliation
     recon: AgingRecon,
     //Dunning Letters
     dunning: DunningLetters,
      
  },
  state: {
    serverdate: [],
    windowSize: {
      width: 0,
      height: 0
    },
    drawer: true,
    loading: true,
    loading2: true,
    dialog: false,
    dialog2: false,
    snackbar: false,
    snackbarText: "",
    snackbarTimeout: 0,
    goDark: false,
    // auth
    currentUser: localUser,
    isLoggedIn: !!localUser,
    auth_error: null
  },
  getters: {
    serverDate(state) {
      return state.serverdate;
    },
    // auth
    isLoggedIn(state) {
      return state.isLoggedIn;
    },
    currentUser(state) {
      return state.currentUser;
    },
    authError(state) {
      return state.auth_error;
    },
    goDark(state) {
      return state.goDark;
    }
  },
  mutations: {
    SET_DATE(state, data) {
      state.serverdate = data;
      console.log(state.serverdate);
    },

    WINDOW_SIZE(state) {
      state.windowSize.width = window.innerWidth;
      state.windowSize.height = window.innerHeight;
    },

    DRAWER_STATUS(state, status) {
      state.drawer = status;
    },
    LOADING_STATUS(state, loading) {
      state.loading = loading;
    },
    LOADING_STATUS2(state, loading) {
      state.loading2 = loading;
    },
    DIALOG_STATUS(state, dialog) {
      state.dialog = dialog;
    },
    SNACKBAR_STATUS(state, payload) {
      state.loading = false; // set loading to false
      state.snackbar = payload[0].status;
      state.snackbarText = payload[0].message;
      state.snackbarTimeout = payload[0].timeout;
      // change snackbar state afer timeout
      setTimeout(function() {
        state.snackbar = false;
      }, payload[0].timeout);
    },
    // auth
    login(state) {
      state.loading = true;
      state.auth_error = null;
    },
    loginSuccess(state, payload) {
      state.auth_error = null;
      state.isLoggedIn = true;
      state.loading = false;
      state.currentUser = Object.assign({}, payload.user, {
        token: payload.access_token
      });

      localStorage.setItem("user", JSON.stringify(state.currentUser));
    },
    logout(state) {
      localStorage.removeItem("user");
      state.isLoggedIn = false;
      state.currentUser = null;
      state.loading = false;
    }
  },
  actions: {
    triggerDialog(context, dialog) {
      context.commit("DIALOG_STATUS", dialog);
    },
 

    // auth
    login(context) {
      context.commit("login");
    },
    fetchDate(context) {
      axios.get(dateUrl).then(response => {
        context.commit("SET_DATE", response.data);
      });
    }
  }
});
