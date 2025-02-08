/**
 * Processo principal
 */

const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron/main')
const path = require('node:path')

//importar fs para trabalhar com os arquivos de imagens
const fs = require('fs')

// importar o módulo do banco de dados
const { conectar, desconectar } = require('./database.js')
// importar o Schema (models)
const fornecedorModel = require('./src/models/Fornecedor.js')
const produtoModel = require('./src/models/Produto.js')


/************************/
/*** Janela principal ***/
/************************/
let win
const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: './src/public/img/pc.png',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    //carregar o menu personalizado
    const menuPersonalizado = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menuPersonalizado)

    win.loadFile('./src/views/index.html')
}

/********************/
/*** Janela sobre ***/
/********************/
let about
const aboutWindow = () => {
    if (!about) {
        about = new BrowserWindow({
            width: 360,
            height: 240,
            icon: './src/public/img/pc.png',
            resizable: false,
            autoHideMenuBar: true
        })
    }
    about.loadFile('./src/views/sobre.html')
    about.on('closed', () => {
        about = null
    })
}

/***************************/
/*** Janela fornecedores ***/
/***************************/
let suplier
const suplierWindow = () => {
    if (!suplier) {
        suplier = new BrowserWindow({
            width: 800,
            height: 640,
            icon: './src/public/img/pc.png',
            resizable: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })
    }
    suplier.loadFile('./src/views/fornecedor.html')
    suplier.on('closed', () => {
        suplier = null
    })
}

/***********************/
/*** Janela produtos ***/
/***********************/
let product
const productWindow = () => {
    if (!product) {
        product = new BrowserWindow({
            width: 800,
            height: 640,
            icon: './src/public/img/pc.png',
            resizable: false,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })
    }
    product.loadFile('./src/views/produto.html')
    product.on('closed', () => {
        product = null
    })
}

app.whenReady().then(() => {
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

// Template do menu
const menuTemplate = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Fornecedores',
                accelerator: 'CmdOrCtrl+F',
                click: suplierWindow
            },
            {
                label: 'Produtos',
                accelerator: 'CmdOrCtrl+P',
                click: productWindow
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
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recortar',
                role: 'cut'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Colar',
                role: 'paste'
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
                label: 'Sobre',
                click: aboutWindow
            }
        ]
    }
]

// =========================================
// ========== Conexão com o banco ==========
// =========================================

// Encerrar a conexão antes de sair
app.on('before-quit', async () => {
    await desconectar()
})

// Status de conexão
ipcMain.on('send-message', (event, message) => {
    console.log("<<<", message)
    statusConexao()
})

const statusConexao = async () => {
    try {
        await conectar()
        win.webContents.send('db-status', "Banco de dados conectado.")
    } catch (error) {
        win.webContents.send('db-status', `Erro de conexão: ${error.message}`)
    }
}
// __________________________________________________________


// =====================
// ===== Principal =====
// ===================== 

// Botão fornecedores
ipcMain.on('suplier-window', () => {
    suplierWindow()
})

// Botão produtos
ipcMain.on('product-window', () => {
    productWindow()
})
// __________________________________________________________


// ==================================
// ========== Fornecedores ==========
// ==================================

// CRUD Create
ipcMain.on('new-suplier', async (event, fornecedor) => {
    try {
        const novoFornecedor = new fornecedorModel(fornecedor)
        await novoFornecedor.save()
        dialog.showMessageBox(suplier, {
            type: 'info',
            title: 'CONEST',
            message: 'Fornecedor cadastrado com sucesso',
            buttons: ['OK']
        })
    } catch (error) {
        console.log(error)
    }
})

// Acessar site
ipcMain.on('url-site', (event, site) => {
    let url = site.url
    console.log(url)
    shell.openExternal(url)
})

