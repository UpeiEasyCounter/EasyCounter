// Compiled using ts2gas 1.5.0 (TypeScript 3.2.4)
var exports = exports || {};
var module = module || { exports: exports };
var SI = "Search Index";
var SearchIndexcolumn = {
    Title: 1,
    ISBN: 2,
    ISSN_print: 3,
    ISSN_online: 4,
    URL: 5,
    Report_name: 6,
    Report_Year: 7,
    Type: 8,
    RowPos: 9
};
var ReportIndexcolumn = {
    Name: 1,
    Platform: 2,
    DateRun: 3,
    Period: 4,
    Year: 5,
    Type: 6,
    Updated: 7,
    URL: 8
};
var TRBcolumn = {
    Title: 1,
    ISBN: 7,
    ISSN_Print: 8,
    ISSN_Online: 9
};
var TRJcolumn = {
    Title: 1,
    ISSN_Print: 7,
    ISSN_Online: 8
};
var max_row = 500000;
var trjs = ["TR_J1", "TR_J2", "TR_J3", "TR_J4"];
/**
 *
 * @param form: update search index form.
 * This function is uses for received the update search index form by user and call the right function
 */
function updates(form) {
    var reportYear = form.year;
    if (form.year == null) {
        update_SearchIndex();
    }
    else if (form.year != null) {
        updateByYear(reportYear);
    }
}
/**
 *
 * @param form: this function use to connect with front end  function. catch the arguements pass by the user.
 */
function search(form) {
    var urlReturn;
    var title = form.reportTitle;
    var issn = form.Issn;
    var isbn = form.Isbn;
    var reportType = form.reportType;
    var searchOption = form.searchOption;
    var year = form.year;
    if (title != null) {
        urlReturn = read_SearchIndex('title', searchOption, title, year, reportType);
        return urlReturn;
    }
    if (issn != null) {
        urlReturn = read_SearchIndex('issn', 'exact', issn, year, reportType);
        return urlReturn;
    }
    if (isbn != null) {
        urlReturn = read_SearchIndex('isbn', 'exact', isbn, year, reportType);
        return urlReturn;
    }
    return null;
}
/**
 * create and return a google shhet name "Search Index + year" under the 'DH Place' Folder
 */
function create_SearchIndex(year) {
    var column = ["Title", "ISBN", "ISSN Print", "ISSN Online", "URL", "Report Name", "Report Year", "Type", "Row Position"];
    var searchIndexName = SI + " " + year.toString();
    var spreadsheet = SpreadsheetApp.create(searchIndexName);
    var searchIndexFolder = DriveApp.getFoldersByName("DH Place").next().getFoldersByName(searchIndexName);
    if (searchIndexFolder.hasNext()) {
        var folder = searchIndexFolder.next();
        var file = DriveApp.getFileById(spreadsheet.getId());
        var newFile = file.makeCopy(searchIndexName, folder);
        file.setTrashed(true);
        var siIndex = SpreadsheetApp.open(newFile).getSheets()[0];
        siIndex.appendRow(column);
        siIndex.getRange(1, 1, 1, 9).setBackground("yellow");
        siIndex.getRange(1, 1, 1, 9).setFontWeight("Bold");
        return siIndex;
    }
    else if (!searchIndexFolder.hasNext()) {
        var folder = DriveApp.getFoldersByName("DH Place").next().createFolder(searchIndexName);
        var file = DriveApp.getFileById(spreadsheet.getId());
        var newFile = file.makeCopy(searchIndexName, folder);
        file.setTrashed(true);
        var siIndex = SpreadsheetApp.open(newFile).getSheets()[0];
        siIndex.appendRow(column);
        siIndex.getRange(1, 1, 1, 9).setBackground("green");
        siIndex.getRange(1, 1, 1, 9).setFontWeight("Bold");
        return siIndex;
    }
}
/**
 *
 * @param searchType: title,isbn,issn online, issn print
 * @param searchOption: exactMatch, beginWith or part of String.
 * @param element: userinput
 * @param year: search year
 * @param reportType: search report type.
 * get information from user and search the database, construct a new sheet store the result and
 * return back url for result sheet
 */
