/**
 * Processo de renderização
 * Clientes
 */

// mudar propriedades do documento ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("inputSearch").focus() //foco ao iniciar
    btnCreate.disabled = true
    btnUpdate.disabled = true
    btnDelete.disabled = true
})

// Alterar comportamento do Enter ao enviar os dados do formulário
document.getElementById("frmClient").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault() // desativar o comportamento padrão
        buscarCliente() //usar o Enter para executar uma função
    }
})

// CRUD - Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// captura dos inputs do formulário
let formCliente = document.getElementById('frmClient')
let nomeCliente = document.getElementById('inputNameClient')
let foneCliente = document.getElementById('inputPhoneClient')
let emailCliente = document.getElementById('inputEmailClient')
// evento associado ao botão adicionar
formCliente.addEventListener("submit", async (event) => {
    event.preventDefault() //evitar o comportamento padrão de envio de um formulário
    console.log(formCliente.value, nomeCliente.value, foneCliente.value, emailCliente.value)
    const cliente = {
        nomeCli: nomeCliente.value,
        foneCli: foneCliente.value,
        emailCli: emailCliente.value
    }
    api.newClient(cliente)
    formCliente.reset()
})
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRud Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// vetor usado na renderização dos dados
let arrayCliente = []
// buscar o cliente pelo nome
function buscarCliente() {
    let nomeCliente = document.getElementById('inputSearch').value
    // validação de campo obrigatório
    if (nomeCliente === "") {
        api.infoSearchClient() //aviso e UX
    } else {
        api.searchClient(nomeCliente) //busca pelo nome
    }
}
// Foco no campo de busca - UX
api.focusClient(() => {
    document.getElementById('inputSearch').focus()
})
// Setar Nome do cliente - UX
api.nameClient(() => {
    let setarNomeCliente = document.getElementById('inputSearch').value
    document.getElementById('inputNameClient').value = setarNomeCliente
    document.getElementById('inputSearch').value = ""
    document.getElementById('inputSearch').blur() //remover o foco
    btnRead.disabled = true
    btnCreate.disabled = false
})
// Limpar busca - UX
api.clearSearch(() => {
    document.getElementById('inputSearch').value = ""
    document.getElementById('inputSearch').focus()
})
// Receber do main.js os dados do cliente
api.dataClient((event, dadosCliente) => {
    arrayCliente = JSON.parse(dadosCliente)
    console.log(arrayCliente)
    //percorrer o array e setar os campos do form
    arrayCliente.forEach((c) => {
        document.getElementById('inputClientId').value = c._id
        document.getElementById('inputNameClient').value = c.nomeCliente
        document.getElementById('inputPhoneClient').value = c.foneCliente
        document.getElementById('inputEmailClient').value = c.emailCliente
        //limpar caixa de busca
        document.getElementById("inputSearch").value = ""
        //remover o foco da caixa de busca
        document.getElementById("inputSearch").blur()
        //desativar os botão adicionar e buscar
        document.getElementById("btnCreate").disabled = true
        document.getElementById("btnRead").disabled = true
        // ativar os botões update e delete
        document.getElementById("btnUpdate").disabled = false
        document.getElementById("btnDelete").disabled = false
    })
})
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// Reset Form >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function resetForm() {
    document.getElementById('inputSearch').focus()
    btnCreate.disabled = true
    btnRead.disabled = false
    btnUpdate.disabled = true
    btnDelete.disabled = true
}
//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<