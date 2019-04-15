var databaseName = "C5 Database";


/**
 * Create a folder call "C5 Database" in Folder 'DH Place' has database google sheets srperate by year reference for all the reports.
 */
function createC5Database(year)
{
    var sheetName = databaseName +" "+year.toString();
    var column = ["Name","Platform","Date Run","Report Period","Year","Type","Updated","URL"];
    var databaseSheet= SpreadsheetApp.create(sheetName).getSheets()[0];
    databaseSheet.appendRow(column);

    var folder = DriveApp.getFoldersByName("DH Place").next();
    var c5Folder = folder.getFoldersByName(databaseName);
    if(c5Folder.hasNext())
    {
        var c5 = c5Folder.next();
        var files = DriveApp.getFilesByName(sheetName);
        while (files.hasNext())
        {
            var currentDatabase = files.next();
            var newFile = currentDatabase.makeCopy(sheetName,c5);
            var newDatabase = SpreadsheetApp.openById(newFile.getId()).getSheets()[0];
            newDatabase.getRange(1,1,1,8).setBackground("yellow");
            newDatabase.getRange(1,1,1,8).setFontWeight("Bold");
            currentDatabase.setTrashed(true);

        }
    }else{
        var c5 = folder.createFolder(databaseName);
        var files = DriveApp.getFilesByName(sheetName);
        while (files.hasNext())
        {
            var currentDatabase = files.next();
             var newFile = currentDatabase.makeCopy(sheetName,c5);
            var newDatabase = SpreadsheetApp.openById(newFile.getId()).getSheets()[0];
            newDatabase.getRange(1,1,1,8).setBackground("yellow");
            newDatabase.getRange(1,1,1,8).setFontWeight("Bold");
            currentDatabase.setTrashed(true);

        }
    }
    return newDatabase;
}

/**
 *
 * @param url: report url.
 * for add exist report into database by provide url.
 */
function addByUrl(url)
{



    var c5Report = SpreadsheetApp.openByUrl(url.toString()).getSheets()[0];
    var reportName = SpreadsheetApp.openByUrl(url.toString()).getName();
    var reportData = c5Report.getDataRange().getValues();

    reportName = reportName + " 1 of 1";
    var platform = "";
    var dateRun = reportData[10][1];
    var reportPeriod = reportData [9][1];
    var year = reportPeriod.toString().substring(0,4);
    var type = reportData[1][1];
    var updated = new Date();

    var sheetName = databaseName+" "+year.toString();
    var dataBase = DriveApp.getFilesByName(sheetName);
    var c5Database;

    if(dataBase.hasNext()) {
        c5Database = SpreadsheetApp.openById(dataBase.next().getId()).getSheets()[0];
    }else{
        c5Database = createC5Database(year);
    }
    var exist = false;
    for(var i = 1; i<=c5Database.getLastRow();i++)
    {
        var name = c5Database.getRange(i,1).getValue().toString();
        if(reportName == name)
        {
            exist = true;
            break;
        }
    }

    for (var j = 0; j < c5Report.getLastColumn(); j++) {
        if (reportData[13][j] == "Platform") {
            platform = reportData[14][j].toString();
            break;
        }
    }
    if(!exist)
    {
        var newUrl = copyToFolderC5(platform,year,SpreadsheetApp.openByUrl(url.toString()));
        c5Database.appendRow([reportName,platform,dateRun,reportPeriod,year,type,updated,newUrl]);

    }
}


/**
 *
 * @param vendor: vendor name
 * @param year: year of report
 * @param type: report type
 * @param reportHeader: reportHeader
 * @param reportBody: report body
 * @param fileNum: google sheet that required
 * @param maxRow: max row allow in 1 google sheet
 *
 * Update the database and report if needed, and add report/reports into database
 */
