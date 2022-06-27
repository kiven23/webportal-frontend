import axios from "axios";
import rootUrl from "../../../rootUrl";

const computerwareUrl = rootUrl + "/api/computerware-tickets";

const actions = {
  fetchTickets(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(computerwareUrl).then(response => {
      context.commit("SET_TICKET", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeTicket(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .post(computerwareUrl, data)
      .then(response => {
        context.commit("STORE_TICKET", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          { status: true, message: "Ticket successfully added.", timeout: 3000 }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("TICKET_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateTicket(context, ticket) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .put(computerwareUrl + "/update", ticket)
      .then(response => {
        context.commit("UPDATE_TICKET", response.data);
        context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Ticket successfully updated.",
            timeout: 3000
          }
        ];
        context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("TICKET_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  deleteTickets(context, ticketIds) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios
      .patch(computerwareUrl + "/delete/multiple", ticketIds)
      .then(response => {
        context.commit("DELETE_TICKETS", response.data);
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading

        let payload = [
          {
            status: true,
            message: "Ticket(s) successfully deleted.",
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
