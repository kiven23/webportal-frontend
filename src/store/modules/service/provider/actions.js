import axios from "axios";
import rootUrl from "../../../rootUrl";

const serviceProviderUrl = rootUrl + "/api/service-providers";

const actions = {
  fetchProviders(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(serviceProviderUrl).then(response => {
      context.commit("SET_PROVIDER", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeProvider(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(serviceProviderUrl, data)
      .then(response => {
        context.commit("STORE_PROVIDER", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Provider successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PROVIDER_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateProvider(context, provider) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(serviceProviderUrl + "/update", provider)
      .then(response => {
        context.commit("UPDATE_PROVIDER", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Provider successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PROVIDER_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteProviders(context, providerIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(serviceProviderUrl + "/delete/multiple", providerIds)
      .then(response => {
        context.commit("DELETE_PROVIDERS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Provider(s) successfully deleted.",
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
