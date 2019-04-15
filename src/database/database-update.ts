/**
 * This Code is write by Yong YU 2019/03/07
 * This code contain 2 main function for Data Harvesting project
 * 1.add_report(urls):
 *      This function is use for pre-harvest report, user must pass the report URL in order to call this function
 *      url must to be a COUNTER4 or COUNTER5 format report in Google Sheet.
 *      This function  take the url and open the report by SpreadsheetApp.oprnBy(ur). extract the reportName,
 *      dateRun, reportPeriod,type, year, platform and url. Store the information in a google spreadsheet call
 *      'Report Database' and move the report in corresponding Folder. The Folder are structure as
 *      Platform/year/reports
 *
 *  2. function add_update_report(r_name,header,body):
 *      This function use is uses for right after parsing the report. developer who parse the report should
 *      call this function and passing the reportName, reportHeader and reportBody in order to save/update the report
 *      in database. add report work same as ada_report(url), update report is replacing the
 *       lesser partial year reports. so erase the old report and replace with the new one.
 *
 *
 *
 */


var Report_URL = "https://docs.google.com/spreadsheets/d/1U1wUSFMmhrCiLZXLE_-bvM-VjI5cnlKkhs8NHrtlKqk/edit#gid=0";


var na = "n/a";



// Compiled using ts2gas 1.6.0 (TypeScript 3.2.4)
var exports = exports || {};
var module = module || {exports: exports};
var Report_URL = "https://docs.google.com/spreadsheets/d/1U1wUSFMmhrCiLZXLE_-bvM-VjI5cnlKkhs8NHrtlKqk/edit#gid=0";

var Reports = SpreadsheetApp.openByUrl(Report_URL);


var R4_report = Reports.getSheets()[0];
var R5_report = Reports.getSheets()[1];


var name_col = 0;
var platform_col = 1;
var date_run_col = 2;
var period_col = 3;
var year_col = 4;
var type_col = 5;
var updated_col = 6;
var url_col = 7;


var R4_index = 0;
var R5_index = 1;


/**
 *
 * @param urls: report url
 * add report to database by provide googlde sheet report url
 */
function add_report(urls)
{
    try {

        var nss = SpreadsheetApp.openByUrl(urls);
        var datavalue = nss.getSheets()[0].getDataRange().getValues();

        var name = nss.getName();
        var update = exist(name);

        if (update == null) {
            if (datavalue[2][1] == 5) {

                Counter5(urls, datavalue, name, nss);


            } else {

                Counter4(urls, datavalue, name, nss);

            }

        } else {

            update_db(datavalue, update);

        }

    } catch (e) {
        Logger.log("Error; " + e);
    }


}


/**
 *
 * @param r_name: report name
 * @param header: report header
 * @param body: report body
 * add or update report for harvest report,
 */
function add_update_report(r_name, header, body) {
    var update = exist(r_name);
    if (update == null) {
        var new_report = SpreadsheetApp.create(r_name);
        var ss = new_report.getSheets()[0];
        data_to_sheets(header, body, ss);
        add_report(new_report.getUrl());
    } else {
        var n_report = rewrite_report(header, body, update);
        update_db(n_report, update);

    }


}

/**
 *
 * @param name: report name
 * @param header: report header
 * @param body: report body
 * add report need mpre than 1 google sheet to database, not done. 2019/03/08
 */
function add_update_reports(name, header, body) {
    //var report = SpreadsheetApp.create(name).getSheets()[0];

}

/**
 *
 * @param urls
 * @param data
 * @param name
 * @param c4_report
 * add Counter4 report to database.
 */
function Counter4(urls, data, name, c4_report) {
    var platform = "";
    var date_run = "";
    var period = "";
    var year = "";
    var type = "";
    var url = urls;
    var type_Release = data[0][0];

    for (var i = 0; i < type_Release.length - 4; i++)
    {
        type += type_Release[i];//type of the report
    }


    date_run = data[6][0];
    if (date_run.length <= 0) {
        date_run = na;
    }

    var temp_year = data[4][0];
    period = data[4][0];
    for (var i = 0; i < 4; i++) {
        year += temp_year[i];
    }
    for (var i = 0; i < c4_report.getSheets()[0].getLastColumn(); i++) {
        if (data[7][i] == "Platform") {
            platform = data[9][i];
            break;
        }

    }

    R4_report.autoResizeColumn(period_col + 1);
    var urlNew = moveToFolder(platform, year, c4_report);
    R4_report.appendRow([name, platform, date_run, period, year, type, new Date(), urlNew]);


}

/**
 *
 * @param urls
 * @param data
 * @param name
 * @param c5_report
 * add Counter5 report to database.
 */
