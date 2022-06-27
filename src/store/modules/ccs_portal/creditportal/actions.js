import axios from "axios";
import rootUrl from "../../../rootUrl";


//credit_portal
const fetchUrl = rootUrl + "/api/public/credit/standing/index";
const generateUrl = rootUrl + "/api/public/credit/standing/generate";
const actions = {
  fetchCreditStanding(context) {
      context.commit("LOADING_STATUS", true, { root: true }); // start loading
        axios.get(fetchUrl).then(response => {
          context.commit("GET_CREDITSTANDING", response.data);
          context.commit("LOADING_STATUS", false, { root: true });
        });
  },
  GenerateCreditStanding(context, data){
    context.commit("LOADING_STATUS", true, { root: true });
    axios
    .post(generateUrl, data )
    .then(response => {
      context.commit("GET_CREDITSTANDING", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
      let payload = [
        {
          status: true,
          message: "Sap Data Generated successfully",
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
