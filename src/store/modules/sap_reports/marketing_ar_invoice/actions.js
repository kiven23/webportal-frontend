import axios from "axios";
import rootUrl from "../../../rootUrl";
//MARKETING AR-INVOICE QUERY
const segment = rootUrl + "/api/seriesname/fetch";
 const generate = rootUrl + "/api/public/reports/queries/marketingarinvoicequery?q=queries";
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
    axios.get(generate+'&datefrom='+data['date'][0]+'&dateto='+data['date'][1]+'&series='+data.branch.SeriesName+'').then(response => {
      context.commit("GET_QUERY", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  
 
};

export default actions;
