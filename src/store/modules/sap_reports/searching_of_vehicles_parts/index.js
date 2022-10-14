import actions from "./actions";

const state = {
  vehicleparts_data: [],
  vehicletypes_data: [],
  vehiclequeries_data: []
};

const getters = {
  PARTS(state) {
    return state.vehicleparts_data
  },
  TYPES(state) {
    return state.vehicletypes_data
  },
  QUERIES(state) {
    return state.vehiclequeries_data
  },
  
 
};
const mutations = {
  GET_VEHICLEPARTS(state, payload) {
    state.vehicleparts_data = payload;
  },
  GET_VEHICLETYPE(state, payload) {
    state.vehicletypes_data = payload;
  },
  GET_VEHICLETQUERIES(state, payload) {
    state.vehiclequeries_data = payload;
  },
 
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
