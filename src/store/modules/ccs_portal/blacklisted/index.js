import actions from "./actions";

const state = {
  blacklisted_data: [],
  segment_data: []
};

const getters = {
  getBlackListed(state) {
    return state.blacklisted_data
  },
  getBranchSegment(state) {
    return state.segment_data
  },
 
};
const mutations = {
  GET_BLACKLISTED(state, payload) {
    state.blacklisted_data = payload;
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
