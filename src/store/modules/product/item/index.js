import actions from "./actions";

const state = {
  items: [],
  errors: []
};

const getters = {
  getItems(state) {
    return state.items;
  },
  getItemErrors(state) {
    return state.errors;
  }
};

const mutations = {
  SET_ITEM(state, items) {
    state.items = items;
  },

  STORE_ITEM(state, item) {
    state.items.unshift(item);
  },

  UPDATE_ITEM(state, payload) {
    state.items = state.items.map(item => {
      if (item.id === payload.id) {
        return Object.assign({}, item, payload);
      }
      return item;
    });
  },

  DELETE_ITEMS(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.items.findIndex(item => item.id === payload[i].id);
      state.items.splice(index, 1);
    }
  },

  ITEM_ERROR(state, errors) {
    state.errors = errors;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
