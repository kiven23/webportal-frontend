import actions from "./actions";

const state = {
  categories: [],
  errors: []
};

const getters = {
  getCategories(state) {
    return state.categories;
  },
  getCategoryErrors(state) {
    return state.errors;
  }
};

const mutations = {
  SET_CATEGORY(state, categories) {
    state.categories = categories;
  },

  STORE_CATEGORY(state, category) {
    state.categories.unshift(category);
  },

  UPDATE_CATEGORY(state, payload) {
    state.categories = state.categories.map(category => {
      if (category.id === payload.id) {
        return Object.assign({}, category, payload);
      }
      return category;
    });
  },

  DELETE_CATEGORIES(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.categories.findIndex(
        category => category.id === payload[i].id
      );
      state.categories.splice(index, 1);
    }
  },

  CATEGORY_ERROR(state, errors) {
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
