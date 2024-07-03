const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron')
const path = require('node:path')

// importar o módulo de conexão
const { conectar, desconectar } = require('./database.js')

// Janela principal >>>>>>>>>>>>>>>>>>>>>>>>>>>
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')
}

// iniciar a aplicação
app.whenReady().then(() => {

    // conexão com o banco de dados
    ipcMain.on('db-conect', () => {
        conectar()
    })

    // desconectar do banco ao encerrar a janela
    app.on('before-quit', async () => {
        await desconectar()
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
                label: 'Fornecedores',
                //click: () => suplierWindow()
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