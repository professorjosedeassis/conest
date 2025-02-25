/**
 * Processo de renderização da tela de Clientes
 */

const foco = document.getElementById('searchClient')

//Mudar as propriedades do documento html ao iniciar a janela
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    foco.focus()
    //desativar o input das caixas de texto dentro da div .bloqueio
    /*
    document.querySelectorAll('.bloqueio input').forEach(input => {
        input.disabled = true
    })
    */
    //aviso (pop-up)
    //api.avisoCliente()
})

// Função para manipular o evento da tecla Enter
function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        buscarCliente()
    }
}

// Função para remover o manipulador do evento da tecla Enter
function restaurarEnter() {
    document.getElementById('frmClient').removeEventListener('keydown', teclaEnter)
}

// manipulando o evento (tecla Enter)
document.getElementById('frmClient').addEventListener('keydown', teclaEnter)

// Array usado nos métodos para manipulação da estrutura de dados
let arrayCliente = []

// Captura dos dados dos inputs do form
let formCliente = document.getElementById('frmClient')
let idCliente = document.getElementById('inputIdClient')
let nomeCliente = document.getElementById('inputNameClient')
let foneCliente = document.getElementById('inputPhoneClient')
let emailCliente = document.getElementById('inputEmailClient')

// CRUD Create/Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Evento associado aos botões adicionar e editar
formCliente.addEventListener('submit', async (event) => {
    // evitar o comportamento padrão de envio em um form
    event.preventDefault()
    //teste importante! (fluxo dos dados)
    console.log(idCliente.value, nomeCliente.value, foneCliente.value, emailCliente.value)

    //Passo 2 - slide (envio das informações para o main)

    //Estratégia para determinar se é um novo cadastro de clientes ou a edição de um cliente já existente
    if (idCliente.value === "") {
        // criar um objeto
        const cliente = {
            nomeCli: nomeCliente.value,
            foneCli: foneCliente.value,
            emailCli: emailCliente.value
        }
        api.novoCliente(cliente)
    } else {
        // criar um novo objeto com o id do cliente
        const cliente = {
            idCli: idCliente.value,
            nomeCli: nomeCliente.value,
            foneCli: foneCliente.value,
            emailCli: emailCliente.value
        }
        api.editarCliente(cliente)
    }


})
// Fim CRUD Create <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function buscarCliente() {
    //Passo 1 (slide)
    let cliNome = document.getElementById('searchClient').value
    //validação
    if (cliNome === "") {
        api.validarBusca() //validação do campo obrigatório 
        foco.focus()
    } else {
        //console.log(cliNome) // teste do passo 1
        //Passo 2 (slide) - Enviar o pedido de busca do cliente ao main
        api.buscarCliente(cliNome)
        //Passo 5 - Recebimento dos dados do cliente
        api.renderizarCliente((event, dadosCliente) => {
            //teste de recebimento dos dados do cliente
            console.log(dadosCliente)
            // Passo 6 (slide): renderização dos dados do cliente no formulário
            const clienteRenderizado = JSON.parse(dadosCliente)
            arrayCliente = clienteRenderizado
            // teste para entendimento da lógica
            console.log(arrayCliente)
            // percorrer o array de clientes, extrair os dados e setar(peencher) os campos do formulário
            arrayCliente.forEach((c) => {
                document.getElementById('inputNameClient').value = c.nomeCliente
                document.getElementById('inputPhoneClient').value = c.foneCliente
                document.getElementById('inputEmailClient').value = c.emailCliente
                document.getElementById('inputIdClient').value = c._id
                //limpar o campo de busca, remover o foco e desativar a busca
                foco.value = ""                           
                foco.disabled = true
                btnRead.disabled = true
                //desativar o botão adicionar
                btnCreate.disabled = true
                //liberar os botões editar e excluir
                document.getElementById('btnUpdate').disabled = false
                document.getElementById('btnDelete').disabled = false
                //restaurar o padrão da tecla Enter
                restaurarEnter()
                //reativar os inputs das caixas de texto
                /*
                document.querySelectorAll('.bloqueio input').forEach(input => {
                    input.disabled = false
                })
                */
            })
        })
    }
    //setar o nome do cliente 
    api.setarNomeCliente(() => {
        //setar o nome do cliente       
        let campoNome = document.getElementById('searchClient').value
        document.getElementById('inputNameClient').focus()
        document.getElementById('inputNameClient').value = campoNome
        //limpar o campo de busca e remover o foco
        foco.value = ""
        foco.blur()
        //restaurar o padrão da tecla Enter
        restaurarEnter()
        //reativar os inputs das caixas de texto
        /*
        document.querySelectorAll('.bloqueio input').forEach(input => {
            input.disabled = false
        })
        */
    })
}



// Fim CRUD Read <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function excluirCliente() {
    api.deletarCliente(idCliente.value) //Passo 1 do slide
}
// Fim CRUD Delete

// Reset Form >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
api.resetarFormulario((args) => {
    resetForm()
})

function resetForm() {
    //recarregar a página
    location.reload()
}

// Fim - reset form <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<