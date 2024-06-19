/**
 * Módulo de conexão com o banco de dados
 */

const mongoose = require('mongoose')
// obter do compass (string para conexão com o banco)
let url = "mongodb+srv://joseassis:123senac@clusterze.gdfpjsw.mongodb.net/"

//função para conectar o banco
const conectar = async () => {
    //tratamento de exceção
    try {
        await mongoose.connect(url)
        console.log("MongoDB conectado")
    } catch (error) {
        console.log("Problema detectado: ", error.message)
        throw error
    }
}

//função para desconectar o banco
const desconectar = async () => {
    try {
        await mongoose.disconnect(url)
        console.log("Desconectado do MongoDB.")
    } catch (error) {
        console.log("Problema detectado ao desconectar do banco: ", error.message)
        throw error
    }
}

//exportar o módulo -> main.js
module.exports = { conectar, desconectar }