function addUpdateHarvested(vendor,year,type,reportHeader,reportBody,fileNum,maxRow)
{

    var content =[[]];
    var tempName =vendor +" "+ year + " "+ type;

    var sheetName = databaseName+" "+year.toString();
    var dataBase = DriveApp.getFilesByName(sheetName);
    var c5Database;

    if(dataBase.hasNext()) {
        c5Database = SpreadsheetApp.openById(dataBase.next().getId()).getSheets()[0];
        cleanDatabase(tempName,c5Database);
    }else{
        c5Database = createC5Database(year);
    }
    if(fileNum == 1)
    {

        content = addReport(vendor,year,type,reportHeader,reportBody);
        c5Database.appendRow(content[0]);

    }
    if(fileNum >1){

        content =addReports(vendor,year,type,reportHeader,reportBody,fileNum,maxRow);
        for(var i =0; i <content.length;i++)
        {

            c5Database.appendRow(content[i]);
        }
    }



}


/**
 *
 * @param vendor: vendor name
 * @param year: year of report
 * @param type: report type
 * @param reportHeader: reportHeader
 * @param reportBody: report body
 * @param fileNum: google sheet that required
 * @param maxRow: max row allow in 1 google sheet
 * Helper method of addUpdateHarvested(vendor,year,type,reportHeader,reportBody,fileNum,maxRow).
 * Add report that it into 2 or more google sheet into database.
 */
function addReports(vendor,year,type,reportHeader,reportBody,fileNum,maxRow)
{
    var result = [];
    var columnHeader =[];
    columnHeader.push(reportBody[0]);

    var reportbody =reportBody.slice(1);


try {
    for (var i = 0; i < fileNum - 1; i++) {
        var tempBody = [];
        var reportName = vendor + " " + year + " " + type + " " + (i + 1).toString() + " of " + fileNum.toString();
        var reports = SpreadsheetApp.create(reportName);
        var newUrl = moveToFolder(vendor, year, reports);
        var report = SpreadsheetApp.openByUrl(newUrl).getSheets()[0];
        report.getRange(1, 1, reportHeader.length, 2).setValues(reportHeader);
        report.getRange(14, 1, 1, reportBody[0].length).setValues(columnHeader);


        for (var j = 0; j < maxRow; j++) {
            tempBody.push(reportbody[j]);

        }
        report.getRange(15, 1, maxRow, reportbody[0].length).setValues(tempBody);

        var platform = vendor;
        var dateRun = reportHeader[10][1];
        var reportPeriod = reportHeader[9][1];
        var updated = new Date();

        result.push([reportName, vendor, dateRun, reportPeriod, year, type, updated, newUrl]);
        reportbody = reportbody.slice(maxRow);

    }
    var reportName = vendor + " " + year + " " + type + " " + fileNum.toString() + " of " + fileNum.toString();
    var reports = SpreadsheetApp.create(reportName);
    var newUrl = moveToFolder(vendor, year, reports);
    var report = SpreadsheetApp.openByUrl(newUrl).getSheets()[0];
    report.getRange(1, 1, reportHeader.length, 2).setValues(reportHeader);
    report.getRange(14, 1, 1, reportBody[0].length).setValues(columnHeader);

    report.getRange(15, 1, reportbody.length, reportBody[0].length).setValues(reportbody);
    var platform = vendor;
    var dateRun = reportHeader[10][1];
    var reportPeriod = reportHeader[9][1];
    var updated = new Date();

    result.push([reportName, vendor, dateRun, reportPeriod, year, type, updated, newUrl]);
}catch(e)
{
    Logger.log("add reports err: "+e);
}
    return result;


}


/**
 *
 * @param vendor: vendor name
 * @param year: year of report
 * @param type: report type
 * @param reportHeader: reportHeader
 * @param reportBody: report body
 * Helper method of addUpdateHarvested(vendor,year,type,reportHeader,reportBody,fileNum,maxRow).
 * Add report that can fit into 1 google sheet into database.
 *
 */
function addReport(vendor, year, type, reportHeader, reportBody) {
    var result = [];
    var reportName = vendor +" "+ year + " "+ type + " 1 of 1";
    var reports = SpreadsheetApp.create(reportName);
    var newUrl = moveToFolder(vendor,year,reports);
    try{
        var report = SpreadsheetApp.openByUrl(newUrl).getSheets()[0];
        report.getRange(1,1,reportHeader.length,2).setValues(reportHeader);
        report.getRange(14,1,reportBody.length,reportBody[0].length).setValues(reportBody);


        var dateRun = reportHeader[10][1];
        var reportPeriod = reportHeader[9][1];
        var updated = new Date();

        result.push([reportName,vendor,dateRun,reportPeriod,year,type,updated,newUrl]);
    }catch(e){Logger.log("Add report error: "+e);}

    return result;
}