function read_SearchIndex(searchType, searchOption, element, year, reportType) {
    var urlResult;
    var dateNow = timeGen().toString();
    searchType = searchType.toString().toLowerCase().trim();
    if (searchType == "title") {
        var sheetName = "Search Result " + dateNow + ' title: ' + element.toString() + ' Year: ' + year.toString() + ' Report Type: ' + reportType.toString();
        urlResult = searchByTitle(sheetName, searchOption, element, year, reportType);
    }
    if (searchType == "issn") {

        var sheetName = "Search Result " + dateNow + ' ISSN: ' + element.toString() + ' Year: ' + year.toString() + ' Report Type: ' + reportType.toString();

        Logger.log(sheetName);
        urlResult = searchByIssn(sheetName, element, year, reportType);
    }
    if (searchType == "isbn") {

        var sheetName = "Search Result " + dateNow + ' ISBN: ' + element.toString() + ' Year: ' + year.toString() + ' Report Type: ' + reportType.toString();
        urlResult = searchByIsbn(sheetName, element, year, reportType);
    }
    return urlResult;
}
/**
 * delete all the search index and generating the new sheets by go though the Counter 5 database. find all the TR
 * reports and extract title, issn, isbn also the report url,name and period and save them into 'Search Index'.
 */
function update_SearchIndex() {
    var result = [];
    var C5_DB = DriveApp.getFoldersByName("C5 Database");
    var row = 0;
    //var files = DriveApp.searchFiles('title contains  ' + '\''+SI+'\'');
    var folders = DriveApp.searchFolders('title contains  ' + '\"' + SI + '\"');
    while (folders.hasNext()) {
        var folder = folders.next();
        folder.setTrashed(true);
    } //delete all the old search index.
    var databases = C5_DB.next().getFiles();
    //var searchIndex =create_SearchIndex();// create a new search index sheet
    /**loop though the database **/
    while (databases.hasNext()) {
        var searchIndexRow = 2;
        var rowCount = 1;
        var database = databases.next();
        var databaseYear = database.getName().substring(database.getName().length - 4, database.getName().length);
        var searchIndex = create_SearchIndex(databaseYear); // create search index for that year.
        // one of the data base sheet
        var c5Database = SpreadsheetApp.open(database).getSheets()[0];
        var reportUrl, reportName, reportPeriod, reportType;
        var types = c5Database.getRange(2, ReportIndexcolumn["Type"], c5Database.getLastRow(), 1).getValues();
        var trRegex = /TR\w*/; // TR reports
        for (var i = 0; i < types.length; i++) {
            row = i + 2; // actual row number start from 1.
            if (types[i].toString().match(trRegex)) // if it is a type report
            {
                // loop though the tr report
                reportName = c5Database.getRange(row, ReportIndexcolumn["Name"]).getValue().toString(); // report name
                reportPeriod = c5Database.getRange(row, ReportIndexcolumn["Period"]).getValue().toString().substring(0, 4); // report period
                reportUrl = c5Database.getRange(row, ReportIndexcolumn["URL"]).getValue().toString(); // url of the report
                reportType = c5Database.getRange(row, ReportIndexcolumn["Type"]).getValue().toString();
                // title, isbn, issnOnline, issnPrint and row position in actural report
                var title, isbn, issnO, issnP, rowPos;
                try {
                    var report = SpreadsheetApp.openByUrl(reportUrl).getSheets()[0];
                    var reportData = report.getRange(15, 1, report.getLastRow(), report.getLastColumn()).getValues();
                    for (var j = 0; j < reportData.length - 14; j++) // for each each row of the report
                    {
                        rowPos = j + 15;
                        if (rowCount >= max_row) // if the search index are out of space
                        {
                            searchIndex.getRange(searchIndexRow, 1, result.length, 9).setValues(result);
                            rowCount = 1;
                            searchIndexRow = 2;
                            searchIndex = create_SearchIndex(databaseYear);
                            result = [];
                            // if is a trj1 or trj2, or trj3, or trj4. than skip isbn column
                            // need add '\'' in front of number to protect the information
                            if (trjs.indexOf(types[i].toString()) >= 0) {
                                title = reportData[j][TRJcolumn["Title"] - 1].toString();
                                isbn = "";
                                issnP = reportData[j][TRJcolumn["ISSN_Print"] - 1].toString();
                                if (issnP.toString().substring(0, 1) != "\'") {
                                    issnP = "\'" + issnP;
                                }
                                issnO = reportData[j][TRJcolumn["ISSN_Online"] - 1].toString();
                                if (issnO.toString().substring(0, 1) != "\'") {
                                    issnO = "\'" + issnO;
                                }
                                result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                                rowCount = rowCount + 1;
                            }
                            else {
                                title = reportData[j][TRBcolumn["Title"] - 1].toString();
                                isbn = reportData[j][TRBcolumn["ISBN"] - 1].toString();
                                if (isbn.toString().substring(0, 1) != "\'") {
                                    isbn = "\'" + isbn;
                                }
                                issnP = reportData[j][TRBcolumn["ISSN_Print"] - 1].toString();
                                if (issnP.toString().substring(0, 1) != "\'") {
                                    issnP = "\'" + issnP;
                                }
                                issnO = reportData[j][TRBcolumn["ISSN_Online"] - 1].toString();
                                if (issnO.toString().substring(0, 1) != "\'") {
                                    issnO = "\'" + issnO;
                                }
                                result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                                rowCount = rowCount + 1;
                            }
                            searchIndex.getRange(searchIndexRow, 1, result.length, result[0].length).setValues(result);
                            searchIndexRow = searchIndexRow + result.length;
                            result = [];
                            continue;
                        }
                        if (trjs.indexOf(types[i].toString()) >= 0) {
                            title = reportData[j][TRJcolumn["Title"] - 1].toString();
                            isbn = "";
                            issnP = reportData[j][TRJcolumn["ISSN_Print"] - 1].toString();
                            if (issnP.toString().substring(0, 1) != "\'") {
                                issnP = "\'" + issnP;
                            }
                            issnO = reportData[j][TRJcolumn["ISSN_Online"] - 1].toString();
                            if (issnO.toString().substring(0, 1) != "\'") {
                                issnO = "\'" + issnO;
                            }
                            result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                            rowCount = rowCount + 1;
                        }
                        else {
                            title = reportData[j][TRBcolumn["Title"] - 1].toString();
                            isbn = reportData[j][TRBcolumn["ISBN"] - 1].toString();
                            if (isbn.toString().substring(0, 1) != "\'") {
                                isbn = "\'" + isbn;
                            }
                            issnP = reportData[j][TRBcolumn["ISSN_Print"] - 1].toString();
                            if (issnP.toString().substring(0, 1) != "\'") {
                                issnP = "\'" + issnP;
                            }
                            issnO = reportData[j][TRBcolumn["ISSN_Online"] - 1].toString();
                            if (issnO.toString().substring(0, 1) != "\'") {
                                issnO = "\'" + issnO;
                            }
                            result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                            rowCount = rowCount + 1;
                        }
                    }
                    searchIndex.getRange(searchIndexRow, 1, result.length, result[0].length).setValues(result);
                    searchIndexRow = searchIndexRow + result.length;
                    result = [];
                }
                catch (e) {
                    Logger.log("Search Err" + e);
                }
            }
        }
    }
}
/**
 *
 * @param year: year of the report.
 * look up the database and only generated the search index for specific year.
 */
