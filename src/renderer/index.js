'use strict';

const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const moment = require('moment');
const google = require('googleapis');
const googleAuth = require('google-auth-library');
require('moment-duration-format');
const Counter = require('./counter');

const $mainView = document.querySelector('.main-view');
const $settingsView = document.querySelector('.settings-view');
const $toggleViewButtons = document.querySelectorAll('.toggle-btn');

const VIEWS = { main: 0, settings: 1 };
let selectedView = VIEWS.main;

$toggleViewButtons.forEach($button => {
  $button.addEventListener('click', () => {
    if (selectedView === VIEWS.main) {
      // change to display style
      $mainView.classList.add('hidden');
      $settingsView.classList.remove('hidden');
      selectedView = VIEWS.settings;
    } else {
      $settingsView.classList.add('hidden');
      $mainView.classList.remove('hidden');
      selectedView = VIEWS.main;
    }
  });
});

function timerRender(seconds) {
  const m = moment.duration(seconds * 1000).format('HH : mm : ss', {
    trim: false,
  });
  document.querySelector('.counter').innerHTML = m;
}

let c = new Counter(timerRender);
document.querySelector('.start-btn').addEventListener('click', () => {
  c.start();
});

document.querySelector('.stop-btn').addEventListener('click', () => {
  c.stop();
});

document.querySelector('.reset-btn').addEventListener('click', () => {
  c.reset();
});

document.querySelector('.login-btn').addEventListener('click', () => {
  ipcRenderer.send('do-login');
});

ipcRenderer.on('user-logged-in', () => {
  console.log('renderer: user-logged-in fired');
});

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me';
const GOOGLE_REDIRECT_URI = 'http://localhost';
const GOOGLE_CLIENT_ID =
  '1083955259464-o6fqr0mqadfiol1n764l4l4ajmsgubpb.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '4wjI5bhs0gWacuNaIGy_UWEO';

document.querySelector('.sync-btn').addEventListener('click', async () => {
  const store = new Store();
  console.log('user data', store.get('loggedInUserData'));
  const { accessToken, refreshToken } = store.get('loggedInUserData');
  const auth = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // var authClient = new googleAuth();
  // var auth = new authClient.OAuth2();
  // auth.credentials = {
  //   access_token: accessToken,
  //   refresh_token: refreshToken,
  // };

  const req = {
    resource: {
      properties: {
        title: 'Yallo timer-sheet',
      },
      sheets: [
        {
          properties: {
            title: 'timer-sheet',
            gridProperties: {
              columnCount: 6,
              frozenRowCount: 1,
            },
          },
        },
      ],
    },
  };

  const sheetService = google.sheets({ version: 'v4', auth });

  try {
    console.log('res data: ' + (await sheetService.spreadsheets.create(req)));
  } catch (e) {
    console.log('sheets create error: ' + JSON.stringify(e));
  }
});
