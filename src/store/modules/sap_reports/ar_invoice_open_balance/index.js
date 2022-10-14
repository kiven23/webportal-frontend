import actions from "./actions";

const state = {
  query_data: [],
  segment_data: []
};

const getters = {
  QUERY(state) {
    return state.query_data
  },
  getBranchSegment(state) {
    return state.segment_data
  },
 
};
const mutations = {
  GET_QUERY(state, payload) {
    state.query_data = payload;
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
