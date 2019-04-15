var reportDatabaseUrl = 'https://docs.google.com/spreadsheets/d/1U1wUSFMmhrCiLZXLE_-bvM-VjI5cnlKkhs8NHrtlKqk/edit#gid=0';

/** Structure of folder is RootFolder/VendorName/YearOfReports/
 This function iterates through each YearOfReports for each vendors and adds the url to the database
 */
function uploadPreHarvestedCounter5() {
    var rootFile = 'Upload-Counter5-Reports';
    var rootFileFolders = DriveApp.getFoldersByName(rootFile);
    var rootFileFolder = rootFileFolders.next();
    var list = rootFileFolder.getFolders();

    while (list.hasNext()) {
        var vendor = list.next();
        Logger.log('Name of vendor: ' + vendor);
        var vendorFolders = DriveApp.getFoldersByName(vendor.getName());
        var vendorFolder = vendorFolders.next();
        var vendorFoldersList = vendorFolder.getFolders();

        while (vendorFoldersList.hasNext()) {
            var year = vendorFoldersList.next();
            Logger.log('Folder inside vendor: ' + year);
            var yearFolders = DriveApp.getFoldersByName(year.getName());
            var yearFolder = yearFolders.next();
            var yearFoldersList = yearFolder.getFiles();

            while (yearFoldersList.hasNext()) {
                var file = yearFoldersList.next();
                Logger.log('File inside years: ' + file);
                var fileUrl = file.getUrl();
                Logger.log('File url: ' + file.getUrl());
                addByUrl(fileUrl);
            }
        }
    }
}