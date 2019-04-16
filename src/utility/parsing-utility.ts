/** Global Variables For Each Report Type */
var yearTotalItemRequest = new Array(12),yearTotalItemInvestigation = new Array(12),yearUniqueItemInvestigation = new Array(12)
    ,yearUniqueTitleInvestigation = new Array(12),yearUniqueItemRequest = new Array(12),yearLimitExceed = new Array(12)
    ,yearUniqueTitleRequest = new Array(12),yearAccessDenied = new Array(12),yearSearchesPlatform = new Array(12)
    ,yearSearchesAutomated = new Array(12),yearSearchesFederated = new Array(12),yearSearchesRegular = new Array(12)
    ,yearNoLicense = new Array(12);

/**
 * Select Parser to use
 * */
function parseSelect (data,vendorName,period) {

    var reportID;

    reportID=data.Report_Header.Report_ID;

    switch (reportID) {
        case "TR":
            parseTr(data,vendorName,period);
            break;
        case "TR_B1":
            parseTrb1(data,vendorName,period);
            break;
        case "TR_B2":
            parseTrb2(data,vendorName,period);
            break;
        case "TR_B3":
            parseTrb3(data,vendorName,period);
            break;
        case "TR_J1":
            parseTrj1(data, vendorName, period);
            break;
        case "TR_J2":
            parseTrj2(data,vendorName,period);
            break;
        case "TR_J3":
            parseTrj3(data,vendorName,period);
            break;
        case "TR_J4":
            parseTrj4(data,vendorName,period);
            break;
        case "PR":
            parsePr(data,vendorName,period);
            break;
        case "PR_P1":
            parsePrp1(data,vendorName,period);
            break;
        case "DR":
            parseDr(data,vendorName,period);
            break;
        case "DR_D1":
            parseDrd1(data,vendorName,period);
            break;
        case "DR_D2":
            parseDrd2(data,vendorName,period);
            break;
        case "IR":
            parseIr(data,vendorName,period);
            break;
        case "IR_A1":
            parseIra1(data,vendorName,period);
            break;
        case "IR_M1":
            parseIrm1(data,vendorName,period);
            break;
    }
}

/**
 * Reset Global Variable Arrays to Zero
 * */
function resetToZero(){
    for(var z=0; z<yearTotalItemRequest.length; z++) {
        yearTotalItemRequest[z]=0;
        yearTotalItemInvestigation[z]=0;
        yearUniqueItemInvestigation[z]=0;
        yearUniqueTitleInvestigation[z]=0;
        yearUniqueItemRequest[z]=0;
        yearLimitExceed[z]=0;
        yearUniqueTitleRequest[z]=0;
        yearAccessDenied[z]=0;
        yearSearchesPlatform[z]=0;
        yearSearchesAutomated[z]=0;
        yearSearchesFederated[z]=0;
        yearSearchesRegular[z]=0;
        yearNoLicense[z]=0;
    }
}

/**
 * Return Month Value
 * */
function getMonth(dateString) {
    return dateString.substring(5,7);
}

/**
 * Return Year Value
 * */
function yearOfReport(dateString) {
    return dateString.substring(0,4);
}

/**
 * Calculate number of files needed by Report
 * */
function calcReportFiles(lines,MAX) {
    return Math.ceil(lines/MAX);
}

/**
 *  All Data To Create Google Sheets Reports
 * */
function getInfo(vendorName,year,type,header,body,fileNum,MAX) {
    addUpdateHarvested(vendorName,year,type,header,body,fileNum,MAX);
}

/** Generic Header */
function createHeader(data,period) {
    var header = [];
    var reportFilter="";
    var booleanMetric = false, booleanFilter = false;


    // Report_Name Error Handler
    try {
        if (data.Report_Header.Report_Name) {
            header.push(["Report_Name",data.Report_Header.Report_Name]);
        }
    } catch(e) {
        Logger.log("Report_Name Not Included")
        header.push(["Report_Name",""]);
    }
    // Report_ID Error Handler
    try {
        if (data.Report_Header.Report_ID) {
            header.push(["Report_ID",data.Report_Header.Report_ID]);
        }
    } catch(e) {
        Logger.log("Report_ID Not Included")
        header.push(["Report_ID",""]);
    }
    // Release Error Handler
    try {
        if (data.Report_Header.Release) {
            header.push(["Release",data.Report_Header.Release]);
        }
    } catch(e) {
        Logger.log("Release Not Included")
        header.push(["Release",""]);
    }
    // Institution_Name Error Handler
    try {
        if (data.Report_Header.Institution_Name) {
            header.push(["Institution_Name",data.Report_Header.Institution_Name]);
        }
    } catch(e) {
        Logger.log("Institution_Name Not Included")
        header.push(["Institution_Name",""]);
    }
    // Institution_ID Error Handler
    try {
        if (data.Report_Header.Institution_ID[0]) {
            header.push(["Institution_ID",data.Report_Header.Institution_ID[0].Value]);
        }
    } catch(e) {
        Logger.log("Institution_ID Not Included")
        header.push(["Institution_ID",""]);
    }

    // Report_Filters & Metric Error Handler
    try {
        for(var i=0;i<data.Report_Header.Report_Filters.length; i++)
        {
            if (data.Report_Header.Report_Filters[i].Name == "Metric_Types") {
                header.push(["Metric_Types",data.Report_Header.Report_Filters[i].Value]);
                booleanMetric = true;
            }
            if (data.Report_Header.Report_Filters[i].Name == "Data_Type") {
                reportFilter += "Data_Type: "+data.Report_Header.Report_Filters[i].Value+"; ";
                booleanFilter = true;
            }
            if (data.Report_Header.Report_Filters[i].Name == "Section_Type") {
                reportFilter += "Section_Type: "+data.Report_Header.Report_Filters[i].Value+"; ";
                booleanFilter = true;
            }
            if (data.Report_Header.Report_Filters[i].Name == "Access_Type") {
                reportFilter += "Access_Type: "+data.Report_Header.Report_Filters[i].Value+"; ";
                booleanFilter = true;
            }
            if (data.Report_Header.Report_Filters[i].Name == "Access_Method") {
                reportFilter += "Access_Method: "+data.Report_Header.Report_Filters[i].Value+"; ";
                booleanFilter = true;
            }
        }
        if (booleanFilter)
            header.push(["Report_Filters", reportFilter]);
    } catch(e) {
        Logger.log("Report_Filters Not Included")
        if(!booleanMetric) {
            header.push(["Metric_Types", ""]);
            booleanMetric = true;
        }
        if(!booleanFilter) {
            header.push(["Report_Filters", reportFilter]);
            booleanFilter = true;
        }
    } finally {
        if(!booleanMetric)
            header.push(["Metric_Types",""]);
        if(!booleanFilter)
            header.push(["Report_Filters",reportFilter]);
    }
    // Report_Attributes Error Handler
    try {
        if (data.Report_Header.Report_Attributes[0]) {
            header.push(["Report_Attributes",data.Report_Header.Report_Attributes]);
        }
    } catch(e) {
        Logger.log("Report_Attributes Not Included")
        header.push(["Report_Attributes",""]);
    }
    // Exception Error Handler
    try {
        if (data.Report_Header.Exceptions[0].Message) {
            if(data.Report_Header.Exceptions[0].Code != "3040")
                return null;
            else
                header.push(["Exceptions",data.Report_Header.Exceptions[0].Message]);
        }
    } catch(e) {
        Logger.log("Exception Not Included");
        header.push(["Exceptions", ""]);
    }
    header.push(["Reporting_Period",period]);
    // Created Error Handler
    try {
        if (data.Report_Header.Created) {
            header.push(["Created",data.Report_Header.Created]);
        }
    } catch(e) {
        Logger.log("Created Not Included")
        header.push(["Created",""]);
    }
    // Created_By Error Handler
    try {
        if (data.Report_Header.Created) {
            header.push(["Created_By",data.Report_Header.Created_By]);
        }
    } catch(e) {
        Logger.log("Created_By Not Included")
        header.push(["Created_By",""]);
    }

    return header;
}

