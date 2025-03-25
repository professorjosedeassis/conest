/**
 * Módulo de conexão com o banco de dados
 * Uso do mongoose
 */

const mongoose = require('mongoose')

// definir a URL e autenticação do banco de dados (acrescentar ao final da url um nome para o banco de dados)
const url = ''

// validação (evitar abertura de várias conexões)
let conectado = false

const conectar = async () => {
    // Só estabelecer uma conexão se não estiver conectado
    if (!conectado) {
        try {
            // a linha abaixo abre a conexão com o MongoDB
            await mongoose.connect(url)
            conectado = true //sinalizar que o banco está conectado
            console.log("MongoDB conectado")
            return true
        } catch (error) {
            console.log(`Erro ao conectar ao MongoDB: ${error}`)
            return false
        }
    }
}

// desconectar
const desconectar = async () => {
    if (conectado) {
        try {
            // a linha abaixo encerra a conexão com o MongoDB
            await mongoose.disconnect(url)
            conectado = false //sinalizar que o banco não está conectado
            console.log("MongoDB desconectado")
            return true
        } catch (error) {
            console.log(`Erro ao desconectar do MongoDB: ${error}`)
            return false
        }
    }
}

// exportar para o main as funções desejadas
module.exports = { conectar, desconectar }