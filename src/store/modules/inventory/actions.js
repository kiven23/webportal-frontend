import axios from "axios";
import rootUrl from "../../rootUrl";

const printbarcode = rootUrl + "/api/inventory/grpo/download";

const actions = {
  
  download(context, data){
   return   axios
    .post(printbarcode,  {data: data},
      {responseType: 'blob'})
     .then(response=> {

        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        
        return fileURL;
     //context.commit("ATTACHMENT_DATA", fileURL); 
     
    })
  },
};

export default actions;
