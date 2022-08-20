import axios from "axios";
import rootUrl from "../../../rootUrl";
const prefix = rootUrl + "/api/validation-portal";

const actions = {
    validateGoodReceiptToSerial : function(context, files){
        //console.log(files)
        let formData = new FormData()
        formData.append("base_on_file", files.base_on_file)
        formData.append("comparison_file", files.comparison_file)
        formData.append("column_to_compare", files.column_to_compare)
        formData.append("alt_name_of_col", files.alt_name_of_col)
        formData.append("match_column_1", files.match_column_1)
        formData.append("match_column_2", files.match_column_2)
        
        context.commit("setValidationProgress", true);
        
        axios.post(prefix + "/validate-good-receipt-to-serial", formData)
            .then(res => {
                //console.log(res)
                context.dispatch("resetValidationMessages")
                context.commit("setSuccessMessage", res.data.message)
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