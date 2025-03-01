/**
 * Modelo de dados (Fornecedores)
 */

const { model, Schema } = require('mongoose')

const fornecedorSchema = new Schema({
    nomeFornecedor: {
        type: String
    },
    cnpjFornecedor: {
        type: String
    },
    siteFornecedor: {
        type: String
    }
})

module.exports = model('Fornecedores', fornecedorSchema)