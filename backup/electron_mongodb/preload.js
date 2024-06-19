// Inserir data no rodapé da página
window.addEventListener('DOMContentLoaded', () => {
    const dataAtual = document.getElementById('data').innerHTML = obterDataAtual()
})

function obterDataAtual() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}