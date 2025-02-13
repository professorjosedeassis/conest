/**
 * Processo de renderização da tela de Fornecedores
 */

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