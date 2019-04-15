
/**vendor urls for COUNTER5 spreadsheets*/
/**url of spreadsheet use for harvesting*/
var vendorListUrl = ''; //Insert the URL of C5URLs spreadsheet tab 1.
var reportStatusUrl = ''; //Insert the URL of C5Status spreadsheet tab 1.
/**url of spread sheet used for update and add*/
var vendorCredentialUrl = ''; //Insert the URL of C5URLs spreadsheet tab 2.
var vendorSupportUrl = '';  //Insert the URL of C5Status spreadsheet tab 2.

/**array storing report name also serves as a header*/
var reportType = ['Vendor', 'pr', 'pr_p1', 'dr', 'dr_d1', 'dr_d2', 'tr', 'tr_b1', 'tr_b2', 'tr_b3', 'tr_j1', 'tr_j2', 'tr_j3', 'tr_j4', "ir", 'ir_m1', 'ir_a1'];
/**update the spreadsheets used for harvesting after an update is performed*/
function updateSpreadsheet(vendorName) {
    /**get credential spreadsheet*/
    var vendorCredentialSheet = SpreadsheetApp.openByUrl(vendorCredentialUrl).getSheets()[0];
    /**get support spreadsheet*/
    var vendorSupportSheet = SpreadsheetApp.openByUrl(vendorSupportUrl).getSheets()[1];
    /**get spreadsheet for vendor list used in harvesting*/
    var vendorSpreadsheet = SpreadsheetApp.openByUrl(vendorListUrl).getSheets()[0];
    /**get spreadsheet for harvest status used in harvesting*/
    var statusSpreadsheet = SpreadsheetApp.openByUrl(reportStatusUrl).getSheets()[0];
    /**store spreadsheet in an array*/
    var reportStatus = statusSpreadsheet.getDataRange().getValues();
    var vendorCredential = vendorCredentialSheet.getDataRange().getValues();
    var vendorSupport = vendorSupportSheet.getDataRange().getValues();
    /**create two 2d-array for two spreadsheets*/
    var vendorArray = [];
    var statusArray = [];
    /**for all vendor*/
    for (var i = 1; i < vendorCredential.length; i++) {
        if (vendorCredential[i][0] === vendorName) {
            /**get currrent vendor*/
            var vendor = vendorCredential[i];
            var support = vendorSupport[i];
            Logger.log(vendor);
            /**initial two arrays for url and status, index 0 is the vendor name*/
            /** vendor url initial value is empty string */
            /**status initial is 3--new report*/
            var vendorUrl = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
            var status = ['', 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
            /**assign vendor name*/
            vendorUrl[0] = vendorCredential[i][0];
            status[0] = vendorCredential[i][0];
            /**for all reports in the support sheet*/
            for (var j = 1; j < support.length; j++) {
                /**if report type is supported(y)*/
                if (vendorSupport[i][j] === 'y') {
                    /**add base url and report type*/
                    vendorUrl[j] = vendorCredential[i][1] + reportType[j] + '?';
                    /**if customer Id is used*/
                    if (vendorCredential[i][2])
                        vendorUrl[j] += 'customer_id=' + vendorCredential[i][2] + '&';
                    /**if requestor id is used*/
                    if (vendorCredential[i][3])
                        vendorUrl[j] += "requestor_id=" + vendorCredential[i][3] + '&';
                    /**if api key is used*/
                    if (vendorCredential[i][4])
                        vendorUrl[j] += "api_key=" + vendorCredential[i][4] + '&';
                    /**if platform is used*/
                    if (vendorCredential[i][5])
                        vendorUrl[j] += "platform=" + vendorCredential[i][5] + '&';
                }
                /**assign status to 4--not supported, if "n"*/
                else {
                    status[j] = 4;
                }
            }
            Logger.log("updated urls: "+vendorUrl);
            /**iterating the spreadsheet*/
            for (var j = 1; j < reportStatus.length; j++) {
                /**if vendor matches*/
                if (reportStatus[j][0] === vendorName) {
                    Logger.log("index: " + j);
                    /**push the value to the array will be used for updating later*/
                    vendorArray.push(vendorUrl);
                    statusArray.push(status);
                    /**overwrite value to the spreadsheet used for harvesting, plus 1 because of the header*/
                    vendorSpreadsheet.getRange(j + 1, 1, 1, vendorArray[0].length).setValues(vendorArray);
                    statusSpreadsheet.getRange(j + 1, 1, 1, statusArray[0].length).setValues(statusArray);
                    break;
                }
            }
            break;
        }
    }
}
/**add new vendor(last row in the readable spreadsheet for credentials) to the spreadsheets for harvesting*/
function addSpreadsheet() {
    /**get credential spreadsheet*/
    var vendorCredentialSheet = SpreadsheetApp.openByUrl(vendorCredentialUrl).getSheets()[0];
    /**get support spreadsheet*/
    var vendorSupportSheet = SpreadsheetApp.openByUrl(vendorSupportUrl).getSheets()[1];
    /**get spreadsheet for vendor list used in harvesting*/
    var vendorSpreadsheet = SpreadsheetApp.openByUrl(vendorListUrl).getSheets()[0];
    /**get spreadsheet for harvest status used in harvesting*/
    var statusSpreadsheet = SpreadsheetApp.openByUrl(reportStatusUrl).getSheets()[0];
    /**store spreadsheet in an array*/
    var reportStatus = statusSpreadsheet.getDataRange().getValues();
    var vendorCredential = vendorCredentialSheet.getDataRange().getValues();
    var vendorSupport = vendorSupportSheet.getDataRange().getValues();
    /**create two 2d-array for two spreadsheets*/
    var vendorArray = [];
    var statusArray = [];
    /**last row in the spreadsheet*/
    var rowNum = vendorCredential.length - 1;
    /**get currrent vendor*/
    var vendor = vendorCredential[rowNum];
    Logger.log(vendor);
    /**initial two arrays for url and status, index 0 is the vendor name*/
    /** vendor url initial value is empty string */
    /**status initial is 3--new report*/
    var vendorUrl = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    var status = ['', 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3];
    /**assign vendor name*/
    vendorUrl[0] = vendorCredential[rowNum][0];
    status[0] = vendorCredential[rowNum][0];
    /**for all reports in the support sheet*/
    for (var i = 1; i < vendorSupport[rowNum].length; i++) {
        /**if report type is supported('y')*/
        if (vendorSupport[rowNum][i] == "y") {
            /**add base url and report type*/
            vendorUrl[i] = vendorCredential[rowNum][1] + reportType[i] + '?';
            /**if customer Id is used*/
            if (vendorCredential[rowNum][2])
                vendorUrl[i] += 'customer_id=' + vendorCredential[rowNum][2] + '&';
            /**if requestor id is used*/
            if (vendorCredential[rowNum][3])
                vendorUrl[i] += "requestor_id=" + vendorCredential[rowNum][3] + '&';
            /**if api key is used*/
            if (vendorCredential[rowNum][4])
                vendorUrl[i] += "api_key=" + vendorCredential[rowNum][4] + '&';
            /**if platform is used*/
            if (vendorCredential[rowNum][5])
                vendorUrl[i] += "platform=" + vendorCredential[i][5] + '&';
        }
        /**assign status to 4--not supported, if 'n'*/
        else {
            status[i] = 4;
        }
    }
    Logger.log("new urls: "+vendorUrl);
    /**push to the array*/
    vendorArray.push(vendorUrl);
    statusArray.push(status);
    /**write value to the last row of spreadsheet used for harvesting, plus 1 because of the header*/
    vendorSpreadsheet.getRange(rowNum + 1, 1, 1, vendorArray[0].length).setValues(vendorArray);
    statusSpreadsheet.getRange(rowNum + 1, 1, 1, statusArray[0].length).setValues(statusArray);
}
