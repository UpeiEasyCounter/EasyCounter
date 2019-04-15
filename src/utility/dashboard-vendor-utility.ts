/** the link the the page that stores counter 5 credentials */
var credentialsURL = ''; //Insert the URL of Credentials Information spreadsheet.

var sheetName = 'Sheet1';
var tagArray = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6', 'tag7', 'tag8', 'tag9', 'tag10', 'tag11', 'tag12', 'tag13', 'tag14', 'tag15', 'tag16'];
/**
 *
 * @param option
 * @returns {Object[]}
 * This method takes an option 1 or 2 and searches the vendor tab in either the counter 4 or counter 5 file
 */
function getVendor(option) {
    if (option == 2) {
        var spreadsheet = SpreadsheetApp.openByUrl(credentialsURL);
        var worksheet = spreadsheet.getSheetByName(sheetName);
        var list = worksheet.getRange(1, 1, worksheet.getRange("A1").getDataRegion().getLastRow(), 1).getValues();
        var value = list.map(function (r) { return r["0"]; });
        Logger.log(returnValue);
        var returnValue = value;
        return returnValue;
    }
}
/**
 * This method is used to redirect to a web page by accepting a URL as parameters
 * @returns {string}
 */
function getScriptUrl() {
    var url = ScriptApp.getService().getUrl();
    return url;
}
/**
 *
 * @param e
 * @returns {GoogleAppsScript.HTML.HtmlOutput}
 * This is a modified version of the do-get method, it is used to load the main page as well as other pages
 *  It takes in a parameter 'e' which is a web page name
 */
function doGet(e) {
    Logger.log(Utilities.jsonStringify(e));
    if (!e.parameter.page) {
        // When no specific page requested, return "home page"
        return HtmlService.createTemplateFromFile('Home/dashboard').evaluate();
    }
    else {
        //load the specified page
        return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
    }
}
/**
 * This function resets the array being passed in to a default value
 * @param formValue
 * @param isSupportValue
 * @param isSupport
 * @param supportArray
 * @param size
 */
function resetArray(formValue, isSupportValue, isSupport, supportArray, size) {
    for (var index = 0; index < formValue.length; index++) {
        for (var i = 0; i < size; i++) {
            if (isSupportValue && isSupportValue === true) {
                if (formValue[index] === tagArray[i]) {
                    supportArray[i] = 'y';
                }
            }
            else if (isSupport && isSupport === true) {
                if (formValue[index] === tagArray[i]) {
                    supportArray[i + 1] = 'y';
                }
            }
        }
    }
}
/**
 *
 * @param form
 * This method receives a form and then updates a spread sheet document from the values that were put into the form
 */
function addCounterFive(form) {
    //defines an empty array for the checkboxes
    var supportValues = ['n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n'];
    //direct call to open the google sheet already created
    var spreadSheet = SpreadsheetApp.openByUrl(credentialsURL).getSheets()[0];
    //Call extracted from the API to get a range where input should be stored
    var range = spreadSheet.getRange(spreadSheet.getLastRow() + 1, 1, 1, 6);
    //Call to store all the values as one variable
    var values = [[form.vendorName.toUpperCase(), form.vendorUrl, form.customerId, form.requestorId, form.apiKey, form.platform]];
    //Call to update all the values on the spreadsheet
    range.setValues(values);
    //Modify the checkboxes
    var formValue = form[''];
    var size = 16;
    resetArray(formValue, true, false, supportValues, size);
    Logger.log('support values are :' + supportValues);
    //appends vendor name to
    var ssValues = form.vendorName.toUpperCase() + ',' + supportValues;
    //Logger.log('values to be added :' +ssValues);
    Logger.log("ss values are: " + ssValues);
    //save the changes already made
    SpreadsheetApp.flush();
    addSupportValues(ssValues);
    //calling the update function to update spreadsheet for harvesting
    addSpreadsheet();
    Logger.log("at the end of the method call");
}
/**
 * This method populates the second page of the spreadhsheet with the support required values
 * @param valuesArray
 */
