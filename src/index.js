const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
let mainWindow;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './icons/icon.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

app.on('ready', () => {
  const mainWindow = createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('show-input-box', async (event, options) => {
  const result = await dialog.showInputBox(options);
  return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(options);
  return result;
});

ipcMain.handle('add-group', async (event, groupName) => {
  addGroup(groupName);
});

ipcMain.handle('remove-group', async (event, groupName) => {
  removeGroup(groupName);
});

function addGroup(groupName) {
  mainWindow.webContents.send('group-added', groupName);
}

function removeGroup(groupName) {
  mainWindow.webContents.send('group-removed', groupName);
}