/**
 * Check if an array has all values as 0
 * */
function emptyCheckArray(arrayTest) {
    var empty = true;

    for (var i=0; i < arrayTest.length; i++) {
        if (arrayTest[i] !== 0)
            empty = false;
    }

    return empty;
}

/** Parse Master Report TR */
function parseTr(data,vendorName,period) {
    // MAX Number of Items per File Report
    const MAX=28000;

    // Variables to use per Item
    var title,isbn,issn,issnOnline,platform,proprietaryId,publisher,publisherId,yop,uri,sectionType,doi;
    var month, year;

    // Variables to Store data to Send    
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if ( fileNumber == 0 )
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","ISBN","Print_ISSN","Online_ISSN",
        "URI","Section_Type","YOP","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,
        "Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", isbn = "", issn = "", issnOnline = "", platform = "", proprietaryId = "", publisher = "", publisherId = "", yop = "", uri = "", sectionType = "", doi = "";

            /** Set Item Values */
            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "ISBN")
                        isbn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }
            try {
                if (data.Report_Items[i].YOP)
                    yop = data.Report_Items[i].YOP;
            } catch (e) {
                Logger.log("No YOP");
            }

            /** Reset values to 0 for each Item */
            resetToZero();

            /** Set Metrics For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) {
                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date);

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Investigations")
                        yearTotalItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Investigations")
                        yearUniqueItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Investigations")
                        yearUniqueTitleInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Requests")
                        yearUniqueTitleRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Limit_Exceeded")
                        yearLimitExceed[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values in Each Array */
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Total_Item_Requests",
                    yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4],
                    yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8], yearTotalItemRequest[9],
                    yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearTotalItemInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Total_Item_Requests",
                    yearTotalItemInvestigation[0], yearTotalItemInvestigation[1], yearTotalItemInvestigation[2], yearTotalItemInvestigation[3],
                    yearTotalItemInvestigation[4], yearTotalItemInvestigation[5], yearTotalItemInvestigation[6], yearTotalItemInvestigation[7],
                    yearTotalItemInvestigation[8], yearTotalItemInvestigation[9], yearTotalItemInvestigation[10], yearTotalItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Unique_Item_Investigations",
                    yearUniqueItemInvestigation[0], yearUniqueItemInvestigation[1], yearUniqueItemInvestigation[2], yearUniqueItemInvestigation[3],
                    yearUniqueItemInvestigation[4], yearUniqueItemInvestigation[5], yearUniqueItemInvestigation[6], yearUniqueItemInvestigation[7],
                    yearUniqueItemInvestigation[8], yearUniqueItemInvestigation[9], yearUniqueItemInvestigation[10], yearUniqueItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueTitleInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Unique_Title_Investigations",
                    yearUniqueTitleInvestigation[0], yearUniqueTitleInvestigation[1], yearUniqueTitleInvestigation[2], yearUniqueTitleInvestigation[3],
                    yearUniqueTitleInvestigation[4], yearUniqueTitleInvestigation[5], yearUniqueTitleInvestigation[6], yearUniqueTitleInvestigation[7],
                    yearUniqueTitleInvestigation[8], yearUniqueTitleInvestigation[9], yearUniqueTitleInvestigation[10], yearUniqueTitleInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Unique_Item_Requests",
                    yearUniqueItemRequest[0], yearUniqueItemRequest[1], yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4],
                    yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7], yearUniqueItemRequest[8], yearUniqueItemRequest[9],
                    yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueTitleRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Unique_Item_Requests",
                    yearUniqueTitleRequest[0], yearUniqueTitleRequest[1], yearUniqueTitleRequest[2], yearUniqueTitleRequest[3], yearUniqueTitleRequest[4],
                    yearUniqueTitleRequest[5], yearUniqueTitleRequest[6], yearUniqueTitleRequest[7], yearUniqueTitleRequest[8], yearUniqueTitleRequest[9],
                    yearUniqueTitleRequest[10], yearUniqueTitleRequest[11]]);
            }
            if (!emptyCheckArray(yearLimitExceed)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Limit_Exceeded",
                    yearLimitExceed[0], yearLimitExceed[1], yearLimitExceed[2], yearLimitExceed[3], yearLimitExceed[4], yearLimitExceed[5],
                    yearLimitExceed[6], yearLimitExceed[7], yearLimitExceed[8], yearLimitExceed[9], yearLimitExceed[10], yearLimitExceed[11]]);
            }
        } // End of 1st Loop
    } catch (e) {
        Logger.log("No Items");
    }
    /** Send All Values Stored */
    getInfo(vendorName,year,"TR",header,body,fileNumber,MAX);
}

/** Parse Tr_B1 Reports */
function parseTrb1(data,vendorName,period) {
    // MAX Number of Items per File Report
    const MAX= 99000;

    // Variables to use per Item
    var title,publisher,publisherId,platform,doi,proprietaryId,isbn,issn,issnOnline,uri,sectionType,yop;
    var month, year;

    // Variables to Store data to Send
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if ( fileNumber == 0 )
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","ISBN","Print_ISSN","Online_ISSN",
        "URI","Section_Type","YOP","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,
        "Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", publisher = "", publisherId = "", platform = "", doi = "", proprietaryId = "", isbn = "", issn = "", issnOnline = "", uri = "", sectionType = "", yop = "";

            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "ISBN")
                        isbn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }
            try {
                if (data.Report_Items[i].YOP)
                    yop = data.Report_Items[i].YOP;
            } catch (e) {
                Logger.log("No YOP");
            }

            /** Reset values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month
                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date);

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Requests")
                        yearUniqueTitleRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values in Each Array */
            body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Total_Item_Requests",
                yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4],
                yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8], yearTotalItemRequest[9],
                yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Unique_Title_Requests",
                yearUniqueTitleRequest[0], yearUniqueTitleRequest[1], yearUniqueTitleRequest[2], yearUniqueTitleRequest[3], yearUniqueTitleRequest[4],
                yearUniqueTitleRequest[5], yearUniqueTitleRequest[6], yearUniqueTitleRequest[7], yearUniqueTitleRequest[8], yearUniqueTitleRequest[9],
                yearUniqueTitleRequest[10], yearUniqueTitleRequest[11]]);
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored*/
    getInfo(vendorName,year,"TR_B1",header,body,fileNumber,MAX);
}

/** Parse Tr_B2 Reports */
function parseTrb2(data,vendorName,period) {
    // MAX Number of Items
    const MAX=199000;

    // Variables to use per Item
    var title,publisher,publisherId,platform,doi,proprietaryId,isbn,issn,issnOnline,uri,sectionType,yop;
    var month, year;

    // Variables to Store data to Send
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);
    var body = [];

    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","ISBN","Print_ISSN","Online_ISSN",
        "URI","Section_Type","YOP","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,
        "Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run Each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", publisher = "", publisherId = "", platform = "", doi = "", proprietaryId = "", isbn = "", issn = "", issnOnline = "", uri = "", sectionType = "", yop = "";

            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }

            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "ISBN")
                        isbn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }
            try {
                if (data.Report_Items[i].YOP)
                    yop = data.Report_Items[i].YOP;
            } catch (e) {
                Logger.log("No YOP");
            }

            /** Reset values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) {
                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date);

                yearLimitExceed[month - 1] = data.Report_Items[i].Performance[v].Instance[0].Count;
            }
            /** Store Metric Values */
            body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Limit_Exceeded",
                yearLimitExceed[0], yearLimitExceed[1], yearLimitExceed[2], yearLimitExceed[3], yearLimitExceed[4], yearLimitExceed[5],
                yearLimitExceed[6], yearLimitExceed[7], yearLimitExceed[8], yearLimitExceed[9], yearLimitExceed[10], yearLimitExceed[11]]);
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored*/
    getInfo(vendorName,year,"TR_B2",header,body,fileNumber,MAX);
}

