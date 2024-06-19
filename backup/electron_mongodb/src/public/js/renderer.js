const { ipcRenderer } = require('electron')

//STATUS DA CONEXÃO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//enviar uma mensagem ao processo principal // correção BUG ícone status //passo 1 slide
ipcRenderer.send('send-message', "Status do banco de dados:")

//receber mensagens do processo principal sobre o status da conexão - passo 4 slide
ipcRenderer.on('db-status', (event, status) => {
    console.log(status)
    if (status === "Banco de dados conectado") {
        document.getElementById("status").src = "../public/img/dbon.png"
    } else {
        document.getElementById("status").src = "../public/img/dboff.png"
    }
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD CREATE - inserir dados na coleção(banco de dados)
//Passo 1 - Slide (receber os dados do form)
//querySelector recebe o conteúdo relacionado ao id
let formulario, nomeTarefa, descricaoTarefa, lista//Passo 4.2
formulario = document.querySelector("#frmTarefas")
nomeTarefa = document.querySelector("#txtTarefa")
descricaoTarefa = document.querySelector("#txtDescricao")
lista = document.querySelector("#listaTarefas") //Passo 4.2

let arrayTarefas = [] //Passo 4.3

let updateStatus = false //passo 1.5 Crud Update
let idTarefa //passo 1.5 Crud Update

//recebimento dos dados do formulário ao pressionar o botão salvar - Passo 1 do slide
formulario.addEventListener("submit", async (event) => {
    event.preventDefault() //ignorar o comportamento padrão (reiniciar o documento após envio dos dados do formulário)
    //console.log("recebendo") 
    console.log(nomeTarefa.value, descricaoTarefa.value)
    //criar uma estrutura de dados usando objeto para envio ao main (argumentos)
    const tarefa = {
        nome: nomeTarefa.value,
        descricao: descricaoTarefa.value
    }

    //Passo 3 - Crud Update (Criar uma estrutura do tipo if else para reutilização do formulário) e enviar para o main
    if (updateStatus === false) {
        ipcRenderer.send('new-task', tarefa) //passo 2 do slide - envio dos dados para o main
    } else {
        ipcRenderer.send('update-task', { ...tarefa, idTarefa})
    }
    
    formulario.reset() //limpar o formulário após envio
})
//confirmar cadastro da tarefa no banco de dados
ipcRenderer.on('new-task-created', (event, args) => {
    //CRUD READ - Passo extra: atualizar a lista automaticamente quando uma nova tarefa for adicionada ao banco
    const novaTarefa = JSON.parse(args)
    arrayTarefas.push(novaTarefa)
    renderizarTarefas(arrayTarefas)
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD READ - buscar os dados do banco
//Enviar para o main um pedido para buscar as tarefas pendentes no banco de dados (passo 1 slide)
ipcRenderer.send('get-tasks')
//Passo 3(slide) receber as tarefas pendentes do main
ipcRenderer.on('pending-tasks', (event, args) => {
    console.log(args) //passo 3 - fins didáticos teste de recebimento das tarefas pendentes
    // Passo 4: renderizar as tarefas pendentes no documento index.html
    /*
        4.1 Criar uma lista ou tabela no html
        4.2 Capturar o id da lista ou tabela
        4.3 Criar um vetor para estruturar os dados
        4.4 Criar uma função para renderizar a lista ou tabela
    */
    //criar uma constante para receber as tarefas pendentes
    //JSON.parse (garantir o formato JSON)
    const tarefasPendentes = JSON.parse(args)
    //atribuir ao vetor
    arrayTarefas = tarefasPendentes
    console.log(arrayTarefas) //fins didáticos - exibir a estrutura de dados
    //executar a função renderizarTarefas() passando com parâmetro o array
    renderizarTarefas(arrayTarefas)
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD Update - alterar os dados do banco
/*
 Passo1
  1.1 - Criar o botão Editar na lista de tarefas
  1.2 - Criar a função editarTarefa e testar no console 
  1.3 - acrescentar a diretiva 'unsafe-inline' no index.html
  1.4 - testar a passagem do id como parâmetro
  1.5 - Criar 2 variáveis de apoio para reutilização do formulário nos métodos adicionar e editar uma tarefa
  variável status (status do update)
  idTarefa (id)
*/

//Passo 1.2
function editarTarefa(id) {
    //console.log("Teste do botão editar")
    console.log(id)
    //Passo 2(slide) Enviar para o html os dados da tarefa para serem alterados
    updateStatus = true //sinalizar ao formulário que é um update
    idTarefa = id //Armazenar o id da tarefa a ser modificada
    const tarefaEditada = arrayTarefas.find(arrayTarefas => arrayTarefas._id === id)
    nomeTarefa.value = tarefaEditada.nome
    descricaoTarefa.value = tarefaEditada.descricao
}

//Passos 5 e 6 - receber a confirmação do update e renderizar novamente
ipcRenderer.on('update-task-success', (event, args) => {
    console.log(args) //teste do passo 5(recebimento do main)
    //renderizar a tarefa - Passo 6 (mapeamento do array)
    const tarefaEditada = JSON.parse(args)
    arrayTarefasEditadas = arrayTarefas.map(t => {
        //se id for igual a tarefa editada
        if (t._id === tarefaEditada._id) {
            t.nome = tarefaEditada.nome
            t.descricao = tarefaEditada.descricao
        }
        return t
    })    
    renderizarTarefas(arrayTarefasEditadas)
    updateStatus = false //sinaliza o fim do update
})

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//CRUD Delete - excluir os dados do banco
/*
 Passo1
  1.1 - Criar o botão Excluir na lista de tarefas
  1.2 - Criar a função excluirTarefa e testar no console 
  1.3 - testar a passagem do id como parâmetro
*/

//Passo 1.2
function excluirTarefa(id) {
    console.log(id) //teste - Passo 1.3
    //Passo 2 - confirmar a exclusão(main) -> enviar este ao main junto com o id da tarefa a ser excluída
    ipcRenderer.send('delete-task', id)
}

//Passo 4 receber a confirmação de exclusão e renderezirar novamente a lista de tarefas pendentes
ipcRenderer.on('delete-task-success', (event,args) => {
    console.log(args) // teste de recebimento dos dados do banco
    //atualizar a lista de tarefas pendentes usando um filtro no array para remover a tarefa excluída
    const tarefaEliminada = JSON.parse(args)
    const listaAtualizada = arrayTarefas.filter((t) => {
        return t._id !== tarefaEliminada._id
    })
    arrayTarefas = listaAtualizada
    renderizarTarefas(arrayTarefas)
})

//Passo 4: Função usada para renderizar(exibir) os dados em uma lista ou tabela usando a linguagem html
function renderizarTarefas(arrayTarefas) {
    lista.innerHTML = "" //limpar a lista
    //percorrer o array
    arrayTarefas.forEach((t) => {
        lista.innerHTML += `
        <li class="Card">    
            <h5>Id: ${t._id}</h5>
            <h4>${t.nome}</h4>
            <p>${t.descricao}</p>
            <button onclick="editarTarefa('${t._id}')" id="btnEditar">Editar</button>
            <button onclick="excluirTarefa('${t._id}')" id="btnExcluir">Excluir</button>
        </li>
        <br>
        `
    })
}