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

  // const timeStamps = getAllTimeStamps(sheetService);
  // console.log('timeStamps: ', timeStamps);
  getAllTimeStamps(sheetService)
    .then(res => {
      console.log('timeStamps res: ', res);
      const index = res.values[0].findIndex(elt => elt === 1234);
      if (index === -1) {
        console.log('we append');
      } else {
        console.log('we edit');
      }
    })
    .catch(e => handleSheetsError(e));

  // // Tried Promises, but they don't work
  // sheetService.spreadsheets.values.append(req, (err, response) => {
  //   if (err) {
  //     handleSheetsError(err);
  //     return;
  //   }
  //   console.log(JSON.stringify(response, null, 2));
  // });
};

function getAllTimeStamps(sheetService) {
  const req = {
    spreadsheetId: '1ZnGyOa2TPbWvcpmdSjqF6lOJFE4QONkJhXJdNQdYrJI',
    range: 'Sheet1!A:A',
    majorDimension: 'COLUMNS',
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  };

  return new Promise((resolve, reject) => {
    sheetService.spreadsheets.values.get(req, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });
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
