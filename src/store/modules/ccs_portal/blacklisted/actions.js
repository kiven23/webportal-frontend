import axios from "axios";
import rootUrl from "../../../rootUrl";
//blacklisted
const uploadUrl = rootUrl + "/api/blacklisted/upload";

const segment = rootUrl + "/api/public/branch/segment";

const series = rootUrl + "/api/public/branch/series";
const search = rootUrl + "/api/blacklisted/search";
const blacklisted = rootUrl + "/api/blacklisted/index";
const actions = {
 
  fetchBranchSegment(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(segment).then(response => {
      context.commit("GET_SEGMENT", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  fetchBranchSeries(context) {
    context.commit("LOADING_STATUS", true, { root: true }); // start loading
    axios.get(series).then(response => {
      context.commit("GET_SERIES", response.data);
      context.commit("LOADING_STATUS", false, { root: true });
    });
  },
  fetchBlackListed(context, data) {
    
    context.commit("LOADING_STATUS2", true, { root: true }); // start loading
    axios.get(blacklisted).then(response => {
      context.commit("GET_BLACKLISTED", response.data);
      context.commit("LOADING_STATUS2", false, { root: true });
     
    });
  },
  searchBlacklisted(context, data)
          { 
              context.commit("LOADING_STATUS", true, { root: true });
              axios
              .post(search,  data)
              .then(response => {
                    context.commit("LOADING_STATUS", false, { root: true });
                    context.commit("GET_BLACKLISTED", response.data);
                          let payload = [
                            {
                              status: true,
                              message: "Fetch Done...!",
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
  UploadBlacklisted(context, data) {
    let formdata = new FormData();
    formdata.append('blacklisted', data)
    axios
      .post(uploadUrl, formdata, {
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
            message: "New Blacklisted Customer Data successfully Updated.",
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
