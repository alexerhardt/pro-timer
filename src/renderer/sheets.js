const util = require('util');

const { getGoogleSheetsService } = require('../services/google-auth');
const { wrapInPromise } = require('../services/utils');
const ui = require('./ui');
const messages = require('./messages');

/**
 * Saves the given timer data to Google Sheets
 * First reads the given sheet's data; if an entry with that timestamp /
 * project name / task combination already exists, then it updates that;
 * else, it appends the entry at the end of the sheet.
 */
module.exports.saveDataToSheets = function(timestamp, seconds) {
  if (!seconds) {
    ui.showPopup(messages.timerNotSet);
    return;
  }

  const spreadsheetId = document.querySelector('.sheet-id-input').value;
  const sheetName = document.querySelector('.sheet-name-input').value;
  if (!spreadsheetId || !sheetName) {
    ui.showPopup(messages.missingSpreadsheetDetails);
    return;
  }

  // TODO: Move out all these UI elements out; add as parameters to function
  ui.disableSyncButton();

  const params = {
    timestamp,
    seconds,
    spreadsheetId,
    sheetName,
    projectName: document.querySelector('.project-name-input').value,
    taskName: document.querySelector('.task-name-input').value,
  };
  console.log('saveData params: ' + util.inspect(params));

  const sheetService = getGoogleSheetsService();

  getAllTimeStamps(sheetService, params)
    .then(res => {
      params.rowToEdit = res.values[0].findIndex(elt => elt === timestamp);
      if (params.rowToEdit === -1) {
        return appendToSheet(sheetService, params);
      } else {
        return writeToSheet(sheetService, params);
      }
    })
    .then(res => {
      console.log('update op a-ok, res: ', res);
      ui.enableSyncButton();
    })
    .catch(e => {
      handleSheetsError(e);
      ui.enableSyncButton();
    });
};

/**
 * Reads the first column of the sheet, returning all entry ids
 * @param sheetService
 * @returns {Promise}
 */
function getAllTimeStamps(sheetService, params) {
  const req = {
    spreadsheetId: params.spreadsheetId,
    range: 'Sheet1!A:A',
    majorDimension: 'COLUMNS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  };

  return wrapInPromise(sheetService.spreadsheets.values.get, req);
}

/**
 * Updates the sheet service at the specified row index
 * @param sheetService
 * @param index
 * @returns {Promise}
 */
function writeToSheet(sheetService, params) {
  const req = {
    spreadsheetId: params.spreadsheetId,
    range: 'Sheet1!A' + (params.rowToEdit + 1),
    valueInputOption: 'RAW',
    resource: {
      values: [
        [params.timestamp, params.projectName, params.taskName, params.seconds],
      ],
    },
  };

  return wrapInPromise(sheetService.spreadsheets.values.update, req);
}

/**
 * Appends an entry to the last line of the sheet
 * @param sheetService
 * @returns {Promise}
 */
function appendToSheet(sheetService, params) {
  const req = {
    spreadsheetId: params.spreadsheetId,
    range: 'Sheet1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [
        [params.timestamp, params.projectName, params.taskName, params.seconds],
      ],
    },
  };

  return wrapInPromise(sheetService.spreadsheets.values.append, req);
}

function handleSheetsError(err) {
  console.log('sheets call err' + util.inspect(err));
  if (err.code === 401) {
    ui.showPopup(messages.authError);
  } else if (err.code === 404) {
    ui.showPopup(messages.notFound);
  } else {
    ui.showPopup(messages.unknownAPIError);
  }
}
