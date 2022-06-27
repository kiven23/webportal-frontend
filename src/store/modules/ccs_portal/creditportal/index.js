import actions from "./actions";

const state = {
  creditstanding_data: [],
};

const getters = {
  getCreditStanding(state) {
    return state.creditstanding_data
  },
 
};
const mutations = {
   GET_CREDITSTANDING(state, payload) {
    state.creditstanding_data = payload;
  },
 
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
