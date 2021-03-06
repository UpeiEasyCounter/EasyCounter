# Installation 
## Requirements: 
* A google account 
* Access to internet connection 
## Installation steps 
* Navigate to Google Drive 
* Create folders DH Place, Upload-Counter4-Reports, Upload-Counter5-Reports
* Install dependencies 
  *  Create Google sheets named “C5Status”,“C5URLs”,”Credentials Information”, refer to **Table Format** for header format 
  * Note: To add the URL  “C5URLs” and “C5Status” , navigate to “counter5-harvesting/update-harvesting-spreadsheet.gs” and assign “vendorListUrl” and “reportStatusUrl” respectively to their URL’s
  * To add the URL of “Credentials Information” to the code, navigate to “utility/dashboard-vendor-utility.gs”, and assign “credentialsURL” to the new URL
## Deploying application 
* Launch the application from Google Drive 
* Navigate to counter5-harvesting/harvest-counter.gs 
* Copy objApp key and select Resources → Libraries → Add a library
* Paste the key in the field and select Add
* Select version 5 and click Save
* Select Publish → Deploy as Web App 
  * Note: Make sure Execute the app as: Me and access to the application is “Only myself”
* Click update → latest code
* Save the URL as this will used to launch the application

## Table Format
C5Status and C5URLs spreadsheets in Easy COUNTER should be initialized with the header below</br>
![](tableformat.png)
Column A is used to store the Vendor names</br>
Columns B to Q are used to store Report types (pr, pr_p1…)
</br></br></br></br>
#### Project Perform by: Aleix Molla, David A. Adams, Joshua Daniels, Ye Yuan and Yong Yu. 
