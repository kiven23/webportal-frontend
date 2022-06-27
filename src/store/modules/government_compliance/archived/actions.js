 import axios from "axios";
 import rootUrl from "../../../rootUrl";
 //Archived
 const indexUrl = rootUrl + "/api/archived/index";
 const StoreUrl = rootUrl + "/api/archived/store";
 const UpdateUrl = rootUrl + "/api/archived/update";
 const DownloadUrl = rootUrl + "/api/archived/download";
 const DeleteUrl = rootUrl + "/api/archived/delete";
 const DeleteAttachUrl = rootUrl + "/api/archived/delete/attachment";
 const actions = {
  fetchArchived(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(indexUrl).then(response => {
      context.commit("GET_PROVIDER", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  storeArchived(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    let formData = new FormData();
    //Attachment
    formData.append('tctFile-file', data.tctinfo.tctFile[0]);
    formData.append('taxdecFile-file', data.taxDecInfo.taxdecFile[0]);
    formData.append('realPropertyTaxFile-file', data.realProInfo.realPropertyTaxFile[0]);
    formData.append('vicinityMapFile-file', data.vicinityMapFile);
    formData.append('deedOfSaleFile-file', data.deedOfSaleFile[0]);
    //Info
    formData.append('tctNumber', data.tctinfo.tctNumber);
    formData.append('location', data.tctinfo.location);
    formData.append('dateAquired', data.tctinfo.dateAquired);
    formData.append('area', data.tctinfo.area);
    //
    formData.append('taxDecNumber', data.taxDecInfo.taxDecNumber);
    formData.append('taxDecOption', data.taxDecInfo.taxDecOption);
    formData.append('owner', data.taxDecInfo.owner);
    formData.append('previousOwner', data.taxDecInfo.previousOwner);
    //
    formData.append('realPropertyTaxNumber', data.realProInfo.realPropertyTaxNumber);
    formData.append('realPropertyTaxDate', data.realProInfo.realPropertyTaxDate);
    formData.append('realPropertyTaxOption', data.realProInfo.realPropertyTaxOption);
    formData.append('realPropertyTaxAmount', data.realProInfo.realPropertyTaxAmount);
    formData.append('zonalValue', data.zonalValue2);


      //ADDITIONAL ATTACHMENT
        formData.append('tctFile-file2', data.tctinfo2.tctFile[0]);
        formData.append('taxdecFile-file2', data.taxDecInfo2.taxdecFile[0]);
        formData.append('realPropertyTaxFile-file2', data.realProInfo2.realPropertyTaxFile[0]);
        formData.append('vicinityMapFile-file2', data.vicinityMapFile2);
        formData.append('deedOfSaleFile-file2', data.deedOfSaleFile2[0]);
      //ADDITIONAL TAX DEC TAX
        formData.append('taxDecNumber2', data.taxDecInfo2.taxDecNumber);
        formData.append('taxDecOption2', data.taxDecInfo2.taxDecOption);
        formData.append('owner2', data.taxDecInfo2.owner);
        formData.append('previousOwner2', data.taxDecInfo2.previousOwner);
      //ADDITIONAL REAL PROPERTY TAX  
        formData.append('realPropertyTaxNumber2', data.realProInfo2.realPropertyTaxNumber);
        formData.append('realPropertyTaxDate2', data.realProInfo2.realPropertyTaxDate);
        formData.append('realPropertyTaxOption2', data.realProInfo2.realPropertyTaxOption);
        formData.append('realPropertyTaxAmount2', data.realProInfo2.realPropertyTaxAmount);
        formData.append('zonalValue2', data.zonalValue2);
    axios
      .post(StoreUrl, formData, {
        headers: {
        'Content-Type': 'multipart/form-data'
      }})
      .then(response=> {
      console.log(response.data)
       context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
       context.commit("LOADING_STATUS", false, { root: true }); // stop loading
        let payload = [
          {
            status: true,
            message: "New Archived Land Docs successfully added.",
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
  updateArchived(context, data) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    let formData = new FormData();
    //Attachment
    //FORM ID
    formData.append('form-id', data.tctinfo.id);
    //FORM ATTACHMENT
    formData.append('tctFile-file', data.tctinfo.tctFile[0]);
    formData.append('taxdecFile-file', data.taxDecInfo.taxdecFile[0]);
    formData.append('realPropertyTaxFile-file', data.realProInfo.realPropertyTaxFile[0]);
    formData.append('vicinityMapFile-file', data.vicinityMapFile);
    formData.append('deedOfSaleFile-file', data.deedOfSaleFile[0]);
    //ATTACHMENT ID
    formData.append('tctFile-file-id', data.tctinfo.tctFileID);
    formData.append('taxdecFile-file-id', data.taxDecInfo.taxdecFileID);
    formData.append('realPropertyTaxFile-file-id', data.realProInfo.realPropertyTaxFileID);
    formData.append('vicinityMapFile-file-id', data.vicinityMapFileID);
    formData.append('deedOfSaleFile-file-id', data.deedOfSaleFileID);
    

    //ATTACHMENT ID
    formData.append('tctFile-file-id2', data.tctinfo2.tctFileID);
    formData.append('taxdecFile-file-id2', data.taxDecInfo2.taxdecFileID);
    formData.append('realPropertyTaxFile-file-id2', data.realProInfo2.realPropertyTaxFileID);
    formData.append('vicinityMapFile-file-id2', data.vicinityMapFileID2);
    formData.append('deedOfSaleFile-file-id2', data.deedOfSaleFileID2);
    //Info
    formData.append('tctNumber', data.tctinfo.tctNumber);
    formData.append('location', data.tctinfo.location);
    formData.append('dateAquired', data.tctinfo.dateAquired);
    formData.append('area', data.tctinfo.area);

    formData.append('taxDecNumber', data.taxDecInfo.taxDecNumber);
    formData.append('taxDecOption', data.taxDecInfo.taxDecOption);
    formData.append('owner', data.taxDecInfo.owner);
    formData.append('previousOwner', data.taxDecInfo.previousOwner);

    formData.append('realPropertyTaxNumber', data.realProInfo.realPropertyTaxNumber);
    formData.append('realPropertyTaxDate', data.realProInfo.realPropertyTaxDate);
    formData.append('realPropertyTaxOption', data.realProInfo.realPropertyTaxOption);
    formData.append('realPropertyTaxAmount', data.realProInfo.realPropertyTaxAmount);
    formData.append('zonalValue', data.zonalValue);



    //ADDITIONAL ATTACHMENT
      formData.append('tctFile-file2', data.tctinfo2.tctFile[0]);
      formData.append('taxdecFile-file2', data.taxDecInfo2.taxdecFile[0]);
      formData.append('realPropertyTaxFile-file2', data.realProInfo2.realPropertyTaxFile[0]);
      formData.append('vicinityMapFile-file2', data.vicinityMapFile2);
      formData.append('deedOfSaleFile-file2', data.deedOfSaleFile2[0]);
    //ADDITIONAL TAX DEC TAX
      formData.append('taxDecNumber2', data.taxDecInfo2.taxDecNumber);
      formData.append('taxDecOption2', data.taxDecInfo2.taxDecOption);
      formData.append('owner2', data.taxDecInfo2.owner);
      formData.append('previousOwner2', data.taxDecInfo2.previousOwner);
    //ADDITIONAL REAL PROPERTY TAX  
      formData.append('realPropertyTaxNumber2', data.realProInfo2.realPropertyTaxNumber);
      formData.append('realPropertyTaxDate2', data.realProInfo2.realPropertyTaxDate);
      formData.append('realPropertyTaxOption2', data.realProInfo2.realPropertyTaxOption);
      formData.append('realPropertyTaxAmount2', data.realProInfo2.realPropertyTaxAmount);
      formData.append('zonalValue2', data.zonalValue2);


    axios
      .post(UpdateUrl, formData, {
        headers: {
        'Content-Type': 'multipart/form-data'
      }})
      .then(response=> {
     // console.log(response.data)
       context.commit("DIALOG_STATUS", false, { root: true }); // close dialog
       context.commit("LOADING_STATUS", false, { root: true }); // stop loading
        let payload = [
          {
            status: true,
            message: "Archived successfully Updated.",
            timeout: 3000
          }
        ];
     
       context.commit("GET_RESPONSE", response); // show snackbar
       context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PERM_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
    //console.log(data, context)
  },
  downloadArchived(context, data){
     axios
    .post(DownloadUrl, {id: data.id}, {
      responseType: 'blob'
  })
    .then(response=> {  
      //console.log(response)
        var fileURL = window.URL.createObjectURL(new Blob([response.data]));
        var fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', ''+data.name+'');
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
      });
  },
  deleteArchived(context, data){
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
  },
  attachmentDeletions(context, data){
    axios
    .post(DeleteAttachUrl,  data )
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
