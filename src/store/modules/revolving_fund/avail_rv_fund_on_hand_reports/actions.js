import axios from "axios";
import rootUrl from "../../../rootUrl";

const prefix = rootUrl + "/api/revolving-fund/avail-rv-fund-on-hand"

const actions = {
    fetchAvailRvFundOnHandsReports({ commit }, payload) {
        commit("LOADING_STATUS", true, { root: true });
        axios.get(prefix + "/index")
        .then(({data}) => {
            commit("setAvailRvFundOnHands", data)
            commit("LOADING_STATUS", false, { root: true });
        })
    },
    updateOrCreateRFund(context, payload){
        return axios.post(prefix + "/updateOrCreate", payload)
        .then(res => {
            return res
        })
        .catch(err => {
            return err.response
        })
    },
    printAvailRFOnHandReports(context, payload) {
        axios.get(prefix + "/print", { responseType: 'blob'})
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
    updateTotalData({ commit }, payload) {
        commit('setRFTotal', payload.rfTotal)
        commit('setCATotal', payload.caTotal)
        commit('setAvailRFTotal', payload.availRfTotal)
    },
    historyData(context, payload) {
        axios.get(prefix + "/history?b="+payload,)
        .then(({data}) => {
            context.commit("setHistoryData", data)
        })
    },
    
}

export default actions