import axios from "axios";
import rootUrl from "../../../rootUrl";

const productItemUrl = rootUrl + "/api/product-items";

const actions = {
  fetchItems(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(productItemUrl).then(response => {
      context.commit("SET_ITEM", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeItem(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(productItemUrl, data)
      .then(response => {
        context.commit("STORE_ITEM", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Product Item successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("ITEM_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateItem(context, item) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(productItemUrl + "/update", item)
      .then(response => {
        context.commit("UPDATE_ITEM", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Product Item successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("ITEM_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteItems(context, itemIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(productItemUrl + "/delete/multiple", itemIds)
      .then(response => {
        context.commit("DELETE_ITEMS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Product Item(s) successfully deleted.",
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
