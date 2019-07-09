const util = require('util');

const google = require('googleapis');
const { hasUserData, getUserData } = require('../services/login-helpers');
const ui = require('./ui');

const GOOGLE_REDIRECT_URI = 'http://localhost';
const GOOGLE_CLIENT_ID =
  '1083955259464-o6fqr0mqadfiol1n764l4l4ajmsgubpb.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '4wjI5bhs0gWacuNaIGy_UWEO';

module.exports.saveDataToSheets = async function() {
  if (!hasUserData()) {
    // TODO: Change to modal
    console.error('User data not present; cannot log in');
    return;
  }
  const { accessToken, refreshToken } = getUserData();

  const auth = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

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

  const sheetService = google.sheets({ version: 'v4', auth });

  // Tried Promises, but they don't work
  sheetService.spreadsheets.values.append(req, (err, response) => {
    if (err) {
      console.log('append err' + util.inspect(err));
      if (err.code === 401) {
        ui.showPopup('Authentication error. Please log in again.');
      } else if (err.code === 404) {
        ui.showPopup(
          'Spreadsheet or sheet not found. Please review the details' +
            ' in settings'
        );
      } else {
        ui.showPopup('There was an unknown error; could not update data');
      }
      return;
    }
    console.log(JSON.stringify(response, null, 2));
  });
};
