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
            formData.append('pdfFile', data);  
            console.log(data)
            axios.post('https://571d-124-107-173-55.ngrok-free.app/api/upload', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data', // Important for file uploads
                },
          })
            .then(response => {
              axios
              .post(finalupload, response.data )
              .then(response => {
                   console.log(response)
                   alert('uploaded')
               })
               .catch(error => {
                context.commit("LOADING_STATUS", false, { root: true }); // stop loading
              });
              // Handle the response from the server
              console.log('File uploaded successfully:', response.data);
            })
            .catch(error => {
              // Handle any errors that occur during the upload
              console.error('Error uploading file:', error);
            });
      }
  
 
   
  
};

export default actions;
