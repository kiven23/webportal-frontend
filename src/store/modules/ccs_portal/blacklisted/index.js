import actions from "./actions";

const state = {
  blacklisted_data: [],
  segment_data: [],
  series_data: [],
 
};

const getters = {
  getBlackListed(state) {
    return state.blacklisted_data
  },
  getBranchSegment(state) {
    return state.segment_data
  },
  getBranchSeries(state) {
    return state.series_data
  },
 
 
};
const mutations = {
  GET_BLACKLISTED(state, payload) {
    state.blacklisted_data = payload;
  },
  GET_SEGMENT(state, payload) {
    state.segment_data = payload;
  },
  GET_SERIES(state, payload) {
    state.series_data = payload;
  },
 
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
