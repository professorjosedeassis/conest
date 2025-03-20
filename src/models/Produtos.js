/**
 * Modelo de dados (produtos)
 */

const { model, Schema } = require('mongoose')

const produtoSchema = new Schema({
    barcodeProduto: {
        type: String
    },
    nomeProduto: {
        type: String
    },
    caminhoImagemProduto: {
        type: String
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
},{versionKey: false})

module.exports = model('Produto', produtoSchema)