function updateByYear(year) {
    var result = [];
    var C5_DB = DriveApp.getFoldersByName("C5 Database");
    var row = 0;
    var folderName = SI + " " + year.toString();
    var folders = DriveApp.getFoldersByName(folderName);
    while (folders.hasNext()) {
        var folder = folders.next();
        folder.setTrashed(true);
    } //delete all the old search index.
    var databaseName = "C5 Database " + year.toString();
    var databases = C5_DB.next().getFilesByName(databaseName);
    if (databases.hasNext()) {
        var searchIndexsheet = create_SearchIndex(year); // create a new search index sheet
    }
    else {
        return false;
    }
    var searchIndexRow = 2;
    var rowCount = 1;
    while (databases.hasNext()) {
        var database = databases.next();
        var c5Database = SpreadsheetApp.open(database).getSheets()[0];
        var reportUrl, reportName, reportPeriod, reportType;
        var types = c5Database.getRange(2, ReportIndexcolumn["Type"], c5Database.getLastRow(), 1).getValues();
        var trRegex = /TR\w*/;
        for (var i = 0; i < types.length; i++) {
            row = i + 2; // actual row number start from 1.
            if (types[i].toString().match(trRegex)) // if it is a type report
            {
                reportName = c5Database.getRange(row, ReportIndexcolumn["Name"]).getValue().toString(); // reoort name
                reportPeriod = c5Database.getRange(row, ReportIndexcolumn["Period"]).getValue().toString().substring(0, 4); // report period
                reportUrl = c5Database.getRange(row, ReportIndexcolumn["URL"]).getValue().toString(); // url of the report
                reportType = c5Database.getRange(row, ReportIndexcolumn["Type"]).getValue().toString();
                var title, isbn, issnO, issnP, rowPos;
                try {
                    var report = SpreadsheetApp.openByUrl(reportUrl).getSheets()[0];
                    var reportData = report.getRange(15, 1, report.getLastRow(), report.getLastColumn()).getValues();
                    for (var j = 0; j < reportData.length - 14; j++) // for each each row of the report
                    {
                        rowPos = j + 15;
                        if (rowCount >= max_row) // if the search index are out of space
                        {
                            searchIndexsheet.getRange(searchIndexRow, 1, result.length, 9).setValues(result); // set value in sheet
                            rowCount = 1;
                            searchIndexRow = 2;
                            searchIndexsheet = create_SearchIndex(year);
                            result = [];
                            if (trjs.indexOf(types[i].toString()) >= 0) // clean isbn, issn for trj
                            {
                                title = reportData[j][TRJcolumn["Title"] - 1].toString();
                                isbn = "";
                                issnP = reportData[j][TRJcolumn["ISSN_Print"] - 1].toString();
                                if (issnP.toString().substring(0, 1) != "\'") {
                                    issnP = "\'" + issnP;
                                }
                                issnO = reportData[j][TRJcolumn["ISSN_Online"] - 1].toString();
                                if (issnO.toString().substring(0, 1) != "\'") {
                                    issnO = "\'" + issnO;
                                }
                                result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                                rowCount = rowCount + 1;
                            }
                            else // clean isbn and issn for trb
                            {
                                title = reportData[j][TRBcolumn["Title"] - 1].toString();
                                isbn = reportData[j][TRBcolumn["ISBN"] - 1].toString();
                                if (isbn.toString().substring(0, 1) != "\'") {
                                    isbn = "\'" + isbn;
                                }
                                issnP = reportData[j][TRBcolumn["ISSN_Print"] - 1].toString();
                                if (issnP.toString().substring(0, 1) != "\'") {
                                    issnP = "\'" + issnP;
                                }
                                issnO = reportData[j][TRBcolumn["ISSN_Online"] - 1].toString();
                                if (issnO.toString().substring(0, 1) != "\'") {
                                    issnO = "\'" + issnO;
                                }
                                result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                                rowCount = rowCount + 1;
                            }
                            searchIndexsheet.getRange(searchIndexRow, 1, result.length, result[0].length).setValues(result);
                            searchIndexRow = searchIndexRow + result.length;
                            result = [];
                            continue;
                        }
                        if (trjs.indexOf(types[i].toString()) >= 0) {
                            title = reportData[j][TRJcolumn["Title"] - 1].toString();
                            isbn = "";
                            issnP = reportData[j][TRJcolumn["ISSN_Print"] - 1].toString();
                            if (issnP.toString().substring(0, 1) != "\'") {
                                issnP = "\'" + issnP;
                            }
                            issnO = reportData[j][TRJcolumn["ISSN_Online"] - 1].toString();
                            if (issnO.toString().substring(0, 1) != "\'") {
                                issnO = "\'" + issnO;
                            }
                            result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                            rowCount = rowCount + 1;
                        }
                        else {
                            title = reportData[j][TRBcolumn["Title"] - 1].toString();
                            isbn = reportData[j][TRBcolumn["ISBN"] - 1].toString();
                            if (isbn.toString().substring(0, 1) != "\'") {
                                isbn = "\'" + isbn;
                            }
                            issnP = reportData[j][TRBcolumn["ISSN_Print"] - 1].toString();
                            if (issnP.toString().substring(0, 1) != "\'") {
                                issnP = "\'" + issnP;
                            }
                            issnO = reportData[j][TRBcolumn["ISSN_Online"] - 1].toString();
                            if (issnO.toString().substring(0, 1) != "\'") {
                                issnO = "\'" + issnO;
                            }
                            result.push([title, isbn, issnP, issnO, reportUrl, reportName, reportPeriod, reportType, rowPos]);
                            rowCount = rowCount + 1;
                        }
                    }
                    searchIndexsheet.getRange(searchIndexRow, 1, result.length, result[0].length).setValues(result);
                    searchIndexRow = searchIndexRow + result.length;
                    result = [];
                }
                catch (e) {
                    Logger.log("Search Err by year: " + e);
                }
            }
        }
    }
    return true;
}
/**
 * @param sheetName: the result sheet name
 * @param usr_isbn: ISBN user want to search
 * @param year: year of report
 * @param type: report type.
 *  search all the search index sheet and find match isbn with user_isbn and  create a google
 * sheet to store the result and give back the url.
 */