/**
 *
 * @param reportName: report name in database.
 * This code search report name in the database and delete the report in database and the actural file
 * @param databaseSheet: actual year of the database.
 */
function cleanDatabase(reportName,databaseSheet)
{

    var urls =[];
    var rows =[];
    var c5Database = databaseSheet;

try {
    for (var i = 0; i < c5Database.getLastRow(); i++) {
        var nameInReport = c5Database.getRange(i + 1, 1).getValue().toString();
        var name = nameInReport.substring(0, nameInReport.length - 7);

        if (name == reportName) {

            var row = parseInt((i + 1).toString());
            rows.push(row);
            var reportUrl = c5Database.getRange(row, 8).getValue().toString();
            urls.push(reportUrl);

        }
    }

    for (var i = 0; i < urls.length; i++) {
        var reportId = SpreadsheetApp.openByUrl(urls[i]).getId();

        var report = DriveApp.getFileById(reportId);
        report.setTrashed(true);
    }

    for (var j = rows.length - 1; j >= 0; j--) {

        c5Database.deleteRow(rows[j]);
    }
}catch (e) {
    Logger.log("Clean database error: "+e);

}

}


/**
 *
 * @param name: vendor name.
 * @param year: report year.
 * @param report; report spreadsheet.
 * copy $ss to folder : $name/ $year/ $ss.
 */
function copyToFolderC5(name,year,report)
{
    var DH = DriveApp.getFoldersByName("DH Place").next();
    if (DH.getFoldersByName(name).hasNext()) {
        var vendor = DH.getFoldersByName(name).next();
        if (vendor.getFoldersByName(year).hasNext()) {
            var time = vendor.getFoldersByName(year).next();
            var reportId = report.getId();
            var file = DriveApp.getFileById(reportId);
            var newFile = file.makeCopy(file.getName(), time);

            return newFile.getUrl();
        }
        else {
            vendor.createFolder(year);
            var time = vendor.getFoldersByName(year).next();
            var reportId = report.getId();
            var file = DriveApp.getFileById(reportId);
            var newFile = file.makeCopy(file.getName(), time);

            return newFile.getUrl();
        }
    }
    else {
        var vendor = DH.createFolder(name);
        var time = vendor.createFolder(year);
        var reportId = report.getId();
        var file = DriveApp.getFileById(reportId);
        var newFile = file.makeCopy(file.getName(), time);

        return newFile.getUrl();
    }
}

/**
 *
 * @param name: vendor name.
 * @param year: report year.
 * @param report; report spreadsheet.
 * move $ss to folder : $name/ $year/ $ss.
 */
function moveToFolder(name,year,report)
{
    var DH = DriveApp.getFoldersByName("DH Place").next();
    if (DH.getFoldersByName(name).hasNext()) {
        var vendor = DH.getFoldersByName(name).next();
        if (vendor.getFoldersByName(year).hasNext()) {
            var time = vendor.getFoldersByName(year).next();
            var reportId = report.getId();
            var file = DriveApp.getFileById(reportId);
            var newFile = file.makeCopy(file.getName(), time);
            file.setTrashed(true);
            return newFile.getUrl();
        }
        else {
            vendor.createFolder(year);
            var time = vendor.getFoldersByName(year).next();
            var reportId = report.getId();
            var file = DriveApp.getFileById(reportId);
            var newFile = file.makeCopy(file.getName(), time);
            file.setTrashed(true);
            return newFile.getUrl();
        }
    }
    else {
        var vendor = DH.createFolder(name);
        var time = vendor.createFolder(year);
        var reportId = report.getId();
        var file = DriveApp.getFileById(reportId);
        var newFile = file.makeCopy(file.getName(), time);
        file.setTrashed(true);
        return newFile.getUrl();
    }
}
