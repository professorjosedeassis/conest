const { app, BrowserWindow, Menu, shell, ipcMain, dialog, globalShortcut } = require('electron/main')
const path = require('node:path')

// Importação do módulo de conexão
const { conectar, desconectar } = require('./database.js')

// Importação do Schema Clientes da camada model
const clienteModel = require('./src/models/Clientes.js')

// Importação do Schema Fornecedores da camada model
const fornecedorModel = require('./src/models/Fornecedores.js')

// Importação do Schema Produtos da camada model
const produtoModel = require('./src/models/Produtos.js')

// Importar biblioteca nativa do JS para manipular arquivos
const fs = require('fs')

// Importar a biblioteca jspdf (instalar antes usando npm i jspdf)
const { jspdf, default: jsPDF } = require('jspdf')

// Janela principal
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
}

// Janela sobre
function aboutWindow() {
    const main = BrowserWindow.getFocusedWindow()
    let about
    if (main) {
        about = new BrowserWindow({
            width: 380,
            height: 225,
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

// Botões
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
        // enviar ao renderizador uma mensagem para trocar o ícone do status do banco de dados (delay de 0.5s para sincronizar)
        setTimeout(() => {
            event.reply('db-message', "conectado")
        }, 500) //500ms = 0.5s        
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
        label: 'Relatórios',
        submenu: [
            {
                label: 'Clientes',
                click: () => gerarRelatorioClientes()
            },
            {
                label: 'Fornecedores'
            },
            {
                label: 'Produtos'
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
/************** Validações  *************/
/****************************************/

ipcMain.on('dialog-search', () => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Atenção!',
        message: 'Preencha o campo de busca',
        buttons: ['OK']
    })
})


/****************************************/
/************** Clientes  ***************/
/****************************************/

// Aviso (pop-up) ao abrir a janela (questão didática caso optar pelo bloqueio/desbloqueio dos inputs)
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

// CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('new-supplier', async (event, fornecedor) => {
    console.log(fornecedor)
    try {
        const novoFornecedor = new fornecedorModel({
            nomeFornecedor: fornecedor.nomeFor,
            cnpjFornecedor: fornecedor.cnpjFor,
            siteFornecedor: fornecedor.siteFor
        })
        await novoFornecedor.save()
        dialog.showMessageBox({
            type: 'info',
            title: "Aviso",
            message: "Fornecedor adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            if (result.response === 0) {
                event.reply('reset-form')
            }
        })
    } catch (error) {
        //tratamento personalizado em caso de erro
        //11000 código referente ao erro de campos duplicados no banco (unique)
        if (error.code = 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CNPJ já está cadastrado\nVerifique se digitou corretamente",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    //event.reply('')
                }
            })
        } else {
            console.log(error)
        }
    }
})
// Fim do CRUD Create <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

/********************************************/
/**************** Produtos  *****************/
/********************************************/

// CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Obter o caminho da imagem (executar o open dialog)
ipcMain.handle('open-file-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: "Selecionar imagem",
        properties: ['openFile'],
        filters: [
            {
                name: 'Imagens',
                extensions: ['png', 'jpg', 'jpeg']
            }
        ]
    })

    if (canceled === true || filePaths.length === 0) {
        return null
    } else {
        return filePaths[0] //retorna o caminho do arquivo
    }

})

