import axios from "axios";
import rootUrl from "../../rootUrl";

const userUrl = rootUrl + "/api/users";

const actions = {
  fetchUsers(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(userUrl).then(response => {
      context.commit("SET_USER", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeUser(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(userUrl, data)
      .then(response => {
        context.commit("STORE_USER", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          { status: true, message: "User successfully added.", timeout: 3000 }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("USER_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateUser(context, user) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(userUrl + "/update", user)
      .then(response => {
        context.commit("UPDATE_USER", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          { status: true, message: "User successfully updated.", timeout: 3000 }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("USER_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteUsers(context, userIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(userUrl + "/delete/multiple", userIds)
      .then(response => {
        context.commit("DELETE_USERS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "User(s) successfully deleted.",
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
