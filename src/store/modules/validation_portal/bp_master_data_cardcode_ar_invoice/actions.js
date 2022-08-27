import axios from "axios";
import rootUrl from "../../../rootUrl";
const prefix = rootUrl + "/api/validation-portal";

const actions = {
    validateBPMasterDataCardCodeArInvoice : function(context, files){
       // console.log(files)
        let formData = new FormData()
       // console.log(files)
        formData.append("base_on_file", files.base_on_file)
        formData.append("comparison_file", files.comparison_file)
        formData.append("base_match_column", files.base_match_column)
        formData.append("comparison_match_column", files.comparison_match_column)
        formData.append("base_columns_to_get", files.base_columns_to_get)
        formData.append("comparison_columns_to_get", files.comparison_columns_to_get)
        
        context.commit("setValidationProgress", true);
        
        axios.post(prefix + "/validate-bp-master-cardcode-ar-invoice", formData,  { responseType : "blob"})
            .then(response => {
                context.dispatch("resetValidationMessages")
                let blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                let link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = response.headers['content-disposition'].split("filename=")[1]
                link.click()
                context.commit("setSuccessMessage", "Validation Successful")
            })
            .catch(err => {
                context.dispatch("resetValidationMessages")
                
                let errResponse = err.response
                let errStatusCode = errResponse.status
                let errData = errResponse.data
                if(errStatusCode == 422) {
                    context.commit("setInputValidationErrors", errData.errors)
                } else if(errStatusCode == 500) {
                    context.commit("setValidationErrors", errData)
                }
            })
            .finally(() => {
                context.commit("setValidationProgress", false);
            })
    },
    resetValidationMessages(context) {
        context.commit("setSuccessMessage", null)
        context.commit("setInputValidationErrors", {})
        context.commit("setValidationErrors", {})
    }
};
  
export default actions;