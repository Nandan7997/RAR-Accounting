sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/model/odata/v2/ODataModel",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageToast, ODataModel, MessageBox, Fragment) {
  "use strict";

  return BaseController.extend("salesproject.controller.App", {
    onInit: function () {
      this.getOwnerComponent().getRouter().initialize();
      // Sample navigation data for the left menu
      var oData = {
        navigation: [
          { title: "Home", route: "home" },
         // { title: "RAR Reference Update", route: "sales2" },
          //{ title: "RAR Reference Update 2", route: "rarfirstpage" },
          { title: "RAR Reference Update", route: "smarttable" }
        ]
      };
      
      var oModel = new JSONModel(oData);
      this.getView().setModel(oModel, "leftmenuModel");

      // Set OData Model for fetching user data (can be used later in getTableData method)
      var sServiceUrl = "/sap/opu/odata/sap/ZVBAP_SRV/";
      this.oModel = new ODataModel(sServiceUrl, { useBatch: false });
      this.getView().setModel(this.oModel);

      // Set default values for login (ADMIN/ADMIN)
      this._setDefaultLoginValues();

      this.getTableData();
    },
    _setDefaultLoginValues: function() {
      // Set default values for username and password fields
      this.byId("usernameInput").setValue("ADMIN");
      this.byId("passwordInput").setValue("ADMIN");
    },

    getTableData: function () {
      var that = this;
      var sEntitySet = "/zvbapSet";

      this.getView().getModel().read(sEntitySet, {
        success: function (oData) {
          var oTableModel = new JSONModel();
          oTableModel.setData(oData);
          that._userData = oData.results;
        },
        error: function () {
          MessageToast.show("Error fetching data");
        }
      });
    },

    onItemSelect: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("listItem");
      var oContext = oSelectedItem.getBindingContext("leftmenuModel");
      if (oContext) {
        var sRoute = oContext.getProperty("route");
        this.getOwnerComponent().getRouter().navTo(sRoute);
      }
    },    

    onLoginPress: function () {
      var sUsername = this.byId("usernameInput").getValue();
      var sPassword = this.byId("passwordInput").getValue();

      // Validate credentials with hardcoded admin login
      if (sUsername === "ADMIN" && sPassword === "ADMIN") {
        MessageBox.success("Login successful!");

        this.byId("splitApp").setVisible(true);
        this.getOwnerComponent().getRouter().navTo("home");
        this.byId("loginPage").destroy();
      } else {
        MessageBox.error("Invalid Username or Password.");
      }
    },

    onRegisterPress: function () {
      if (!this._pDialog) {
        this._pDialog = Fragment.load({
          id: this.getView().getId(),
          name: "salesproject.view.RegisterUser",
          controller: this
        }).then(function (oDialog) {
          this.getView().addDependent(oDialog);
          return oDialog;
        }.bind(this));
      }

      this._pDialog.then(function (oDialog) {
        oDialog.open();
      });
    },

    onCreatePress: function () {
      var oView = this.getView();
      var oUserId = oView.byId("userIdInput1").getValue();
      var oName = oView.byId("nameInput1").getValue();
      var oUsername = oView.byId("usernameInput1").getValue();
      var oPassword = oView.byId("passwordInput1").getValue();

      if (!oUserId || !oName || !oUsername || !oPassword) {
        MessageBox.error("Please fill all required fields.");
        return;
      }

      var oModel = oView.getModel();
      var oDataPayload = {
        Userid: parseInt(oUserId, 10),
        Name: oName,
        Username: oUsername,
        Password: oPassword
      };

      oModel.create("/zusersSet", oDataPayload, {
        success: function () {
          MessageToast.show("Record created successfully.");
          this._pDialog.then(function (oDialog) {
            oDialog.close();
          }.bind(this));
        }.bind(this),
        error: function () {
          MessageBox.error("Error creating record.");
        }
      });
    },

    onCancelPress: function () {
      this._pDialog.then(function (oDialog) {
        oDialog.close();
      });
    }
  });
});
