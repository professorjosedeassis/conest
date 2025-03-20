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
        buscarProduto()
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
let imagem = document.getElementById('imageProductPreview')

//variável usada para armazenar o caminho da imagem
let caminhoImagem

// CRUD Create/Update >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// solicitar ao main o uso do explorador de arquivos e armazenar o caminho da imagem selecionada na variável caminhoImagem
async function uploadImage() {
    caminhoImagem = await api.selecionarArquivo()
    console.log(caminhoImagem)
    //correção BUG seleção de imagem
    if (caminhoImagem) {
        imagem.src = `file://${caminhoImagem}`
    }
    btnCreate.focus() //correção de BUG (teclaEnter)
}

formProduto.addEventListener('submit', async (event) => {
    event.preventDefault()
    //teste de recebimento dos inputs do formulário (passo 1)
    console.log(barcodeProduto.value, nomeProduto.value, caminhoImagem)
    // criar um objeto
    // caminhoImagemPro: caminhoImagem ? caminhoImagem : "" 
    // ? : (operador ternário (if else)) correção de BUG se não existir caminho da imagem (se nenhuma imagem selecionada) enviar uma string vazia ""

    // Estratégia usada para diferenciar adicionar/editar (se existir idProduto )

    if (idProduto.value === "") {
        const produto = {
            barcodePro: barcodeProduto.value,
            nomePro: nomeProduto.value,
            caminhoImagemPro: caminhoImagem ? caminhoImagem : ""
        }
        api.novoProduto(produto)
    } else {
        const produto = {
            idPro: idProduto.value,
            barcodePro: barcodeProduto.value,
            nomePro: nomeProduto.value,
            caminhoImagemPro: caminhoImagem ? caminhoImagem : ""
        }
        api.editarProduto(produto)
    }
})
// Fim CRUD Create/Update <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Read >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function buscarProduto() {
    let barcode = document.getElementById('searchProduct').value
    console.log(barcode) // teste passo 1 fluxo (slides)
    //validação
    if (barcode === "") {
        api.validarBusca()
        foco.focus()
    } else {
        api.buscarProduto(barcode) //Passo 2 fluxo (slides)
        // recebimento dos dados do produto
        api.renderizarProduto((event, dadosProduto) => {
            //teste do passo 5
            console.log(dadosProduto)
            //Passo 6 renderização dos dados do produto
            const produtoRenderizado = JSON.parse(dadosProduto)
            arrayProduto = produtoRenderizado
            // percorrer o vetor de produtos extrair os dados e setar(preencher) os campos do formulário e a imagem
            arrayProduto.forEach((p) => {
                document.getElementById('inputIdProduct').value = p._id
                document.getElementById('inputBarcodeProduct').value = p.barcodeProduto
                document.getElementById('inputNameProduct').value = p.nomeProduto
                //######################### Renderizar imagem
                //validação(imagem não é campo obrigatório)
                //se existir imagem cadastrada
                if (p.caminhoImagemProduto) {
                    imagem.src = p.caminhoImagemProduto
                }
                //data formatada para pt-BR
                const dataCadastrada = p.dataCadastro
                const dataFormatada = new Date(dataCadastrada).toLocaleDateString("pt-BR")
                document.getElementById('dataProduct').value = dataFormatada
                //limpar o campo de busca, remover o foco e desativar a busca
                foco.value = ""
                foco.disabled = true
                //liberar os botões editar e excluir e bloquer o botão adicionar
                document.getElementById('btnUpdate').disabled = false
                document.getElementById('btnDelete').disabled = false
                document.getElementById('btnCreate').disabled = true
                //restaurar a tecla Enter
                restaurarEnter()
            })

        })
    }
}

//setar o campo do código de barras (produto não cadastrado)
api.setarBarcode(() => {
    //setar o barcode do produto
    let campoBarcode = document.getElementById('searchProduct').value
    document.getElementById('inputBarcodeProduct').value = campoBarcode
    // limpar o campo de busca e remover o foco
    foco.value = ""
    document.getElementById('inputNameProduct').focus()
    // restaurar a tecla enter (associar ao botão adicionar)
    restaurarEnter()
})

// Fim CRUD Read <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


// CRUD Delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function excluirProduto() {
    console.log(idProduto.value) //Passo 1 (fluxo-slide)
    api.deletarProduto(idProduto.value) //Passo 2 (fluxo-slide)
}
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