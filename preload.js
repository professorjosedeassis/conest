const { contextBridge, ipcRenderer } = require('electron')

// Estabelecer a conexão com o banco (envio de pedido para o main abrir a conexão com o banco de dados)
ipcRenderer.send('db-connect')

contextBridge.exposeInMainWorld('api', {
    status: (message) => ipcRenderer.on('db-message', message),
    fecharJanela: () => ipcRenderer.send('close-about'),
    janelaClientes: () => ipcRenderer.send('open-client'),
    janelaFornecedores: () => ipcRenderer.send('open-supplier'),
    janelaProdutos: () => ipcRenderer.send('open-product'),
    janelaRelatorios: () => ipcRenderer.send('open-report'),
    resetarFormulario: (args) => ipcRenderer.on('reset-form', args),  
    novoCliente: (cliente) => ipcRenderer.send('new-client', cliente),
    buscarCliente: (cliNome) => ipcRenderer.send('search-client', cliNome),
    renderizarCliente: (dadosCliente) => ipcRenderer.on('client-data', dadosCliente),
    deletarCliente: (idCliente) => ipcRenderer.send('delete-client', idCliente),
    editarCliente: (cliente) => ipcRenderer.send('update-client', cliente),
    validarBusca: () => ipcRenderer.send('dialog-search'),
    setarNomeCliente: (args) => ipcRenderer.on('set-nameClient', args),
    avisoCliente: () => ipcRenderer.send('notice-client'),
    abrirSite: (urlSite) => ipcRenderer.send('url-site', urlSite),
    novoProduto: (produto) => ipcRenderer.send('new-product', produto),
    selecionarArquivo: () => ipcRenderer.invoke('open-file-dialog'),
    buscarProduto: (barcode) => ipcRenderer.send('search-product', barcode),
    setarBarcode: (args) => ipcRenderer.on('set-barcode', args),
    renderizarProduto: (dadosProduto) => ipcRenderer.on('product-data', dadosProduto)
})