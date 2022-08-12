import axios from "axios";

//Node Js Server
const getWinner = 'http://10.10.10.38:3008/'

const actions = {
  GetWinner(context, data){
    context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    axios
    .get(getWinner)
        .then(response => {
         context.commit("GET_WINNER", response.data);
        })
     .catch(error => {
      context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    });
  },
  
};

export default actions;
