const util = require('util');

const google = require('googleapis');
const ui = require('../renderer/ui');
const messages = require('../renderer/messages');
const { userDataInStore, getUserData } = require('./local-storage');

const GOOGLE_REDIRECT_URI = 'http://localhost';
const GOOGLE_CLIENT_ID =
  '1083955259464-o6fqr0mqadfiol1n764l4l4ajmsgubpb.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '4wjI5bhs0gWacuNaIGy_UWEO';

/**
 * Returns a ready to use Google Sheets service
 */
module.exports.getGoogleSheetsService = function() {
  if (!userDataInStore()) {
    ui.showPopup(messages.notLoggedIn);
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

  return google.sheets({ version: 'v4', auth });
};
