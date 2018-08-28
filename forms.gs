var SPREADSHEET_ID = '1I4q3mj-gBGQu1NWq1vr4abPPEh76rjmij1q6DrlR0iA'; // NEED TO FILL IN TO MAKE THIS WORK FOR YOU
var spreadsheet_cat;
var spreadsheet_cab;
/**
 * Get search.html, or a requested page.
 * Expects a 'page' parameter in e.
 *
 * @param {event} e Event passed to doGet, with querystring
 * @returns {String/html} Html to be served
 */

function doGet(e) {
  Logger.log( Utilities.jsonStringify(e) );
  
  if (!e.parameter.page || e.parameter.page == 'search') {
    return HtmlService.createTemplateFromFile('search').evaluate().setTitle('Search Catalogue');
  }
  if(e.parameter.page == 'addfile')
    return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate().setTitle('Add File');
  if(e.parameter.page == 'cabinets')
    return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate().setTitle('Manage Cabinets');
}

/**
 * Get the URL for the Google Apps Script running as a WebApp.
 */
function getScriptUrl() {
 var url = ScriptApp.getService().getUrl();
 return url;
}

function include(file) {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}

/**
  * Find a list of files that match search criteria and return
  * information about them.
  * @param data - data from the input form
  *
  * @return array of data that stores for matching search criteria
 **/
function searchInput(data) {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('catalogue');
  var cdata = sheet.getDataRange().getValues();
  var input_array = (data.searchQuerey).split(" ");
  var isAll = (data.cabinetNumber == 'all');
  
  var retArr = [];
  
  for(var i = 0; i < cdata.length ; i++) {
    if(searchAFile(cdata[i], input_array, data.cabinetNumber, data.AND, isAll))
      retArr.push([i, sheet.getRange(i+1,1).getValue(), sheet.getRange(i+1, 2).getValue(), sheet.getRange(i+1, 5).getValue()]);
  }
  return retArr;
}


/** function to do the searching on an individual row in searchInput **/
function searchAFile(fileData, input_array, cabinet_num, isAND, isAll)
{
  var good = false;
    
    for(var j = 0; j < input_array.length ; j++) {
      
      if(isAll || fileData[1] == cabinet_num) {
        var str = (fileData[4]+'').toLowerCase();
        if(str.indexOf(input_array[j].toLowerCase()) !== -1) {
          good = true;
        }
        else if(!isNaN(input_array[j]) && fileData[0] == parseInt(input_array[j], 10)) {
          good = true;
        }
      }
      
      if(isAND) {
        if(good == true) {
          if(j+1 == input_array.length) return true;
          good = false;
        }
        else return false;
      }
      else if(good == true) {
          return true;
      }
  }
  return false;
}


/** getTimeString - gets the time string */
function getTimeString()
{
  var d = new Date();
  var dstring = (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear() +" "+ d.toLocaleTimeString('it-IT');
  return dstring;
}

/** getUserName - gets the name of user who changed */
function getUserName()
{
  return Session.getActiveUser().getEmail();
}

function getEmptyFiles(cabinet)
{
  var chartData = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('catalogue').getDataRange().getValues();
  var retArray = [];
  
  for(var i = 0; i < chartData.length ; i++)
  {
    if(cabinet == chartData[i][1]) {
      if(chartData[i][4] == 'EMPTY FILE')
        retArray.push([i, chartData[i][0]]);
    }
  }
  return retArray;
}


/**
  * Adds new file to system.(not replacing old file)
  *
  * @param filenumber - number on new file added
  * @param cabinet - cabinet number
  * @param description - description of whats being put into file
 **/
function addNewFile(filenumber, cabinet, description)
{  
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('catalogue');
  sheet.appendRow([filenumber, cabinet, getTimeString(), getUserName(), description]);
}

/**
  * Replaces an empty file/already filled file with information.
  * @param index
  * @param cabinet
  * @param description
  */
function editFile(index, cabinetTextNumber, description)
{
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('catalogue');
  sheet.getRange(index+1, 2, 1, 4).setValues([[cabinetTextNumber, getTimeString(), getUserName(), description]]);
         
}

/** Function to access entire sheet of cabinets **/
function getCabinets()
{
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('catalogue_cabinets');
  var chart = sheet.getDataRange().getValues();
  return chart;
}

function addNewCabinet(sheet, name, description)
{
  var length = sheet.getDataRange().getHeight();
  sheet.appendRow([length, name, description]);
  return length;
}

function editCabinet(csheet, cabinetID, name, description)
{
  csheet.getRange(cabinetID, 2, 1, 2).setValues([[name, description]]);
}


function deleteAllXFiles(sheet, cabinetID)
{
  var data = sheet.getRange(1, 2, sheet.getDataRange().getHeight(), 1).getValues();
  for(var i = 0; i < data.length ; i++)
  {
    if(data[i][0] == cabinetID) {
      deleteFile(sheet, i);
    }
  }
}

function moveAllXFilesIntoY(sheet, cabinetX, cabinetY)
{
  var data = sheet.getRange(1, 2, sheet.getDataRange().getHeight(), 1).getValues();
  for(var i = 0; i < data.length ; i++)
  {
    if(data[i][0] == cabinetX)
    {
      sheet.getRange(i+1,2).setValue(cabinetY);
    }
  }
}
