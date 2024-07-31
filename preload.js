const { contextBridge, ipcRenderer } = require('electron')

// conexão com o banco de dados
ipcRenderer.send('db-connect')

// processos
contextBridge.exposeInMainWorld('api', {
    openClient: () => ipcRenderer.send('open-client'),
    dbMessage: (message) => ipcRenderer.on('db-message', message),
    newClient: (cliente) => ipcRenderer.send('new-client', cliente)
})
