<template>
    <div>
        <v-container grid-list-md text-xs-center>
            <v-card>
                <v-card-title  class="text-h5">
                    Validation Portal
                </v-card-title>
                <v-card-subtitle>Template</v-card-subtitle>
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
                                v-model="unique_column_1"
                                :error-messages="input_validation_errors.unique_column_1"
                                label="Enter first unique column"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field
                                prepend-icon="mdi-table-column"
                                v-model="unique_column_2"
                                :error-messages="input_validation_errors.unique_column_2"
                                label="Enter second unique column"
                                hint="Optional"
                                persistent-hint
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col  class="align-end" cols="12">
                            <v-btn class="mr-2" :loading="validation_on_progress" @click="validateData()">Validate</v-btn>
                            <v-btn :loading="exporting_on_progress" v-if="needExporting" @click="exportToExcel()">Export To Excel</v-btn>
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
                        <v-data-table
                            :headers="headers"
                            :items="validation_errors.notEqualColumns"
                            :items-per-page="15"
                            class="elevation-2 mt-4"
                            v-if="validation_errors.notEqualColumns"
                        ></v-data-table>
                        <!-- <v-simple-table v-if="validation_errors.notEqualColumns">
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th class="text-left">
                                            Header
                                        </th>
                                        <th class="text-left">
                                            Row
                                        </th>
                                        <th class="text-left">
                                            Value
                                        </th>
                                        <th class="text-left">
                                            Expected Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(column, index) in  validation_errors.notEqualColumns" :key="index">
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ column.header }}</td>
                                        <td>{{ column.row }}</td>
                                        <td>{{ column.value }}</td>
                                        <td>{{ column.expected_value }}</td>
                                    </tr>
                                </tbody>
                            </template>
                        </v-simple-table> -->
                        <!-- <ol v-if="validation_errors.notEqualColumns">
                            <li v-for="(column, index) in  validation_errors.notEqualColumns" :key="index" v-html="column"></li> 
                        </ol> -->
                        <!-- <ol v-if="validation_errors.notEqualColumns">
                            <li v-for="(column, index) in  validation_errors.notEqualColumns" :key="index">
                                {{ index }}
                                <ol>
                                    <li  v-for="(error, index) in  column" :key="index" v-html="error"></li>
                                </ol>
                            </li> 
                        </ol> -->
                        <!-- <ol v-if="validation_errors.notEqualHeaders">
                            <li v-for="(column, index) in  validation_errors.notEqualHeaders" :key="index" v-html="column"></li> 
                        </ol> -->
                        <div v-if="validation_errors.validationErrorType == 'Data not found'">
                            <div class="mt-2" v-if="isComparisonNotFoundExisted">
                                <label>The data listed below are not existed in <strong>{{ validation_errors.itemsNotFound.comparison_sheet_not_found.notFoundIn}}</strong></label>
                                <div><strong>Data From:</strong> {{ validation_errors.itemsNotFound.comparison_sheet_not_found.excelSrc }}</div>
                                <div><strong>Total Errors:</strong> {{ validation_errors.itemsNotFound.comparison_sheet_not_found.error_count }}</div>
                                 <v-data-table
                                    :headers="data_not_found_headers"
                                    :items="validation_errors.itemsNotFound.comparison_sheet_not_found.data"
                                    :items-per-page="15"
                                    class="elevation-2 mt-4"
                                    v-if="validation_errors.itemsNotFound.comparison_sheet_not_found.data"
                                ></v-data-table>
                            </div>
                            <div :class="getBaseBaseDataNotFoundClassMargin" v-if="isBaseDataNotFoundExisted">
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
<!-- 
                        <ol v-if="validation_errors.itemsNotFound">
                            <li  v-for="(item, index) in  validation_errors.itemsNotFound" :key="index" v-html="item"></li>
                        </ol> -->
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
        this.$store.dispatch("validation_template/resetValidationMessages")
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
                    text: "Unique Column",
                    align: "start",
                    value: "unique_column",
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
            unique_column_1 : "",
            unique_column_2 : "",
            base_on_file : null,
            comparison_file : null,
        }
    },
    methods : {
        validateData : function(){
            this.$store.dispatch("validation_template/validateTemplate", { 
                base_on_file : this.base_on_file, 
                comparison_file : this.comparison_file,
                unique_column_1 : this.unique_column_1,
                unique_column_2 : this.unique_column_2,
            })
        },
        exportToExcel : function(){
            let validationErrs = this.validation_errors
            
            let excel_headers =  []; 
            let data = [];
            let type = "";
            
            if(this.cellValueNotMatchErrType) {
                excel_headers = [
                    "Unique Column",
                    "Header",
                    "Row",
                    "Value",
                    "Expected Value"
                ];
                data = validationErrs.notEqualColumns
                type = "CellValuesDoesNotMatch"
            } else if(this.dataNotFoundErrType){
                excel_headers = [
                    "Header",
                    "Row",
                    "Value",
                ]
                data = validationErrs.itemsNotFound
                type = "DataNotFound"
            }

            this.$store.dispatch("validation_template/exportToExcel", {
                excel_headers,
                data,
                type
            })

        }
    },
    computed: {
        getBaseBaseDataNotFoundClassMargin(){
            return this.isComparisonNotFoundExisted? "mt-5" : "mt-2"
        },
        isComparisonNotFoundExisted(){
            let validationErrs = this.validation_errors
            return validationErrs.itemsNotFound.comparison_sheet_not_found && validationErrs.itemsNotFound.comparison_sheet_not_found.data.length > 0
        },
        isBaseDataNotFoundExisted(){
            let validationErrs = this.validation_errors
            return validationErrs.itemsNotFound.base_sheet_not_found && validationErrs.itemsNotFound.base_sheet_not_found.data.length > 0
        },
        getValidationErrType(){
            let validationErrs = this.validation_errors
            let validationErrType = validationErrs.validationErrorType
            return validationErrType
        },
        cellValueNotMatchErrType(){
            if(! this.getValidationErrType) {
                return false
            }
            return this.getValidationErrType.includes("Cell Values doesn't match")
        },
        dataNotFoundErrType(){
            if(! this.getValidationErrType) {
                return false
            }
            return this.getValidationErrType.includes("Data not found")
        },
        needExporting(){
            return this.cellValueNotMatchErrType || this.dataNotFoundErrType
        },
        ...mapGetters({
            input_validation_errors : "validation_template/getInputValidationErrors",
            validation_errors: "validation_template/getValidationErrors",
            validation_on_progress: "validation_template/getValidationProgress",
            success_message : "validation_template/getSuccessMessage",
            exporting_on_progress: "validation_template/getExportingProgress",
         }),
    },
}
</script>