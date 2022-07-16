import axios from "axios";
import rootUrl from "../../../rootUrl";

import fileDownload from "js-file-download";

const prefix = rootUrl + "/api/credit-dunning"

const actions = {
  fetchOverdues(context, payload) {
    
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    
    axios.post(prefix + "/index").then(response => {
      context.commit("GET_OVERDUES", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });

  },
  downloadLetters(context, payload){
    
    let downloadStatPayload = { index : payload.index, value: true };
    context.commit("DOWNLOADING_STATUS", downloadStatPayload);
    
    axios
    .post(prefix + "/download-letters", payload, { responseType: 'blob' })
    .then(response => {
      
      // let blob = new Blob([response.data], { type: 'application/pdf' })
      // let link = document.createElement('a')
      // link.href = window.URL.createObjectURL(blob)
      // link.download = 
      // link.click()
      fileDownload(response.data, response.headers['content-disposition'].split("filename=")[1].replace(/"/g, ''))
      
      context.commit("SNACKBAR_STATUS", [
        {
          status: true,
          message: "Letters successfully Downloaded.",
          timeout: 3000
        }
      ], { root: true }); // show snackbar

    })
    .catch(error => {
      console.log(error.response.data)
    })
    .finally(() => {
      downloadStatPayload.value = false
      context.commit("DOWNLOADING_STATUS",  downloadStatPayload);
    })

  },
  //to be removed
  test() {
    axios.get(prefix )
    .then(res => {
      console.log(res.headers)
    })
  },
  fetchBranches(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(prefix + "/get-branches").then(response => {
      console.log(response.data)
      context.commit("GET_BRANCHES", response.data);
      context.commit("GET_AGINGS", [
        { name: "1 month", value : "02 ONE(1) MONTH" },
        { name: "2 months", value : "03 TWO(2) MONTHS" },
        { name: "3 months", value : "04 THREE(3) MONTHS" },
        { name: "4 months", value : "05 FOUR(4) MONTHS" },
        { name: "1 month lapcon", value : "09 LAPCON ONE(1) MONTH" }
      ])
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
};

export default actions;
