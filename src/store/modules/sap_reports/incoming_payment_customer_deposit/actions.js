import axios from "axios";
import rootUrl from "../../../rootUrl";
//ADJUSTMENT SALES DISCOUNT
const segment = rootUrl + "/api/seriesname/fetch?q=sapprogtbl";
 const generate = rootUrl + "/api/public/reports/queries/incomingpaymentcustomerdeposit?q=queries";
const actions = {
 
  fetchBranchSegment(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(segment).then(response => {
      context.commit("GET_SEGMENT", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  
  generatequery(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(generate+'&series='+data.branch.U_Branch1+'').then(response => {
      context.commit("GET_QUERY", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  
 
};

export default actions;
