sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, ODataModel, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("salesproject.controller.sales2", {
        onInit: function () {
            var oModel = new ODataModel("/sap/opu/odata/sap/ZVBAP_SRV", {
                json: true,
                loadMetadataAsync: true
            });
            this.getView().setModel(oModel);

            // Initialize selected data model
            var oSelectedDataModel = new JSONModel([]);
            sap.ui.getCore().setModel(oSelectedDataModel, "selectedDataModel");
        },

        onFetchPress: function () {
            debugger;
            var sVbelnInput = this.byId("vbelnInput").getValue().trim();
            var sKunnr = this.byId("Customer").getValue().trim();
            var sVkorg_ana = this.byId("salesOrgSearch").getValue().trim();
            var oDatePicker = this.byId("dateInput");
            var sErdat = oDatePicker.getDateValue();

            // Format the date for OData query if provided
            if (sErdat) {
                sErdat = this._formatDateForOData(sErdat);
            }

            // Check if any field is provided
            if (!sVbelnInput && !sKunnr && !sVkorg_ana && !sErdat) {
                MessageToast.show("Please enter a Sales Order No, Sales Org, or Date to fetch data.");
                return;
            }

            // Split the VBELN input into an array (comma or space-separated)
            var aVbeln = sVbelnInput ? sVbelnInput.split(/[\s,]+/) : [];

            var oModel = this.getView().getModel();
            var that = this;

            var sPath = "/zrardataSet";

            oModel.read(sPath, {
                success: function (oData) {
                    alert(JSON.stringify(oData));
                    var iRecordCount = oData.results.length;
         
                    // Log the number of records
                    alert(iRecordCount);
                    var aFilteredResults = oData.results.filter(function (item) {
                        // Match VBELN with any of the entered values (if any)
                        var matchesVbeln = aVbeln.length ? aVbeln.includes(item.Vbeln) : true;
                        var matchesKunnr = sKunnr ? item.Kunnr === sKunnr : true;
                        var matchesVkorg_ana = sVkorg_ana ? item.Vkorg === sVkorg_ana : true;
                        var matchesErdat = sErdat ? that._compareDates(item.Erdat, sErdat) : true;

                        return matchesVbeln && matchesKunnr && matchesVkorg_ana && matchesErdat;
                    });

                    if (aFilteredResults.length === 0) {
                        that._clearTable();
                        MessageToast.show("No data found for the entered values.");
                    } else {
                        var oJSONModel = new JSONModel({ results: aFilteredResults });
                        that.getView().setModel(oJSONModel, "zrardataModel");

                        var oTable = that.byId("zvbapTable");
                        oTable.bindItems({
                            path: "zrardataModel>/results",
                            template: that.getView().byId("_IDGenColumnListItem2")
                        });
                    }
                },
                error: function () {
                    that._clearTable();
                    MessageToast.show("Error fetching data from the backend.");
                }
            });
        },

        _clearTable: function () {
            var oTable = this.byId("zvbapTable");
            oTable.unbindItems();
        },

        _formatDateForOData: function (date) {
            if (!(date instanceof Date)) {
                return null;
            }

            var year = date.getFullYear();
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            var day = ("0" + date.getDate()).slice(-2);

            return `${year}-${month}-${day}`;
        },

        _compareDates: function (backendDate, frontendDate) {
            if (backendDate instanceof Date) {
                backendDate = backendDate.toISOString().split("T")[0];
            } else if (typeof backendDate === "string") {
                backendDate = backendDate.split("T")[0];
            }

            return backendDate === frontendDate;
        },

        onSearchHelpPress: function () {
            // Open the search help dialog
            this.byId("searchHelpDialog").open();
        },

        onSearchHelpGoPress: function () {
            // Fetch data based on the range inputs
            var sFrom = this.byId("vbelnFromInput").getValue().trim();
            var sTo = this.byId("vbelnToInput").getValue().trim();

            if (!sFrom || !sTo) {
                MessageToast.show("Please enter both From and To Sales Order values.");
                return;
            }

            var oModel = this.getView().getModel();
            var that = this;

            // Construct the OData path to fetch all data
            var sPath = "/zrardataSet"; // Fetching all records from the backend

            oModel.read(sPath, {
                success: function (oData) {
                    // Filter results based on the VBELN range in the frontend
                    var filteredResults = oData.results.filter(function(item) {
                        return item.Vbeln >= sFrom && item.Vbeln <= sTo;
                    });

                    if (filteredResults.length === 0) {
                        MessageToast.show("No data found for the specified range.");
                    } else {
                        var oJSONModel = new JSONModel({ results: filteredResults });
                        that.getView().setModel(oJSONModel, "zrardataModel");

                        that.byId("zvbapTable").bindItems({
                            path: "zrardataModel>/results",
                            template: that.getView().byId("_IDGenColumnListItem2")
                        });
                    }

                    that.byId("searchHelpDialog").close();
                },
                error: function () {
                    MessageToast.show("Error fetching data for the specified range.");
                }
            });
        },

        onSelect: function () {
            debugger;
            var oTable = this.getView().byId("zvbapTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one item.");
                return;
            }

            var oSelectedDataModel = sap.ui.getCore().getModel("selectedDataModel");
            var aSelectedData = oSelectedDataModel.getData();

            aSelectedItems.forEach(function (oItem) {
                var oContext = oItem.getBindingContext("zrardataModel");
                if (oContext) {
                    var oData = oContext.getObject();
                    var bExists = aSelectedData.some(function (item) {
                        return item.Vbeln === oData.Vbeln && item.Posnr === oData.Posnr;
                    });

                    if (!bExists) {
                        aSelectedData.push(oData);
                    }
                }
            });

            oSelectedDataModel.setData(aSelectedData);
            MessageToast.show("Selected data stored successfully.");
        },

        onDialogClose: function () {
            // Close the search help dialog
            this.byId("searchHelpDialog").close();
        },

        onnext: function () {
            debugger;
            var oSelectedDataModel = sap.ui.getCore().getModel("selectedDataModel");
            var aSelectedData = oSelectedDataModel.getData();

            if (aSelectedData.length === 0) {
                MessageToast.show("No data to submit. Please select items first.");
                return;
            }

            this._clearTable();

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("table");

            MessageToast.show("Data stored and navigating to the next view.");
        }
    });
});
