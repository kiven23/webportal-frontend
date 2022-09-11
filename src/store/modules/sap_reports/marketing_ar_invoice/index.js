import actions from "./actions";

const state = {
  paymentcrb_data: [],
  segment_data: []
};

const getters = {
  getPaymentCRB(state) {
    return state.paymentcrb_data
  },
  getBranchSegment(state) {
    return state.segment_data
  },
 
};
const mutations = {
  GET_PAYMENTCRB(state, payload) {
    state.paymentcrb_data = payload;
  },
  GET_SEGMENT(state, payload) {
    state.segment_data = payload;
  },
 
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
