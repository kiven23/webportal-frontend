import actions from "./actions";

const state = {
  input_validation_errors : {},
  validation_errors : {},
  validation_on_progress : false,
  success_message : null
};
const getters = {
  getInputValidationErrors(state) {
    return state.input_validation_errors
  },
  getValidationErrors(state) {
    return state.validation_errors
  },
  getValidationProgress(state) {
    return state.validation_on_progress
  },
  getSuccessMessage(state) {
    return state.success_message
  }
};

const mutations = {
  setValidationErrors(state, payload) { 
    state.validation_errors = payload
  },
  setInputValidationErrors(state, payload) {
    state.input_validation_errors = payload
  },
  setValidationProgress(state, payload) {
    state.validation_on_progress = payload
  },
  setSuccessMessage(state, payload) {
    state.success_message = payload
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};