/**
 * Módulo de conexão com o banco de dados
 * Uso do framework mongoose (npm i mongoose)
 */

// importar a biblioteca
const mongoose = require('mongoose')

// definir o banco de dados (copiar a string do compass)
let url = "mongodb://admin:123%40senac@10.26.45.200:27017/"

// conectar
const conectar = async () => {
    try {
        await mongoose.connect(url)
        console.log("MongoDB conectado")
    } catch (error) {
        console.log(`Problema detectado: ${error}`)
    }
}

// desconectar
const desconectar = async () => {
    try {
        await mongoose.disconnect(url)
        console.log("MongoDB desconectado")
    } catch (error) {
        console.log(`Problema detectado: ${error}`)
    }
}

// exportar para o main os métodos conectar e desconectar
module.exports = {conectar, desconectar}