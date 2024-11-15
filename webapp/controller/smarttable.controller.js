sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
     "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, ODataModel, MessageToast, JSONModel, DateFormat, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("salesproject.controller.smarttable", {

        onInit: function () {
            var oModel = new ODataModel("/sap/opu/odata/sap/ZVBAP_SRV", {
                json: true,
                loadMetadataAsync: true
            });
            this.getView().setModel(oModel);

            // Initialize an empty JSON model to bind the fetched data
            var oSalesDataModel = new JSONModel();
            this.getView().setModel(oSalesDataModel, "salesDataModel");

            oModel.attachMetadataLoaded(null, function() {
                var oSmartTable = this.byId("salesOrgSmartTable");
                oSmartTable.rebindTable(); // Ensure the SmartTable is rebinding
            }.bind(this));

            // Initialize a JSON model to store selected records
            var oSelectedDataModel = new JSONModel([]);
            sap.ui.getCore().setModel(oSelectedDataModel, "selectedDataModel"); // Store globally for access across views
        },
        onValueHelpRequestcustomer: function () {
            debugger
            this._loadCustomerData();
            this.getView().byId("CustomernoDialog").open();
        },

        

        _loadCustomerData: function () {
            debugger
            var oModel = this.getView().getModel();
            oModel.read("/zcustomerNumSet", {
                success: function (oData) {
                    console.log("Customer Data:", oData);
                    var oCustomerModel = new JSONModel(oData);
                    this.getView().setModel(oCustomerModel, "customerModel");
                    
                }.bind(this),
                error: function () {
                    MessageToast.show("Error fetching customer data.");
                }
            });
        },
        onDialogOkPress1: function () {
            var oTable = this.getView().byId("salesOrgSmartTable1").getTable();
            var aSelectedItems = oTable.getSelectedIndices();
            var oCustomerSearch = this.getView().byId("Customer1");
            oCustomerSearch.removeAllTokens();

            if (aSelectedItems.length > 0) {
                aSelectedItems.forEach(function (iIndex) {
                    var oContext = oTable.getContextByIndex(iIndex);
                    if (oContext) {
                        var oData = oContext.getObject();
                        var sCustomerNo = oData.Kunnr;
                        oCustomerSearch.addToken(new sap.m.Token({
                            key: sCustomerNo,
                            text: "=" + sCustomerNo
                        }));
                    }
                });
            }

            this.getView().byId("CustomernoDialog").close();
        },
        

        onDialogClose1: function () {
            this.getView().byId("CustomernoDialog").close();
        },

       

         // Open the Value Help dialog
         onValueHelpRequest: function () {
            // Load the sales organization data for the dialog
            this._loadSalesOrgData();

            // Open the dialog
            this.getView().byId("salesOrgDialog").open();
        },
        // Load Sales Organization data
        _loadSalesOrgData: function () {
            var oModel = this.getView().getModel();
            oModel.read("/ZSALES_ORG001Set", {
                success: function (oData) {
                    var oSalesOrgModel = new JSONModel(oData);
                    this.getView().byId("salesOrgTable").setModel(oSalesOrgModel);
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error fetching sales organization data.");
                }
            });
        },

        // OK button press event in the dialog
        onDialogOkPress: function () {
            var oTable = this.getView().byId("salesOrgSmartTable").getTable(); // Get table from SmartTable
            var aSelectedItems = oTable.getSelectedIndices(); // Get selected indices
              // Get the tokens from the MultiInput
            var oMultiInput = this.byId("salesOrgSearch1");
            var aTokens = oMultiInput.getTokens();
            // Prepare a string to hold the condition values
              var aConditions = aTokens.map(function(oToken) {
            return oToken.getText();
            });
            // Combine the conditions into a single string (optional, based on your requirement)
           var sCombinedConditions = aConditions.join(", "); // Change the separator as needed

            // Assuming you want to set this combined string to an Input field with id "someInputId"
              var oInputField = this.byId("salesOrgSearch1"); // Replace with the actual ID of your input field
             if (oInputField) {
              oInputField.setValue(sCombinedConditions);
              console.log("Set conditions to input field:", sCombinedConditions); // Log for debugging
           } else {
        console.error("Input field not found!");
    }

            var oSalesOrgSearch = this.getView().byId("salesOrgSearch1"); // Get MultiInput field
            oSalesOrgSearch.removeAllTokens(); // Clear existing tokens

            if (aSelectedItems.length > 0) {
                aSelectedItems.forEach(function (iIndex) {
                    var oContext = oTable.getContextByIndex(iIndex);
                    if (oContext) {
                        var oData = oContext.getObject(); // Get the selected row data
                        var sSalesOrg = oData.Bukrs; // Assuming Bukrs is the field for Sales Org

                        // Add selected sales org to MultiInput as token
                        oSalesOrgSearch.addToken(new sap.m.Token({
                            key: sSalesOrg,
                            text: "=" + sSalesOrg
                        }));
                    }
                });
            }

            this.getView().byId("salesOrgDialog").close(); // Close dialog
        },

        // Cancel button or dialog close event
        onDialogClose: function () {
            this.getView().byId("salesOrgDialog").close();
        },

        onGoPress: function () {
            debugger
            var sVbeln = this.byId("KaufnInput1").getValue();
            var sVbeln_token = this.byId("KaufnInput1");
            var sVkorg = this.byId("salesOrgSearch1").getValue();
            var sVkorg_token = this.byId("salesOrgSearch1");
           // var sKunnr = this.byId("Customer1").getValue().trim();
            var oSalesOrgSearch = this.getView().byId("salesOrgSearch1");
            var aVkorgTokens = oSalesOrgSearch.getTokens();
            var sVkorgInput = oSalesOrgSearch.getValue(); // Get the current value of the MultiInput
            var oCustomerMultiInput = this.byId("Customer1");
            var sKunnr = oCustomerMultiInput.getValue();
            var cTokens = oCustomerMultiInput.getTokens();
            var sSingleDate = null;

             // Fetch 'From Date', 'To Date', and 'Single Date' values
             var sStartDate = this.byId("fromDatePicker").getDateValue();
             var sEndDate = this.byId("toDatePicker").getDateValue();
             
             // Fetch tokens from MultiInput for the single date
             var oMultiInput = this.byId("recordCreatedOn");
            

            // Set the value from MultiInput into the Input
            var oSalesOrgInput = this.byId("salesOrgSearch12");
            var oBukrs = oSalesOrgInput.getValue();

           var aTokens= sVbeln_token.getTokens();
           var bTokens= sVkorg_token.getTokens();
           var DateTokens = oMultiInput.getTokens();
           
           //var cTokens= sKunnr_token.getTokens();
           
          //  var oDatePicker = this.byId("dateInput1"); this.byId();
          //  var sErdat = oDatePicker.getDateValue();
            var aFilters = [];

            if (sVbeln=='' && sVkorg=='' && bTokens==0 && sKunnr=='' && cTokens.length==0 && oBukrs=='' && DateTokens==0 ) {
                MessageToast.show("Select atleast one search criteria...");
                // Clear the table model and refresh the table
                var oSalesDataModel = this.getView().getModel("salesDataModel");
                oSalesDataModel.setData([]); // Clear the model's data

                // Bind the empty data to the table to refresh it
                this._bindDataToTable([]);
                return false;
            }

     //       if (sErdat) {
       //         sErdat = this._formatDateForOData(sErdat);
       //     }
            if (cTokens.length > 0) {
                // Assuming you're using the key of the token for the Kunnr filter
                sKunnr = cTokens[0].getKey(); 
            }
            if (DateTokens.length > 0) {
                sSingleDate = DateTokens[0].getKey(); // Assuming only one token, use the key (formatted date)
            }
            if (DateTokens.length > 0) {
                var tokenKey = DateTokens[0].getKey();
                
                // Check if the token contains a date range (with "..." in between)
                if (tokenKey.includes("...")) {
                    var parts = tokenKey.split("...");
                    
                    // Assign the start and end dates from the token to sStartDate and sEndDate
                    if (parts.length === 2) {
                        sStartDate = new Date(parts[0]); // Convert the start date string to a Date object
                        sEndDate = new Date(parts[1]);   // Convert the end date string to a Date object
                    }
                }
            }

            // Fetch value from equalToDatePicker
            var sSingleDate1 = this.byId("equalToDatePicker").getValue();
            

            var aValues = [];
            var aFilters = [];
            if (sKunnr) {
                aFilters.push(new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, sKunnr));
            }

             // Check the input value type
            if (sVkorgInput) {
             // Parse the input string
             var parsedTokens = this._parseSalesOrgInput(sVkorgInput);

             // Process parsed tokens into filters
        parsedTokens.forEach(function (token) {
            aFilters.push(new sap.ui.model.Filter("Vkorg", sap.ui.model.FilterOperator.EQ, token));
        });
    }

            if (aTokens && aTokens.length > 0) {
               
                aValues=this.getTokensData(sVbeln_token);
              
                    if (aValues && aValues.length > 1) {
                        for (var i = 0; i < aValues.length; i++) {
                            aFilters=  this.prepareFilters("Kaufn",aValues[i],aFilters);
                          
                        }
                    } else {
                        aFilters=this.prepareFilters("Kaufn",aValues[0],aFilters);
                    }
                
               
            }if (bTokens && bTokens.length > 0) {
                
                aValues=this.getTokensData(sVkorg_token);
                sVkorg = aValues[0];
                aFilters=this.prepareFilters("Vkorg",sVkorg,aFilters); 
                
            }if (DateTokens && DateTokens.length > 0 ){
              //  alert(sSingleDate);
                // Add date range filter if both 'From Date' and 'To Date' are available
                    if (sStartDate && sEndDate) {
                        var parts = sSingleDate.split("...");
                        aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, parts[0].replace(/-/g, ""), parts[1].replace(/-/g, "")));
                    } 
                    // If only 'Single Date' is entered
                    else if (sSingleDate) {
                        aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, sSingleDate.replace(/-/g, "")));
                    } 
                    else if (sSingleDate1) {
                        aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, sSingleDate1.replace(/-/g, "")));
                    }

            }

            
            

            if (sKunnr) {
                aFilters.push(new sap.ui.model.Filter("Kunnr", sap.ui.model.FilterOperator.EQ, sKunnr));
            }
          //  if (sErdat) {
            //    aFilters.push(new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.EQ, sErdat));
           // }
           // Check that Vbeln is not null or placeholders
    // Adding multiple conditions to filter out unwanted values
    var vbelnNotNullFilter = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.NE, null);
    var vbelnNotPlaceholderFilter1 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.NE, "0000-00-00");
    var vbelnNotPlaceholderFilter2 = new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.NE, ""); // Exclude empty strings if needed

    // Log filter conditions for debugging
    console.log("Filters being applied: ", aFilters);

    // Combine filters
    aFilters.push(vbelnNotNullFilter);
    aFilters.push(vbelnNotPlaceholderFilter1);
    aFilters.push(vbelnNotPlaceholderFilter2);
            var oModel = this.getView().getModel();
            var that = this;
            oModel.read("/zrardynamicSet", {
                filters: aFilters,
                success: function (oData) {
                //    alert();
                    var oSalesDataModel = that.getView().getModel("salesDataModel");
                    oSalesDataModel.setData(oData.results);
                    that._bindDataToTable(oData.results);
                },
                error: function () {
                    MessageToast.show("Error fetching data.");
                }
            });
        },
        // Function to parse the input string for sales organizations
