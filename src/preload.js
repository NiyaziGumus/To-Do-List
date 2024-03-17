// preload.js
const { contextBridge, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {
    showDialog: (options) => ipcRenderer.invoke('show-message-box', options),
    addGroup: (groupName) => ipcRenderer.invoke('add-group', groupName),
    removeGroup: (groupName) => ipcRenderer.invoke('remove-group', groupName)
});