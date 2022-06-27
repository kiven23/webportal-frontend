import axios from "axios";
import rootUrl from "../../../rootUrl";

const productBrandUrl = rootUrl + "/api/product-brands";

const actions = {
  fetchBrands(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(productBrandUrl).then(response => {
      context.commit("SET_BRAND", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeBrand(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(productBrandUrl, data)
      .then(response => {
        context.commit("STORE_BRAND", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Product Brand successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("BRAND_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateBrand(context, brand) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(productBrandUrl + "/update", brand)
      .then(response => {
        context.commit("UPDATE_BRAND", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Product Brand successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("BRAND_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteBrands(context, brandIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(productBrandUrl + "/delete/multiple", brandIds)
      .then(response => {
        context.commit("DELETE_BRANDS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Product Brand(s) successfully deleted.",
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
