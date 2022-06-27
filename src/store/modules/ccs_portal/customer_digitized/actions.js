import axios from "axios";
import rootUrl from "../../../rootUrl";
 var fileDownload = require('js-file-download');
//digitized
const indexUrl = rootUrl + "/api/digitized/index";
const branchesUrl = rootUrl + "/api/branches/public";

const UploadUrl = rootUrl + "/api/digitized/upload";
const UpdateUrl = rootUrl + "/api/digitized/update";
const TrashUrl = rootUrl + "/api/digitized/trash";
const DeleteUrl = rootUrl + "/api/digitized/delete";
const DownloadUrl = rootUrl + "/api/digitized/download";

const actions = {
  fetchCDR(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(indexUrl).then(response => {
      context.commit("GET_CDR", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  fetchbranches(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(branchesUrl).then(response => {
      context.commit("GET_BRANCHES", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeCDR(context, data) {
 
      context.commit("LOADING_STATUS", true, { root: true }); // start loading
    let formData = new FormData();
    //Attachment
    data.validID_file.map(function (value, key) {
      formData.append('file-valid-id' + key, value);
    });
    data.proof_of_billing.map(function (value, key) {
      formData.append('file-proof-billing' + key, value);
    });
    formData.append('file-application-form', data.application_file);
    formData.append('file-picture_file', data.picture_file);

    //Customer Information
    formData.append('customer-name', data.custormer_info.customer_name);
    formData.append('birthday', data.custormer_info.birthday);
    formData.append('branch', data.custormer_info.branch.value);
    formData.append('unit-avail', data.custormer_info.unit_avail);
  
      axios
        .post(UploadUrl, formData, {
          headers: {
          'Content-Type': 'multipart/form-data'
        }})
        .then(response=> {
         console.log(response)
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
  updateCDR(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    let formData = new FormData();
    //Attachment
    data.validID_file.map(function (value, key) {
      formData.append('file-valid-id' + key, value);
    });
    data.proof_of_billing.map(function (value, key) {
      formData.append('file-proof-billing' + key, value);
    });
    formData.append('file-application-form', data.application_file);
    formData.append('file-picture_file', data.picture_file);
    //Customer Information
    formData.append('customer-name', data.custormer_info.customer_name);
    formData.append('birthday', data.custormer_info.birthday);
    formData.append('branch', data.custormer_info.branch.value);
    formData.append('unit-avail', data.custormer_info.unit_avail);
    formData.append('id', data.id);
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
  
  // getDateAgencies(context, data){
  //   axios
  //   .post(getDateUrl,  { id: data}
  //    )
  //    .then(response=> {
  //    //console.log(response)
  //    context.commit("DATE_HISTORY",response)
  //    // show snackbar
  //   })
  // },
  download(context, data){
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
  preview(context, data){
    axios
    .post(DownloadUrl,  { id: data.id},
      {responseType: 'blob'})
     .then(response=> {

        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement('a');

        fileLink.href = fileURL;
        fileLink.setAttribute('download', ''+data.filename+'');
        document.body.appendChild(fileLink);
        
 
     context.commit("ATTACHMENT_DATA", fileURL); 
     
    })
  },
  trashCDR(context, data){
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
  deleteCDR(context, data){
    axios
    .post(DeleteUrl,  { id: data} )
    .then(response => {
      console.log(response.data)
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
