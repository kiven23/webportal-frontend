import axios from "axios";

//Node Js Server
const getWinner = 'http://192.168.1.19:3378/'

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
