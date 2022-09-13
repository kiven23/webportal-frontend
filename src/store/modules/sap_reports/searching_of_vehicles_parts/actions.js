import axios from "axios";
import rootUrl from "../../../rootUrl";
//VEHICLES PARTS
const types = rootUrl + "/api/public/reports/queries/searchofvehicleparts?q=items&req=type";
const parts = rootUrl + "/api/public/reports/queries/searchofvehicleparts?q=items&req=parts";
const generate = rootUrl + "/api/public/reports/queries/searchofvehicleparts?q=queries&";
const actions = {
 
  fetchVEHICLEPARTS(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(parts).then(response => {
      context.commit("GET_VEHICLEPARTS", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  fetchVEHICLETYPE(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(types).then(response => {
      context.commit("GET_VEHICLETYPE", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },

  GenerateVEHICLETQUERIES(context, data)
          { 
            context.commit("LOADING_STATUS", true, { root: true }); // start loading
            axios.get(generate+'part='+data.part+'&type='+data.type).then(response => {
              context.commit("GET_VEHICLETQUERIES", response.data);
              context.commit("LOADING_STATUS", false, { root: true });
            });
        },
 
};

export default actions;