_parseSalesOrgInput: function (sInput) {
    var tokens = [];
    if (sInput) {
        // Handle case for range input (e.g., US10...US01)
        if (sInput.includes('...')) {
            var rangeParts = sInput.split('...');
            if (rangeParts.length === 2) {
                var startToken = rangeParts[0].trim();
                var endToken = rangeParts[1].trim();
                tokens.push(startToken);
                tokens.push(endToken);
                // Optionally, add logic to include all values in between, if applicable
            }
        } else {
            // Handle prefixed equals input (e.g., =US10x)
            if (sInput.startsWith('=')) {
                tokens.push(sInput.substring(1).trim());
            } else {
                // Handle normal single token input (e.g., US10x)
                tokens.push(sInput.trim());
            }
        }
    }
    return tokens;
},
         
        prepareFilters:function(keydata,dataFilters,aFilters){
            
          //  alert(keydata+"--"+dataFilters);
            if (dataFilters.includes("=")) {
                if(keydata==="Kaufn"){
                    dataFilters = dataFilters.replace(/=/g, "").padStart(10, '0');
                }else(
                    dataFilters = dataFilters.replace(/=/g, "")
                )
               
               // alert(dataFilters);
                aFilters.push(new sap.ui.model.Filter(keydata, sap.ui.model.FilterOperator.EQ, dataFilters));
            } else if (dataFilters.includes("...")) {
                var parts = dataFilters.split("...");
                if(keydata==="Kaufn"){
                     parts[0] = parts[0].padStart(10, '0');
                     parts[1] = parts[1].padStart(10, '0');
                }
                
                aFilters.push(new sap.ui.model.Filter(keydata, sap.ui.model.FilterOperator.BT, parts[0], parts[1]));
            }
            return aFilters;
        },
        getTokensData:function(var1){
            var aTokens = var1.getTokens();
            var amainValues = [];
            aTokens.forEach(function (oToken) {
                if (oToken.getRange) {
                    var oRange = oToken.getRange();
                    amainValues.push(oRange.value1);
                } else {
                    amainValues.push(oToken.getText());
                }
            });
            return amainValues;
        },


        _bindDataToTable: function (oData) {
            var oTable = this.getView().byId("tableId"); 
            var oJSONModel = new JSONModel();
            oJSONModel.setData({ results: oData });
            oTable.setModel(oJSONModel);
            oTable.bindRows("/results");
        },
        _bindDataToSmartTable: function (oData) {
            var oSmartTable = this.getView().byId("smartTable");
            var oJSONModel = new JSONModel();
            oJSONModel.setData({ results: oData });
        
            if (oSmartTable) {
                var oTable = oSmartTable.getTable();
                oTable.setModel(oJSONModel);
                oTable.bindRows("/results");
            } else {
                MessageToast.show("Smart Table not found.");
            }
        },



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
        onOperatorChange: function() {
            // Get the selected operator
            var sSelectedKey = this.byId("conditionOperator").getSelectedKey();
            
            // Show/hide the second input based on the selected operator
            var bIsBetween = sSelectedKey === "BT";
            this.byId("conditionValue2").setVisible(bIsBetween);
        },

        onAddCondition: function() {
            var oSelect = this.byId("conditionOperator");
            var sOperator = oSelect.getSelectedKey();
            var sValue1 = this.byId("conditionValue").getValue();
            var sValue2 = this.byId("conditionValue2") ? this.byId("conditionValue2").getValue() : ""; // Handle BT condition
        
            // Variable to hold the formatted condition
            var sCondition;
        
            // Validate input values
            if (sOperator === "EQ") {
                // Validate that the first value is provided
                if (!sValue1) {
                    sap.m.MessageToast.show("Please enter a value for 'equal to' condition.");
                    return; // Exit the function if validation fails
                }
                
                // Format the condition for EQ
                sCondition = `=${sValue1}`; // Format: =US10X
        
            } else if (sOperator === "BT") {
                // Validate that both values are provided
                if (!sValue1 || !sValue2) {
                    sap.m.MessageToast.show("Please enter both values for 'between' condition.");
                    return; // Exit the function if validation fails
                }
                
                // Format the condition for BT
                sCondition = `${sValue1}...${sValue2}`; // Format: US10...US01X
            }
        
            // Add the condition to the MultiInput field
            this.addTokenToMultiInput(sCondition);
        },
        
        addTokenToMultiInput: function(sCondition) {
            var oMultiInput = this.byId("salesOrgSearch1");
            // Check if MultiInput is defined
            if (oMultiInput) {
                // Add the token to the MultiInput
                oMultiInput.addToken(new sap.m.Token({ text: sCondition }));
                console.log("Added token:", sCondition); // Log token for debugging
            } else {
                console.error("MultiInput not found!");
            }
        },
        
        onDeleteCondition: function(oEvent) {
            // Remove the selected token from the MultiInput
            var oToken = oEvent.getParameter("token");
            var oMultiInput = this.byId("salesOrgSearch1");
            oMultiInput.removeToken(oToken);
        },
        onSelectPress: function () {
            var oTable = this.getView().byId("tableId");   // Reference to the table
            var aSelectedItems = oTable.getSelectedIndices();  // Get selected indices
            
            if (aSelectedItems.length === 0) {
                MessageToast.show("Please select at least one item.");
                return;
            }
        
            var oSelectedDataModel = sap.ui.getCore().getModel("selectedDataModel");  // Get the selectedDataModel
            var aSelectedData = oSelectedDataModel.getData();  // Get the current data
        
            var bAlreadyExists = false;  // To track if any item is already added
            var sAlreadyAddedOrders = "";  // To store the sales order numbers of already added items
        
            // Loop through selected items
            aSelectedItems.forEach(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex);  // Get context of the selected row
                if (oContext) {
                    var oData = oContext.getObject();  // Get the actual data (e.g., Sales Order)
                    
                    // Check if the item already exists in the selectedDataModel
                    var bExists = aSelectedData.some(function (item) {
                        return item.Vbeln === oData.Vbeln && item.Posnr === oData.Posnr;
                    });
        
                    // If item exists, show a message with the Sales Order number
                    if (bExists) {
                        bAlreadyExists = true;
                        sAlreadyAddedOrders += oData.Vbeln + " ";  // Collect sales order numbers
                    } else {
                        // If the item doesn't exist, add it to the selected data array
                        aSelectedData.push(oData);
                    }
                }
            });
        
            // Update the model with the newly added data
            oSelectedDataModel.setData(aSelectedData);
        
            // If any item was already added, show a message with the respective sales order numbers
            if (bAlreadyExists) {
                MessageToast.show("Item(s) with Sales Order No(s): " + sAlreadyAddedOrders + " already added to list .");
            } else {
                // If no items were already added, show a success message
                MessageToast.show("Selected data stored successfully.");
            }
        },

     //date code
     HelpRequest: function () {
        // Clear the existing data in the table by resetting the model
        this._clearTableData();
    
        // Load the sales organization data for the dialog
       // this._loadSalesOrgData();
    
        // Open the dialog
        this.getView().byId("dateDialog").open();
    },
    
    // Clear the table's data
    _clearTableData: function () {
        var oEmptyModel = new JSONModel(); // Create an empty JSONModel
        this.getView().byId("tableId").setModel(oEmptyModel); // Set the empty model to the table
    },
    
    // Load Sales Organization data
   /* _loadSalesOrgData: function () {
        var oModel = this.getView().getModel();
        oModel.read("/zrardynamicSet", {
            success: function (oData) {
                var oSalesOrgModel = new JSONModel(oData);
                this.getView().byId("tableId").setModel(oSalesOrgModel); // Set the new data to the table
            }.bind(this),
            error: function (oError) {
                MessageToast.show("Error fetching sales organization data.");
            }
        });
    },        */

    // OK button press event in the dialog
    onDialog: function () {
        var oTable = this.getView().byId("smartTable").getTable(); // Get table from SmartTable
        var aSelectedItems = oTable.getSelectedIndices(); // Get selected indices

        var oSalesOrgSearch = this.getView().byId("recordCreatedOn"); // Get MultiInput field
        oSalesOrgSearch.removeAllTokens(); // Clear existing tokens

        if (aSelectedItems.length > 0) {
            aSelectedItems.forEach(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex);
                if (oContext) {
                    var oData = oContext.getObject(); // Get the selected row data
                    var sSalesOrg = oData.Bukrs; // Assuming Bukrs is the field for Sales Org

                    // Add selected sales org to MultiInput as token
                    oSalesOrgSearch.addToken(new sap.m.Token({
                        key: sSalesOrg,
                        text: sSalesOrg
                    }));
                }
            });
        }

        this.getView().byId("dateDialog").close(); // Close dialog
    },

    // Cancel button or dialog close event
    onDialogClose2: function () {
        this.getView().byId("dateDialog").close();
    },
    _formatDateForOData: function (date) {
        if (!(date instanceof Date)) {
            return null;
        }
        var year = date.getFullYear();
        var month = ("0" + (date.getMonth() + 1)).slice(-2); // Month is zero-based
        var day = ("0" + date.getDate()).slice(-2);
        return `${year}${month}${day}`; // Return as YYYYMMDD
    },

    // Handle Calendar 2 selection
    handleCalendarSelect1: function (oEvent) {
        console.log("ok");
        var oCalendar = oEvent.getSource();
        var oSelectedDate = oCalendar.getSelectedDates()[0].getStartDate();
        
        // Format the date
        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
        this.selectedDate2 = oDateFormat.format(oSelectedDate);  // Store selected date in 'yyyy-MM-dd' format
    
        // Get the MultiInput field where you want to display the token
        var oMultiInput = this.getView().byId("recordCreatedOn");
    
        // Create a new token with the formatted date
        var oToken = new sap.m.Token({
            key: this.selectedDate2, // This can be used as an identifier
            text: this.selectedDate2 // This is what will be displayed
        });
    
        // Add the token to the MultiInput
        oMultiInput.addToken(oToken);
        console.log("Token added: ", this.selectedDate2);
    },        

    // Handle OK button press
    onDialog: function () {
      //  debugger
        this.byId("dateDialog").close();
    },

    // Handle Cancel button press
    onDialogCancelPress: function () {
        this.byId("DateSelectionDialog").close();  // Close the dialog box
    },
    onConditionOperatorChange: function(oEvent) {
      debugger
        var selectedKey = oEvent.getParameter("selectedItem").getKey();
        var equalToVBox = this.getView().byId("equalToVBox");
        var betweenVBox = this.getView().byId("betweenVBox");
    
        if (selectedKey === "EQ") {
            equalToVBox.setVisible(true);
            betweenVBox.setVisible(false);
        } else if (selectedKey === "BT") {
            equalToVBox.setVisible(false);
            betweenVBox.setVisible(true);
        }
    },
    onDateChange: function (oEvent) {
        debugger
        // Get the selected date from the DatePicker
        var oDatePicker = oEvent.getSource();
        var sSelectedDate = oDatePicker.getDateValue();
    
        if (sSelectedDate) {
            // Format the date
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd" // Use your desired date format
            });
            var sFormattedDate = oDateFormat.format(sSelectedDate);
            //alert("sFormattedDate")
            // Get the MultiInput field where you want to display the token
            var oMultiInput = this.byId("recordCreatedOn");
    
            // Create a new token with the formatted date
            var oToken = new sap.m.Token({
                key: sFormattedDate, // This can be used as an identifier
                text: sFormattedDate // This is what will be displayed
            });
    
            // Add the token to the MultiInput
            oMultiInput.addToken(oToken);
            oDatePicker.setValue(sFormattedDate);
            //alert("sFormattedDate")
            // Optionally, clear the DatePicker after selecting the date
            oDatePicker.setDateValue(sFormattedDate);
        }
    },   onFromDateChange: function (oEvent) {
        // Get the selected "From Date" from the DatePicker
        var oDatePicker = oEvent.getSource();
        var sSelectedDate = oDatePicker.getDateValue();
        
        if (sSelectedDate) {
            // Format the date
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd" // Use your desired date format
            });
            var sFormattedDate = oDateFormat.format(sSelectedDate);
            
            // Set the formatted "From Date" to the DatePicker input
            oDatePicker.setValue(sFormattedDate);  // Displaying the formatted date in the DatePicker
        }
    },
    
    onToDateChange: function (oEvent) {
        // Get the selected "To Date" from the DatePicker
        var oDatePicker = oEvent.getSource();
        var sSelectedDate = oDatePicker.getDateValue();
        
        if (sSelectedDate) {
            // Format the date
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd" // Use your desired date format
            });
            var sFormattedDate = oDateFormat.format(sSelectedDate);
            
            // Set the formatted "To Date" to the DatePicker input
            oDatePicker.setValue(sFormattedDate);  // Displaying the formatted date in the DatePicker
        }
    },
    
    onAddCondition1: function () {
        // Get the 'From' date and 'To' date from the DatePickers
        var fromDate = this.byId("fromDatePicker").getDateValue();
        var toDate = this.byId("toDatePicker").getDateValue();
    
        // Check if both dates are selected
        if (fromDate && toDate) {
            // Format the dates to 'yyyy-MM-dd'
            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
            var formattedFromDate = oDateFormat.format(fromDate);
            var formattedToDate = oDateFormat.format(toDate);
    
            // Concatenate the 'From' and 'To' dates with "..." in between
            var dateRange = formattedFromDate + "..." + formattedToDate;
    
            // Get the MultiInput field where you want to display the token
            var oMultiInput = this.byId("recordCreatedOn");
            
    
            // Create a new token with the date range
            var oDateRangeToken = new sap.m.Token({
                key: dateRange, // This can be used as an identifier
                text: dateRange // This is what will be displayed
            });
    
            // Add the token to the MultiInput
            oMultiInput.addToken(oDateRangeToken);

        // NEW functionality: Add the token to 'newConditionInput'
        var oNewConditionInput = this.byId("newConditionInput");
        var oNewConditionToken = new sap.m.Token({
            key: dateRange, // Use the date range as the token key
            text: dateRange // Display the date range
        });
        oNewConditionInput.addToken(oNewConditionToken); // Add token to newConditionInput

    
            // Optionally, create filters based on the date range to use in an OData request
            var oFilter = new sap.ui.model.Filter("Erdat", sap.ui.model.FilterOperator.BT, formattedFromDate, formattedToDate);
            // Add this filter to your OData query or pass it to the logic that handles fetching data
    
            // Optionally, clear the DatePickers after adding the condition
            this.byId("fromDatePicker").setDateValue(null);
            this.byId("toDatePicker").setDateValue(null);
        } else {
            sap.m.MessageToast.show("Please select both 'From' and 'To' dates.");
        }
    },
    
    onSubmitPress: function () {
        debugger
        var oSelectedDataModel = sap.ui.getCore().getModel("selectedDataModel");
        var aSelectedData = oSelectedDataModel.getData();

        if (aSelectedData.length === 0) {
            MessageToast.show("No data to submit. Please select items first.");
            return;
        }

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("table", {
            selectedData: JSON.stringify(aSelectedData)
        });

        MessageToast.show("Navigating to the next view with selected data.");
    },

    _onObjectMatched: function (oEvent) {
        debugger
        var sSelectedData = oEvent.getParameter("arguments").selectedData;
        var aSelectedData = JSON.parse(sSelectedData);

        var oModel = new JSONModel(aSelectedData);
        this.getView().byId("selectedItemsTable").setModel(oModel);
        this.getView().byId("selectedItemsTable").bindItems({
            path: "/",
            template: this.byId("rowTemplate")
        });
    },
    onInitSecondPage: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("table").attachPatternMatched(this._onObjectMatched, this);
    }, // Search handler for SmartFilterBar
 onSearch: function(oEvent) {
    debugger
     var oSmartTable = this.byId("salesOrgSmartTable");
     var oSmartFilterBar = this.byId("smartFilterBarSalesOrg");

     // Trigger the binding for the table with the SmartFilterBar conditions
     var oBinding = oSmartTable.getBinding("items");
     if (oBinding) {
         oBinding.filter(oSmartFilterBar.getFilters());
     }
 },
    


    });
});
