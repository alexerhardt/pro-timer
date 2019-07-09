/****************************************************************************
 *
 * MESSAGE POPUPS
 *
 ***************************************************************************/

const $mainView = document.querySelector('.main-view');
const $settingsView = document.querySelector('.settings-view');

const VIEWS = { main: 0, settings: 1 };
let selectedView = VIEWS.main;

module.exports.toggleSettingsView = function() {
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
};

/****************************************************************************
 *
 * MESSAGE POPUPS
 *
 ***************************************************************************/

const $messagePopup = document.querySelector('.message-popup');
const $messageText = document.querySelector('.message-popup__text');

module.exports.showPopup = function(text) {
  $messagePopup.classList.remove('hidden');
  $messageText.innerHTML = text;
};

module.exports.dismissPopup = function() {
  $messagePopup.classList.add('hidden');
  $messageText.innerHTML = '';
};

/****************************************************************************
 *
 *  LOGIN VIEWS
 *
 ***************************************************************************/

const $loggedInContainer = document.querySelector(
  '.settings-inner-container--is-logged-in'
);
const $loggedOutContainer = document.querySelector(
  '.settings-inner-container--not-logged-in'
);

const $emailDisplay = document.querySelector('.email-display');

module.exports.showLoggedInOptions = function(loginEmail) {
  $loggedOutContainer.classList.add('hidden');
  $emailDisplay.innerHTML = loginEmail;
  $loggedInContainer.classList.remove('hidden');
};

module.exports.showLoggedOutOptions = function() {
  $loggedInContainer.classList.add('hidden');
  $emailDisplay.innerHTML = '';
  $loggedOutContainer.classList.remove('hidden');
};
