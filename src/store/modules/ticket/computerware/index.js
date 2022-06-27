import actions from "./actions";

const state = {
  tickets: [],
  errors: []
};

const getters = {
  getTickets(state) {
    return state.tickets;
  },
  getTicketErrors(state) {
    return state.errors;
  }
};

const mutations = {
  SET_TICKET(state, tickets) {
    state.tickets = tickets;
  },

  STORE_TICKET(state, ticket) {
    state.tickets.unshift(ticket);
  },

  UPDATE_TICKET(state, payload) {
    state.tickets = state.tickets.map(ticket => {
      if (ticket.id === payload.id) {
        return Object.assign({}, ticket, payload);
      }
      return ticket;
    });
  },

  DELETE_TICKETS(state, payload) {
    for (var i = payload.length - 1; i >= 0; i--) {
      var index = state.tickets.findIndex(
        ticket => ticket.id === payload[i].id
      );
      state.tickets.splice(index, 1);
    }
  },

  TICKET_ERROR(state, errors) {
    state.errors = errors;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