function Counter5(urls, data, name, c5_report) {
    var platform = "";
    var date_run = "";
    var period = "";
    var year = "";
    var type = "";
    var url = urls;

    type = data[1][1];
    date_run = data[10][1];
    var temp_year = data[9][1];
    period = data[9][1];
    for (var i = 0; i < 4; i++) {
        year += temp_year[i];
    }
    for (var j = 0; j < c5_report.getLastColumn(); j++) {
        if (data[13][j] == "Platform") {
            platform = data[14][j];
            break;
        }
    }

    var urlNew = moveToFolder(platform, year, c5_report);
    R5_report.appendRow([name, platform, date_run, period, year, type, new Date(), urlNew]);

}


/**
 * @param: report name
 * check if a report in database. return the position of the report. pos(sheets number, rowNumber)
 */
function exist(name) {

    var result;
    var sheets = Reports.getSheets();
    for (var sheet = 0; sheet < sheets.length; sheet++) {
        var ss = sheets[sheet].getDataRange().getValues();

        for (var row = 0; row < sheets[sheet].getLastRow(); row++) {

            if (ss[row][name_col] == name) {
                result = [sheet, row];

                return result;
            }
        }
    }
    return null;
}

/**
 * @param datavalue: report value
 * @param result: report position
 * update the database master sheets by passing the sheet position and report value.
 */
function update_db(datavalue, result) {


    var n_update = new Date();
    if (result[0] == R4_index) {
        var n_date_run = datavalue[6][0];
        var n_period = datavalue[4][0];

        var o_update = R4_report.getRange(result[1] + 1, updated_col + 1);
        o_update.setValue(n_update);

        var o_date_run = R4_report.getRange(result[1] + 1, date_run_col + 1);
        o_date_run.setValue(n_date_run);

        var o_period = R4_report.getRange(result[1] + 1, period_col + 1);
        o_period.setValue(n_period);

    }
    if (result[0] == R5_index) {
        var n_date_run = datavalue[10][1];

        var n_period = datavalue[9][1];

        var o_update = R5_report.getRange(result[1] + 1, updated_col + 1);
        o_update.setValue(n_update);

        var o_date_run = R5_report.getRange(result[1] + 1, date_run_col + 1);
        o_date_run.setValue(n_date_run);

        var o_period = R5_report.getRange(result[1] + 1, period_col + 1);
        o_period.setValue(n_period);

    }
}


/**
 *
 * @param header: report header
 * @param body: report body
 * @param ss: spreadsheet
 * write the header and body to ss.
 */
function data_to_sheets(header, body, ss) {

    ss.getRange(1, 1, header.length, header[0].length).setValues(header);
    ss.getRange(ss.getLastRow() + 2, 1, body.length, body[0].length).setValues(body);

}


/**
 *
 * @param header: report header
 * @param body: report body
 * @param pos: report position
 * rewrite the whole report with header and body.
 */
function rewrite_report(header, body, pos) {
    var index = pos[0];
    var row_num = pos[1] + 1;
    var release_ss = Reports.getSheets()[index];
    var url = release_ss.getRange(row_num, url_col + 1).getValue().toString();

    try {
        var ss = SpreadsheetApp.openByUrl(url);
        var report = ss.getSheets()[0];

        report.getRange(1, 1, report.getLastRow(), report.getLastColumn()).clearContent();
        data_to_sheets(header, body, report);
        return report.getDataRange().getValues();

    } catch (e) {
        Logger.log("Err Msg: " + e);
    }
    return null;
}


/**
 *
 * @param name: name folder
 * @param year: year folder
 * @param ss: speadsheet
 * move spreadsheet to folder name/year.
 */
function moveToFolder(name, year, ss) {
    var DH = DriveApp.getFoldersByName("DH Place").next();
    if (DH.getFoldersByName(name).hasNext()) {
        var vendor = DH.getFoldersByName(name).next();
        if (vendor.getFoldersByName(year).hasNext()) {
            var time = vendor.getFoldersByName(year).next();
            var ss_id = ss.getId();
            var file = DriveApp.getFileById(ss_id);
            var new_file = file.makeCopy(file.getName(), time);
            file.setTrashed(true);
            return new_file.getUrl();
        } else {
            vendor.createFolder(year);
            var time = vendor.getFoldersByName(year).next();
            var ss_id = ss.getId();
            var file = DriveApp.getFileById(ss_id);
            var new_file = file.makeCopy(file.getName(), time);
            file.setTrashed(true);
            return new_file.getUrl();

        }
    } else {
        var vendor = DH.createFolder(name);
        var time = vendor.createFolder(year);
        var ss_id = ss.getId();
        var file = DriveApp.getFileById(ss_id);
        var new_file = file.makeCopy(file.getName(), time);

        file.setTrashed(true);
        return new_file.getUrl();
    }
}




