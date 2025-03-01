/**
 * Processo de renderização da tela de Fornecedores
 */

// Configuração inicial do formulário
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
})

// Captura dos dados dos inputs do form
let formFornecedor = document.getElementById('frmSupplier')
let nomeFornecedor = document.getElementById('inputNameSupplier')
let cnpjFornecedor = document.getElementById('inputCNPJSupplier')
let siteFornecedor = document.getElementById('inputSiteSupplier')

// CRUD Create >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
formFornecedor.addEventListener('submit', async (event) => {
    event.preventDefault()
    const fornecedor = {
        nomeFor: nomeFornecedor.value,
        cnpjFor: cnpjFornecedor.value,
        siteFor: siteFornecedor.value
    }
    console.log(fornecedor)
    api.novoFornecedor(fornecedor)
})
// Fim CRUD Create 


// Acessar site >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function acessarSite() {
    let urlFornecedor = document.getElementById('inputSiteSupplier').value
    //console.log(urlFornecedor)
    const url = {
        url: urlFornecedor
    }
    //enviar ao main a url do site
    api.abrirSite(url)
}
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<