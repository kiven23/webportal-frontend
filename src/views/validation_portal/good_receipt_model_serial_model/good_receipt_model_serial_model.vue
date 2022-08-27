<template>
    <div>
        <v-container grid-list-md text-xs-center>
            <v-card>
                <v-card-title  class="text-h5">
                    Validation Portal
                </v-card-title>
                <v-card-subtitle>Good Receipt Model - Serial Model</v-card-subtitle>
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
                                v-model="column_to_compare"
                                 :error-messages="input_validation_errors.column_to_compare"
                                label="Enter column to compare"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field
                                prepend-icon="mdi-table-column"
                                v-model="alt_name_of_col"
                                label="Enter alternate name"
                                :error-messages="input_validation_errors.alt_name_of_col"
                                hint="Optional"
                                persistent-hint
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>    
                        <v-col cols="4">
                            <v-text-field
                                prepend-icon="mdi-table-column"
                                v-model="match_column_1"
                                :error-messages="input_validation_errors.match_column_1"
                                label="Enter matched column 1"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field
                                prepend-icon="mdi-table-column"
                                v-model="match_column_2"
                                :error-messages="input_validation_errors.match_column_2"
                                label="Enter matched column 2"
                                hint="Optional"
                                persistent-hint
                            ></v-text-field>
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
                        <h4 v-if="validation_errors.excelSrc">Excel Source: {{ validation_errors.excelSrc }}</h4>
                        <div v-if="validation_errors.message" v-html="validation_errors.message"></div>
                        <v-data-table  v-if="validation_errors.notMatchData"
                            :headers="headers"
                            :items="validation_errors.notMatchData"
                            :items-per-page="15"
                            class="elevation-2 mt-4"
                        ></v-data-table>
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
        this.$store.dispatch("validation_good_receipt_serial/resetValidationMessages")
    },
    data () {
        return {
            headers : [
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
                {
                    text: "Expected Value",
                    align: "start",
                    value: "expected_value",
                    sortable: false,
                }
            ],
            column_to_compare : "LineNum",
            alt_name_of_col : "DocLineNum",
            match_column_1 : "ItemCode",
            match_column_2 : "WhsCode",
            base_on_file : null,
            comparison_file : null,
        }
    },
    methods : {
        validateData : function(){
            this.$store.dispatch("validation_good_receipt_serial/validateGoodReceiptToSerial", { 
                base_on_file : this.base_on_file, 
                comparison_file : this.comparison_file,
                column_to_compare : this.column_to_compare,
                alt_name_of_col : this.alt_name_of_col,
                match_column_1 : this.match_column_1,
                match_column_2 : this.match_column_2
            })
        },
        exportToExcel : function(){

            let validationErrs = this.validation_errors
            let excel_headers = [
                "Header",
                "Row",
                "Value",
                "Expected Value",
                ];

            let data = validationErrs.notMatchData
            this.$store.dispatch("validation_template/exportToExcel", {
                excel_headers,
                data,
                type: "DataDoesnotMatch"
            })

        }
    },
    computed: {
        ...mapGetters({
            input_validation_errors : "validation_good_receipt_serial/getInputValidationErrors",
            validation_errors: "validation_good_receipt_serial/getValidationErrors",
            validation_on_progress: "validation_good_receipt_serial/getValidationProgress",
            success_message : "validation_good_receipt_serial/getSuccessMessage",
            exporting_on_progress: "validation_template/getExportingProgress",
        }),
    }, 
}
</script>