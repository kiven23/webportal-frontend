import axios from "axios";
import rootUrl from "../../rootUrl";

const permissionUrl = rootUrl + "/api/permissions";

const actions = {
  fetchPerms(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(permissionUrl).then(response => {
      context.commit("SET_PERM", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storePerm(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(permissionUrl, data)
      .then(response => {
        context.commit("STORE_PERM", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Permission successfully added.",
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
  updatePerm(context, perm) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(permissionUrl + "/update", perm)
      .then(response => {
        context.commit("UPDATE_PERM", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Permission successfully updated.",
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
  deletePerms(context, permIds) {
    console.log(permIds);
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(permissionUrl + "/delete/multiple", permIds)
      .then(response => {
        context.commit("DELETE_PERMS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Permission(s) successfully deleted.",
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
