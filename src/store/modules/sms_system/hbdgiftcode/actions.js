import axios from "axios";
import rootUrl from "../../../rootUrl";

const authorizedUrl = rootUrl + "/api/authorized/giftcode";

const actions = {
  AuthorizedAccess(context) {
    console.log(context)
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(authorizedUrl).then(response => {
      console.log(response)
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
   
};

export default actions;
