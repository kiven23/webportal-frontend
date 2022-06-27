import axios from "axios";
import rootUrl from "../../rootUrl";

const positionUrl = rootUrl + "/api/positions";

const actions = {
  fetchPositions(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(positionUrl).then(response => {
      context.commit("SET_POSITION", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storePosition(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(positionUrl, data)
      .then(response => {
        context.commit("STORE_POSITION", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Position successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("POSITION_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updatePosition(context, position) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(positionUrl + "/update", position)
      .then(response => {
        context.commit("UPDATE_POSITION", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Position successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("POSITION_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deletePositions(context, positionIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(positionUrl + "/delete/multiple", positionIds)
      .then(response => {
        context.commit("DELETE_POSITIONS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Position(s) successfully deleted.",
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
