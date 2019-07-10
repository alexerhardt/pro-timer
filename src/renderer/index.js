'use strict';

const { ipcRenderer } = require('electron');
const moment = require('moment');
require('moment-duration-format');
const ui = require('./ui');
const Counter = require('./counter');
const { getUserData, userDataInStore } = require('../services/local-storage');
const { saveDataToSheets } = require('./sheets');

if (userDataInStore()) {
  const { email } = getUserData();
  ui.showLoggedInOptions(email);
}

const $toggleViewButtons = document.querySelectorAll('.toggle-btn');
$toggleViewButtons.forEach($button => {
  $button.addEventListener('click', ui.toggleSettingsView);
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

document
  .querySelector('.message-popup__dismiss')
  .addEventListener('click', ui.dismissPopup);

document.querySelector('.sync-btn').addEventListener('click', saveDataToSheets);
