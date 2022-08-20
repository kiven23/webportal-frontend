import actions from "./actions";

const state = {
  winner_data: [],
  
};
const getters = {
  getWinner(state) {
    return state.winner_data
  },
};
 
const mutations = {
  GET_WINNER(state, payload) {
    state.winner_data = payload;
  } 
};
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