/** Parse Tr_B3 Reports */
function parseTrb3(data,vendorName,period) {
    // MAX Number of Items
    const MAX=33000;

    // Variables to use per Item
    var title,publisher,publisherId,platform,doi,proprietaryId,isbn,issn,issnOnline,uri,sectionType,yop;
    var month, year;

    // Variables to Store data to Send
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","ISBN","Print_ISSN","Online_ISSN",
        "URI","Section_Type","YOP","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,
        "Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run Each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", publisher = "", publisherId = "", platform = "", doi = "", proprietaryId = "", isbn = "", issn = "", issnOnline = "", uri = "", sectionType = "", yop = "";

            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "ISBN")
                        isbn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }
            try {
                if (data.Report_Items[i].YOP)
                    yop = data.Report_Items[i].YOP;
            } catch (e) {
                Logger.log("No YOP");
            }

            /** Reset to 0 values for each Item */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Investigations")
                        yearTotalItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Investigations")
                        yearUniqueItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Investigations")
                        yearUniqueTitleInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Requests")
                        yearUniqueTitleRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop,
                    "Total_Item_Requests", yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3],
                    yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8],
                    yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearTotalItemInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop,
                    "Total_Item_Investigations", yearTotalItemInvestigation[0], yearTotalItemInvestigation[1], yearTotalItemInvestigation[2],
                    yearTotalItemInvestigation[3], yearTotalItemInvestigation[4], yearTotalItemInvestigation[5], yearTotalItemInvestigation[6],
                    yearTotalItemInvestigation[7], yearTotalItemInvestigation[8], yearTotalItemInvestigation[9], yearTotalItemInvestigation[10],
                    yearTotalItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop,
                    "Unique_Item_Investigations", yearUniqueItemInvestigation[0], yearUniqueItemInvestigation[1], yearUniqueItemInvestigation[2],
                    yearUniqueItemInvestigation[3], yearUniqueItemInvestigation[4], yearUniqueItemInvestigation[5], yearUniqueItemInvestigation[6],
                    yearUniqueItemInvestigation[7], yearUniqueItemInvestigation[8], yearUniqueItemInvestigation[9], yearUniqueItemInvestigation[10],
                    yearUniqueItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueTitleInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop,
                    "Unique_Title_Investigations", yearUniqueTitleInvestigation[0], yearUniqueTitleInvestigation[1], yearUniqueTitleInvestigation[2],
                    yearUniqueTitleInvestigation[3], yearUniqueTitleInvestigation[4], yearUniqueTitleInvestigation[5], yearUniqueTitleInvestigation[6],
                    yearUniqueTitleInvestigation[7], yearUniqueTitleInvestigation[8], yearUniqueTitleInvestigation[9], yearUniqueTitleInvestigation[10],
                    yearUniqueTitleInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueTitleRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Unique_Title_Requests",
                    yearUniqueTitleRequest[0], yearUniqueTitleRequest[1], yearUniqueTitleRequest[2], yearUniqueTitleRequest[3], yearUniqueTitleRequest[4],
                    yearUniqueTitleRequest[5], yearUniqueTitleRequest[6], yearUniqueTitleRequest[7], yearUniqueTitleRequest[8], yearUniqueTitleRequest[9],
                    yearUniqueTitleRequest[10], yearUniqueTitleRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, isbn, issn, issnOnline, uri, sectionType, yop, "Unique_Item_Requests",
                    yearUniqueItemRequest[0], yearUniqueItemRequest[1], yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4],
                    yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7], yearUniqueItemRequest[8], yearUniqueItemRequest[9],
                    yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored*/
    getInfo(vendorName,year,"TR_B3",header,body,fileNumber,MAX);
}

/** Parse Tr_J1 Reports */
function parseTrj1(data,vendorName,period) {
    // MAX Number of Items
    const MAX=108000;

    // Variables to use per Item
    var title,publisher,publisherId,platform,doi,proprietaryId,issn,issnOnline,uri,sectionType;
    var month, year;

    // Variables to Store data to Send
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","Print_ISSN","Online_ISSN",
        "URI","Section_Type","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,
        "Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run Each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", publisher = "", publisherId = "", platform = "", doi = "", proprietaryId = "", issn = "", issnOnline = "", uri = "", sectionType = "";

            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }

            /** Reset values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, "Unique_Item_Requests",
                    yearUniqueItemRequest[0], yearUniqueItemRequest[1], yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4],
                    yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7], yearUniqueItemRequest[8], yearUniqueItemRequest[9],
                    yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            }
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, "Total_Item_Requests",
                    yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4],
                    yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8], yearTotalItemRequest[9],
                    yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"TR_J1",header,body,fileNumber,MAX);
}

/** Parse Tr_J2 Reports */
function parseTrj2(data,vendorName,period) {
    // MAX Number of Items
    const MAX=217000;

    // Variables to use per Item
    var title,publisher,publisherId,platform,doi,proprietaryId,issn,issnOnline,uri,sectionType;
    var month, year;

    // Variables to Store data to Send
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","Print_ISSN","Online_ISSN",
        "URI","Section_Type","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,
        "Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run Each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", publisher = "", publisherId = "", platform = "", doi = "", proprietaryId = "", issn = "", issnOnline = "", uri = "", sectionType = "";

            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }

            /** Reset values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                yearAccessDenied[month - 1] = data.Report_Items[i].Performance[v].Instance[0].Count;
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearAccessDenied)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, "Access_Denied",
                    yearAccessDenied[0], yearAccessDenied[1], yearAccessDenied[2], yearAccessDenied[3], yearAccessDenied[4],
                    yearAccessDenied[5], yearAccessDenied[6], yearAccessDenied[7], yearAccessDenied[8], yearAccessDenied[9],
                    yearAccessDenied[10], yearAccessDenied[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"TR_J2",header,body,fileNumber,MAX);
}

/** Parse Tr_J3 Reports */
function parseTrj3(data,vendorName,period) {
    // MAX Number of Items
    const MAX=54000;

    // Variables to use per Item
    var title,publisher,publisherId,platform,doi,proprietaryId,issn,issnOnline,uri,sectionType;
    var month, year;

    // Variables to Store data to Send
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","Print_ISSN","Online_ISSN",
        "URI","Section_Type","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,
        "Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run Each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", publisher = "", publisherId = "", platform = "", doi = "", proprietaryId = "", issn = "", issnOnline = "", uri = "", sectionType = "";

            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }

            /** Reset values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Investigations")
                        yearTotalItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Investigations")
                        yearUniqueItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, "Total_Item_Requests",
                    yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4],
                    yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8], yearTotalItemRequest[9],
                    yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, "Unique_Item_Investigations",
                    yearUniqueItemInvestigation[0], yearUniqueItemInvestigation[1], yearUniqueItemInvestigation[2], yearUniqueItemInvestigation[3],
                    yearUniqueItemInvestigation[4], yearUniqueItemInvestigation[5], yearUniqueItemInvestigation[6], yearUniqueItemInvestigation[7],
                    yearUniqueItemInvestigation[8], yearUniqueItemInvestigation[9], yearUniqueItemInvestigation[10], yearUniqueItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearTotalItemInvestigation)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, "Total_Item_Investigations",
                    yearTotalItemInvestigation[0], yearTotalItemInvestigation[1], yearTotalItemInvestigation[2], yearTotalItemInvestigation[3],
                    yearTotalItemInvestigation[4], yearTotalItemInvestigation[5], yearTotalItemInvestigation[6], yearTotalItemInvestigation[7],
                    yearTotalItemInvestigation[8], yearTotalItemInvestigation[9], yearTotalItemInvestigation[10], yearTotalItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, "Total_Item_Requests",
                    yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4],
                    yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8], yearTotalItemRequest[9],
                    yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"TR_J3",header,body,fileNumber,MAX);
}

/** Parse Tr_J4 Reports */
function parseTrj4(data,vendorName,period) {
    // MAX Number of Items
    const MAX=103000;

    // Variables to use per Item
    var title,publisher,publisherId,platform,doi,proprietaryId,issn,issnOnline,uri,sectionType,yop;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Title","Publisher","Publisher_ID","Platform","DOI","Proprietary_ID","Print_ISSN","Online_ISSN",
        "URI","Section_Type","YOP","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,
        "Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Item
            title = "", publisher = "", publisherId = "", platform = "", doi = "", proprietaryId = "", issn = "", issnOnline = "", uri = "", sectionType = "", yop = "";

            try {
                if (data.Report_Items[i].Title)
                    title = data.Report_Items[i].Title;
            } catch (e) {
                Logger.log("No Title");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Publisher_ID)
                    publisherId = data.Report_Items[i].Publisher_ID;
            } catch (e) {
                Logger.log("No Publisher_ID");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            /** Item_ID with different attributes and sizes */
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id].Type == "DOI")
                        doi = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id].Type == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Section_Type)
                    sectionType = data.Report_Items[i].Section_Type;
            } catch (e) {
                Logger.log("No Section_Type");
            }
            try {
                if (data.Report_Items[i].YOP)
                    yop = data.Report_Items[i].YOP;
            } catch (e) {
                Logger.log("No YOP");
            }

            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, yop, "Total_Item_Requests",
                    yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4],
                    yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8], yearTotalItemRequest[9],
                    yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([title, publisher, publisherId, platform, doi, proprietaryId, issn, issnOnline, uri, sectionType, yop, "Unique_Item_Requests",
                    yearUniqueItemRequest[0], yearUniqueItemRequest[1], yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4],
                    yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7], yearUniqueItemRequest[8], yearUniqueItemRequest[9],
                    yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"TR_J4",header,body,fileNumber,MAX);
}

