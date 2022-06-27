import actions from "./actions";

const state = {
  brands: [],
  errors: []
};

const getters = {
  getBrands(state) {
    return state.brands;
  },
  getBrandErrors(state) {
    return state.errors;
  }
};

const mutations = {
  SET_BRAND(state, brands) {
    state.brands = brands;
  },

  STORE_BRAND(state, brand) {
    state.brands.unshift(brand);
  },

  UPDATE_BRAND(state, payload) {
    state.brands = state.brands.map(brand => {
      if (brand.id === payload.id) {
        return Object.assign({}, brand, payload);
      }
      return brand;
    });
  },

  DELETE_BRANDS(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.brands.findIndex(brand => brand.id === payload[i].id);
      state.brands.splice(index, 1);
    }
  },

  BRAND_ERROR(state, errors) {
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
