import actions from "./actions";
const state = {
  permissions_data: [],
  permission: []
};
const getters = {
  getPermissions(state) {
    return state.permissions_data
  },
  getPermission(state) {
    return state.permission
  },
};
const mutations = {
  GET_PERMISSIONS(state, payload) {
    state.permissions_data = payload;
  },
  GET_PERMISSION(state, payload) {
    state.permission = payload;
  },
};
export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
