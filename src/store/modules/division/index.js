import actions from "./actions";

const state = {
  divisions: [],
  errors: [],
  divisionItem: [],
  deptDialog: false
};

const getters = {
  getDivisions(state) {
    return state.divisions;
  },
  getDivisionErrors(state) {
    return state.errors;
  },
  getDeptDialog(state) {
    return state.deptDialog;
  },
  getDivisionItem(state) {
    return state.divisionItem;
  }
};

const mutations = {
  SET_DIVISION(state, divisions) {
    state.divisions = divisions;
  },

  STORE_DIVISION(state, division) {
    state.divisions.unshift(division);
  },

  UPDATE_DIVISION(state, payload) {
    state.divisions = state.divisions.map(division => {
      if (division.id === payload.id) {
        return Object.assign({}, division, payload);
      }
      return division;
    });
  },

  DELETE_DIVISIONS(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.divisions.findIndex(
        division => division.id === payload[i].id
      );
      state.divisions.splice(index, 1);
    }
  },

  DIVISION_ERROR(state, errors) {
    state.errors = errors;
  },

  SET_DIVISION_ITEM(state, payload) {
    state.deptDialog = payload.dialog;
    state.divisionItem = payload.item;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
