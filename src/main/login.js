const { BrowserWindow } = require('electron');
const Store = require('electron-store');
const { parse } = require('url');
const axios = require('axios');
const qs = require('qs');

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me';
const GOOGLE_REDIRECT_URI = 'http://localhost';
const GOOGLE_CLIENT_ID =
  '1083955259464-o6fqr0mqadfiol1n764l4l4ajmsgubpb.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '4wjI5bhs0gWacuNaIGy_UWEO';

/**
 * Opens up a new window with the Google oAuth sign-in process
 * @param { x, y } Object containing the coordinates of the new window
 * @returns {Promise}
 */
function signInWithPopup({ x, y }) {
  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      x,
      y,
      width: 500,
      height: 600,
      show: true,
    });

    const urlParams = {
      response_type: 'code',
      redirect_uri: GOOGLE_REDIRECT_URI,
      client_id: GOOGLE_CLIENT_ID,
      scope: 'profile email https://www.googleapis.com/auth/spreadsheets',
    };
    const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`;

    function handleNavigation(url) {
      const query = parse(url, true).query;
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`));
        } else if (query.code) {
          // Login is complete
          authWindow.removeAllListeners('closed');
          setImmediate(() => authWindow.close());
          // This is the authorization code we need to request tokens
          resolve(query.code);
        }
      }
    }

    authWindow.webContents.on('will-navigate', (event, url) => {
      handleNavigation(url);
    });

    authWindow.webContents.on(
      'did-get-redirect-request',
      (event, oldUrl, newUrl) => {
        handleNavigation(newUrl);
      }
    );

    authWindow.loadURL(authUrl);
  });
}

/**
 * Uses the code returned through redirect by the Google API when the
 * user grants permissions, and gets an access token for use in the app
 * @param code
 * @returns {Promise}
 */
async function fetchAccessTokens(code) {
  const response = await axios.post(
    GOOGLE_TOKEN_URL,
    qs.stringify({
      code: code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
}

/**
 * Uses the access token obtained through the Google oAuth API and
 * fetches basic data about the user for display in the app
 * @param accessToken
 * @returns {Promise}
 */
async function fetchGoogleProfile(accessToken) {
  console.log('fetchGoogleProfile called, accessToken: ' + accessToken);
  const response = await axios.get(GOOGLE_PROFILE_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

module.exports = async function googleSignIn(windowProps) {
  const code = await signInWithPopup(windowProps);
  const tokens = await fetchAccessTokens(code);
  console.log('tokens: ' + tokens);
  const { id, email } = await fetchGoogleProfile(tokens.access_token);

  return {
    uid: id, // can probably remove this
    email,
    idToken: tokens.id_token, // can probably remove this
    accessToken: tokens.access_token,
    tokenExpiry: tokens.expires_in,
    refreshToken: tokens.refresh_token,
  };
};
