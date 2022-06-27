import axios from "axios";
import rootUrl from "../../rootUrl";

const branchUrl = rootUrl + "/api/branches";

const actions = {
  fetchBranches(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(branchUrl).then(response => {
      context.commit("SET_BRANCH", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeBranch(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(branchUrl, data)
      .then(response => {
        context.commit("STORE_BRANCH", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          { status: true, message: "Branch successfully added.", timeout: 3000 }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("BRANCH_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateBranch(context, branch) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(branchUrl + "/update", branch)
      .then(response => {
        context.commit("UPDATE_BRANCH", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Branch successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("BRANCH_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteBranches(context, branchIds) {
    console.log(branchIds);
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(branchUrl + "/delete/multiple", branchIds)
      .then(response => {
        context.commit("DELETE_BRANCHES", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Branch(es) successfully deleted.",
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
