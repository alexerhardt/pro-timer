'use strict';

const { ipcRenderer } = require('electron');
const Store = require('electron-store');
const moment = require('moment');
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
  const store = new Store();
  console.log('user data', store.get('loggedInUserData'));
});

document.querySelector('.sync-btn').addEventListener('click', () => {});
