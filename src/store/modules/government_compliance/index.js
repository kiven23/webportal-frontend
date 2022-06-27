import actions from "./actions";

const state = {
  archived_data: [],
  errors: [],
};

const getters = {
  getArchived(state) {
    return state.archived_data
  },
  // getProviderErrors(state) {
  //   return state.errors;
  // }
};

const mutations = {
  GET_PROVIDER(state, payload) {
    state.archived_data = payload;
  },

  // STORE_PROVIDER(state, provider) {
  //   state.providers.unshift(provider);
  // },

  // UPDATE_PROVIDER(state, payload) {
  //   state.providers = state.providers.map(provider => {
  //     if (provider.id === payload.id) {
  //       return Object.assign({}, provider, payload);
  //     }
  //     return provider;
  //   });
  // },

  // DELETE_PROVIDERS(state, payload) {
  //   for (var i = payload.length - 1; i >= 0; i--) {
  //     var index = state.providers.findIndex(
  //       provider => provider.id === payload[i].id
  //     );
  //     state.providers.splice(index, 1);
  //   }
  // },

  // PROVIDER_ERROR(state, errors) {
  //   state.errors = errors;
  // }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
