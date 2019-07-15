'use strict';

const { ipcRenderer } = require('electron');
const moment = require('moment');
require('moment-duration-format');
const ui = require('./ui');
const Counter = require('./counter');
const constants = require('../constants');
const {
  saveData,
  getData,
  isDataInStore,
} = require('../services/local-storage');
const { saveDataToSheets } = require('./sheets');

if (isDataInStore(constants.USER_DATA_KEY)) {
  const { email } = getData(constants.USER_DATA_KEY);
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

const counterEventHandlers = {
  onStart: function() {
    document.querySelector('.project-name-input').disabled = true;
    document.querySelector('.task-name-input').disabled = true;
  },
  onReset: function() {
    document.querySelector('.project-name-input').disabled = false;
    document.querySelector('.task-name-input').disabled = false;
  },
};

let c = new Counter(timerRender, counterEventHandlers);
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

document.querySelector('.sync-btn').addEventListener('click', () => {
  saveDataToSheets(c.startDate, c.seconds);
});

const $sheetIdInput = document.querySelector('.sheet-id-input');
const $sheetNameInput = document.querySelector('.sheet-name-input');

$sheetIdInput.addEventListener('change', ev => {
  saveData(constants.SPREADSHEET_ID_KEY, ev.target.value);
});

$sheetNameInput.addEventListener('change', ev => {
  saveData(constants.SHEET_NAME_KEY, ev.target.value);
});

if (isDataInStore(constants.SPREADSHEET_ID_KEY)) {
  $sheetIdInput.value = getData(constants.SPREADSHEET_ID_KEY);
}

if (isDataInStore(constants.SHEET_NAME_KEY)) {
  $sheetNameInput.value = getData(constants.SHEET_NAME_KEY);
}
