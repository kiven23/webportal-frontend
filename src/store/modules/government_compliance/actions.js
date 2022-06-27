 import axios from "axios";
 import rootUrl from "../../rootUrl";


 //Archived
 const indexUrl = rootUrl + "/api/archived/index";
 const StoreUrl = rootUrl + "/api/archived/store";
 const UpdateUrl = rootUrl + "/api/archived/update";
 const DownloadUrl = rootUrl + "/api/archived/download";

 


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

    formData.append('taxDecNumber', data.taxDecInfo.taxDecNumber);
    formData.append('taxDecOption', data.taxDecInfo.taxDecOption);
    formData.append('owner', data.taxDecInfo.owner);
    formData.append('previousOwner', data.taxDecInfo.previousOwner);

    formData.append('realPropertyTaxNumber', data.realProInfo.realPropertyTaxNumber);
    formData.append('realPropertyTaxDate', data.realProInfo.realPropertyTaxDate);
    formData.append('realPropertyTaxOption', data.realProInfo.realPropertyTaxOption);
    formData.append('realPropertyTaxAmount', data.realProInfo.realPropertyTaxAmount);
    formData.append('zonalValue', data.zonalValue);
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
    //Info
    formData.append('tctNumber', data.tctinfo.tctNumber);
    formData.append('location', data.tctinfo.location);
    formData.append('dateAquired', data.tctinfo.dateAquired);

    formData.append('taxDecNumber', data.taxDecInfo.taxDecNumber);
    formData.append('taxDecOption', data.taxDecInfo.taxDecOption);
    formData.append('owner', data.taxDecInfo.owner);
    formData.append('previousOwner', data.taxDecInfo.previousOwner);

    formData.append('realPropertyTaxNumber', data.realProInfo.realPropertyTaxNumber);
    formData.append('realPropertyTaxDate', data.realProInfo.realPropertyTaxDate);
    formData.append('realPropertyTaxOption', data.realProInfo.realPropertyTaxOption);
    formData.append('realPropertyTaxAmount', data.realProInfo.realPropertyTaxAmount);
    formData.append('zonalValue', data.zonalValue);
    axios
      .post(UpdateUrl, formData, {
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
            message: "Archived successfully Updated.",
            timeout: 3000
          }
        ];
       context.commit("SNACKBAR_STATUS", payload, { root: true }); // show snackbar
      })
      .catch(error => {
        context.commit("PERM_ERROR", error.response.data); // get error from backend
        context.commit("LOADING_STATUS", false, { root: true }); // stop loading
      });
    console.log(data, context)
    
  },
  downloadArchived(context, data){
    axios
    .post(DownloadUrl,  { id: data} )
    .then(response=> {
     console.log(response.data)
     
    })
  }
 
};

export default actions;
