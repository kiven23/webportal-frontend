import axios from "axios";
import rootUrl from "../../rootUrl";

const pendingTranUrl = rootUrl + "/api/pending-transactions";

const actions = {
  fetchPendingTrans(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.post(pendingTranUrl + "/index", data).then(response => {
      context.commit("SET_PENDINGTRAN", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storePendingTran(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(pendingTranUrl, data)
      .then(response => {
        context.commit("STORE_PENDINGTRAN", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        var msg = "";
        if (response.data.inDB == 0) {
          msg = "Pending Transaction successfully added.";
        } else {
          msg = "Pending Transaction successfully updated.";
        }

        let payload = [
          {
            status: true,
            message: msg,
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PENDINGTRAN_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  addAllPendingTran(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(pendingTranUrl + "/addall", data)
      .then(response => {
        console.log(response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message:
              "All Pending Transaction(s) successfully added to current.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PENDINGTRAN_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updatePendingTran(context, payload) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(pendingTranUrl + "/update", payload)
      .then(response => {
        // updating already done by data tables content editable
        console.log(response.data);
        let payload = [
          {
            status: true,
            message: "Pending Transaction successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PENDINGTRAN_ERROR", error.message); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Update failed!",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      });
  },
  deletePendingTran(context, pendingtran) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(pendingTranUrl + "/delete", pendingtran)
      .then(response => {
        context.commit("DELETE_PENDINGTRAN", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Pending Transaction successfully deleted.",
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