/** Parse Master PR Reports */
function parsePr(data,vendorName,period) {
    // MAX Number of Items
    const MAX=44000;

    // Variables to use per Item
    var platform,dataType,accessMethod;
    var month, year;

    // Reset Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Platform","Data_Type","Access_Method","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,
        "Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Variables to use per Item
            platform = "", dataType = "", accessMethod = "";


            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                if (data.Report_Items[i].Data_Type)
                    dataType = data.Report_Items[i].Data_Type;
            } catch (e) {
                Logger.log("No Data_Type");
            }
            try {
                if (data.Report_Items[i].Access_Method)
                    accessMethod = data.Report_Items[i].Access_Method;
            } catch (e) {
                Logger.log("No Access_Method");
            }

            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Platform")
                        yearSearchesPlatform[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Investigations")
                        yearTotalItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Requests")
                        yearUniqueTitleRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            body.push([platform, dataType, accessMethod, "Searches_Platform", yearSearchesPlatform[0], yearSearchesPlatform[1],
                yearSearchesPlatform[2], yearSearchesPlatform[3], yearSearchesPlatform[4], yearSearchesPlatform[5], yearSearchesPlatform[6], yearSearchesPlatform[7]
                , yearSearchesPlatform[8], yearSearchesPlatform[9], yearSearchesPlatform[10], yearSearchesPlatform[11]]);
            body.push([platform, dataType, accessMethod, "Total_Item_Investigations", yearTotalItemInvestigation[0], yearTotalItemInvestigation[1],
                yearTotalItemInvestigation[2], yearTotalItemInvestigation[3], yearTotalItemInvestigation[4], yearTotalItemInvestigation[5], yearTotalItemInvestigation[6], yearTotalItemInvestigation[7]
                , yearTotalItemInvestigation[8], yearTotalItemInvestigation[9], yearTotalItemInvestigation[10], yearTotalItemInvestigation[11]]);
            body.push([platform, dataType, accessMethod, "Total_Item_Requests", yearTotalItemRequest[0], yearTotalItemRequest[1],
                yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7]
                , yearTotalItemRequest[8], yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            body.push([platform, dataType, accessMethod, "Unique_Item_Investigations", yearUniqueItemInvestigation[0], yearUniqueItemInvestigation[1],
                yearUniqueItemInvestigation[2], yearUniqueItemInvestigation[3], yearUniqueItemInvestigation[4], yearUniqueItemInvestigation[5], yearUniqueItemInvestigation[6], yearUniqueItemInvestigation[7]
                , yearUniqueItemInvestigation[8], yearUniqueItemInvestigation[9], yearUniqueItemInvestigation[10], yearUniqueItemInvestigation[11]]);
            body.push([platform, dataType, accessMethod, "Unique_Item_Requests", yearUniqueItemRequest[0], yearUniqueItemRequest[1],
                yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4], yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7]
                , yearUniqueItemRequest[8], yearUniqueItemRequest[9], yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            body.push([platform, dataType, accessMethod, "Unique_Title_Investigations", yearUniqueTitleInvestigation[0], yearUniqueTitleInvestigation[1],
                yearUniqueTitleInvestigation[2], yearUniqueTitleInvestigation[3], yearUniqueTitleInvestigation[4], yearUniqueTitleInvestigation[5], yearUniqueTitleInvestigation[6], yearUniqueTitleInvestigation[7]
                , yearUniqueTitleInvestigation[8], yearUniqueTitleInvestigation[9], yearUniqueTitleInvestigation[10], yearUniqueTitleInvestigation[11]]);
            body.push([platform, dataType, accessMethod, "Unique_Title_Requests", yearUniqueTitleRequest[0], yearUniqueTitleRequest[1],
                yearUniqueTitleRequest[2], yearUniqueTitleRequest[3], yearUniqueTitleRequest[4], yearUniqueTitleRequest[5], yearUniqueTitleRequest[6], yearUniqueTitleRequest[7]
                , yearUniqueTitleRequest[8], yearUniqueTitleRequest[9], yearUniqueTitleRequest[10], yearUniqueTitleRequest[11]]);
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"PR",header,body,fileNumber,MAX);
}

