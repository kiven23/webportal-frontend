import actions from "./actions";

const state = {
  agencies_data: [],
  date_history: [],
  errors: [],
};

const getters = {
  getAgencies(state) {
    return state.agencies_data
  },
  getdate_history(state) {
    return state.date_history
  },
};

const mutations = {
  GET_AGENCIES(state, payload) {
    state.agencies_data = payload;
  },
  DATE_HISTORY(state, payload) {
    state.date_history = payload;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
