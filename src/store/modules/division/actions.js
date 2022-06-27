import axios from "axios";
import rootUrl from "../../rootUrl";

const divisionUrl = rootUrl + "/api/divisions";

const actions = {
  fetchDivisions(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(divisionUrl).then(response => {
      context.commit("SET_DIVISION", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeDivision(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(divisionUrl, data)
      .then(response => {
        context.commit("STORE_DIVISION", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Division successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("DIVISION_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateDivision(context, division) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(divisionUrl + "/update", division)
      .then(response => {
        context.commit("UPDATE_DIVISION", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Division successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("DIVISION_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteDivisions(context, divisionIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(divisionUrl + "/delete/multiple", divisionIds)
      .then(response => {
        context.commit("DELETE_DIVISIONS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Division(s) successfully deleted.",
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
