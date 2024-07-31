// botões
function clientes() {
    api.openClient()
}

// inserir data no rodapé da tela principal
document.getElementById('dataAtual').innerHTML = obterData()

function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

// ícone do banco de dados
api.dbMessage((event, message) => {
    console.log(message)
    if(message === "conectado") {
        document.getElementById('iconDB').src = "../public/img/dbon.png"
    } else {
        document.getElementById('iconDB').src = "../public/img/dboff.png"
    }
})