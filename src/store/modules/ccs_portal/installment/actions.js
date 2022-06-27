import axios from "axios";
import rootUrl from "../../../rootUrl";
 
//fetch incoming
const indexUrl = rootUrl + "/api/public/index";
//get installment
const installmentUrl = rootUrl + "/api/public/installment";

const actions = {
  fetchIncoming(context, data){
    context.commit("LOADING_STATUS", true,{ root: true });
    axios
    .post(indexUrl,  data )
    .then(response => {
      context.commit("LOADING_STATUS", false,{ root: true });
      context.commit("GET_INCOMING", response.data);
     })
     .catch(error => {
      context.commit("INSTALLMENT_ERROR", error.response.data); // get error from backend
      context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    });
  },
  fetchInstallment(context, data){
    context.commit("LOADING_STATUS", true,{ root: true });
    axios
    .post(installmentUrl,  data )
    .then(response => {
      context.commit("LOADING_STATUS", false,{ root: true });
      context.commit("GET_INSTALLMENT", response.data);
     })
     .catch(error => {
      context.commit("INSTALLMENT_ERROR", error.response.data); // get error from backend
      context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    });
  },
};

export default actions;