/** Parse PR_P1 Reports */
function parsePrp1(data,vendorName,period) {
    // MAX Number of Items
    const MAX=88000;

    // Variables to use per Report
    var platform,dataType,accessMethod;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Platform","Data_Type","Access_Method","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,
        "Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);


    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Report
            platform = "", dataType = "", accessMethod = "";

            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                if (data.Report_Items[i].Data_Type)
                    dataType = data.Report_Items[i].Data_Type;
            } catch (e) {
                Logger.log("No Data_Type");
            }
            try {
                if (data.Report_Items[i].Access_Method)
                    accessMethod = data.Report_Items[i].Access_Method;
            } catch (e) {
                Logger.log("No Access_Method");
            }

            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) {

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date);

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Platform")
                        yearSearchesPlatform[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Requests")
                        yearUniqueTitleRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearSearchesPlatform)) {
                body.push([platform, dataType, accessMethod, "Searches_Platform", yearSearchesPlatform[0], yearSearchesPlatform[1],
                    yearSearchesPlatform[2], yearSearchesPlatform[3], yearSearchesPlatform[4], yearSearchesPlatform[5], yearSearchesPlatform[6], yearSearchesPlatform[7]
                    , yearSearchesPlatform[8], yearSearchesPlatform[9], yearSearchesPlatform[10], yearSearchesPlatform[11]]);
            }
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([platform, dataType, accessMethod, "Total_Item_Requests", yearTotalItemRequest[0], yearTotalItemRequest[1],
                    yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7]
                    , yearTotalItemRequest[8], yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([platform, dataType, accessMethod, "Unique_Item_Requests", yearUniqueItemRequest[0], yearUniqueItemRequest[1],
                    yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4], yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7]
                    , yearUniqueItemRequest[8], yearUniqueItemRequest[9], yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueTitleRequest)) {
                body.push([platform, dataType, accessMethod, "Unique_Title_Requests", yearUniqueTitleRequest[0], yearUniqueTitleRequest[1],
                    yearUniqueTitleRequest[2], yearUniqueTitleRequest[3], yearUniqueTitleRequest[4], yearUniqueTitleRequest[5], yearUniqueTitleRequest[6], yearUniqueTitleRequest[7]
                    , yearUniqueTitleRequest[8], yearUniqueTitleRequest[9], yearUniqueTitleRequest[10], yearUniqueTitleRequest[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"PR_P1",header,body,fileNumber,MAX);
}

/** Parse Master DR Reports */
function parseDr(data,vendorName,period) {
    // MAX Number of Items
    const MAX=26000;

    // Variables to use per Report
    var database,publisher,platform,proprietaryId,dataType,accessMethod;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Database","Publisher","Platform","Proprietary_ID","Data_Type","Access_Method","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,
        "Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Report
            database = "", publisher = "", platform = "", proprietaryId = "", dataType = "", accessMethod = "";

            try {
                if (data.Report_Items[i].Database)
                    database = data.Report_Items[i].Database;
            } catch (e) {
                Logger.log("No Database");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id] == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Data_Type)
                    dataType = data.Report_Items[i].Data_Type;
            } catch (e) {
                Logger.log("No Data_Type");
            }
            try {
                if (data.Report_Items[i].Access_Method)
                    accessMethod = data.Report_Items[i].Access_Method;
            } catch (e) {
                Logger.log("No Access_Method");
            }

            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) {

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date);

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Federated")
                        yearSearchesFederated[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Automated")
                        yearSearchesAutomated[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Regular")
                        yearSearchesRegular[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Investigations")
                        yearTotalItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Investigations")
                        yearUniqueItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Investigations")
                        yearUniqueTitleInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Title_Requests")
                        yearUniqueTitleRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Limit_Exceeded")
                        yearLimitExceed[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearSearchesFederated)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Searches_Federated", yearSearchesFederated[0], yearSearchesFederated[1],
                    yearSearchesFederated[2], yearSearchesFederated[3], yearSearchesFederated[4], yearSearchesFederated[5], yearSearchesFederated[6], yearSearchesFederated[7]
                    , yearSearchesFederated[8], yearSearchesFederated[9], yearSearchesFederated[10], yearSearchesFederated[11]]);
            }
            if (!emptyCheckArray(yearSearchesRegular)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Searches_Regular", yearSearchesRegular[0], yearSearchesRegular[1],
                    yearSearchesRegular[2], yearSearchesRegular[3], yearSearchesRegular[4], yearSearchesRegular[5], yearSearchesRegular[6], yearSearchesRegular[7]
                    , yearSearchesRegular[8], yearSearchesRegular[9], yearSearchesRegular[10], yearSearchesRegular[11]]);
            }
            if (!emptyCheckArray(yearSearchesAutomated)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Searches_Automated", yearSearchesAutomated[0], yearSearchesAutomated[1],
                    yearSearchesAutomated[2], yearSearchesAutomated[3], yearSearchesAutomated[4], yearSearchesAutomated[5], yearSearchesAutomated[6], yearSearchesAutomated[7]
                    , yearSearchesAutomated[8], yearSearchesAutomated[9], yearSearchesAutomated[10], yearSearchesAutomated[11]]);
            }
            if (!emptyCheckArray(yearTotalItemInvestigation)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Total_Item_Investigation", yearTotalItemInvestigation[0], yearTotalItemInvestigation[1],
                    yearTotalItemInvestigation[2], yearTotalItemInvestigation[3], yearTotalItemInvestigation[4], yearTotalItemInvestigation[5], yearTotalItemInvestigation[6], yearTotalItemInvestigation[7]
                    , yearTotalItemInvestigation[8], yearTotalItemInvestigation[9], yearTotalItemInvestigation[10], yearTotalItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Total_Item_Requests", yearTotalItemRequest[0], yearTotalItemRequest[1],
                    yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7]
                    , yearTotalItemRequest[8], yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemInvestigation)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Unique_Item_Investigations", yearUniqueItemInvestigation[0], yearUniqueItemInvestigation[1],
                    yearUniqueItemInvestigation[2], yearUniqueItemInvestigation[3], yearUniqueItemInvestigation[4], yearUniqueItemInvestigation[5], yearUniqueItemInvestigation[6], yearUniqueItemInvestigation[7]
                    , yearUniqueItemInvestigation[8], yearUniqueItemInvestigation[9], yearUniqueItemInvestigation[10], yearUniqueItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueTitleInvestigation)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Unique_Title_Investigations", yearUniqueTitleInvestigation[0], yearUniqueTitleInvestigation[1],
                    yearUniqueTitleInvestigation[2], yearUniqueTitleInvestigation[3], yearUniqueTitleInvestigation[4], yearUniqueTitleInvestigation[5], yearUniqueTitleInvestigation[6], yearUniqueTitleInvestigation[7]
                    , yearUniqueTitleInvestigation[8], yearUniqueTitleInvestigation[9], yearUniqueTitleInvestigation[10], yearUniqueTitleInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Unique_Item_Requests", yearUniqueItemRequest[0], yearUniqueItemRequest[1],
                    yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4], yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7]
                    , yearUniqueItemRequest[8], yearUniqueItemRequest[9], yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueTitleRequest)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Unique_Title_Requests", yearUniqueTitleRequest[0], yearUniqueTitleRequest[1],
                    yearUniqueTitleRequest[2], yearUniqueTitleRequest[3], yearUniqueTitleRequest[4], yearUniqueTitleRequest[5], yearUniqueTitleRequest[6], yearUniqueTitleRequest[7]
                    , yearUniqueTitleRequest[8], yearUniqueTitleRequest[9], yearUniqueTitleRequest[10], yearUniqueTitleRequest[11]]);
            }
            if (!emptyCheckArray(yearLimitExceed)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Limit_Exceeded", yearLimitExceed[0], yearLimitExceed[1],
                    yearLimitExceed[2], yearLimitExceed[3], yearLimitExceed[4], yearLimitExceed[5], yearLimitExceed[6], yearLimitExceed[7]
                    , yearLimitExceed[8], yearLimitExceed[9], yearLimitExceed[10], yearLimitExceed[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"DR",header,body,fileNumber,MAX);
}

