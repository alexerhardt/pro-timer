const path = require('path');
const util = require('util');
const { app, BrowserWindow, ipcMain } = require('electron');
require('electron-reload')(path.join(__dirname, '..'));
const constants = require('../constants');
const { saveData } = require('../services/local-storage');
const windowStateKeeper = require('electron-window-state');
const googleSignIn = require('./login');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Load previous state
  let mainWindowState = windowStateKeeper({
    defaultWidth: 640,
    defaultHeight: 360,
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 640,
    height: 360,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindowState.manage(mainWindow);

  // and load the index.html of the app.
  mainWindow.loadURL(
    `file://${path.join(__dirname, '..', 'renderer', 'index.html')}`
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('do-login', async (event, arg) => {
  console.log('do-login fired');
  const [x, y] = mainWindow.getPosition();
  try {
    const loggedInUserData = await googleSignIn({ x, y });
    saveData(constants.USER_DATA_KEY, loggedInUserData);
    event.reply('user-logged-in');
  } catch (e) {
    // TODO: Need to create a banner here
    console.error('error on sign in: ' + util.inspect(e));
    event.reply('login-error');
  }
});
