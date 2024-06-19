const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')

// importar o módulo do banco de dados
const { conectar, desconectar } = require('./db.js')

// importar o Schema (models)
const Tarefa = require(`${__dirname}/src/models/Tarefa`)

let win //reutilização desta variável no status conexão
const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  win.loadFile(`${__dirname}/src/views/index.html`)
}

app.whenReady().then(() => {
  createWindow() //criar a janela  

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

// encerrar a conexão com o banco de dados antes do aplicativo ser fechado
app.on('before-quit', async () => {
  await desconectar()
})

// acrescentar este processo (correção de bug reload ícone status) - passo 2 slide
ipcMain.on('send-message', (event, message) => {
  console.log("<<<", message)
  statusConexao()
})

//status de conexão >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const statusConexao = async () => {
  try {
    await conectar()
    // Enviar uma mensagem para a janela (renderer.js) informando o status da conexão e os erros caso ocorram - passo 3 -slide
    win.webContents.send('db-status', "Banco de dados conectado")
  } catch (error) {
    win.webContents.send('db-status', `Erro de conexão: ${error.message}`)
  }
}

//CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.on('new-task', async (event, args) => {
  console.log(args) // teste de recebimento
  //salvar no banco de dados os dados do formulário - Passo 3 slides
  //validação de campos obrigatórios
  if (args.nome === "") {
    dialog.showMessageBox(win, {
      type: "info",
      message: 'Preencha o nome da tarefa',
      buttons: ['OK']
    })
  } else {
    const novaTarefa = new Tarefa(args)
    await novaTarefa.save()
    //usar o modal(dialog) do sistema operacional para enviar uma mensagem ao usuário confirmando que a tarefa foi salva
    /*
    //fins didáticos - desnecessário neste projeto
    dialog.showMessageBox(win, {
      type: 'info',
      message: 'Tarefa salva com sucesso',
      buttons: ['OK']
    })
    */
    //enviar uma confirmação para o renderer(front-end) - passo 4
    //passando a nova tarefa no formato JSON (Passo extra Crud READ)
    event.reply('new-task-created', JSON.stringify(novaTarefa))
  }
})

//CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//Passo 2(slide) fazer uma busca no banco de dados de todas as tarefas pendentes
ipcMain.on('get-tasks', async (event, args) => {
  const tarefasPendentes = await Tarefa.find() //busca "select"
  console.log(tarefasPendentes) //Passo 2 fins didáticos (teste)
  //Passo 3(slide) enviar ao renderer(view) as tarefas pendentes
  event.reply('pending-tasks', JSON.stringify(tarefasPendentes))
})

//CRUD Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//Passo 3(slide) - receber o pedido do renderer para editar a tarefa no banco de dados
ipcMain.on('update-task', async (event, args) => {
  console.log(args) //teste de recebimento dos dados do form
  //validação de campos obrigatórios
  if (args.nome === "") {
    dialog.showMessageBox(win, {
      type: "info",
      message: 'Preencha o nome da tarefa',
      buttons: ['OK']
    })
  } else {
    //Passo 4 slide - Alterar as informações no banco de dados
    const tarefaEditada = await Tarefa.findByIdAndUpdate(
      args.idTarefa, {
      nome: args.nome,
      descricao: args.descricao
    },
      {
        new: true
      }
    )
    //enviar a confirmação para o renderer junto com a tarefa editada (passo 5 do slide)
    event.reply('update-task-success', JSON.stringify(tarefaEditada))
  }
})

//CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//Passo 2(slide) - receber o pedido do renderer para excluir uma tarefa do banco de dados
ipcMain.on('delete-task', async (event, args) => {
  console.log(args) //teste de recebimento do id (passo 2)
  //exibir uma caixa de diálogo para confirmar a exclusão
  const {response} = await dialog.showMessageBox(win, {
    type: 'warning',
    buttons: ['Cancelar','Excluir'], //[0,1]
    title: 'Confirmação de exclusão',
    message: 'Tem certeza que deseja excluir esta tarefa?'
  })
  console.log(response)//apoio a lógica
  if (response === 1) {
    const tarefaExcluida = await Tarefa.findByIdAndDelete(args) //Passo 3 excluir a tarefa do banco e enviar uma resposta para o renderer atualizar a lista de tarefas pendentes
    event.reply('delete-task-success', JSON.stringify(tarefaExcluida))
  }
})