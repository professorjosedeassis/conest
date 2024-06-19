const {model, Schema} = require('mongoose')

//criar um objeto -> modelo para coleção
//Importante: nomes dos atributos serem iguais ao objeto recebido pelo main
const tarefaSchema = new Schema({
    nome: {
        type: String
    },
    descricao: {
        type: String
    }
})

//exportar o Schema -> main
module.exports = model('Tarefa', tarefaSchema)