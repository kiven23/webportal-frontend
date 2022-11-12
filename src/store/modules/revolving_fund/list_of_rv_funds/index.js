import actions from "./actions";

const state = {
    glaccount: [],
    revolving_funds: [], 
    rv_fund_with_expense_items: {
        check_voucher_verifications: [],
        check_voucher_for_transmittals: [],
        expenses_for_check_preparations:[],
        check_voucher_verifications_total: 0,
        check_voucher_for_transmittals_total: 0,
        expenses_for_check_preparations_total:0,
    },
    // deleting_on_progress: false,
}

const getters = {
    getRevolvingFunds(state) {
        return state.revolving_funds
    }, 
    getRvFundWithExpenseItems(state){
        return state.rv_fund_with_expense_items
    },
    getGlAccount(state){
        return state.glaccount
    }
    // getDeletingOnProgress(state) {
    //     return state.deleting_on_progress
    // }
}

const mutations = {
    setRevolvingFunds(state, payload) {
        state.revolving_funds = payload
    },
    setRvFundWithExpenseItems(state, payload){
        state.rv_fund_with_expense_items = payload
    },
    setChkVoucherVerificationsTotal(state, payload){
        state.rv_fund_with_expense_items.check_voucher_verifications_total = payload
    },
    setChkVoucherForTransmittalTotal(state, payload){
        state.rv_fund_with_expense_items.check_voucher_for_transmittals_total = payload
    },
    setExpensesForChkPreparationTotal(state, payload) {
        state.rv_fund_with_expense_items.expenses_for_check_preparations_total = payload
    },
    GL_ACCOUNT(state, payload){
        state.glaccount = payload
    }
    // setDeletingOnProgress(state, payload) {
    //     state.deleting_on_progress = payload
    // }
}

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};
