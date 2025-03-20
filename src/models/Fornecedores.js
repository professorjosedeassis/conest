/**
 * Modelo de dados (Fornecedores)
 */

//importação de bibliotecas
const { model, Schema } = require('mongoose')

//criação da estrutura de dados ("tabela") que será usada no banco
const fornecedorSchema = new Schema({
    nomeFornecedor: {
        type: String
    },
    cnpjFornecedor: {
        type: String,
        unique: true,
        index: true
    },
    siteFornecedor: {
        type: String
    }
},{versionKey: false})

// exportar para o main
// Para modificar o nome da coleção ("tabela"), basta modificar na linha abaixo o rótulo 'Clientes', sempre iniciando com letra maiúscula
module.exports = model('Fornecedores', fornecedorSchema)