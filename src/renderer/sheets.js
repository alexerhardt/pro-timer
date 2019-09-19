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
    projectName: document.querySelector('.project-input__project').value,
    taskName: document.querySelector('.project-input__task').value,
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
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [
        [params.timestamp, params.projectName, params.taskName, duration],
      ],
    },
  };

  return wrapInPromise(sheetService.spreadsheets.values.update, req);
}

function secondsToDuration(seconds) {
  const h = Math.trunc(seconds / 3600);
  const m = Math.trunc((seconds - 3600 * h) / 60);
  const s = seconds - 3600 * h - 60 * m;
  return `${h}:${m}:${s}`;
}

/**
 * Appends an entry to the last line of the sheet
 * @param sheetService
 * @returns {Promise}
 */
function appendToSheet(sheetService, params) {
  console.log('seconds: ', params.seconds);
  const duration = secondsToDuration(params.seconds);
  console.log('duration: ', duration);
  const req = {
    spreadsheetId: params.spreadsheetId,
    range: 'Sheet1',
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [
        [params.timestamp, params.projectName, params.taskName, duration],
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
