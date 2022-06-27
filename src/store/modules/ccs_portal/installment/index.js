import actions from "./actions";

const state = {
  incoming_data: [],
  installment_data: [],
  errors: []
 
};
const getters = {
  getIncoming(state) {
    return state.incoming_data
  },
  getInstallment(state) {
    return state.installment_data
  },
  getInstallmentErr(state) {
    return state.errors
  },
 
};
 
const mutations = {
  GET_INCOMING(state, payload) {
    state.incoming_data = payload;
  },
  GET_INSTALLMENT(state, payload) {
    state.installment_data = payload;
  },
  INSTALLMENT_ERROR(state, errors) {
    state.errors = errors;
  }
  
};
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
