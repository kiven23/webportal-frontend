import actions from "./actions";

const state = {
  providers: [],
  errors: []
};

const getters = {
  getProviders(state) {
    return state.providers;
  },
  getProviderErrors(state) {
    return state.errors;
  }
};

const mutations = {
  SET_PROVIDER(state, providers) {
    state.providers = providers;
  },

  STORE_PROVIDER(state, provider) {
    state.providers.unshift(provider);
  },

  UPDATE_PROVIDER(state, payload) {
    state.providers = state.providers.map(provider => {
      if (provider.id === payload.id) {
        return Object.assign({}, provider, payload);
      }
      return provider;
    });
  },

  DELETE_PROVIDERS(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.providers.findIndex(
        provider => provider.id === payload[i].id
      );
      state.providers.splice(index, 1);
    }
  },

  PROVIDER_ERROR(state, errors) {
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
