import axios from "axios";
import rootUrl from "../../../rootUrl";
 
//fetch incoming
const indexUrl = rootUrl + "/api/public/installment/index";
//get installment
const installmentUrl = rootUrl + "/api/public/installment/create";
const updateManual = rootUrl + "/api/public/installment/updatemanual";
const GetBranchGrade = rootUrl + "/api/public/calculate/grade";
const actions = {
  fetchIncoming(context, data){
    context.commit("LOADING_STATUS2", true,{ root: true });
    axios
    .post(indexUrl,  data )
    .then(response => {
       
      context.commit("LOADING_STATUS2", false,{ root: true });
      context.commit("GET_INCOMING", response.data.data);
      context.commit("GET_GRADE", response.data.grade.original);
     })
     .catch(error => {
      context.commit("INSTALLMENT_ERROR", error.response.data); // get error from backend
      context.commit("LOADING_STATUS2", false, { root: true }); // stop loading
    });
  },
  fetchInstallment(context, data){
    context.commit("GET_INSTALLMENT", []);
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
  updateManual(context, data){
    context.commit("LOADING_STATUS", true,{ root: true });
    axios
    .post(updateManual,  data )
    .then(response => {
      console.log(response)
      context.commit("LOADING_STATUS", false,{ root: true });
     // context.commit("GET_INSTALLMENT", response.data);
     })
     .catch(error => {
      //context.commit("INSTALLMENT_ERROR", error.response.data); // get error from backend
      context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    });
  },
 
  ComputeBranchGrade(context, data){
    axios
    .get(GetBranchGrade,  data )
    .then(response => {
      context.commit("GET_GRADE", response.data);
     })
     .catch(error => {
      context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    });
  },
  
};

export default actions;
