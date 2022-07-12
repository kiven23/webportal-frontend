import actions from "./actions";

const state = {
  incoming_data: [],
  installment_data: [],
  errors: [],
  branchgrade: []
 
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
  getbranchgrade(state) {
    return state.branchgrade
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
  },
  GET_GRADE(state, payload){
    state.branchgrade = payload;
  }
  
};
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
