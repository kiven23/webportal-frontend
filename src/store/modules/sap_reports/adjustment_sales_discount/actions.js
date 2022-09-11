import axios from "axios";
import rootUrl from "../../../rootUrl";
//INCOMING PAYMENT CRB
const segment = rootUrl + "/api/public/branch/segment";
const generate = rootUrl + "/api/public/reports/incoming/crb";
const actions = {
 
  fetchBranchSegment(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(segment).then(response => {
      context.commit("GET_SEGMENT", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  
  GeneratePaymentCRB(context, data)
          { 
              context.commit("LOADING_STATUS", true, { root: true });
              axios
              .post(generate,  data)
              .then(response => {
                    context.commit("LOADING_STATUS", false, { root: true });
                    context.commit("GET_PAYMENTCRB", response.data);
                          let payload = [
                            {
                              status: true,
                              message: "Fetch Done...!",
                              timeout: 3000
                            }
                          ];
                    context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
              })
              .catch(error => {
                  context.commit("PERM_ERROR", error.response.data); // get error from backend
                  context.commit("LOADING_STATUS", false, { root: true }); // stop loading
              });
        },
 
};

export default actions;
