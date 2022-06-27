import actions from "./actions";

const state = {
  regions: [],
  errors: [],
  regionItem: [],
  branchDialog: false
};

const getters = {
  getRegions(state) {
    return state.regions;
  },
  getRegionErrors(state) {
    return state.errors;
  },
  getBranchDialog(state) {
    return state.branchDialog;
  },
  getRegionItem(state) {
    return state.regionItem;
  }
};

const mutations = {
  SET_REGION(state, regions) {
    state.regions = regions;
  },

  STORE_REGION(state, region) {
    state.regions.unshift(region);
  },

  UPDATE_REGION(state, payload) {
    state.regions = state.regions.map(region => {
      if (region.id === payload.id) {
        return Object.assign({}, region, payload);
      }
      return region;
    });
  },

  DELETE_REGIONS(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.regions.findIndex(
        region => region.id === payload[i].id
      );
      state.regions.splice(index, 1);
    }
  },

  REGION_ERROR(state, errors) {
    state.errors = errors;
  },

  SET_REGION_ITEM(state, payload) {
    state.branchDialog = payload.dialog;
    state.regionItem = payload.item;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
