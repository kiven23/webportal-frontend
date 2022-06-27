import axios from "axios";
import rootUrl from "../../../rootUrl";

const serviceTypeUrl = rootUrl + "/api/service-types";

const actions = {
  fetchTypes(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(serviceTypeUrl).then(response => {
      context.commit("SET_TYPE", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeType(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(serviceTypeUrl, data)
      .then(response => {
        context.commit("STORE_TYPE", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Type successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("TYPE_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateType(context, type) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(serviceTypeUrl + "/update", type)
      .then(response => {
        context.commit("UPDATE_TYPE", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Type successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("TYPE_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteTypes(context, typeIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(serviceTypeUrl + "/delete/multiple", typeIds)
      .then(response => {
        context.commit("DELETE_TYPES", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Type(s) successfully deleted.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        console.log(error.response.data);
      });
  }
};

export default actions;
