import axios from "axios";
import rootUrl from "../../../rootUrl";
 
//fetch incoming
const indexUrl = rootUrl + "/api/expressway/monitoring/index";
const finalupload = rootUrl+ "/api/expressway/upload/index";
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
    return axios.post('https://8cc4-124-107-173-55.ngrok-free.app/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
    })
    .then(response => {
 
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
    })
    .catch(error => {
      // Handle errors from the initial file upload request
      console.error('Error uploading file:', error);
      throw error; // Rethrow the error to propagate it up the promise chain
    });
    
      }
  
 
   
  
};

export default actions;
