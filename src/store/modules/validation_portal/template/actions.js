import axios from "axios";
import rootUrl from "../../../rootUrl";
const prefix = rootUrl + "/api/validation-portal";

const actions = {
    checkAuth : function(context) {
        axios.get(prefix + "/check-auth");
    },
    validateTemplate : function(context, files){
        let formData = new FormData()
       // console.log(files)
        formData.append("base_on_file", files.base_on_file)
        formData.append("comparison_file", files.comparison_file)
        formData.append("unique_column_1", files.unique_column_1)
        formData.append("unique_column_2", files.unique_column_2)
        
        context.commit("setValidationProgress", true);
        
        axios.post(prefix + "/validate-template", formData)
            .then(res => {
                //console.log(res)
                context.dispatch("resetValidationMessages")
                context.commit("setSuccessMessage", res.data.message)
            })
            .catch(err => {
                //console.log(err.response)
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
    exportToExcel(context, payload) {
        context.commit("setExportingProgress", true);
        axios.post(prefix + "/export-to-excel", payload, 
        { responseType : "blob"}
        )
        .then(response => {
            console.log(response)
            let blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = response.headers['content-disposition'].split("filename=")[1]
            link.click()
        })
        .finally(() => {
            context.commit("setExportingProgress", false);
        })
    },
    resetValidationMessages(context) {
        context.commit("setSuccessMessage", null)
        context.commit("setInputValidationErrors", {})
        context.commit("setValidationErrors", {})
    }
};
  
export default actions;