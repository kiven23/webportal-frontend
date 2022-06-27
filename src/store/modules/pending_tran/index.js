import actions from "./actions";

const state = {
  pendingtrans: [],
  errors: [],
  pendingtranItem: [],
 
};

const getters = {
  getPendingTrans(state) {
    return state.pendingtrans;
  },
  getPendingTranErrors(state) {
    return state.errors;
  }
};

const mutations = {
  SET_PENDINGTRAN(state, pendingtrans) {
    state.pendingtrans = pendingtrans;
  },

  STORE_PENDINGTRAN(state, pendingtran) {
    var a = state.pendingtrans;
    var index = a.findIndex(x => x.id === pendingtran.branch_id);

    var b = state.pendingtrans[index].pendings;
    var index2 = b.findIndex(y => y.docdate === pendingtran.docdate);

    if (index2 == -1) {
      // store
      state.pendingtrans[index].pendings.push(pendingtran);
    } else {
      // update
      state.pendingtrans[index].pendings = state.pendingtrans[
        index
      ].pendings.map(pending => {
        if (pending.id === pendingtran.id) {
          return Object.assign({}, pending, pendingtran);
        }
        return pending;
      });
    }
  },

  DELETE_PENDINGTRAN(state, payload) {
    var a = state.pendingtrans;
    var index = a.findIndex(x => x.id === payload.branch_id);

    var b = state.pendingtrans[index].pendings;
    var index2 = b.findIndex(y => y.id === payload.id);

    state.pendingtrans[index].pendings.splice(index2, 1);
  },

  PENDINGTRAN_ERROR(state, errors) {
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
