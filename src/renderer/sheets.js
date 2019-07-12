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
 *
 * @returns {Promise}
 */
module.exports.saveDataToSheets = async function() {
  const sheetService = getGoogleSheetsService();

  getAllTimeStamps(sheetService)
    .then(res => {
      const index = res.values[0].findIndex(elt => elt === 123456);
      if (index === -1) {
        return appendToSheet(sheetService);
      } else {
        return writeToSheet(sheetService, index);
      }
    })
    .then(res => console.log('update op a-ok, res: ', res))
    .catch(e => handleSheetsError(e));
};

/**
 * Reads the first column of the sheet, returning all entry ids
 * @param sheetService
 * @returns {Promise}
 */
function getAllTimeStamps(sheetService) {
  const req = {
    spreadsheetId: '1ZnGyOa2TPbWvcpmdSjqF6lOJFE4QONkJhXJdNQdYrJI',
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
function writeToSheet(sheetService, index) {
  const req = {
    spreadsheetId: '1ZnGyOa2TPbWvcpmdSjqF6lOJFE4QONkJhXJdNQdYrJI',
    range: 'Sheet1!A' + (index + 1),
    valueInputOption: 'RAW',
    resource: {
      values: [[1234, 'Yallo', 'Yalloooo!']],
    },
  };

  return wrapInPromise(sheetService.spreadsheets.values.update, req);
}

/**
 * Appends an entry to the last line of the sheet
 * @param sheetService
 * @returns {Promise}
 */
function appendToSheet(sheetService) {
  const req = {
    spreadsheetId: '1ZnGyOa2TPbWvcpmdSjqF6lOJFE4QONkJhXJdNQdYrJI',
    range: 'Sheet1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [[12345, 'AppendTest', 'AppendTest']],
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
