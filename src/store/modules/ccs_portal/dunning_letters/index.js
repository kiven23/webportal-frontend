import actions from "./actions";

import Vue from "vue";

const state = {
  overdues_data: [],
  downloading: {}, 
  // branches_data: [],
  // agings_data:[],
};
const getters = {
  getOverdues(state) {
    return state.overdues_data
  },
  getDownloadingStatus(state) {
    return state.downloading
  },
  //TO BE DELETE
  getBranches(state) {
    return state.branches_data
  },
  getAgings(state) {
    return state.agings_data
  },
};
 
const mutations = {
  GET_OVERDUES(state, payload) {
    state.overdues_data = payload;
  },
  DOWNLOADING_STATUS(state, payload) {
    Vue.set(state.downloading, payload.index, payload.value);
  },
  //TO BE DELETE
  GET_BRANCHES(state, payload) {
    state.branches_data = payload;
  },
  GET_AGINGS(state, payload) {
    state.agings_data = payload;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
