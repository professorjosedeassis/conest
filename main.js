const { app, BrowserWindow, ipcMain, Menu, shell, nativeTheme, dialog } = require('electron')
const path = require('node:path')

// importar o módulo de conexão
const { dbConnect, desconectar } = require('./database.js')
// status de conexão do banco de dados (No MongoDB é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e usá-la conforme necessário. Fechar e reabrir a conexão frequentemente pode aumentar a sobrecarga e causar problemas de desempenho)
// a função dbStatus garante que a conexão com o banco de dados seja estabelecida apenas uma vez e reutilizada.
// a variável abaixo é usada para garantir que o sistema inicie com o banco de dados desconectado
let dbCon = null

// importar o Schema (models)
const clienteModel = require('./src/models/Cliente.js')

// Janela principal >>>>>>>>>>>>>>>>>>>>>>>>>>>
const createWindow = () => {
    nativeTheme.themeSource = 'light'
    const win = new BrowserWindow({
        width: 800,
        height: 360,      
        icon: './src/public/img/pc.png',
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')

    // botões
    ipcMain.on('open-client', () => {
        clientWindow()
    })

    ipcMain.on('open-product', () => {
        productWindow()
    })
}

// Janela clientes >>>>>>>>>>>>>>>>>>>>>>>>>>>
const clientWindow = () => {
    const father = BrowserWindow.getFocusedWindow()
    if (father) {
        const child = new BrowserWindow({
            width: 800,
            height: 600,
            icon: './src/public/img/pc.png',
            autoHideMenuBar: true,
            resizable: false,
            parent: father,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
        child.loadFile('./src/views/cliente.html')
    }
}

// Janela produtos >>>>>>>>>>>>>>>>>>>>>>>>>>>
const productWindow = () => {
    const father = BrowserWindow.getFocusedWindow()
    if (father) {
        const child = new BrowserWindow({
            width: 800,
            height: 640,
            icon: './src/public/img/pc.png',
            autoHideMenuBar: true,
            resizable: false,
            parent: father,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
        child.loadFile('./src/views/produto.html')
    }
}

// iniciar a aplicação
app.whenReady().then(() => {

    // conexão com o banco de dados
    ipcMain.on('db-connect', async (event, message) => {
        dbCon = await dbConnect()
        event.reply('db-message', "conectado")
    })

    // desconectar do banco ao encerrar a aplicação
    app.on('before-quit', async () => {
        await desconectar(dbCon)
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// template do menu
const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Clientes',
                accelerator: 'Alt+C',
                click: () => clientWindow()
            },
            {
                label: 'Fornecedores',
                accelerator: 'Alt+F',
                //click: () => suplierWindow()
            },
            {
                label: 'Produtos',
                accelerator: 'Alt+P',
                click: () => productWindow()
            },
            {
                label: 'Sair',
                click: () => app.quit(),
                accelerator: 'Alt+F4'
            }
        ]
    },
    {
        label: 'Exibir',
        submenu: [
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramentas do desenvolvedor',
                role: 'toggleDevTools'
            },
            {
                type: 'separator'
            },
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o zoom padrão',
                role: 'resetZoom'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Projeto',
                click: () => shell.openExternal('https://joseassis.com.br/projetos.html')
            },
            {
                type: 'separator'
            },
            {
                label: 'Sobre',
                //click: () => aboutWindow()
            }
        ]
    }
]

// CRud Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('new-client', async (event, cliente) => {
    console.log(cliente)
    try {
        const novoCliente = new clienteModel({
            nomeCliente: cliente.nomeCli,
            foneCliente: cliente.foneCli,
            emailCliente: cliente.emailCli
        })
        console.log(novoCliente)
        await novoCliente.save()
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        })
        event.reply('reset-form')
    } catch (error) {
        console.log(error)
    }
})
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRud Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Aviso (Busca: Preenchimento de campo obrigatório)
ipcMain.on('dialog-infoSearchClient', (event) => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atenção!',
        message: 'Preencha um nome no campo de busca',
        buttons: ['OK']
    })
    event.reply('focus-searchClient') //UX
})
// Busca do cliente pelo nome
ipcMain.on('search-client', async (event, nomeCliente) => {
    console.log(nomeCliente) //receber pedido de busca do form
    try {
        const dadosCliente = await clienteModel.find({ nomeCliente: new RegExp(nomeCliente, 'i') }) // buscar no banco 
        console.log(dadosCliente)
        //UX
        if (dadosCliente.length === 0) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Clientes',
                message: 'Cliente não cadastrado.\nDeseja cadastrar este cliente?',
                defaultId: 0,
                buttons: ['Sim', 'Nâo']
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('set-nameClient')
                } else {
                    event.reply('clear-search')
                }
            })
        } else {
            event.reply('data-client', JSON.stringify(dadosCliente)) //envio dos dados do cliente ao renderizador (cliente.js)
        }

    } catch (error) {
        console.log(error)
    }
})

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('update-client', async (event, cliente) => {
    console.log(cliente) // teste do passo 2

    try {
        const clienteEditado = await clienteModel.findByIdAndUpdate(
            cliente.idCli, {
            nomeCliente: cliente.nomeCli,
            foneCliente: cliente.foneCli,
            emailCliente: cliente.emailCli
        },
            {
                new: true
            }
        )
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Dados do cliente alterados com sucesso",
            buttons: ['OK']
        }).then((result)=>{
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })       
    } catch (error) {
        console.log(error)
    }
})
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('delete-client', (event, idCli) => {
    console.log(idCli) // teste do passo 2
    //Importante! Confirmar a ação antes de excluir do banco
    dialog.showMessageBox({
        type: 'warning',
        title: 'ATENÇÃO!',
        message: 'Tem certeza que deseja excluir este cliente?',
        defaultId: 0,
        buttons: ['Sim', 'Não']
    }).then(async (result) => {
        if (result.response === 0) {
            // Passo 3 (excluir o cliente do banco)
            try {
                await clienteModel.findByIdAndDelete(idCli)
                event.reply('reset-form')
            } catch (error) {
                console.log(error)
            }
        }
    })
})
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<