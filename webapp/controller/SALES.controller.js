sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, ODataModel, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("salesproject.controller.SALES", {
        onInit: function () {
            // Initialize the OData model but don't bind it to the table immediately
            var oModel = new ODataModel("/sap/opu/odata/sap/ZVBAP_SRV", {
                json: true,
                loadMetadataAsync: true
            });
            this.getView().setModel(oModel);

            // Ensure no data is shown initially by leaving the table unbound
            var oTable = this.byId("trainTable");
            oTable.unbindItems(); // Unbind items initially
        },

        onFetchPress: function () {
            debugger
            var sQuery = this.byId("inputField1").getValue().trim(); // Get and trim the search query

            // Validate if the input is provided
            if (!sQuery) {
                MessageToast.show("Please enter a VBELN value to fetch data.");
                return; // Stop the function execution if input is empty
            }

            // Prepare the OData call for the entered VBELN without filters, directly fetching the specific entry
            var oModel = this.getView().getModel();
            var that = this;

            // Clear any previously shown data
            this._clearTable();

            // Construct the specific path to fetch the VBELN from the backend
            var sPath = "/zvbapSet('" + sQuery + "')"; // Assuming the OData entity is key-based on VBELN

            // OData call to fetch data for the specific VBELN
            oModel.read(sPath, {
                success: function (oData) {
                    if (!oData) {
                        MessageToast.show("No data found for the entered VBELN.");
                    } else {
                        // Create a JSON model from the fetched data
                        var oJSONModel = new JSONModel({ results: [oData] }); // Wrap the single result in an array
                        that.getView().setModel(oJSONModel, "studentModel"); // Set it to a named model
                        
                        // Bind the table items to the new model
                        var oTable = that.byId("trainTable");
                        oTable.bindItems({
                            path: "studentModel>/results", // Bind to the results array in the model
                            template: that.getView().byId("_IDGenColumnListItem") // Use your item template
                        });
                    }
                },
                error: function () {
                    MessageToast.show("Error fetching data from the backend.");
                }
            });
        },

        _clearTable: function () {
            var oTable = this.byId("trainTable");
            oTable.unbindItems(); // Clear any existing data in the table
        }
    });
});
