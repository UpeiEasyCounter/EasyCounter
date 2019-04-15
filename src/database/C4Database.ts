var c4databaseName = "C4 Database";
var name_col = 0;

/**
 * create a spreadshhet call "C4 Database" for Counter4 report Index.
 */
function createC4Database()
{
    var column = ["Name","Platform","Data Run","Report Period","Year","Type","Updated","URL"];
    var database= SpreadsheetApp.create(c4databaseName).getSheets()[0];
    database.appendRow(column);

    var folder = DriveApp.getFoldersByName("DH Place").next();
    var files = DriveApp.getFilesByName(c4databaseName);
    while (files.hasNext())
    {
        var currentDatabase = files.next();
        var newFile = currentDatabase.makeCopy(c4databaseName,folder);
        var newDatabase = SpreadsheetApp.openById(newFile.getId()).getSheets()[0];
        newDatabase.getRange(1,1,1,8).setBackground("yellow");
        newDatabase.getRange(1,1,1,8).setFontWeight("Bold");
        currentDatabase.setTrashed(true);

    }
    return newDatabase;
}


/**
 *
 * @param url: report url
 * This function take a counter4 report and store it into Counter4 database
 */
function addC4(url)
{
    var dataBase = DriveApp.getFilesByName(c4databaseName);
    var c4Reports;

    if(dataBase.hasNext()) {
        c4Reports = SpreadsheetApp.openById(dataBase.next().getId());
    }else{
        c4Reports = createC4Database();
    }

    try{
        var report = SpreadsheetApp.openByUrl(url.toString()).getSheets()[0];
        var data = report.getDataRange().getValues();
        var name = SpreadsheetApp.openByUrl(url.toString()).getName();

     if(!existC4(name)){
         var platform = "";
         var date_run = "";
         var period = "";
         var year = "";
         var type = "";

         var type_Release = data[0][0].toString();
         for (var i = 0; i < type_Release.length - 4; i++) {
             type += type_Release[i]; //type of the report
         }
         date_run = data[6][0].toString();
         if (date_run.length <= 0) {
             date_run = "n\a";
         }
         var temp_year = data[4][0];
         period = data[4][0].toString();
         Logger.log(period);
         for (var i = 0; i < 4; i++) {
             year += temp_year[i];
         }
         for (var i = 0; i < report.getLastColumn(); i++) {
             if (data[7][i] == "Platform") {
                 platform = data[9][i].toString();
                 Logger.log(platform);
                 break;
             }
         }

         var urlNew = copyToFolderC4(platform, year, SpreadsheetApp.openByUrl(url.toString()));
         c4Reports.appendRow([name, platform, date_run, period, year, type, new Date(), urlNew]);

     }



    }catch (e) {
        Logger.log("Counter 4 Exception: " + e);
    }
}

/**
 *
 * @param name: report name.
 * check if a report exist already, if yes,
 * return true, return false otherwise.
 */
function existC4(name) {

    var databases = DriveApp.getFilesByName(c4databaseName);
    while (databases.hasNext()) {
        var current = SpreadsheetApp.openById(databases.next().getId()).getSheets()[0];
        var names = current.getRange(1, name_col + 1, current.getLastRow(), 1).getValues();
        for (var i = 0; i < names.length; i++) {
            for (var j = 0; j < name[0].length; j++) {
                if (name == names[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}


/**
 *
 * @param name: report name.
 * @param year: report year.
 * @param report; report spreadsheet.
 * copy $ss to folder : $name/ $year/ $ss.
 */
function copyToFolderC4(name,year,report)
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

