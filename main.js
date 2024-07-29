const { app, BrowserWindow, ipcMain, Menu, shell, nativeTheme } = require('electron')
const path = require('node:path')

// importar o módulo de conexão
const { dbStatus, desconectar } = require('./database.js')
// status de conexão do banco de dados (No MongoDB é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e usá-la conforme necessário. Fechar e reabrir a conexão frequentemente pode aumentar a sobrecarga e causar problemas de desempenho)
// a função dbStatus garante que a conexão com o banco de dados seja estabelecida apenas uma vez e reutilizada.
// a variável abaixo é usada para garantir que o sistema inicie com o banco de dados desconectado
let dbCon = null

// Janela principal >>>>>>>>>>>>>>>>>>>>>>>>>>>
const createWindow = () => {
    nativeTheme.themeSource = 'light'
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: './src/public/img/pc.png',
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

// iniciar a aplicação
app.whenReady().then(() => {

    // conexão com o banco de dados
    ipcMain.on('db-conect', async () => {
        dbCon = await dbStatus()
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