sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], function (Controller, ODataModel, MessageToast, JSONModel, DateFormat) {
    "use strict";

    return Controller.extend("salesproject.controller.SingleController", {

        onInit: function () {
            var oModel = new ODataModel("/sap/opu/odata/sap/ZVBAP_SRV", {
                json: true,
                loadMetadataAsync: true
            });
            this.getView().setModel(oModel);

            // Initialize the selected data model (empty array to store selected data)
            var oSelectedDataModel = new JSONModel([]);  
            sap.ui.getCore().setModel(oSelectedDataModel, "selectedDataModel");  // Set as a global model
        },

        onGoPress: function () {
            var oView = this.getView();
            var sVbeln = this.byId("KaufnInput1").getValue().trim();
            var sKunnr = this.byId("Customer1").getValue().trim();
            var sVkorg = this.byId("salesOrgSearch1").getValue().trim();
            var oDatePicker = this.byId("dateInput1");
            var sErdat = oDatePicker.getDateValue();

            // Format the date for OData if needed
            if (sErdat) {
                sErdat = this._formatDateForOData(sErdat);
            }

            // Validate that at least one search parameter is provided
            if (!sVbeln && !sKunnr && !sVkorg && !sErdat) {
                MessageToast.show("Please enter a VBELN, Sales Org, or Date to fetch data.");
                return;
            }

            // Get the OData model and apply filters
            var oModel = this.getView().getModel();
            var that = this;
            var aSalesOrders = sVbeln.split(',');
            var aFilters = [];

            // Add sales order filters
            aSalesOrders.forEach(function(sVbeln) {
                sVbeln = sVbeln.trim();
                if (sVbeln) {
                    // If the sales order number is less than 10 characters, pad it with leading zeros
                    if (sVbeln.length < 10) {
                        sVbeln = sVbeln.padStart(10, '0');
                    }
                    aFilters.push(new sap.ui.model.Filter("Kaufn", sap.ui.model.FilterOperator.EQ, sVbeln));
                }
            });

            if (sKunnr) {
                aFilters.push(new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, sKunnr));
            }
            if (sVkorg) {
                aFilters.push(new sap.ui.model.Filter("Vkorg", sap.ui.model.FilterOperator.EQ, sVkorg));
            }
            if (sErdat) {
                aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, sErdat));
            }

            // Read data and bind it to the table
            oModel.read("/zrardynamicSet", {
                filters: aFilters,
                success: function (oData) {
                   // alert(JSON.stringify(oData));

                    // Preprocess the data to format dates
                   /* oData.results.forEach(function(item) {
                        alert(item.Erdat);
                        if (item.Erdat) {
                            item.Erdat = this.formatDate(item.Erdat);
                        }
                    }.bind(this)); // Use `.bind(this)` to access the controller's scope*/

                    var oSalesDataModel = new JSONModel(oData.results);
                    oView.byId("zvbapTable").setModel(oSalesDataModel);
                    oView.byId("zvbapTable").bindItems({
                        path: "/",
                        template: oView.byId("Salesrowtemplete") // Referencing template ID
                    });
                },
                error: function (oError) {
                    console.error("Error loading data from OData service: ", oError);
                    MessageToast.show("Error fetching data.");
                }
            });
        },

        // Function to format date for OData
        // Helper function to format the date for OData queries in YYYYMMDD format
        _formatDateForOData: function (date) {
            if (!(date instanceof Date)) {
                return null;
            }
            var year = date.getFullYear();
            var month = ("0" + (date.getMonth() + 1)).slice(-2); // Month is zero-based
            var day = ("0" + date.getDate()).slice(-2);
            return `${year}${month}${day}`; // Return as YYYYMMDD
        },

        onSelect: function () {
            var oTable = this.getView().byId("zvbapTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one item.");
                return;
            }

            var oSelectedDataModel = sap.ui.getCore().getModel("selectedDataModel");
            var aSelectedData = oSelectedDataModel.getData();

            aSelectedItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext();  // Assuming default model is used
                if (oContext) {
                    var oData = oContext.getObject();  // Get row data
                    var bExists = aSelectedData.some(function (item) {
                        return item.Vbeln === oData.Vbeln && item.Posnr === oData.Posnr;
                    });

                    if (!bExists) {  // Avoid duplicates
                        aSelectedData.push(oData);
                    }
                }
            });

            oSelectedDataModel.setData(aSelectedData);
            MessageToast.show("Selected data stored successfully.");
        },

        onnext: function () {
            debugger
            var oSelectedDataModel = sap.ui.getCore().getModel("selectedDataModel");
            var aSelectedData = oSelectedDataModel.getData();

            if (aSelectedData.length === 0) {
                MessageToast.show("No data to submit. Please select items first.");
                return;
            }

            // Clear the current table
            this._clearTable();

            // Navigate to the next page with selected data
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("table", {
                selectedData: JSON.stringify(aSelectedData)  // Pass the selected data
            });

            MessageToast.show("Data stored and navigating to the next view.");
        },

        _clearTable: function () {
            var oTable = this.getView().byId("zvbapTable");
            oTable.unbindItems();  // Clear the table binding
        },

        // Handling the next view's initialization and displaying the selected data
        _onObjectMatched: function (oEvent) {
            var sSelectedData = oEvent.getParameter("arguments").selectedData;
            var aSelectedData = JSON.parse(sSelectedData);  // Parse the passed data

            // Bind the selected data to a table on the next page
            var oModel = new JSONModel(aSelectedData);
            this.getView().byId("selectedItemsTable").setModel(oModel);
            this.getView().byId("selectedItemsTable").bindItems({
                path: "/",
                template: this.byId("rowTemplate")  // Assuming a row template is defined
            });
        },

        onInitSecondPage: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("table").attachPatternMatched(this._onObjectMatched, this);
        }
    });
});