function searchByIsbn(sheetName, usr_isbn, year, type) {
    var result = [];
    if (year.toString().toLowerCase() == 'all') {
        var files = DriveApp.searchFiles('title contains  ' + '\"' + SI + '\"');
    }
    else {
        var files = DriveApp.getFilesByName(SI + ' ' + year.toString());
    }
    var titleExist = false;
    var tempResultSheet = SpreadsheetApp.create(sheetName);
    var dest = DriveApp.getFoldersByName('DH Place').next();
    var tempFile = DriveApp.getFilesByName(sheetName.toString()).next();
    var newFile = tempFile.makeCopy(sheetName.toString(), dest);
    var searchResultSheet = SpreadsheetApp.open(newFile);
    var urlResult = searchResultSheet.getUrl();
    var searchResult = searchResultSheet.getSheets()[0];
    while (files.hasNext()) {
        var searchIndexsheet = SpreadsheetApp.open(files.next()).getSheets()[0]; //open all the search index.
        var searchIndexData = searchIndexsheet.getDataRange().getValues();
        for (var i = 0; i < searchIndexData.length; i++) // search all rows
        {
            var isbn = searchIndexData[i][SearchIndexcolumn["ISBN"] - 1].toString();
            var reportURL = searchIndexData[i][SearchIndexcolumn["URL"] - 1];
            var rowInReport = searchIndexData[i][SearchIndexcolumn["RowPos"] - 1];
            var reportType = searchIndexData[i][SearchIndexcolumn["Type"] - 1];
            var reportYear = searchIndexData[i][SearchIndexcolumn["Report_Year"] - 1];
            if (reportType.toString() == type.toString()) {
                if (isbn == usr_isbn.toString()) {
                    var report = SpreadsheetApp.openByUrl(reportURL.toString()).getSheets()[0];
                    var reportData = report.getDataRange().getValues();
                    var titleHeader = reportData[13];
                    if (!titleExist) {
                        result.push(titleHeader);
                        titleExist = true;
                    }
                    var row = parseInt(rowInReport.toString());
                    var content = reportData[row - 1];
                    if (trjs.indexOf(type.toString()) >= 0) {
                        var reportIssnP = content[TRJcolumn["ISSN_Print"] - 1];
                        var reportIssnO = content[TRJcolumn["ISSN_Online"] - 1];
                        if (reportIssnP.toString().substring(0, 1) != "\'") {
                            content[TRJcolumn["ISSN_Print"] - 1] = '\'' + content[TRJcolumn["ISSN_Print"] - 1];
                        }
                        if (reportIssnO.toString().substring(0, 1) != "\'") {
                            content[TRJcolumn["ISSN_Online"] - 1] = '\'' + content[TRJcolumn["ISSN_Online"] - 1];
                        }
                    }
                    else {
                        var reportIsbn = content[TRBcolumn["ISBN"] - 1];
                        var reportIssnP = content[TRBcolumn["ISSN_Print"] - 1];
                        var reportIssnO = content[TRBcolumn["ISSN_Online"] - 1];
                        if (reportIssnP.toString().substring(0, 1) != "\'") {
                            content[TRBcolumn["ISSN_Print"] - 1] = '\'' + content[TRBcolumn["ISSN_Print"] - 1];
                        }
                        if (reportIssnO.toString().substring(0, 1) != "\'") {
                            content[TRBcolumn["ISSN_Online"] - 1] = '\'' + content[TRBcolumn["ISSN_Online"] - 1];
                        }
                        if (reportIsbn.toString().substring(0, 1) != "\'") {
                            content[TRBcolumn["ISBN"] - 1] = content[TRBcolumn["ISBN"] - 1];
                        }
                    }
                    result.push(content);
                }
            }
        }
    }
    if (result.length > 1) {
        var tempResultSheet = SpreadsheetApp.create(sheetName);
        var dest = DriveApp.getFoldersByName('DH Place').next();
        var tempFile = DriveApp.getFilesByName(sheetName.toString()).next();
        var newFile = tempFile.makeCopy(sheetName.toString(), dest);
        var searchResultSheet = SpreadsheetApp.open(newFile);
        var urlResult = searchResultSheet.getUrl();
        var searchResult = searchResultSheet.getSheets()[0];
        for (var k = 0; k < result.length; k++) {
            var temp = [];
            temp.push(result[k]);
            searchResult.getRange(k + 1, 1, 1, result[k].length).setValues(temp);
        }
        return urlResult;
    }
    else {
        var notFound = "Nothing found";
        return notFound;
    }
}
/**
 *
 * @param sheetName: the result sheet name
 * @param usr_issn: ISSN user want to search
 * @param year: year of report
 * @param type: report type.
 * search all the search index sheet and find match issn with user_isbn and  create a google
 * sheet to store the result and give back the url.
 */
