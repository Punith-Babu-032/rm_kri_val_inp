sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("rmkrivalinput.controller.Worklist", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            var oViewModel;

            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

            this.setModel(new JSONModel({
                indicators: [],
                recipients: []
            }), "saveModel");

            this.setModel(new JSONModel({
                indicators: [{
                    indID: "1",
                    indText: "Risk Indicator 1"
                }, {
                    indID: "2",
                    indText: "Risk Indicator 2"
                }],
                recipients: [{
                    recID: "1",
                    recText: "Recipient 1"
                }, {
                    recID: "2",
                    recText: "Recipient 2"
                }],

            }), "dropdowns");

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        onUpdateFinished : function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        onPress : function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        onNavBack : function() {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },


        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("ProductID", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },


        onRefresh : function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */
        
        handleAddRiskInd: function () {
            // open popup
            if (!this.riskIndPopup) {
                this.riskIndPopup = new sap.m.SelectDialog({
                    title: "Select Risk Indicators",
                    confirm: function (oEvent) {
                        var aContexts = oEvent.getParameter("selectedContexts");
                        var mObject = aContexts[0].getObject();
                        var oModel = this.getView().getModel("saveModel");
                        var aData = oModel.getData();
                        aData.indicators.push({ "indText": mObject.indText });
                        oModel.setData(aData);
                        oModel.refresh();
                    }.bind(this)
                });
                this.riskIndPopup.bindAggregation("items", {
                    path: "dropdowns>/indicators",
                    template: new sap.m.StandardListItem({
                        title: "{dropdowns>indText}"
                    })
                });
                this.getView().addDependent(this.riskIndPopup);
            }
            this.riskIndPopup.open();
        },

        handleRiskIndDelete: function (oEvent) {
            var id = oEvent.getParameter("listItem").getBindingContext("saveModel").getPath().split("/");
            var oModel = this.getView().getModel("saveModel");
            var aData = oModel.getData();
            aData.indicators.splice(id,1);
            oModel.setData(aData);
        },

        handleAddRecipients: function () {
            // open popup
            if (!this.recipientsPopup) {
                this.recipientsPopup = new sap.m.SelectDialog({
                    title: "Select a Recipient",
                    confirm: function (oEvent) {
                        var aContexts = oEvent.getParameter("selectedContexts");
                        var mObject = aContexts[0].getObject();
                        var oModel = this.getView().getModel("saveModel");
                        var aData = oModel.getData();
                        aData.recipients.push({ "recText": mObject.recText });
                        oModel.setData(aData);
                        oModel.refresh();
                    }.bind(this)
                });
                this.recipientsPopup.bindAggregation("items", {
                    path: "dropdowns>/recipients",
                    template: new sap.m.StandardListItem({
                        title: "{dropdowns>recText}"
                    })
                });
                this.getView().addDependent(this.recipientsPopup);
            }
            this.recipientsPopup.open();
        },

        handleRecipientsDelete: function (oEvent) {
            var id = oEvent.getParameter("listItem").getBindingContext("saveModel").getPath().split("/");
            var oModel = this.getView().getModel("saveModel");
            var aData = oModel.getData();
            aData.recipients.splice(id,1);
            oModel.setData(aData);
        },
        

        handleSubmitMitiSubmit: function () {
            sap.m.MessageBox.success("Your KRI Input has been submitted successfully");
        }
        

    });
});
