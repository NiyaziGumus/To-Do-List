const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: false,
          contextIsolation: true,
          // allowRunningInsecureContent: false, // Eklenen satır
          enableRemoteModule: false, // Eklenen satır
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.webContents.openDevTools(); // DevTools'u açıyoruz
};

app.on('ready', () => {
    const mainWindow = createWindow();
    // Oluşturulan mainWindow örneğini burada kullanabilirsiniz
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

// Renderer süreçlerinden gelen istekleri işliyoruz
ipcMain.handle('show-input-box', async (event, options) => {
    const result = await dialog.showInputBox(options);
    return result;
});

ipcMain.handle('show-message-box', async (event, options) => {
    const result = await dialog.showMessageBox(options);
    return result;
});

// Renderer sürecinden gelen istekleri işleme
ipcMain.handle('add-group', async (event, groupName) => {
  // Grup ekleme işlemlerini gerçekleştirme
  addGroup(groupName);
});

ipcMain.handle('remove-group', async (event, groupName) => {
  // Grup silme işlemlerini gerçekleştirme
  removeGroup(groupName);
});



function addGroup(groupName) {
  // Grup ekleme işlemlerini gerçekleştirdikten sonra
  mainWindow.webContents.send('group-added', groupName);
}

function removeGroup(groupName) {
  // Grup silme işlemlerini gerçekleştirdikten sonra
  mainWindow.webContents.send('group-removed', groupName);
}