function searchByIssn(sheetName, usr_issn, year, type) {
    var result = [];
    if (year.toString().toLowerCase() == 'all') {
        var files = DriveApp.searchFiles('title contains  ' + '\"' + SI + '\"');
    }
    else {
        var files = DriveApp.getFilesByName(SI + ' ' + year.toString());
    }
    var titleExist = false;
    var tempResultSheet = SpreadsheetApp.create(sheetName);
    var dest = DriveApp.getFoldersByName('DH Place').next();
    var tempFile = DriveApp.getFilesByName(sheetName.toString()).next();
    var newFile = tempFile.makeCopy(sheetName.toString(), dest);
    var searchResultSheet = SpreadsheetApp.open(newFile);
    var urlResult = searchResultSheet.getUrl();
    var searchResult = searchResultSheet.getSheets()[0];
    while (files.hasNext()) {
        var searchIndexsheet = SpreadsheetApp.open(files.next()).getSheets()[0]; //open all the search index.
        var searchIndexData = searchIndexsheet.getDataRange().getValues();
        for (var i = 0; i < searchIndexData.length; i++) // search all rows
        {
            var issnO = searchIndexData[i][SearchIndexcolumn["ISSN_online"] - 1].toString();
            var issnP = searchIndexData[i][SearchIndexcolumn["ISSN_print"] - 1].toString();
            var reportURL = searchIndexData[i][SearchIndexcolumn["URL"] - 1];
            var rowInReport = searchIndexData[i][SearchIndexcolumn["RowPos"] - 1];
            var reportType = searchIndexData[i][SearchIndexcolumn["Type"] - 1];
            var reportYear = searchIndexData[i][SearchIndexcolumn["Report_Year"] - 1];
            if (reportType.toString() == type.toString()) {
                if (issnO == usr_issn || issnP == usr_issn) {
                    var report = SpreadsheetApp.openByUrl(reportURL.toString()).getSheets()[0];
                    var reportData = report.getDataRange().getValues();
                    var titleHeader = reportData[13];
                    if (!titleExist) {
                        result.push(titleHeader);
                        titleExist = true;
                    }
                    var row = parseInt(rowInReport.toString());
                    var content = reportData[row - 1];
                    if (trjs.indexOf(type.toString()) >= 0) {
                        var reportIssnP = content[TRJcolumn["ISSN_Print"] - 1];
                        var reportIssnO = content[TRJcolumn["ISSN_Online"] - 1];
                        if (reportIssnP.toString().substring(0, 1) != "\'") {
                            content[TRJcolumn["ISSN_Print"] - 1] = '\'' + content[TRJcolumn["ISSN_Print"] - 1];
                        }
                        if (reportIssnO.toString().substring(0, 1) != "\'") {
                            content[TRJcolumn["ISSN_Online"] - 1] = '\'' + content[TRJcolumn["ISSN_Online"] - 1];
                        }
                    }
                    else {
                        var reportIsbn = content[TRBcolumn["ISBN"] - 1];
                        var reportIssnP = content[TRBcolumn["ISSN_Print"] - 1];
                        var reportIssnO = content[TRBcolumn["ISSN_Online"] - 1];
                        if (reportIssnP.toString().substring(0, 1) != "\'") {
                            content[TRBcolumn["ISSN_Print"] - 1] = '\'' + content[TRBcolumn["ISSN_Print"] - 1];
                        }
                        if (reportIssnO.toString().substring(0, 1) != "\'") {
                            content[TRBcolumn["ISSN_Online"] - 1] = '\'' + content[TRBcolumn["ISSN_Online"] - 1];
                        }
                        if (reportIsbn.toString().substring(0, 1) != "\'") {
                            content[TRBcolumn["ISBN"] - 1] = content[TRBcolumn["ISBN"] - 1];
                        }
                    }
                    result.push(content);
                }
            }
        }
    }
    if (result.length > 1) {
        var tempResultSheet = SpreadsheetApp.create(sheetName);
        var dest = DriveApp.getFoldersByName('DH Place').next();
        var tempFile = DriveApp.getFilesByName(sheetName.toString()).next();
        var newFile = tempFile.makeCopy(sheetName.toString(), dest);
        var searchResultSheet = SpreadsheetApp.open(newFile);
        var urlResult = searchResultSheet.getUrl();
        var searchResult = searchResultSheet.getSheets()[0];
        for (var k = 0; k < result.length; k++) {
            var temp = [];
            temp.push(result[k]);
            searchResult.getRange(k + 1, 1, 1, result[k].length).setValues(temp);
        }
        return urlResult;
    }
    else {
        var notFound = "Nothing found";
        return notFound;
    }
}
/**
 *
 * @param sheetName: the result sheet name
 * @param searchOption: start with, part of string or exact match.
 * @param usr_title: title user want to search
 * @param year: year of report
 * @param type: report type.
 * search all the search index sheet and find match title with user title and create a google
 * sheet to store the result and give back the url.
 */
