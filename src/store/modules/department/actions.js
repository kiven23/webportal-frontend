import axios from "axios";
import rootUrl from "../../rootUrl";

const deptUrl = rootUrl + "/api/departments";

const actions = {
  fetchDepartments(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(deptUrl).then(response => {
      context.commit("SET_DEPARTMENT", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeDepartment(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(deptUrl, data)
      .then(response => {
        context.commit("STORE_DEPARTMENT", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Department successfully added.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("DEPARTMENT_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateDepartment(context, department) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(deptUrl + "/update", department)
      .then(response => {
        context.commit("UPDATE_DEPARTMENT", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Department successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("DEPARTMENT_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteDepartments(context, departmentIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(deptUrl + "/delete/multiple", departmentIds)
      .then(response => {
        context.commit("DELETE_DEPARTMENTS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Department(s) successfully deleted.",
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
