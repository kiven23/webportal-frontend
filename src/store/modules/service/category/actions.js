import axios from "axios";
import rootUrl from "../../../rootUrl";

const serviceCategoryUrl = rootUrl + "/api/service-categories";

const actions = {
  fetchCategories(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(serviceCategoryUrl).then(response => {
      context.commit("SET_CATEGORY", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeCategory(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(serviceCategoryUrl, data)
      .then(response => {
        context.commit("STORE_CATEGORY", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Category successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("CATEGORY_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateCategory(context, category) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(serviceCategoryUrl + "/update", category)
      .then(response => {
        context.commit("UPDATE_CATEGORY", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Category successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("CATEGORY_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteCategories(context, categoryIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(serviceCategoryUrl + "/delete/multiple", categoryIds)
      .then(response => {
        context.commit("DELETE_CATEGORIES", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Service Category(s) successfully deleted.",
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
