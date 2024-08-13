const { contextBridge, ipcRenderer } = require('electron')

// conexão com o banco de dados
ipcRenderer.send('db-connect')

// processos
contextBridge.exposeInMainWorld('api', {
    openClient: () => ipcRenderer.send('open-client'),
    dbMessage: (message) => ipcRenderer.on('db-message', message),
    newClient: (cliente) => ipcRenderer.send('new-client', cliente),
    infoSearchClient: () => ipcRenderer.send('dialog-infoSearchClient'),
    focusClient: (args) => ipcRenderer.on('focus-searchClient', args),
    searchClient: (nomeCliente) => ipcRenderer.send('search-client', nomeCliente),
    nameClient: (args) => ipcRenderer.on('set-nameClient', args),
    clearSearch: (args) => ipcRenderer.on('clear-search', args),
    dataClient: (dadosCliente) => ipcRenderer.on('data-client', dadosCliente),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    updateClient: (cliente) => ipcRenderer.send('update-client', cliente)
})