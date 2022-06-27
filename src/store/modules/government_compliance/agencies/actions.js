 import axios from "axios";
 import rootUrl from "../../../rootUrl";
 var fileDownload = require('js-file-download');
 //agencies
 const indexUrl = rootUrl + "/api/agencies/index";
 const StoreUrl = rootUrl + "/api/agencies/store";
 const UpdateUrl = rootUrl + "/api/agencies/update";
 const TrashUrl = rootUrl + "/api/agencies/trash";


 const getDateUrl = rootUrl + "/api/agencies/date";
 const DeleteUrl = rootUrl + "/api/agencies/delete";
 const DownloadUrl = rootUrl + "/api/agencies/download";
const actions = {
  fetchAgencies(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(indexUrl).then(response => {
      context.commit("GET_AGENCIES", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeAgencies(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
     let formData = new FormData();
    //Attachment
      data.dole_file.map(function(value, key) {
        formData.append('file-dole'+key, value);
      });
      data.bir_file.map(function(value, key) {
        formData.append('file-bir'+key, value);
      });
      data.lgu_file.map(function(value, key) {
        formData.append('file-lgu'+key, value);
      });
    axios
      .post(StoreUrl, formData, {
        headers: {
        'Content-Type': 'multipart/form-data'
      }})
      .then(response=> {
       //console.log(response)
       context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
       context.commit("LOADING_STATUS", false, { root: true }); // stop loading
        let payload = [
          {
            status: true,
            message: "New Agencies Land Docs successfully added.",
            timeout: 3000
          }
        ];
       context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PERM_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  updateAgencies(context, data) {
  
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    let formData = new FormData();
    data.dole_file.map(function(value, key) {
      formData.append('file-dole'+key, value);
    });
    data.bir_file.map(function(value, key) {
      formData.append('file-bir'+key, value);
    });
    data.lgu_file.map(function(value, key) {
      formData.append('file-lgu'+key, value);
    });
    data.id.map(function(value, key) {
      formData.append('id', value);
    });
    axios
      .post(UpdateUrl, formData, {
        headers: {
        'Content-Type': 'multipart/form-data'
      }})
      .then(response=> {
        //console.log(response)
       context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
       context.commit("LOADING_STATUS", false, { root: true }); // stop loading
        let payload = [
          {
            status: true,
            message: "Agencies successfully Updated.",
            timeout: 3000
          }
        ];
       context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PERM_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
  },
  getDateAgencies(context, data){
    axios
    .post(getDateUrl,  { id: data}
     )
     .then(response=> {
     //console.log(response)
     context.commit("DATE_HISTORY",response)
     // show snackbar
    })
  },
  downloadAgencies(context, data){
    axios
    .post(DownloadUrl,  { id: data.id},
      {responseType: 'blob'})
     .then(response=> {

        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement('a');
    
        fileLink.href = fileURL;
        fileLink.setAttribute('download', ''+data.filename+'');
        document.body.appendChild(fileLink);
        fileLink.click();
  
          let payload = [
            {
              status: true,
              message: "File successfully Downloaded.",
              timeout: 3000
            }
        ];
     context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
    })
  },
  trashAgencies(context, data){
    axios
    .post(TrashUrl,  { id: data} )
    .then(response => {
    // console.log(response.data)
    
      let payload = [
        {
          status: true,
          message: "File successfully Deleted.",
          timeout: 3000
        }
      ];
     context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
     })
     .catch(error => {
      context.commit("PERM_ERROR", error.response.data); // get error from backend
      context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    });
  },
  deleteAgencies(context, data){
    axios
    .post(DeleteUrl,  { id: data} )
    .then(response => {
     //console.log(response.data)
    
      let payload = [
        {
          status: true,
          message: "File successfully Deleted.",
          timeout: 3000
        }
      ];
     context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
     })
     .catch(error => {
      context.commit("PERM_ERROR", error.response.data); // get error from backend
      context.commit("LOADING_STATUS", false, { root: true }); // stop loading
    });
  }
 
};

export default actions;
