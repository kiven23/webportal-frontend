import actions from "./actions";

const state = {
  cdr_data: [],
  branches_data: [],
  attachment_data: ''
 
};
const getters = {
  getCdr(state) {
    return state.cdr_data
  },
  getBranches(state) {
    return state.branches_data
  },
  getAttachment(state) {
    return state.attachment_data
  },
};
 
const mutations = {
  GET_CDR(state, payload) {
    state.cdr_data = payload;
  },
  GET_BRANCHES(state, payload) {
    state.branches_data = payload;
  },
  ATTACHMENT_DATA(state, payload) {
    state.attachment_data = payload;
  },
};
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