/** Parse DR_D1 Reports */
function parseDrd1(data,vendorName,period) {
    // MAX Number of Items
    const MAX=52000;

    // Variables to use per Report
    var database,publisher,platform,proprietaryId,dataType,accessMethod;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Database","Publisher","Platform","Proprietary_ID","Data_Type","Access_Method","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,
        "Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Report
            database = "", publisher = "", platform = "", proprietaryId = "", dataType = "", accessMethod = "";

            try {
                if (data.Report_Items[i].Database)
                    database = data.Report_Items[i].Database;
            } catch (e) {
                Logger.log("No Database");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id] == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Data_Type)
                    dataType = data.Report_Items[i].Data_Type;
            } catch (e) {
                Logger.log("No Data_Type");
            }
            try {
                if (data.Report_Items[i].Access_Method)
                    accessMethod = data.Report_Items[i].Access_Method;
            } catch (e) {
                Logger.log("No Access_Method");
            }

            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) {

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date);

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Federated")
                        yearSearchesFederated[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Automated")
                        yearSearchesAutomated[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Searches_Regular")
                        yearSearchesRegular[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Investigations")
                        yearTotalItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }
            /** Store Metric Values */
            if (!emptyCheckArray(yearSearchesFederated)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Searches_Federated", yearSearchesFederated[0], yearSearchesFederated[1],
                    yearSearchesFederated[2], yearSearchesFederated[3], yearSearchesFederated[4], yearSearchesFederated[5], yearSearchesFederated[6], yearSearchesFederated[7]
                    , yearSearchesFederated[8], yearSearchesFederated[9], yearSearchesFederated[10], yearSearchesFederated[11]]);
            }
            if (!emptyCheckArray(yearSearchesRegular)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Searches_Regular", yearSearchesRegular[0], yearSearchesRegular[1],
                    yearSearchesRegular[2], yearSearchesRegular[3], yearSearchesRegular[4], yearSearchesRegular[5], yearSearchesRegular[6], yearSearchesRegular[7]
                    , yearSearchesRegular[8], yearSearchesRegular[9], yearSearchesRegular[10], yearSearchesRegular[11]]);
            }
            if (!emptyCheckArray(yearSearchesAutomated)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Searches_Automated", yearSearchesAutomated[0], yearSearchesAutomated[1],
                    yearSearchesAutomated[2], yearSearchesAutomated[3], yearSearchesAutomated[4], yearSearchesAutomated[5], yearSearchesAutomated[6], yearSearchesAutomated[7]
                    , yearSearchesAutomated[8], yearSearchesAutomated[9], yearSearchesAutomated[10], yearSearchesAutomated[11]]);
            }
            if (!emptyCheckArray(yearTotalItemInvestigation)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Total_Item_Investigation", yearTotalItemInvestigation[0], yearTotalItemInvestigation[1],
                    yearTotalItemInvestigation[2], yearTotalItemInvestigation[3], yearTotalItemInvestigation[4], yearTotalItemInvestigation[5], yearTotalItemInvestigation[6], yearTotalItemInvestigation[7]
                    , yearTotalItemInvestigation[8], yearTotalItemInvestigation[9], yearTotalItemInvestigation[10], yearTotalItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "Total_Item_Requests", yearTotalItemRequest[0], yearTotalItemRequest[1],
                    yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7]
                    , yearTotalItemRequest[8], yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"DR_D1",header,body,fileNumber,MAX);
}

/** Parse DR_D2 Reports */
function parseDrd2(data,vendorName,period) {
    // MAX Number of Items
    const MAX=310000;

    // Variables to use per Report
    var database,publisher,platform,proprietaryId,dataType,accessMethod;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Database","Publisher","Platform","Proprietary_ID","Data_Type","Access_Method","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,
        "Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Report
            database = "", publisher = "", platform = "", proprietaryId = "", dataType = "", accessMethod = "";

            try {
                if (data.Report_Items[i].Database)
                    database = data.Report_Items[i].Database;
            } catch (e) {
                Logger.log("No Database");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id] == "Proprietary_ID")
                        proprietaryId = data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                if (data.Report_Items[i].Data_Type)
                    dataType = data.Report_Items[i].Data_Type;
            } catch (e) {
                Logger.log("No Data_Type");
            }
            try {
                if (data.Report_Items[i].Access_Method)
                    accessMethod = data.Report_Items[i].Access_Method;
            } catch (e) {
                Logger.log("No Access_Method");
            }

            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                yearAccessDenied[month - 1] = data.Report_Items[i].Performance[v].Instance[0].Count;
            }
            /** Store Metric Values */
            body.push([database, publisher, platform, proprietaryId, dataType, accessMethod, "No_License", yearAccessDenied[0], yearAccessDenied[1],
                yearAccessDenied[2], yearAccessDenied[3], yearAccessDenied[4], yearAccessDenied[5], yearAccessDenied[6], yearAccessDenied[7]
                , yearAccessDenied[8], yearAccessDenied[9], yearAccessDenied[10], yearAccessDenied[11]]);
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"DR_D2",header,body,fileNumber,MAX);
}

