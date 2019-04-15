// Compiled using ts2gas 1.5.0 (TypeScript 3.2.4)
var exports = exports || {};
var module = module || { exports: exports };
/** this script uses objApp library import library before using this script */
/** objApp key: MTeYmpfWgqPbiBkVHnpgnM9kh30YExdAc */
/** vendor credential url for COUNTER5 */
var vendorListUrl = "https://docs.google.com/spreadsheets/d/1Qi7_n2IcfQe0CvJTJeBfewU4o8eFo2Q3Si4bsibG5sI/edit#gid=0";
var reportStatusUrl = "https://docs.google.com/spreadsheets/d/1I-RwT-JGO1_pLMviezLMqmhD-46QHmX4d7ykqE61Q3M/edit#gid=0";
/**prefix length for detecting response type*/
var PREFIX = 20;
/** error message variable */
var errors = "<p>";
/** fetch vendor list */
function harvestVendorList(vendorName, type) {
    /** get spreadsheet for vendor list */
    var vendorSpreadsheet = SpreadsheetApp.openByUrl(vendorListUrl).getSheets()[0];
    /** get spreadsheet for harvest status */
    var statusSpreadsheet = SpreadsheetApp.openByUrl(reportStatusUrl).getSheets()[0];
    var statusHeaders = statusSpreadsheet.getRange(1, 1, 1, statusSpreadsheet.getLastColumn()).getValues()[0];
    /** parse spreadsheet to object */
    var vendorList = ObjApp.rangeToObjects(vendorSpreadsheet.getDataRange().getValues());
    var statusList = ObjApp.rangeToObjects(statusSpreadsheet.getDataRange().getValues());
    /** clean the error message before harvesting */
    errors = "<p>";
    /** run through list */
    /** if only harvesting specific vendor */
    if (vendorName) {
        for (var i in vendorList) {
            Logger.log("looking for vendor. Now: " + vendorList[i].vendor);
            if (vendorList[i].vendor == vendorName) {
                /**if passed type*/
                if (type) {
                    Logger.log("retry vendor: " + vendorName + " report type :" + type);
                    /**harvest the specified report*/
                    retryReport(vendorList[i], statusList[i], type);
                }
                /** call function to harvest vendor */
                else {
                    Logger.log("harvesting: " + vendorList[i].vendor);
                    harvestVendor(vendorList[i], statusList[i]);
                }
                break;
            }
        }
    }
    /** harvesting all vendors */
    else {
        /** for every vendor in the list */
        for (var i in vendorList) {
            Logger.log("harvseting, vendor:" + vendorList[i].vendor);
            /** call function to harvest vendor */
            harvestVendor(vendorList[i], statusList[i]);
            Logger.log(i + " DONE!");
        }
    }
    /** convert object back to array */
    var statusArray = ObjApp.objectToArray(statusHeaders, statusList);
    /** set status spreadsheet with new values, row 1 is headers so start from row 2 */
    statusSpreadsheet.getRange(2, 1, statusArray.length, statusArray[0].length).setValues(statusArray);
    Logger.log("status updated");
    /** put finish sign for error division */
    errors += "</p>";
    /** return error report */
    return errors;
}
/** harvest reports for one vendor */
function harvestVendor(vendor, status) {
    var date = new Date();
    var year = date.getYear();
    var month = date.getMonth();
    /** get vendor name for logging error message */
    var vendorName = vendor.vendor;
    for (var i in vendor) {
        /** if it's not row number nor vendorname and report type is supported */
        if (i != "rowNum" && i != "vendor" && vendor[i]) {
            /** concatenate url */
            var requestUrl = createURL(vendor[i], year, month);
            /** get current report type */
            var reportType = i.toUpperCase();
            Logger.log("now: vendor: " + vendorName + " report type :" + reportType);
            try {
                /**if the return type is 0-- response is invalid*/
                var data = harvest(requestUrl);
                if (data[0] == 0) {
                    errors += "Server Error:<br>Vendor: " + vendorName + "<br>Report Type :" + reportType + "<br>Error Message: Server does not respond properly<br><br>";
                    status[i] = 0;
                    Logger.log("Server returning invalid response.");
                    /**continue to next report*/
                    continue;
                }
                /**if the return type is 3-- response is an object containing the error*/
                if (data[0] == 3) {
                    errors+="Server Error:<br>Vendor: "+vendorName+"<br>Report Type: "+reportType+"<br>Error Code: "+data[1].Code+"<br>Error Message: "+data[1].Message;
                    try {
                        if (data[1].Data) {
                            errors += "<br>Details: " + data[1].Data;
                        }
                    }
                    catch (e) {
                        Logger.log("No details in the error messages.");
                    }
                    errors += "<br><br>";
                    Logger.log("Server returning error messages in an object.");
                    status[i] = 0;
                    /**continue to next report*/
                    continue;
                }
                /**if the return type is 2-- response is an array of errors*/
                if (data[0] == 2) {
                    for (var j = 0; j < data[1].length; j++) {
                        errors+="Server Error:<br>Vendor: "+vendorName+"<br>Report Type: "+reportType+"<br>Error Code: "+data[1][j].Code+"<br>Error Message: "+data[1][j].Message;
                        try {
                            if (data[1][j].Data) {
                                errors += "<br>Details: " + data[1][j].Data;
                            }
                        }
                        catch (e) {
                            Logger.log("No details in the error messages.");
                        }
                        errors += "<br><br>";
                    }
                    Logger.log("Server returning error messages in an array.");
                    status[i] = 0;
                    /**continue to next report*/
                    continue;
                }
            }
            catch (e) {
                status[i] = 0;
                errors += "Server Error:<br>Vendor: " + vendorName + "<br>Report Type: " + reportType + "<br>Error Message: " + e.message + "<br><br>";
                Logger.log("Server error: timeout or no response.");
                continue;
            }
            /** server response contains report header, set harvest status to 1 for now*/
            status[i] = 1;
            try {
                /**pass report to parser*/
                parseSelect(data[1], vendorName, getPeriod());
            }
            catch(e){
                errors+="System Error:<br>Vendor: "+vendorName+"<br>Report Type: "+reportType+"<br>Error Message: System failed to process this report. Please try again.<br>Details:"+e.message+"<br><br>";
                status[i]=2;
                Logger.log("system error");
                continue;
            }
            /** check if report has any exceptions */
            try {
                /** if has exception message */
                if (data[1].Report_Header.Exceptions[0].Message) {
                    /** report error occur, set status to 2 */
                    status[i] = 2;
                    /** add new report error */
                    errors+="Report Error:<br>Vendor: "+vendorName+"<br>Report Type: "+data[1].Report_Header.Report_ID+"<br>Error Code: "+data[1].Report_Header.Exceptions[0].Code+"<br>Error Message: "+data[1].Report_Header.Exceptions[0].Message;
                    try {
                        if (data[1].Report_Header.Exceptions[0].Data) {
                            errors += "<br>Details: " + data[1].Report_Header.Exceptions[0].Data;
                        }
                    }
                    catch (e) {
                        Logger.log("No details in error messages.");
                    }
                    errors += "<br><br>";
                }
            }
                /** only for catching type error if there"s no exception in the report */
            catch (e) {
                Logger.log("No exception");
            }
            /** set 1 sec period between each harvest */
            Utilities.sleep(1000);
        }
    }
    /** set last harvest time */
    status.last = Utilities.formatDate(date, "GMT", "yyyy.MM.dd");
}
/**retry a single report*/
function retryReport(vendor, status, type) {
    for (var i in vendor) {
        /** if it's the type */
        if (i == type) {
            var date = new Date();
            var year = date.getYear();
            var month = date.getMonth();
            /** concatenate url */
            /** if it's jan, harvest reports of the whole last year */
            var requestUrl = createURL(vendor[i], year, month);
            var vendorName = vendor.vendor;
            var reportType = i.toUpperCase();
            try {
                /** harvest report */
                /** To a JSON report */
                var data = harvest(requestUrl);
                /**if the return type is 0-- response is invalid*/
                if (data[0] == 0) {
                    errors += "Server Error:<br>Vendor: " + vendorName + "<br>Report Type: " + reportType + "<br>Error Message: Server does not respond properly<br><br>";
                    status[i] = 0;
                    Logger.log("Server returning invalid response");
                    /**continue to next report*/
                    break;
                }
                /**if the return type is 3-- response is an object containing error*/
                if (data[0] == 3) {
                    errors+="Server Error:<br>Vendor: "+vendorName+"<br>Report Type: "+reportType+"<br>Error Code: "+data[1].Code+"<br>Error Message: "+data[1].Message;
                    try {
                        if (data[1].Data) {
                            errors += "<br>Details: " + data[1].Data;
                        }
                    }
                    catch (e) {
                        Logger.log("No details in the error messages.");
                    }
                    errors += "<br><br>";
                    Logger.log("Server returning error messages in an object.");
                    status[i] = 0;
                    /**break the loop*/
                    break;
                }
                /**if the return type is 2-- response is an array of errors*/
                if (data[0] == 2) {
                    for (var j = 0; j < data[1].length; j++) {
                        errors+="Server Error:<br>Vendor: "+vendorName+"<br>Report Type: "+reportType+"<br>Error Code: "+data[1][j].Code+"<br>Error Message: "+data[1][j].Message;
                        try {
                            if (data[1][j].Data) {
                                errors += "<br>Details: " + data[1][j].Data;
                            }
                        }
                        catch (e) {
                            Logger.log("No details in the error messages.");
                        }
                        errors += "<br><br>";
                    }
                    Logger.log("Server returning error messages in an array.");
                    status[i] = 0;
                    /**break the loop*/
                    break;
                }
            }
            catch (e) {
                status[i] = 0;
                errors += "Server Error:<br>Vendor: " + vendorName + "<br>Report Type: " + reportType + "<br>Error Message: " + e.message + "<br><br>";
                Logger.log("Server error: time out or no response.");
                break;
            }
            /** server response contains report header, set harvest status to 1 */
            status[i] = 1;
            try {
                /**pass report to parser*/
                parseSelect(data[1], vendorName, getPeriod());
            }
            catch(e){
                errors+="System Error:<br>Vendor: "+vendorName+"<br>Report Type: "+reportType+"<br>Error Message: System failed to process this report. Please try again.<br>Details:"+e.message+"<br><br>";
                status[i]=2;
                Logger.log("system error");
                break;
            }
            /** check if report has any exceptions */
            try {
                /** if has exception message */
                if (data[1].Report_Header.Exceptions[0].Message) {
                    /** report error occur, set status to 2 */
                    status[i] = 2;
                    /** add new report error */
                    errors+="Report Error:<br>Vendor: "+vendorName+"<br>Report Type: "+data[1].Report_Header.Report_ID+"<br>Error Code: "+data[1].Report_Header.Exceptions[0].Code+"<br>Error Message: "+data[1].Report_Header.Exceptions[0].Message;
                    try {
                        if (data[1].Report_Header.Exceptions[0].Data) {
                            errors += "<br>Details: " + data[1].Report_Header.Exceptions[0].Data;
                        }
                    }
                    catch (e) {
                        Logger.log("No details in error messages.");
                    }
                    errors += "<br><br>";
                }
            }
                /** only for catching type error if there"s no exception in the report */
            catch (e) {
                Logger.log("No exception");
            }
            break;
        }
    }
}
/**harvest report using request url*/
function harvest(request) {
    Logger.log("request url: "+request);
    /**send request*/
    var response = UrlFetchApp.fetch(encodeURI(request), { muteHttpExceptions: true });
    /**get response content*/
    var content = response.getContentText();
    var returnType;
    /**get the least content for detecting response type*/
    var prefix = "" + content.substring(0, PREFIX);
    try {
        /**if the response contains report header*/
        if (prefix.indexOf("Report_Header") > 0)
            returnType = 1;
        /**if the response is an array*/
        else if (prefix.indexOf("\[") == 0)
            returnType = 2;
        /**if the response is an object*/
        else if (prefix.indexOf("\{") == 0)
            returnType = 3;
        /**if the response is not valid*/
        else
            returnType = 0;
    }
        /**if any exception happens*/
    catch (e) {
        Logger.log(e);
    }
    /**if the response is valid*/
    if (returnType > 0)
        var data = JSON.parse(content);
    Logger.log("return type: "+returnType);
    /**store the type and data in an array*/
    var result = [returnType, data];
    return result;
}
/**create requesting urls*/
function createURL(base, year, month) {
    /**if it"s jan, create request for the last year*/
    if (month == 0) {
        var url = base + "begin_date=" + (year - 1) + "-01" + "&end_date=" + (year - 1) + "-12";
    }
    else {
        var url = base + "begin_date=" + year + "-01" + "&end_date=" + year + "-0" + month;
    }
    return url;
}
/**get current harvesting period*/
function getPeriod() {
    var date = new Date();
    var year = date.getYear();
    var month = date.getMonth();
    var period;
    if (month == 0) {
        period = (year - 1) + "-01" + " to " + (year - 1) + "-12";
    }
    else {
        period = year + "-01" + " to " + year + "-0" + month;
    }
    return period;
}
/** import CSS or scripts file */
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}
/** return status list */
function getStatus() {
    /** get spreadsheet for harvest status */
    var statusSpreadsheet = SpreadsheetApp.openByUrl(reportStatusUrl).getSheets()[0];
    var statusList = ObjApp.rangeToObjects(statusSpreadsheet.getDataRange().getValues());
    return statusList;
}