function addSupportValues(valuesArray) {
    Logger.log("add support values started");
    //Access the spreadsheet
    var spreadSheet = SpreadsheetApp.openByUrl(credentialsURL).getSheets()[1];
    //get the avlues
    var values = valuesArray.toString().split(',');
    //create an array for the values to be appended
    var appendValues = new Array(17);
    for (var i = 0; i < 17; i++) {
        appendValues[i] = values[i];
    }
    for (var j = 0; j < 17; j++) {
        Logger.log('Trace: ' + appendValues[j]);
    }
    //Logger.log('some values: '+appendValues[0] + ' ' +appendValues[3]+ 'end');
    var range = spreadSheet.getRange(spreadSheet.getLastRow() + 1, 1, 1, 17);
    //Assign the values
    var valueToAdd = [[appendValues[0], appendValues[1], appendValues[2], appendValues[3], appendValues[4], appendValues[5], appendValues[6], appendValues[7], appendValues[8], appendValues[9], appendValues[10], appendValues[11], appendValues[12], appendValues[13], appendValues[14], appendValues[15], appendValues[16]]];
    //Add the values to the sheet
    range.setValues(valueToAdd);
    Logger.log("Add support values ended");
}
/**
 *
 * @param vendorName
 * @param option
 * @returns {Object[][]}
 * This method gets passed a vendorName and an Option and then it searches a spreadsheet to find that value
 *  1 - counter 4 sheet
 *  2 - counter 5 sheet
 *
 */
function accessRow(vendorName, option) {
    if (option == 2) {
        //open a sheet
        var spreadSheet = SpreadsheetApp.openByUrl(credentialsURL);
        //open the specific worksheet
        var workSheet = spreadSheet.getSheetByName(sheetName);
        var sheet2 = spreadSheet.getSheetByName("typeSupported");
        //get the search param
        var data = workSheet.getRange(1, 1, workSheet.getLastRow(), 6).getValues();
        var namesList = data.map(function (r) { return r[0]; });
        //problem is the position
        var position;
        //Searches the list to find the value
        for(var i =0;i<namesList.length;i++)
        {
            if(vendorName === namesList[i])
            {
                position = i;
            }

        }
        if (position > -1) {
            var values = workSheet.getRange(position + 1, 1, 1, 6).getValues();
            var otherValues = sheet2.getRange(position + 1, 2, 1, 16).getValues();
            values.map(function (r) { return r[0]; });
            otherValues.map(function (r) { return r[0]; });
            var allValues = values + "," + otherValues;
            Logger.log("Other values are " +otherValues)
            //Logger.log("what is being returned " +allValues);
            return allValues;

        }
        else {
            Logger.log('Not found');
        }
    }
}
/**
 * This method takes in a form and replaces a specific row within that form with some value
 * @param form
 */
function replaceRow(form) {
    var vendorName = form.vendorName.toUpperCase();
    //direct call to open the google sheet already created
    var spreadSheet = SpreadsheetApp.openByUrl(credentialsURL).getSheets()[0]; //direct call to open the google sheet already created
    var status = SpreadsheetApp.openByUrl(credentialsURL).getSheets()[1];
    //store spreadsheet in an array
    var vendorCredential = spreadSheet.getDataRange().getValues();
    var vendorSupport = status.getDataRange().getValues();
    //create two 2d-array for two spreadsheets
    var credentialArray = [];
    var supportArray = [];
    for (var i = 1; i < vendorCredential.length; i++) { //for all vendor
        if (vendorCredential[i][0] == form.vendorName.toUpperCase() || vendorCredential[i][2] == form.customerId || vendorCredential[i][3] == form.apiKey) { //if vendor matches
            Logger.log(vendorCredential[i]);
            //create two array, index 0 is the vendor name
            var credential = [form.vendorName.toUpperCase(), form.vendorUrl, form.customerId, form.requestorId, form.apiKey, form.platform];
            var support = [form.vendorName.toUpperCase(), 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n', 'n'];
            Logger.log(credential);
            Logger.log(support);
            //Modify the checkboxes
            var formValue = form[''];
            var size = 16;
            resetArray(formValue, false, true, support, size);
            Logger.log(credential);
            Logger.log(support);
            //push to the array
            credentialArray.push(credential);
            supportArray.push(support);
            //overwrite value to the spreadsheet used for harvesting, plus 1 because of the header
            spreadSheet.getRange(i + 1, 1, 1, credentialArray[0].length).setValues(credentialArray);
            status.getRange(i + 1, 1, 1, supportArray[0].length).setValues(supportArray);
            //calling the update function to update spreadsheet for harvesting
            updateSpreadsheet(vendorName);
            break;
        }
    }
}
