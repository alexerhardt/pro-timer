const Store = require('electron-store');
const store = new Store();

module.exports.saveData = function(key, data) {
  return store.set(key, data);
};

module.exports.getData = function(key) {
  return store.get(key);
};

module.exports.isDataInStore = function(key) {
  return store.has(key);
};
