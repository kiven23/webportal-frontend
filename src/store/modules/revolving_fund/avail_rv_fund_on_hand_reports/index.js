import actions from "./actions";

const state = {
    avail_rf_on_hands: {
        items: [],
        rf_total: 0,
        ca_total: 0,
        avail_rf_total: 0
    },
    historyData: []
}

const getters = {
    getAvailRvFundOnHands(state){
        return state.avail_rf_on_hands
    },
    getHistoryData(state){
        return state.historyData
    }
}

const mutations = {
    setAvailRvFundOnHands(state, payload) {
        state.avail_rf_on_hands = payload
    },
    setRFTotal(state, payload){
        state.avail_rf_on_hands.rf_total = payload
    },
    setCATotal(state, payload) {
        state.avail_rf_on_hands.ca_total = payload
    },
    setAvailRFTotal(state, payload) {
        state.avail_rf_on_hands.avail_rf_total = payload
    },
    setHistoryData(state, payload){
        state.historyData = payload
    }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};