/** Parse Master IR Reports */
function parseIr(data,vendorName,period) {
    // MAX Number of Items
    const MAX=17000;

    // Variables to use per Report
    var item,publisher,platform,author,publicationDate,articleVersion,doi,proprietaryId,isbn,
        issn,issnOnline,uri,yop, parentTitle, parentAuthors, parentPublicationDate, parentArticleVersion, parentDataType,
        parentDOI, parentProprietaryID, parentISBN, parentISSN, parentISSNonline, parentURI, componentTitle, componentAuthors,
        componentPublicationDate, componentDataType, componentDOI, componentProprietaryID, componentISBN, componentISSN,
        componentISSNonline, componentURI;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Item","Publisher","Platform","Author","Publication_Date","Article_Version","DOI","Proprietary_ID","ISBN",
        "Print_ISSN","Online_ISSN","URI","YOP","Parent_Title","Parent_Authors","Parent_Publication_Date","Parent_ArticleVersion","Parent_Data_Type",
        "Parent_DOI","Parent_Proprietary_ID","Parent_ISBN","Parent_Print_ISSN","Parent_Online_ISSN","Parent_URI","Component_Title","Component_Authors",
        "Component_Publication_Date","Component_Data_Type","Component_DOI","Component_Proprietary_ID","Component_ISBN","Component_Print_ISSN","Component_Online_ISSN",
        "Component_URI","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,"Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,
        "Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Report
            item = "", publisher = "", platform = "", author = "", publicationDate = "", articleVersion = "", doi = "", proprietaryId = "", isbn = "",
                issn = "", issnOnline = "", uri = "", yop = "", parentTitle = "", parentAuthors = "", parentPublicationDate = "", parentArticleVersion = "", parentDataType = "",
                parentDOI = "", parentProprietaryID = "", parentISBN = "", parentISSN = "", parentISSNonline = "", parentURI = "", componentTitle = "", componentAuthors = "",
                componentPublicationDate = "", componentDataType = "", componentDOI = "", componentProprietaryID = "", componentISBN = "", componentISSN = "",
                componentISSNonline = "", componentURI = "";

            try {
                if (data.Report_Items[i].Item)
                    item = data.Report_Items[i].Item;
            } catch (e) {
                Logger.log("No Item");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                if (data.Report_Items[i].YOP)
                    yop = data.Report_Items[i].YOP;
            } catch (e) {
                Logger.log("No YOP");
            }

            try {
                for (var id = 0; id < data.Report_Items[i].Item_Contributors.length; id++) {
                    if (data.Report_Items[i].Item_Contributors[id] == "Authors")
                        author += data.Report_Items[i].Item_Contributors[id].Name + "; ";
                }
            } catch (e) {
                Logger.log("No Item_Contributors");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_Dates.length; id++) {
                    publicationDate = data.Report_Items[i].Item_Dates[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_Dates");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_Attributes.length; id++) {
                    articleVersion = data.Report_Items[i].Item_Attributes[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_Attributes");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id] == "Proprietary_ID")
                        proprietaryId = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "DOI")
                        doi = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "ISBN")
                        isbn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Include_Parent_Details.length; id++) {
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Title")
                        parentTitle = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Authors")
                        parentAuthors = data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Publication_Date")
                        parentPublicationDate = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Article_Version")
                        parentArticleVersion = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Data_Type")
                        parentDataType = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_DOI")
                        parentDOI = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Proprietary_ID")
                        parentProprietaryID = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_ISBN")
                        parentISBN = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Print_ISSN")
                        parentISSN = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Online_ISSN")
                        parentISSNonline = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_URI")
                        parentURI = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                }
            } catch (e) {
                Logger.log("No Include_Parent_Details");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Include_Component_Details.length; id++) {
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_Title")
                        componentTitle = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_Authors")
                        componentAuthors = data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_Publication_Date")
                        componentPublicationDate = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_Data_Type")
                        componentDataType = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_DOI")
                        componentDOI = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_Proprietary_ID")
                        componentProprietaryID = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_ISBN")
                        componentISBN = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_Print_ISSN")
                        componentISSN = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_Online_ISSN")
                        componentISSNonline = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                    if (data.Report_Items[i].Include_Component_Details[id] == "Component_URI")
                        componentURI = "'" + data.Report_Items[i].Include_Component_Details[id].Value;
                }
            } catch (e) {
                Logger.log("No Include_Component_Details");
            }
            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) {

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date);

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Investigations")
                        yearTotalItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Investigations")
                        yearUniqueItemInvestigation[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Limit_Exceeded")
                        yearLimitExceed[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "No_License")
                        yearNoLicense[month - 1] = data.Report_Items[i].Performance[v].Instance[n].Count;
                }
            }

            /** Store Metric Values */
            if (!emptyCheckArray(yearTotalItemInvestigation)) {
                body.push([item, publisher, platform, author, publicationDate, articleVersion, doi, proprietaryId, isbn, issn, issnOnline, uri,
                    yop, parentTitle, parentAuthors, parentPublicationDate, parentArticleVersion, parentDataType, parentDOI, parentProprietaryID,
                    parentISBN, parentISSN, parentISSNonline, parentURI, componentAuthors, componentPublicationDate, componentDataType, componentDOI, componentProprietaryID,
                    componentISBN, componentISSN, componentISSNonline, componentURI, "Total_Item_Investigations", yearTotalItemInvestigation[0], yearTotalItemInvestigation[1],
                    yearTotalItemInvestigation[2], yearTotalItemInvestigation[3], yearTotalItemInvestigation[4], yearTotalItemInvestigation[5],
                    yearSearchesFederated[6], yearSearchesFederated[7], yearSearchesFederated[8], yearSearchesFederated[9], yearSearchesFederated[10],
                    yearSearchesFederated[11]]);
            }
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([item, publisher, platform, author, publicationDate, articleVersion, doi, proprietaryId, isbn, issn, issnOnline, uri,
                    yop, parentTitle, parentAuthors, parentPublicationDate, parentArticleVersion, parentDataType, parentDOI, parentProprietaryID,
                    parentISBN, parentISSN, parentISSNonline, parentURI, componentAuthors, componentPublicationDate, componentDataType, componentDOI, componentProprietaryID,
                    componentISBN, componentISSN, componentISSNonline, componentURI, "Total_Item_Investigations", yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2],
                    yearTotalItemRequest[3], yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7],
                    yearTotalItemRequest[8], yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemInvestigation)) {
                body.push([item, publisher, platform, author, publicationDate, articleVersion, doi, proprietaryId, isbn, issn, issnOnline, uri,
                    yop, parentTitle, parentAuthors, parentPublicationDate, parentArticleVersion, parentDataType, parentDOI, parentProprietaryID,
                    parentISBN, parentISSN, parentISSNonline, parentURI, componentAuthors, componentPublicationDate, componentDataType, componentDOI, componentProprietaryID,
                    componentISBN, componentISSN, componentISSNonline, componentURI, "Total_Item_Investigations", yearUniqueItemInvestigation[0], yearUniqueItemInvestigation[1],
                    yearUniqueItemInvestigation[2], yearUniqueItemInvestigation[3], yearUniqueItemInvestigation[4], yearUniqueItemInvestigation[5],
                    yearUniqueItemInvestigation[6], yearUniqueItemInvestigation[7], yearUniqueItemInvestigation[8], yearUniqueItemInvestigation[9],
                    yearUniqueItemInvestigation[10], yearUniqueItemInvestigation[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([item, publisher, platform, author, publicationDate, articleVersion, doi, proprietaryId, isbn, issn, issnOnline, uri,
                    yop, parentTitle, parentAuthors, parentPublicationDate, parentArticleVersion, parentDataType, parentDOI, parentProprietaryID,
                    parentISBN, parentISSN, parentISSNonline, parentURI, componentAuthors, componentPublicationDate, componentDataType, componentDOI, componentProprietaryID,
                    componentISBN, componentISSN, componentISSNonline, componentURI, "Total_Item_Investigations", yearUniqueItemRequest[0], yearUniqueItemRequest[1], yearUniqueItemRequest[2],
                    yearUniqueItemRequest[3], yearUniqueItemRequest[4], yearUniqueItemRequest[5], yearUniqueItemRequest[6], yearUniqueItemRequest[7],
                    yearUniqueItemRequest[8], yearUniqueItemRequest[9], yearUniqueItemRequest[10], yearUniqueItemRequest[11]]);
            }
            if (!emptyCheckArray(yearLimitExceed)) {
                body.push([item, publisher, platform, author, publicationDate, articleVersion, doi, proprietaryId, isbn, issn, issnOnline, uri,
                    yop, parentTitle, parentAuthors, parentPublicationDate, parentArticleVersion, parentDataType, parentDOI, parentProprietaryID,
                    parentISBN, parentISSN, parentISSNonline, parentURI, componentAuthors, componentPublicationDate, componentDataType, componentDOI, componentProprietaryID,
                    componentISBN, componentISSN, componentISSNonline, componentURI, "Total_Item_Investigations", yearLimitExceed[0], yearLimitExceed[1], yearLimitExceed[2],
                    yearLimitExceed[3], yearLimitExceed[4], yearLimitExceed[5], yearLimitExceed[6], yearLimitExceed[7], yearLimitExceed[8],
                    yearLimitExceed[9], yearLimitExceed[10], yearLimitExceed[11]]);
            }
            if (!emptyCheckArray(yearNoLicense)) {
                body.push([item, publisher, platform, author, publicationDate, articleVersion, doi, proprietaryId, isbn, issn, issnOnline, uri,
                    yop, parentTitle, parentAuthors, parentPublicationDate, parentArticleVersion, parentDataType, parentDOI, parentProprietaryID,
                    parentISBN, parentISSN, parentISSNonline, parentURI, componentAuthors, componentPublicationDate, componentDataType, componentDOI, componentProprietaryID,
                    componentISBN, componentISSN, componentISSNonline, componentURI, "Total_Item_Investigations", yearNoLicense[0], yearNoLicense[1], yearNoLicense[2], yearNoLicense[3],
                    yearNoLicense[4], yearNoLicense[5], yearNoLicense[6], yearNoLicense[7], yearNoLicense[8], yearNoLicense[9], yearNoLicense[10], yearNoLicense[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"IR",header,body,fileNumber,MAX);
}

/** Parse IR_A1 Reports */
function parseIra1(data,vendorName,period) {
    // MAX Number of Items
    const MAX=75000;

    // Variables to use per Report
    var item,publisher,platform,author,publicationDate,articleVersion,doi,proprietaryId,
        issn,issnOnline,uri,yop, parentTitle, parentAuthors, parentArticleVersion, parentDOI, parentProprietaryID,
        parentISSN, parentISSNonline, parentURI;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Item","Publisher","Platform","Author","Publication_Date","Article_Version","DOI","Proprietary_ID",
        "Print_ISSN","Online_ISSN","URI","YOP","Parent_Title","Parent_Authors","Parent_Article_Version","Parent_DOI",
        "Parent_Proprietary_ID","Parent_Print_ISSN","Parent_Online_ISSN","Parent_URI","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,
        "Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Report
            item = "", publisher = "", platform = "", author = "", publicationDate = "", articleVersion = "", doi = "", proprietaryId = "",
                issn = "", issnOnline = "", uri = "", yop = "", parentTitle = "", parentAuthors = "", parentArticleVersion = "", parentDOI = "",
                parentProprietaryID = "", parentISSN = "", parentISSNonline = "", parentURI = "";

            try {
                if (data.Report_Items[i].Item)
                    item = data.Report_Items[i].Item;
            } catch (e) {
                Logger.log("No Item");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                if (data.Report_Items[i].YOP)
                    yop = data.Report_Items[i].YOP;
            } catch (e) {
                Logger.log("No YOP");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_Contributors.length; id++) {
                    author += data.Report_Items[i].Item_Contributors[id].Name + "; ";
                }
            } catch (e) {
                Logger.log("No Item_Contributors");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_Dates.length; id++) {
                    publicationDate = data.Report_Items[i].Item_Dates[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_Dates");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_Attributes.length; id++) {
                    articleVersion = data.Report_Items[i].Item_Attributes[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_Attributes");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id] == "Proprietary_ID")
                        proprietaryId = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "DOI")
                        doi = data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "Print_ISSN")
                        issn = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "Online_ISSN")
                        issnOnline = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "URI")
                        uri = "'" + data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Include_Parent_Details.length; id++) {
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Title")
                        parentTitle = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Authors")
                        parentAuthors = data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Article_Version")
                        parentArticleVersion = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_DOI")
                        parentDOI = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Proprietary_ID")
                        parentProprietaryID = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Print_ISSN")
                        parentISSN = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_Online_ISSN")
                        parentISSNonline = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                    if (data.Report_Items[i].Include_Parent_Details[id] == "Parent_URI")
                        parentURI = "'" + data.Report_Items[i].Include_Parent_Details[id].Value;
                }
            } catch (e) {
                Logger.log("No Include_Parent_Details");
            }
            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                /** Traverse Each Metric in One Month */
                for (var n = 0; n < data.Report_Items[i].Performance[v].Instance.length; n++) {
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Total_Item_Requests")
                        yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[0].Count;
                    if (data.Report_Items[i].Performance[v].Instance[n].Metric_Type == "Unique_Item_Requests")
                        yearUniqueItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[0].Count;
                }
            }

            /** Store Metric Values */
            if (!emptyCheckArray(yearTotalItemRequest)) {
                body.push([item, publisher, platform, author, publicationDate, articleVersion, doi, proprietaryId, issn, issnOnline, uri, yop,
                    parentTitle, parentAuthors, parentArticleVersion, parentDOI, parentProprietaryID, parentISSN, parentISSNonline, parentURI,
                    "Total_Item_Requests", yearTotalItemRequest[0], yearTotalItemRequest[1], yearTotalItemRequest[2], yearTotalItemRequest[3],
                    yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7], yearTotalItemRequest[8],
                    yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
            }
            if (!emptyCheckArray(yearUniqueItemRequest)) {
                body.push([item, publisher, platform, author, doi, proprietaryId, issn, issnOnline, uri, parentTitle, parentAuthors, parentArticleVersion,
                    parentDOI, parentProprietaryID, parentISSN, parentISSNonline, parentURI, "Unique_Item_Requests", yearUniqueItemRequest[0],
                    yearUniqueItemRequest[1], yearUniqueItemRequest[2], yearUniqueItemRequest[3], yearUniqueItemRequest[4], yearUniqueItemRequest[5],
                    yearUniqueItemRequest[6], yearUniqueItemRequest[7], yearUniqueItemRequest[8], yearUniqueItemRequest[9], yearUniqueItemRequest[10],
                    yearUniqueItemRequest[11]]);
            }
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"IR_A1",header,body,fileNumber,MAX);
}

