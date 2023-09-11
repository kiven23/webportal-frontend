import axios from "axios";
import rootUrl from "../../../rootUrl";
 
//fetch incoming
const indexUrl = rootUrl + "/api/expressway/monitoring/index";
const finalupload = rootUrl+ "/api/expressway/upload/index";
const trash = rootUrl+ "/api/expressway/monitoring/bin";
const actions = {
  monitoring(context, data){
   return axios
    .get(indexUrl,  data )
    .then(response => {
        return response
     })
     .catch(error => {
      alert("Error")
    });
  },
  upload(context, data){
    const formData = new FormData();
    formData.append('pdfFile', data); // Assuming 'data' is the file you want to upload
    
    // Make the initial file upload request
    return axios.post('https://ff6e-124-107-173-55.ngrok-free.app/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    })
    .then(response => {
      
      if(response.data[0]['all'][0]){
            // Make a secondary request using the data from the initial response
            return axios.post(finalupload, response.data)
            .then(res => {
              // Handle the response from the secondary request
              return res.data; // Return the data from the secondary request
            })
            .catch(error => {
              // Handle errors from the secondary request
              console.error('Error in secondary request:', error);
              throw error; // Rethrow the error to propagate it up the promise chain
            });
      }else{  
          return 2
      }
    
    })
    .catch(error => {
      // Handle errors from the initial file upload request
      console.error('Error uploading file:', error);
      throw error; // Rethrow the error to propagate it up the promise chain
    });
    
  },
  trash(context, data){
    return axios
    .get(trash+'?id='+  data )
    .then(response => {
        return response
     })
     .catch(error => {
      alert("Error")
    });
  }
  
 
   
  
};

export default actions;
