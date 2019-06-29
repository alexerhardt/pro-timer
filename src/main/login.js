const { BrowserWindow } = require('electron');
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
      console.log('handleNavigation called, url: ', url);
      const query = parse(url, true).query;
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`));
        } else if (query.code) {
          // Login is complete
          console.log('login complete');
          authWindow.removeAllListeners('closed');
          setImmediate(() => authWindow.close());

          // This is the authorization code we need to request tokens
          resolve(query.code);
        }
      }
    }

    // authWindow.on('closed', () => {
    //   // TODO: Handle this smoothly
    //   throw new Error('Auth window was closed by user');
    // });

    authWindow.webContents.on('will-navigate', (event, url) => {
      console.log('will-navigate fired');
      handleNavigation(url);
    });

    authWindow.webContents.on(
      'did-get-redirect-request',
      (event, oldUrl, newUrl) => {
        console.log('did-get-redirect-request fired');
        handleNavigation(newUrl);
      }
    );

    authWindow.loadURL(authUrl);
  });
}

async function fetchGoogleProfile(accessToken) {
  const response = await axios.get(GOOGLE_PROFILE_URL, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

async function fetchAccessTokens(code) {
  let response;
  const params = qs.stringify({
    code: code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  console.log(params);
  try {
    response = await axios.post(GOOGLE_TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

module.exports = async function googleSignIn(windowProps) {
  const code = await signInWithPopup(windowProps);
  console.log('sign in complete, code: ', code);
  const tokens = await fetchAccessTokens(code);
  console.log('tokens retrieved, tokens: ', tokens);
  const { id, email } = await fetchGoogleProfile(tokens.access_token);
  const providerUser = {
    uid: id,
    email,
    idToken: tokens.id_token,
  };

  // return mySignInFunction(providerUser);
  console.log(providerUser);
};
