import axios from "axios";
import rootUrl from "../../../rootUrl";

//Revolving fund prefix
const prefix = rootUrl + "/api/revolving-fund"
const Printbir = prefix + "/preparation/history"
//Rv Fund Check Voucher Verification
const chkVoucherVeriPrefix = prefix + "/check-voucher-verification";

//Rv Fund Check Voucher For Transmittal
const chkVoucherForTransPrefix = prefix + "/check-voucher-for-transmittal";

//Rv Fund Expenses for Check Preparation
const expensesForChkPreparationPrefix = prefix + "/expenses-for-check-preparation";

const actions = {
    //Revolving Fund
    fetchRevolvingFunds(context, payload) {
        context.commit("LOADING_STATUS", true, { root: true }); // start loading
        axios.get(prefix + "/index")
        .then(({data}) => {
            context.commit('setRevolvingFunds', data.data)
            context.commit("LOADING_STATUS", false, { root: true }); 
        })
    },
    fetchPreparationHistory(context, payload) {
  
        context.commit("LOADING_STATUS", true, { root: true }); // start loading
        axios.get(prefix + "/preparation/history"+"?id="+payload.tin+"&date="+payload.date)
        .then(({data}) => {
            context.commit('setPreparationHistory', data)
            context.commit("LOADING_STATUS", false, { root: true }); 
        })
    },
    // addRevolvingFund(context, payload){
    //     return axios.post(prefix + "/create", payload)
    //     .then(res => {
    //         return res;
    //     })
    //     .catch(err => {
    //         return err.response
    //     })
    // },
    viewRevolvingFund(context, payload){
        return axios.get(prefix + "/view/" + payload.id)
        .then(({data}) => {
            context.commit('setRvFundWithExpenseItems', data.data)
            return data.data
        })
    },
    updateCashAdvances(context, payload){
        return axios.post(prefix + "/update/" + payload.id + "/cash-advances", { cash_advances : payload.cash_advances })
        .then(res => {
            return res
       })
       .catch(err => {
           return err.response
       })
    },
    // updateRevolvingFund(context, payload) {
    //     return axios.put(prefix + "/update/" + payload.id, payload)
    //     .then(res => {
    //         return res;
    //     })
    //     .catch(err => {
    //         return err.response
    //     })
    // },
    // deleteRvFunds(context, payload) {
    //     context.commit('setDeletingOnProgress', true)
    //     return axios.post(prefix + "/delete/items", payload)
    //     .then(({data}) => {
    //         context.commit('setDeletingOnProgress', false)
    //         context.commit("SNACKBAR_STATUS", [
    //             {
    //               status: true,
    //               message: data.message,
    //               timeout: 3000
    //             }
    //           ], { root: true });
    //         return data   
    //     })
    // },
    PrintBIR(context, payload) {
        axios.get(Printbir + "/print?id=" + payload.tin+"&date="+payload.date, { responseType: 'blob'})
        .then(response => {
            console.log(response.data)
            // let blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            // let link = document.createElement('a')
            // link.href = window.URL.createObjectURL(blob)
            // link.download = response.headers['content-disposition'].split("filename=")[1].replace(/"/g, '')
            // link.click()

            //window.open(URL.createObjectURL(response.data));
            // const file = new Blob([response.data], {
            //     type: "application/pdf",
            //   });
            // const fileURL = URL.createObjectURL(file);
            // window.open(fileURL);
        })
    },
    printRvFundsSummary(context, payload) {
        axios.get(prefix + "/print/" + payload.id, { responseType: 'blob'})
        .then(response => {
            // let blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            // let link = document.createElement('a')
            // link.href = window.URL.createObjectURL(blob)
            // link.download = response.headers['content-disposition'].split("filename=")[1].replace(/"/g, '')
            // link.click()

            //window.open(URL.createObjectURL(response.data));
            const file = new Blob([response.data], {
                type: "application/pdf",
              });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        })
    },
    //Update Available Revolving Fund On Hand
    updateAvailRevolvingFundOnHand(context, payload){
        axios.post(prefix + "/update-avail-rf-on-hand/" + payload.id, { avail_fund_on_hand : payload.avail_fund_on_hand })
        .then(res => {
            console.log(res.data)
        })
    },
    // resetRvFundWithExpenseItems(context) {
    //     context.commit('setRvFundWithExpenseItems', { 
    //         check_voucher_verifications: [],
    //         check_voucher_for_transmittals: [],
    //         expenses_for_check_preparations:[],
    //         check_voucher_verifications_total: 0,
    //         check_voucher_for_transmittals_total: 0,
    //         expenses_for_check_preparations_total:0,
    //     })
    // },
    //RV Fund Check Voucher Verification
    createCheckVoucherVerification(context, payload){
        return axios.post(chkVoucherVeriPrefix + "/create", payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    updateCheckVoucherVerification(context, payload) {
        return axios.put(chkVoucherVeriPrefix + "/update/" + payload.id, payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    updateChkVoucherVerificationStatus(context, payload) {
        return axios.put(chkVoucherVeriPrefix + "/update-status/" + payload.id, payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    deleteChkVoucherVerification(context, payload) {
        return axios.delete(chkVoucherVeriPrefix + "/destroy/" + payload.id )
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    //RV Fund Check Voucher For Transmittal
    createCheckVoucherForTransmittal(context, payload){
        return axios.post(chkVoucherForTransPrefix + "/create", payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    updateCheckVoucherForTransmittal(context, payload) {
        return axios.put(chkVoucherForTransPrefix + "/update/" + payload.id, payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    deleteChkVoucherForTransmittal(context, payload) {
        return axios.delete(chkVoucherForTransPrefix + "/destroy/" + payload.id )
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    transmitChkVoucher(context, payload) {
        return axios.post(chkVoucherForTransPrefix + "/transmit", payload)
        .then(res => {
             return res
        })
        .catch(err => {
            return err.response
        })
    },
    //RV Fund Expenses For Check Preparation
    createExpenseForChkPreparation(context, payload){
        return axios.post(expensesForChkPreparationPrefix + "/create", payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    updateExpenseForChkPreparation(context, payload) {
        return axios.put(expensesForChkPreparationPrefix + "/update/" + payload.id, payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    deleteExpenseForChkPreparation(context, payload) {
        return axios.delete(expensesForChkPreparationPrefix + "/destroy/" + payload.id )
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    replenishExpenses(context, payload) {
        return axios.post(expensesForChkPreparationPrefix + "/replenish", payload) 
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    fetchGLaccount(context, payload) {
        return axios.get(prefix+"/gl/account") 
        .then(res => {
            context.commit("GL_ACCOUNT", res)
            return res
        })
        .catch(err => {
            return err.response
        })
    },
}

export default actions