function searchByTitle(sheetName, searchOption, usr_title, year, type) {
    var result = [];
    if (year.toString().toLowerCase() == 'all') {
        var files = DriveApp.searchFiles('title contains  ' + '\"' + SI + '\"');
    }
    else {
        var files = DriveApp.getFilesByName(SI + ' ' + year.toString());
    }
    var titleExist = false;
    while (files.hasNext()) {
        var searchIndexsheet = SpreadsheetApp.open(files.next()).getSheets()[0]; //open all the search index.
        var searchIndexData = searchIndexsheet.getDataRange().getValues();
        for (var i = 0; i < searchIndexData.length; i++) // search all rows
        {
            var title = searchIndexData[i][SearchIndexcolumn["Title"] - 1].toString();
            var reportURL = searchIndexData[i][SearchIndexcolumn["URL"] - 1];
            var rowInReport = searchIndexData[i][SearchIndexcolumn["RowPos"] - 1];
            var reportType = searchIndexData[i][SearchIndexcolumn["Type"] - 1];
            var reportYear = searchIndexData[i][SearchIndexcolumn["Report_Year"] - 1];
            if (reportType.toString() == type.toString()) {
                if (searchOption.toString().toLowerCase() == 'exact match') {
                    if (exactMatch(usr_title.toString(), title)) {
                        var report = SpreadsheetApp.openByUrl(reportURL.toString()).getSheets()[0];
                        var reportData = report.getDataRange().getValues();
                        var titleHeader = reportData[13];
                        if (!titleExist) {
                            result.push(titleHeader);
                            titleExist = true;
                        }
                        var row = parseInt(rowInReport.toString());
                        var content = reportData[row - 1];
                        if (trjs.indexOf(type.toString()) >= 0) {
                            content[TRJcolumn["ISSN_Print"] - 1] = '\'' + content[TRJcolumn["ISSN_Print"] - 1];
                            content[TRJcolumn["ISSN_Online"] - 1] = '\'' + content[TRJcolumn["ISSN_Online"] - 1];
                        }
                        else {
                            content[TRBcolumn["ISBN"] - 1] = '\'' + content[TRBcolumn["ISBN"] - 1];
                            content[TRBcolumn["ISSN_Print"] - 1] = '\'' + content[TRBcolumn["ISSN_Print"] - 1];
                            content[TRBcolumn["ISSN_Online"] - 1] = '\'' + content[TRBcolumn["ISSN_Online"] - 1];
                        }
                        result.push(content);
                    }
                }
                else if (searchOption.toString().toLowerCase() == 'anywhere match') {
                    if (subStringMatch(usr_title.toString(), title)) {
                        var report = SpreadsheetApp.openByUrl(reportURL.toString()).getSheets()[0];
                        var reportData = report.getDataRange().getValues();
                        var titleHeader = reportData[13];
                        if (!titleExist) {
                            result.push(titleHeader);
                            titleExist = true;
                        }
                        var row = parseInt(rowInReport.toString());
                        var content = reportData[row - 1];
                        if (trjs.indexOf(type.toString()) >= 0) {
                            content[TRJcolumn["ISSN_Print"] - 1] = '\'' + content[TRJcolumn["ISSN_Print"] - 1];
                            content[TRJcolumn["ISSN_Online"] - 1] = '\'' + content[TRJcolumn["ISSN_Online"] - 1];
                        }
                        else {
                            content[TRBcolumn["ISBN"] - 1] = '\'' + content[TRBcolumn["ISBN"] - 1];
                            content[TRBcolumn["ISSN_Print"] - 1] = '\'' + content[TRBcolumn["ISSN_Print"] - 1];
                            content[TRBcolumn["ISSN_Online"] - 1] = '\'' + content[TRBcolumn["ISSN_Online"] - 1];
                        }
                        result.push(content);
                    }
                }
                else if (searchOption.toString().toLowerCase() == 'begin with') {
                    if (beginWithMatch(usr_title.toString(), title)) {
                        var report = SpreadsheetApp.openByUrl(reportURL.toString()).getSheets()[0];
                        var reportData = report.getDataRange().getValues();
                        var titleHeader = reportData[13];
                        if (!titleExist) {
                            result.push(titleHeader);
                            titleExist = true;
                        }
                        var row = parseInt(rowInReport.toString());
                        var content = reportData[row - 1];
                        if (trjs.indexOf(type.toString()) >= 0) {
                            content[TRJcolumn["ISSN_Print"] - 1] = '\'' + content[TRJcolumn["ISSN_Print"] - 1];
                            content[TRJcolumn["ISSN_Online"] - 1] = '\'' + content[TRJcolumn["ISSN_Online"] - 1];
                        }
                        else {
                            content[TRBcolumn["ISBN"] - 1] = '\'' + content[TRBcolumn["ISBN"] - 1];
                            content[TRBcolumn["ISSN_Print"] - 1] = '\'' + content[TRBcolumn["ISSN_Print"] - 1];
                            content[TRBcolumn["ISSN_Online"] - 1] = '\'' + content[TRBcolumn["ISSN_Online"] - 1];
                        }
                        result.push(content);
                    }
                }
            }
        }
    }
    if (result.length > 1) {
        var tempResultSheet = SpreadsheetApp.create(sheetName);
        var dest = DriveApp.getFoldersByName('DH Place').next();
        var tempFile = DriveApp.getFilesByName(sheetName.toString()).next();
        var newFile = tempFile.makeCopy(sheetName.toString(), dest);
        var searchResultSheet = SpreadsheetApp.open(newFile);
        var urlResult = searchResultSheet.getUrl();
        var searchResult = searchResultSheet.getSheets()[0];
        for (var k = 0; k < result.length; k++) {
            var temp = [];
            temp.push(result[k]);
            searchResult.getRange(k + 1, 1, 1, result[k].length).setValues(temp);
        }
        return urlResult;
    }
    else {
        var notFound = "Nothing found";
        return notFound;
    }
}
/**
 *
 *  @param userString: user input string
 * @param reportString: string in report
 *  return true if user input are equal with report string ignore cases
 */
function exactMatch(userString, reportString) {
    var result = false;
    if (userString.toString().toLowerCase() == reportString.toString().toLowerCase()) {
        result = true;
    }
    return result;
}
/**
 *
 * @param userString: user input string
 * @param reportString: string in report
 * return true if user input string is a substring of the report string ignore cases.
 */
function subStringMatch(userString, reportString) {
    var result = false;
    if (reportString.toString().toLowerCase().indexOf(userString.toString().toLowerCase()) >= 0) {
        result = true;
    }
    return result;
}
/**
 *
 * @param userString: user input string
 * @param reportString: string in report
 * return true if reportString are begin with user input string ignore cases.
 */
function beginWithMatch(userString, reportString) {
    var result = false;
    if (reportString.toString().toLowerCase().indexOf(userString.toString().toLowerCase()) == 0) {
        result = true;
    }
    return result;
}
/**
 * This function generate yyyy-mm-dd for date.
 */
function timeGen() {
    var year = new Date().getFullYear();
    var month = new Date().getMonth() + 1;
    var day = new Date().getDate();
    var resultTime = year.toString() + '-' + month.toString() + '-' + day.toString();
    return resultTime;
}
