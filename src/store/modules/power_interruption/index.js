import actions from "./actions";

const state = {
  powerinterruptions: [],
  errors: [],
  powerinterruptionItem: []
};

const getters = {
  getPowerInterruptions(state) {
    return state.powerinterruptions;
  },
  getPowerInterruptionErrors(state) {
    return state.errors;
  },
  getPowerInterruptionItem(state) {
    return state.powerinterruptionItem;
  }
};

const mutations = {
  SET_POWERINTERRUPTION(state, powerinterruptions) {
    state.powerinterruptions = powerinterruptions;
  },

  STORE_POWERINTERRUPTION(state, powerinterruption) {
    state.powerinterruptions.unshift(powerinterruption);
  },

  UPDATE_POWERINTERRUPTION(state, payload) {
    state.powerinterruptions = state.powerinterruptions.map(
      powerinterruption => {
        if (powerinterruption.id === payload.id) {
          return Object.assign({}, powerinterruption, payload);
        }
        return powerinterruption;
      }
    );
  },

  DELETE_POWERINTERRUPTIONS(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.powerinterruptions.findIndex(
        powerinterruption => powerinterruption.id === payload[i].id
      );
      state.powerinterruptions.splice(index, 1);
    }
  },

  POWERINTERRUPTION_ERROR(state, errors) {
    state.errors = errors;
  },

  SET_POWERINTERRUPTION_ITEM(state, payload) {
    state.powerinterruptionItem = payload.item;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
