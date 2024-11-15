sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("salesproject.controller.table", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("table").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._bindTable();
        },

        _bindTable: function () {
            var oSelectedModel = sap.ui.getCore().getModel("selectedDataModel");
            if (!oSelectedModel) {
                console.error("No selected data model found.");
                return;
            }
            this.getView().setModel(oSelectedModel, "selectedDataModel");
            var oTable = this.byId("selectedDataTable");

            oTable.bindItems({
                path: "selectedDataModel>/",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: "{selectedDataModel>Vbeln}" }),
                        new sap.m.Text({ text: "{selectedDataModel>Vkorg}" }),
                        new sap.m.Text({ text: "{selectedDataModel>Raic}" }),
                        new sap.m.Text({ text: "{selectedDataModel>Erdat}" }),
                        new sap.m.Text({ text: "{selectedDataModel>Vtweg}" }),
                        new sap.m.Text({ text: "{selectedDataModel>Auart}" }),
                        new sap.m.Text({ text: "{selectedDataModel>SrcdocType}" }), 
                        new sap.m.Text({ text: "{selectedDataModel>ReferenceId}" }),  // Updated ReferenceId
                        new sap.m.Text({ text: "{selectedDataModel>Reference}" }),
                        new sap.m.Button({
                            icon: {
                                parts: ["selectedDataModel>Action"],
                                formatter: function(Action) {
                                    if (Action === "0001") {
                                        return "sap-icon://accept";  // Display the accept icon
                                    } else {
                                        return "sap-icon://decline"; // Display the decline icon
                                    }
                                }
                            },
                            press: function(oEvent) {
                                // Get the current item (row) and its binding context
                                var currentItem = oEvent.getSource().getParent(); 
                                var oContext = currentItem.getBindingContext("selectedDataModel");
                        
                                // Get the Sales Order Number (Vbeln) from the selected row
                                var sVbeln = oContext.getProperty("Vbeln"); 
                        
                                // Get the model and its data
                                var oModel = oContext.getModel();
                                var aData = oModel.getProperty("/");
                        
                                // Find the index of the record with the matching Sales Order Number
                                var iIndex = aData.findIndex(function(item) {
                                    return item.Vbeln === sVbeln;
                                });
                        
                                if (iIndex !== -1) {
                                    // Remove the record from the data array
                                    aData.splice(iIndex, 1);
                        
                                    // Update the model with the new data
                                    oModel.setProperty("/", aData);
                        
                                    // Show a message confirming the removal
                                    sap.m.MessageToast.show("Record with Sales Order " + sVbeln + " removed successfully.");
                                } else {
                                    sap.m.MessageToast.show("Record with Sales Order " + sVbeln + " not found.");
                                }
                            }
                        })
                    ]
                })
            });
        },

        onUpdate: function () {
            var oView = this.getView();
            var oModel = oView.getModel();
            var oTable = this.byId("selectedDataTable");
            var aAllItems = oTable.getBinding("items").getContexts(); 
            var updatePromises = []; 

            if (aAllItems.length === 0) {
                MessageToast.show("Error: No items found in the table to update.");
                return;
            }

            aAllItems.forEach(function(oContext) {
                var sKaufn = oContext.getProperty("Vbeln");
                var sReference = oContext.getProperty("Reference");

                if (!sKaufn || !sReference) {
                    MessageToast.show("Error: Kaufn (Vbeln) or Kunnr is not defined for item.");
                    return;
                }

                var oPayloadReference = {
                    Kaufn: sKaufn,
                    ReferenceId: sReference
                };

                var sPathZReference = "/zrardataSet('" + sKaufn + "')";
                updatePromises.push(
                    new Promise((resolve, reject) => {
                        oModel.update(sPathZReference, oPayloadReference, {
                            method: "PUT",
                            success: function () {
                                // Update the ReferenceId in the model
                                oContext.getModel().setProperty(oContext.getPath() + "/ReferenceId", sReference);
                                resolve();
                            },
                            error: function (oError) {
                               reject(oError);
                            }
                        });
                    })
                );
            });

            Promise.all(updatePromises)
                .then(function () {
                    MessageToast.show("All entries updated successfully.");
                    oModel.refresh(true); // Refresh the model to reflect changes
                })
                .catch(function (oError) {
                    this._handleError(oError);
                }.bind(this));
        },

        _handleError: function (oError) {
            var errorMessage = "An error occurred.";
            if (oError.responseText) {
                try {
                    var oResponse = JSON.parse(oError.responseText);
                    errorMessage = oResponse.error.message.value || "Error details not available.";
                } catch (e) {
                    errorMessage = "Failed to parse error response.";
                }
            }
            MessageToast.show(errorMessage);
            console.error("Error:", oError);
        },

        onBack: function () {
            this._clearTable();
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("smarttable");
        },
        
        _clearTable: function () {
            var oTable = this.byId("selectedDataTable");
            if (oTable) {
                oTable.unbindItems(); 
            }
            this.getView().setModel(null, "selectedDataModel");
        }
    });
});