/*
 * Cria o Objeto de Acesso de Dados para a Orgãos Competentes
 *
 * @exports Mongoose#Model Modelo de Orgãos
 */


// Importação de dependências

var mongoose = require('mongoose'),
	Mixed = mongoose.Schema.Types.Mixed;

// Definição do Schema de Orgãos Competentes

var Orgao = mongoose.model('Orgao', {
	nome: String,
	descricao: String,
	email: String,
	telefone: String,
	endereco: String
});

// Exportação do Model resultante

exports = module.exports = Orgao;