ipcMain.on('new-product', async (event, produto) => {
    // teste de recebimento dos dados do produto
    console.log(produto) // teste do passo 2 (recebimento do produto)

    //Resolução de BUG (quando a imagem não for selecionada)
    let caminhoImagemSalvo = ""

    try {
        // Correção de BUG (validação de imagem)
        if (produto.caminhoImagemPro) {
            //===================================== (imagens #1)
            // Criar a pasta uploads se não existir
            //__dirname (caminho absoluto)
            const uploadDir = path.join(__dirname, 'uploads')
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir)
            }

            //===================================== (imagens #2)
            // Gerar um nome único para o arquivo (para não sobrescrever)
            const fileName = `${Date.now()}_${path.basename(produto.caminhoImagemPro)}`
            //console.log(fileName) // apoio a lógica
            const uploads = path.join(uploadDir, fileName)

            //===================================== (imagens #3)
            //Copiar o arquivo de imagem para pasta uploads
            fs.copyFileSync(produto.caminhoImagemPro, uploads)

            //===================================== (imagens #4)
            //alterar a variável caminhoImagemSalvo para uploads
            caminhoImagemSalvo = uploads

        }
        // Cadastrar o produto no banco de dados
        const novoProduto = new produtoModel({
            barcodeProduto: produto.barcodePro,
            nomeProduto: produto.nomePro,
            caminhoImagemProduto: caminhoImagemSalvo
        })

        // adicionar o produto no banco de dados
        await novoProduto.save()

        // confirmação
        dialog.showMessageBox({
            type: 'info',
            message: 'Produto cadastrado com sucesso.',
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

// Fim CRUD Create <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('search-product', async (event, barcode) => {
    console.log(barcode) // teste do passo 2
    try {
        // Passos 3 e 4 (fluxo do slide)
        const dadosProduto = await produtoModel.find({
            barcodeProduto: barcode
        })
        console.log(dadosProduto) //teste Passo 4
        //validação (se não existir produto cadastrado)
        if (dadosProduto.length === 0) {
            dialog.showMessageBox({
                type: 'warning',
                title: 'Produtos',
                message: 'Produto não cadastrado.\nDeseja cadastrar este produto?',
                defaultId: 0,
                buttons: ['Sim', 'Não']
            }).then((result) => {
                console.log(result)
                if (result.response === 0) {
                    //enviar ao renderizador um pedido para setar o código de barras
                    event.reply('set-barcode')
                } else {
                    //enviar ao renderizador um pedido para limpar os campos do formulário
                    event.reply('reset-form')
                }
            })
        }
        // Passo 5: fluxo (envio dos dados do produto ao renderizador)
        event.reply('product-data', JSON.stringify(dadosProduto))

    } catch (error) {
        console.log(error)
    }
})
// Fim CRUD Read <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('update-product', async (event, produto) => {
    console.log(produto) //teste do fluxo (passo2) - slide

    // Correção de BUG (caminho da imagem)
    // estratégia: se o usuário não trocou a imagem, editar apenas os campos nome do produto e código de barras do produto
    if (produto.caminhoImagemPro === "") {
        try {
            const produtoEditado = await produtoModel.findByIdAndUpdate(
                produto.idPro, {
                barcodeProduto: produto.barcodePro,
                nomeProduto: produto.nomePro
            },
                {
                    new: true
                }
            )
        } catch (error) {
            console.log(error)
        }
    } else {
        try {
            const produtoEditado = await produtoModel.findByIdAndUpdate(
                produto.idPro, {
                barcodeProduto: produto.barcodePro,
                nomeProduto: produto.nomePro,
                caminhoImagemProduto: produto.caminhoImagemPro
            },
                {
                    new: true
                }
            )
        } catch (error) {
            console.log(error)
        }
    }


    // confirmação
    dialog.showMessageBox(product, {
        type: 'info',
        message: 'Dados do produto alterados com sucesso.',
        buttons: ['OK']
    }).then((result) => {
        if (result.response === 0) {
            event.reply('reset-form')
        }
    })
})
// Fim CRUD Update <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('delete-product', async (event, idProduto) => {
    //teste de recebimento do ID do produto (passo 2)
    console.log(idProduto)
    //confirmação de exclusão
    // confirmação antes de excluir o produto (IMPORTANTE!)
    // product é a variável ref a janela de produtos
    const { response } = await dialog.showMessageBox(product, {
        type: 'warning',
        buttons: ['Cancelar', 'Excluir'], //[0,1]
        title: 'Atenção!',
        message: 'Tem certeza que deseja excluir este produto?'
    })
    // apoio a lógica
    console.log(response)
    if (response === 1) {
        //Passo 3 slide
        try {
            const produtoExcluido = await produtoModel.findByIdAndDelete(idProduto)
            dialog.showMessageBox({
                type: 'info',
                title: 'Aviso',
                message: 'Produto excluído com sucesso',
                buttons: ['OK']
            })
            event.reply('reset-form')
        } catch (error) {
            console.log(error)
        }
    }
})
// Fim CRUD Delete <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


/********************************************/
/**************** Relatórios ****************/
/********************************************/

// Relatório de clientes
async function gerarRelatorioClientes() {
    try {
        //listar os clientes por ordem alfabética
        const clientes = await clienteModel.find().sort({ nomeCliente: 1 })
        console.log(clientes)
        //formatação do documento
        const doc = new jsPDF('p', 'mm', 'a4') // p portrait | l landscape
        //tamanho da fonte (título)
        doc.setFontSize(16)
        //Escrever um texto (título)
        doc.text("Relatório de clientes", 14, 20) //x, y (mm)
        //Data
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 160, 10)
        //variável de apoio para formatação da altura do conteúdo
        let y = 45
        doc.text("Nome", 14, y)
        doc.text("telefone", 80, y)
        doc.text("E-mail", 130, y)
        y += 5
        //desenhar uma linha
        doc.setLineWidth(0.5) //expessura da linha 
        doc.line(10, y, 200, y) //inicio, fim
        y += 10
        //renderizar os clientes (vetor)
        clientes.forEach((c) => {
            //se ultrapassar o limite da folha (A4 = 270mm) adicionar outra página
            if (y > 250) {
                doc.addPage()
                y = 20 //cabeçalho da outra página
            }
            doc.text(c.nomeCliente, 14, y)
            doc.text(c.foneCliente, 80, y)
            doc.text(c.emailCliente || "N/A", 130, y)
            y += 10 //quebra de linha
        })

        //Setar o caminho do arquivo temporário
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'clientes.pdf') //nome do arquivo
        //Salvar temporariamente o arquivo
        doc.save(filePath)
        //Abrir o arquivo no navegador padrão
        shell.openPath(filePath)
    } catch (error) {
        console.log(error)
    }
}