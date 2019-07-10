const util = require('util');

const { getGoogleSheetsService } = require('../services/google-auth');
const ui = require('./ui');
const messages = require('./messages');

module.exports.saveDataToSheets = async function() {
  // Move this out to its own auth helper
  // End move

  // Read from sheets
  // Find an id in first column
  // If found, write to that column
  // Else, append at the end

  const req = {
    spreadsheetId: '1ZnGyOa2TPbWvcpmdSjqF6lOJFE4QONkJhXJdNQdYrJI',
    range: 'Sheet1!A1:E1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      range: 'Sheet1!A1:E1',
      majorDimension: 'ROWS',
      values: [
        ['Door', '$15', '2', '3/15/2016'],
        ['Engine', '$100', '1', '3/20/2016'],
      ],
    },
  };

  const sheetService = getGoogleSheetsService();

  // Tried Promises, but they don't work
  sheetService.spreadsheets.values.append(req, (err, response) => {
    if (err) {
      handleSheetsError(err);
      return;
    }
    console.log(JSON.stringify(response, null, 2));
  });
};

function handleSheetsError(err) {
  console.log('append err' + util.inspect(err));
  if (err.code === 401) {
    ui.showPopup(messages.authError);
  } else if (err.code === 404) {
    ui.showPopup(messages.notFound);
  } else {
    ui.showPopup(messages.unknownAPIError);
  }
}
