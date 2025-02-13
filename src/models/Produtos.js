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
    }
})

module.exports = model('Produto', produtoSchema)