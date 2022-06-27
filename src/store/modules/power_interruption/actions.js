import axios from "axios";
import rootUrl from "../../rootUrl";

const powerinterruptionUrl = rootUrl + "/api/power-interruptions";

const actions = {
  fetchPowerInterruptions(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(powerinterruptionUrl).then(response => {
      context.commit("SET_POWERINTERRUPTION", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storePowerInterruption(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(powerinterruptionUrl, data)
      .then(response => {
        context.commit("STORE_POWERINTERRUPTION", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Power Interruption successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("POWERINTERRUPTION_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updatePowerInterruption(context, powerinterruptions) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(powerinterruptionUrl + "/update", powerinterruptions)
      .then(response => {
        context.commit("UPDATE_POWERINTERRUPTION", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Power Interruption successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("POWERINTERRUPTION_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deletePowerInterruptions(context, powerinterruptionIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(powerinterruptionUrl + "/delete/multiple", powerinterruptionIds)
      .then(response => {
        context.commit("DELETE_POWERINTERRUPTIONS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Power Interruption(s) successfully deleted.",
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
