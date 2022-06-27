import actions from "./actions";

const state = {
  types: [],
  errors: []
};

const getters = {
  getTypes(state) {
    return state.types;
  },
  getTypeErrors(state) {
    return state.errors;
  }
};

const mutations = {
  SET_TYPE(state, types) {
    state.types = types;
  },

  STORE_TYPE(state, type) {
    state.types.unshift(type);
  },

  UPDATE_TYPE(state, payload) {
    state.types = state.types.map(type => {
      if (type.id === payload.id) {
        return Object.assign({}, type, payload);
      }
      return type;
    });
  },

  DELETE_TYPES(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.types.findIndex(type => type.id === payload[i].id);
      state.types.splice(index, 1);
    }
  },

  TYPE_ERROR(state, errors) {
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