/** Parse IR_M1 Reports */
function parseIrm1(data,vendorName,period) {
    // MAX Number of Items
    const MAX=275000;

    // Variables to use per Report
    var item,publisher,platform,doi,proprietaryId;
    var month, year;

    // Variables to use per Report
    var header = createHeader(data,period);
    if (header == null)
        return;
    var fileNumber = calcReportFiles(data.Report_Items.length,MAX);
    if (fileNumber == 0)
        fileNumber = 1;

    year=yearOfReport(period);

    var body = [];
    body.push(["Item","Publisher","Platform","DOI","Proprietary_ID","Metric_Type","Jan"+year,"Feb"+year,"Mar"+year,
        "Apr"+year,"May"+year,"Jun"+year,"Jul"+year,"Aug"+year,"Sep"+year,"Oct"+year,"Nov"+year,"Dec"+year]);

    /** Run each Item */
    try {
        for (var i = 0; i < data.Report_Items.length; i++) {

            // Reset Variables to use per Report
            item = "", publisher = "", platform = "", doi = "", proprietaryId = "";

            try {
                if (data.Report_Items[i].Item)
                    item = data.Report_Items[i].Item;
            } catch (e) {
                Logger.log("No Item");
            }
            try {
                if (data.Report_Items[i].Publisher)
                    publisher = data.Report_Items[i].Publisher;
            } catch (e) {
                Logger.log("No Publisher");
            }
            try {
                if (data.Report_Items[i].Platform)
                    platform = data.Report_Items[i].Platform;
            } catch (e) {
                Logger.log("No Platform");
            }
            try {
                for (var id = 0; id < data.Report_Items[i].Item_ID.length; id++) {
                    if (data.Report_Items[i].Item_ID[id] == "Proprietary_ID")
                        proprietaryId = "'" + data.Report_Items[i].Item_ID[id].Value;
                    if (data.Report_Items[i].Item_ID[id] == "DOI")
                        doi = data.Report_Items[i].Item_ID[id].Value;
                }
            } catch (e) {
                Logger.log("No Item_ID");
            }

            /** Reset Values to 0 */
            resetToZero();

            /** Set Values For Each Month in One Item */
            for (var v = 0; v < data.Report_Items[i].Performance.length; v++) { // Run each month

                month = getMonth(data.Report_Items[i].Performance[v].Period.Begin_Date); // call function getMonth

                yearTotalItemRequest[month - 1] = data.Report_Items[i].Performance[v].Instance[0].Count;
            }
            /** Store Metric Values */
            body.push([item, publisher, platform, doi, proprietaryId, "Total_Item_Requests", yearTotalItemRequest[0], yearTotalItemRequest[1],
                yearTotalItemRequest[2], yearTotalItemRequest[3], yearTotalItemRequest[4], yearTotalItemRequest[5], yearTotalItemRequest[6], yearTotalItemRequest[7]
                , yearTotalItemRequest[8], yearTotalItemRequest[9], yearTotalItemRequest[10], yearTotalItemRequest[11]]);
        } // End of 1st Loop
    } catch(e) {
        Logger.log("No Items");
    }
    /** Send of Values Stored */
    getInfo(vendorName,year,"IR_M1",header,body,fileNumber,MAX);
}
