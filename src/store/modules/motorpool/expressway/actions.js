import axios from "axios";
import rootUrl from "../../../rootUrl";
 
//fetch incoming
const indexUrl = rootUrl + "/api/expressway/monitoring/index";
 
const actions = {
  monitoring(context, data){
   return axios
    .get(indexUrl,  data )
    .then(response => {
        return response
     })
     .catch(error => {
      alert("Error")
    });
  },
  // fetchInstallment(context, data){
  //   context.commit("GET_INSTALLMENT", []);
  //   context.commit("LOADING_STATUS", true,{ root: true });
    
  //   axios
  //   .post(installmentUrl,  data )
  //   .then(response => {
    
  //     context.commit("LOADING_STATUS", false,{ root: true });
  //     context.commit("GET_INSTALLMENT", response.data);
  //    })
  //    .catch(error => {
  //     context.commit("INSTALLMENT_ERROR", error.response.data); // get error from backend
  //     context.commit("LOADING_STATUS", false, { root: true }); // stop loading
  //   });
  // },
  
 
   
  
};

export default actions;
