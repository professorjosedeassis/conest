const { app, BrowserWindow, Menu, shell, ipcMain, dialog, globalShortcut } = require('electron/main')
const path = require('node:path')

// Importação do módulo de conexão
const { conectar, desconectar } = require('./database.js')

// importação do Schema Clientes da camada model
const clienteModel = require('./src/models/Clientes.js')

// importação do Schema Fornecedores da camada model
const fornecedorModel = require('./src/models/Fornecedores.js')

// importação do Schema Produtos da camada model
const produtoModel = require('./src/models/Produtos.js')

// janela principal
let win
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // Menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')

    // botões
    ipcMain.on('open-client', () => {
        clientWindow()
    })

    ipcMain.on('open-supplier', () => {
        supplierWindow()
    })

    ipcMain.on('open-product', () => {
        productWindow()
    })

    ipcMain.on('open-report', () => {
        reportWindow()
    })
}

// Janela sobre
function aboutWindow() {
    const main = BrowserWindow.getFocusedWindow()
    let about
    if (main) {
        about = new BrowserWindow({
            width: 360,
            height: 215,
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }

    about.loadFile('./src/views/sobre.html')

    ipcMain.on('close-about', () => {
        if (about && !about.isDestroyed()) {
            about.close()
        }
    })
}

// Janela clientes
let client
function clientWindow() {
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/clientes.html')
}

// Janela fornecedores
let supplier
function supplierWindow() {
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        supplier = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    supplier.loadFile('./src/views/fornecedores.html')
}

// Janela produtos
let product
function productWindow() {
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        product = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    product.loadFile('./src/views/produtos.html')
}

// Janela relatórios
let report
function reportWindow() {
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        report = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            parent: main,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    report.loadFile('./src/views/relatorios.html')
}

app.whenReady().then(() => {
    //registrar atalho global para devtools em qualquer janela ativa
    globalShortcut.register('Ctrl+Shift+I', () => {
        const tools = BrowserWindow.getFocusedWindow()
        if (tools) {
            tools.webContents.openDevTools()
        }
    })

    // Desregistrar atalhos globais antes de sair
    app.on('will-quit', () => {
        globalShortcut.unregisterAll()
    })

    createWindow()
    // Melhor local para estabelecer a conexão com o banco de dados
    // Importar antes o módulo de conexão no início do código
    // No MongoDB é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e usá-la quando necessário. Fechar e reabrir constantemente a conexão aumenta a sobrecarga e reduz o desempenho do servidor.
    // conexão com o banco ao iniciar a aplicação   
    ipcMain.on('db-connect', async (event) => {
        // a linha abaixo estabelece a conexão com o banco
        await conectar()
        // enviar ao renderizador uma mensagem para trocar o ícone do status do banco de dados
        event.reply('db-message', "conectado")
    })

    // desconectar do banco ao encerrar a aplicação
    app.on('before-quit', async () => {
        await desconectar()
    })

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

//Reduzir logs não críticos (mensagens no console quando executar Devtools)
app.commandLine.appendSwitch('log-level', '3')

const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Clientes',
                click: () => clientWindow()
            },
            {
                label: 'Fornecedores',
                click: () => supplierWindow()
            },
            {
                label: 'Produtos',
                click: () => productWindow()
            },            
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                accelerator: 'Alt+F4',
                click: () => app.quit()
            }
        ]
    },
    {
        label: 'Relatórios'
    },
    {
        label: 'Zoom',
        submenu: [
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
                label: 'Repositório',
                click: () => shell.openExternal('https://github.com/professorjosedeassis/conestv3')
            },
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]

/****************************************/
/************** Clientes  ***************/
/****************************************/

// Aviso (pop-up) ao abrir a janela
ipcMain.on('notice-client', () => {
    dialog.showMessageBox({
        type: 'info',
        title: "Atenção!",
        message: "Pesquise um cliente antes de continuar.",
        buttons: ['OK']
    })
})

// CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Recebimento dos dados do formulário do cliente
ipcMain.on('new-client', async (event, cliente) => {
    //teste de recebimento dos dados (Passo 2 - slide) Importante!
    console.log(cliente)

    // Passo 3 - slide (cadastrar os dados no banco de dados)
    try {
        // criar um novo objeto usando a classe modelo
        const novoCliente = new clienteModel({
            nomeCliente: cliente.nomeCli,
            foneCliente: cliente.foneCli,
            emailCliente: cliente.emailCli
        })
        // a linha abaixo usa a biblioteca moongoose para salvar
        await novoCliente.save()

        //confirmação de cliente adicionado no banco
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })

    } catch (error) {
        console.log(error)
    }
})
// Fim do CRUD Create <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('dialog-search', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atenção!',
        message: 'Preencha um nome no campo de busca',
        buttons: ['OK']
    })
})

ipcMain.on('search-client', async (event, cliNome) => {
    //teste de recebimento do nome do cliente a ser pesquisado(passo 2)
    console.log(cliNome)
    //Passos 3 e 4 - Pesquisar no banco de dados o cliente pelo nome
    // find() -> buscar no banco de dados (mongoose)
    // RegExp -> filtro pelo nome do cliente 'i' insensitive (maiúsculo ou minúsculo)
    // Atenção: nomeCliente -> model | cliNome -> renderizador
    try {
        const dadosCliente = await clienteModel.find({
            nomeCliente: new RegExp(cliNome, 'i')
        })
        console.log(dadosCliente) // teste dos passos 3 e 4
        // Passo 5 - slide -> enviar os dados do cliente para o renderizador (JSON.stringfy converte para JSON)

        // Melhoria na experiência do usuário (se não existir o cliente cadstrado, enviar mensagem e questionar se o usuário deseja cadastrar um novo cliente)
        if (dadosCliente.length === 0) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Clientes',
                message: 'Cliente não cadastrado.\nDeseja cadastrar este cliente?',
                defaultId: 0,
                buttons: ['Sim', 'Não']
            }).then((result) => {
                console.log(result)
                if (result.response === 0) {
                    //enviar ao renderizador um pedido para setar o nome do cliente (trazendo do campo de busca) e liberar o botão adicionar
                    event.reply('set-nameClient')
                } else {
                    //enviar ao renderizador um pedido para limpar os campos do formulário
                    event.reply('reset-form')
                }
            })
        }

        event.reply('client-data', JSON.stringify(dadosCliente))
    } catch (error) {
        console.log(error)
    }
})
// Fim do CRUD Read <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('delete-client', async (event, idCliente) => {
    //teste de recebimento do id do cliente (passo 2 - slide)
    console.log(idCliente)
    // confirmação antes de excluir o cliente (IMPORTANTE!)
    // client é a variável ref a janela de clientes
    const { response } = await dialog.showMessageBox(client, {
        type: 'warning',
        buttons: ['Cancelar', 'Excluir'], //[0,1]
        title: 'Atenção!',
        message: 'Tem certeza que deseja excluir este cliente?'
    })
    // apoio a lógica
    console.log(response)
    if (response === 1) {
        //Passo 3 slide
        try {
            const clienteExcluido = await clienteModel.findByIdAndDelete(idCliente)
            dialog.showMessageBox({
                type: 'info',
                title: 'Aviso',
                message: 'Cliente excluído com sucesso',
                buttons: ['OK']
            })
            event.reply('reset-form')
        } catch (error) {
            console.log(error)
        }
    }

})
// Fim do CRUD Delete <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('update-client', async (event, cliente) => {
    //teste de recebimento dos dados do cliente (passo 2)
    console.log(cliente)
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
    } catch (error) {
        console.log(error)
    }
    dialog.showMessageBox(client, {
        type: 'info',
        message: 'Dados do cliente alterados com sucesso.',
        buttons: ['OK']
    }).then((result) => {
        if (result.response === 0) {
            event.reply('reset-form')
        }
    })
})
// Fim do CRUD Update <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


/********************************************/
/************** Fornecedores  ***************/
/********************************************/

// Acessar site externo
ipcMain.on('url-site', (event, urlSite) => {
    let url = urlSite.url
    console.log(url)
    shell.openExternal(url)
})

