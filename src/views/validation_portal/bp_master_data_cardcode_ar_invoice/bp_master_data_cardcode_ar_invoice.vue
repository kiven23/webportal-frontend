<template>
    <div>
        <v-container grid-list-md text-xs-center>
            <v-card>
                <v-card-title  class="text-h5">
                    Validation Portal
                </v-card-title>
                <v-card-subtitle>BP Master Data CardCode - AR Invoice CardCode</v-card-subtitle>
                <v-divider></v-divider>
                <v-card-text>
                    <v-row>
                        <v-col cols="4">
                            <v-file-input
                                prepend-icon="mdi-microsoft-excel"
                                v-model="base_on_file"
                                show-size
                                :error-messages="input_validation_errors.base_on_file"
                                label="Select file to base on"
                            ></v-file-input>
                        </v-col>
                        <v-col cols="4">
                            <v-file-input
                                prepend-icon="mdi-microsoft-excel"
                                v-model="comparison_file"
                                show-size
                                :error-messages="input_validation_errors.comparison_file"
                                label="Select another file for comparison"
                            ></v-file-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="4">
                            <v-text-field
                                prepend-icon="mdi-table-column"
                                v-model="base_match_column"
                                 :error-messages="input_validation_errors.base_match_column"
                                label="Base file match column name"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field
                                prepend-icon="mdi-table-column"
                                v-model="comparison_match_column"
                                label="Comparison file match column name"
                                :error-messages="input_validation_errors.comparison_match_column"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>    
                        <v-col cols="4">
                            
                            <v-combobox
                                v-model="base_columns_to_get"
                                chips
                                clearable
                                label="Input columns to get in base file"
                                multiple
                                prepend-icon="mdi-table-column"
                                :error-messages="input_validation_errors.base_columns_to_get"
                               
                            >
                                <template v-slot:selection="{ attrs, item, select, selected }">
                                    <v-chip
                                        v-bind="attrs"
                                        :input-value="selected"
                                        close
                                        @click="select"
                                        @click:close="removeBaseColumn(item)"
                                    >
                                    <strong>{{ item }}</strong>&nbsp;
                                </v-chip>
                                </template>
                            </v-combobox>
                        </v-col>
                        <v-col cols="4">
                           <v-combobox
                                v-model="comparison_columns_to_get"
                                chips
                                clearable
                                label="Input columns to get in comparison file"
                                multiple
                                prepend-icon="mdi-table-column"
                                :error-messages="input_validation_errors.comparison_columns_to_get"
                               
                            >
                                <template v-slot:selection="{ attrs, item, select, selected }">
                                    <v-chip
                                        v-bind="attrs"
                                        :input-value="selected"
                                        close
                                        @click="select"
                                        @click:close="removeComparisonColumn(item)"
                                    >
                                    <strong>{{ item }}</strong>&nbsp;
                                </v-chip>
                                </template>
                            </v-combobox>
                        </v-col>
                        <v-col  class="align-end" cols="12">
                            <v-btn class="mr-2" :loading="validation_on_progress" @click="validateData()">Validate</v-btn>
                            <v-btn :loading="exporting_on_progress" v-if="validation_errors.validationErrorType" @click="exportToExcel()">Export To Excel</v-btn>
                        </v-col>
                    </v-row>
                    <div class="mt-5" v-if="success_message">
                        <div class="text-h6 green--text text--darken-1">{{ success_message }}</div>
                    </div>
                     <div class="mt-7" v-if="validation_errors.validationErrorType">
                        <h3 class="mb-1 red--text text--lighten-1 text-h6">Validation Errors</h3>
                        <h4 class="mb-2 red--text text--lighten-2">{{ validation_errors.validationErrorType }}</h4>
                        <div v-if="validation_errors.validationErrorType == 'Data not found'">
                            <div class="mt-2" v-if="validation_errors.itemsNotFound.base_sheet_not_found && validation_errors.itemsNotFound.base_sheet_not_found.data.length > 0">
                                <label>The data listed below are not existed in <strong>{{ validation_errors.itemsNotFound.base_sheet_not_found.notFoundIn}}</strong></label>
                                <div><strong>Data From:</strong> {{ validation_errors.itemsNotFound.base_sheet_not_found.excelSrc }}</div>
                                <div><strong>Total Errors:</strong> {{ validation_errors.itemsNotFound.base_sheet_not_found.error_count }}</div>
                                    <v-data-table
                                    :headers="data_not_found_headers"
                                    :items="validation_errors.itemsNotFound.base_sheet_not_found.data"
                                    :items-per-page="15"
                                    class="elevation-2 mt-4"
                                    v-if="validation_errors.itemsNotFound.base_sheet_not_found.data"
                                ></v-data-table>
                            </div>
                        </div>
                    </div>  
                </v-card-text>
            </v-card>
        </v-container>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'; 
export default {
    created() {
        this.$store.dispatch("validation_template/checkAuth")
    },
    mounted(){
        this.$store.dispatch("validation_bp_master_ar_invoice_cardcode/resetValidationMessages")
    },
    data () {
        return {
            data_not_found_headers : [
                 {
                    text: "No.",
                    align: "center",
                    sortable: false,
                    value: "no",
                },
                {
                    text: "Header",
                    align: "start",
                    value: "header"
                },
                {
                    text: "Row",
                    align: "start",
                    value: "row",
                    sortable: false,
                },
                {
                    text: "Value",
                    align: "start",
                    value: "value",
                    sortable: false,
                },
            ],
            base_match_column : "AliasName",
            comparison_match_column : "CardCode",
            base_on_file : null,
            comparison_file : null,
            base_columns_to_get: [
                "CardCode",
                "AliasName"
            ],
            comparison_columns_to_get: [
                "CardName"
            ],
        }
    },
    methods : {
        validateData : function(){
            this.$store.dispatch("validation_bp_master_ar_invoice_cardcode/validateBPMasterDataCardCodeArInvoice", { 
                base_on_file : this.base_on_file, 
                comparison_file : this.comparison_file,
                base_match_column : this.base_match_column,
                comparison_match_column : this.comparison_match_column,
                base_columns_to_get : this.base_columns_to_get,
                comparison_columns_to_get : this.comparison_columns_to_get
            })
        },
        removeBaseColumn(item) {
            this.base_columns_to_get.splice(this.base_columns_to_get.indexOf(item), 1)
        },
        removeComparisonColumn(item) {
            this.comparison_columns_to_get.splice(this.comparison_columns_to_get.indexOf(item), 1)
        },
        exportToExcel : function(){

            let validationErrs = this.validation_errors
            let excel_headers = [
                "Header",
                "Row",
                "Value",
                ];

            let data = validationErrs.itemsNotFound
            this.$store.dispatch("validation_template/exportToExcel", {
                excel_headers,
                data,
                type: "DataNotFound"
            })

        }
    },
    computed: {
        ...mapGetters({
            input_validation_errors : "validation_bp_master_ar_invoice_cardcode/getInputValidationErrors",
            validation_errors: "validation_bp_master_ar_invoice_cardcode/getValidationErrors",
            validation_on_progress: "validation_bp_master_ar_invoice_cardcode/getValidationProgress",
            success_message : "validation_bp_master_ar_invoice_cardcode/getSuccessMessage",
            exporting_on_progress: "validation_template/getExportingProgress",
        }),
    }, 
}
</script>