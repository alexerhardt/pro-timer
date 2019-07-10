const Store = require('electron-store');
const store = new Store();

module.exports.saveUserData = function(userData) {
  return store.set('loggedInUserData', userData);
};

module.exports.getUserData = function() {
  return store.get('loggedInUserData');
};

module.exports.userDataInStore = function() {
  return store.has('loggedInUserData');
};
