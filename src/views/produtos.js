/**
 * Processo de renderização da tela de Produtos
 */

const foco = document.getElementById('searchProduct')

// Configuração inicial do formulário
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    foco.focus()    
})

// Função para manipular o evento da tecla Enter
function teclaEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        //buscarProduto()
    }
}

// Função para remover o manipulador do evento da tecla Enter
function restaurarEnter() {
    document.getElementById('frmProduct').removeEventListener('keydown', teclaEnter)
}

// manipulando o evento (tecla Enter)
document.getElementById('frmProduct').addEventListener('keydown', teclaEnter)

// Array usado nos métodos para manipulação da estrutura de dados
let arrayProduto = []

// Captura dos inputs do formulário
let formProduto = document.getElementById('frmProduct')
let idProduto = document.getElementById('inputIdProduct')
let barcodeProduto = document.getElementById('inputBarcodeProduct')
let nomeProduto = document.getElementById('inputNameProduct')
let caminhoImagemProduto = document.getElementById('pathImageProduct')

// // CRUD Create/Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
formProduto.addEventListener('submit', async (event) => {
    event.preventDefault()
    //teste de recebimento dos inputs do formulário
    console.log(idProduto.value, barcodeProduto.value, nomeProduto.value, caminhoImagemProduto.value)
    // criar um objeto
    const produto = {
        barcodePro: barcodeProduto.value,
        nomePro: nomeProduto.value,
        caminhoImagemPro: caminhoImagemProduto.value
    }
    api.novoProduto(produto)
})
// Fim CRUD Create/Update <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Fim CRUD Read <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// Fim CRUD Delete <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// Reset Form >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
api.resetarFormulario((args) => {
    resetForm()
})

function resetForm() {
    //recarregar a página
    location.reload()
}
// Fim - reset form <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<