// CRUD Read
ipcMain.on('search-suplier', async (event, nome) => {
    // console.log(nome)
    try {
        const dadosFornecedor = await fornecedorModel.find({ nome: new RegExp(nome, 'i') })
        if (dadosFornecedor.length === 0) {
            dialog.showMessageBox(suplier, {
                type: 'question',
                title: 'CONEST',
                message: 'Fornecedor não cadastrado.\nDeseja cadastrar este fornecedor?',
                buttons: ['Sim', 'Não']
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('set-name')
                } else {
                    event.reply('clear-search')
                }
            })
        } else {
            event.reply('suplier-data', JSON.stringify(dadosFornecedor))
        }
    } catch (error) {
        console.log(error)
    }
})

ipcMain.on('search-alert', (event) => {
    dialog.showMessageBox(suplier, {
        type: 'info',
        title: 'CONEST',
        message: 'Preencha o nome do fornecedor',
        buttons: ['OK']
    })
    event.reply('search-focus')
})

// CRUD Update
ipcMain.on('update-suplier', async (event, fornecedor) => {
    //console.log(fornecedor)
    const fornecedorEditado = await fornecedorModel.findByIdAndUpdate(
        fornecedor.id, {
        nome: fornecedor.nome,
        fone: fornecedor.fone,
        endereco: fornecedor.endereco,
        site: fornecedor.site
    },
        {
            new: true
        }
    )
    dialog.showMessageBox(suplier, {
        type: 'info',
        title: 'CONEST',
        message: 'Dados do fornecedor alterados com sucesso.',
        buttons: ['OK']
    }).then((result) => {
        // Verifica se o botão "OK" foi clicado (índice 0)
        if (result.response === 0) {
            event.reply('update-success')
        }
    })
})

// CRUD Delete
ipcMain.on('delete-suplier', async (event, idFornecedor) => {
    //console.log(idFornecedor)
    const { response } = await dialog.showMessageBox(product, {
        type: 'warning',
        buttons: ['Cancelar', 'Excluir'], //[0,1]
        title: 'Atenção!',
        message: 'Tem certeza que deseja excluir este fornecedor?'
    })
    //console.log(response)//apoio a lógica
    if (response === 1) {
        const fornecedorExcluido = await fornecedorModel.findByIdAndDelete(idFornecedor)
        event.reply('delete-success')
    }
})
// __________________________________________________________


// ===============================
//  ========== Produtos ==========
// ===============================

//CRUD Create
ipcMain.on('new-product', async (event, produto) => {
    console.log(produto)
    try {

        const uploadsDir = path.join(__dirname, 'uploads')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir)
        }

        const fileName = `${Date.now()}_${path.basename(produto.imagemProduto)}`
        const destination = path.join(uploadsDir, fileName);

        fs.copyFileSync(produto.imagemProduto, destination);

        const novoProduto = new produtoModel({
            barcode: produto.barcode,
            nomeProduto: produto.nomeProduto,
            imagemProduto: destination
        })

        // const novoProduto = new produtoModel(produto)
        await novoProduto.save()
        dialog.showMessageBox(product, {
            type: 'info',
            title: 'CONEST',
            message: 'Produto cadastrado com sucesso',
            buttons: ['OK']
        })
    } catch (error) {
        console.log(error)
    }
})

//CRUD Read
// Receber barcode
ipcMain.on('search-barcode', async (event, barcode) => {
    console.log(barcode)

    try {
        const dadosProduto = await produtoModel.find({ barcode: barcode })
        if (dadosProduto.length === 0) {
            dialog.showMessageBox(suplier, {
                type: 'question',
                title: 'CONEST',
                message: 'Produto não cadastrado.\nDeseja cadastrar este produto?',
                buttons: ['Sim', 'Não']
            }).then((result) => {
                if (result.response === 0) {
                    event.reply('set-barcode')
                } else {
                    event.reply('clear-search')
                }
            })
        } else {
            event.reply('product-data', JSON.stringify(dadosProduto))
        }
    } catch (error) {
        console.log(error)
    }

})
// __________________________________________________________