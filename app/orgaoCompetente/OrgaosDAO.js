/*
 * Cria o Objeto de Acesso de Dados para a Orgãos Responsáveis
 * 
 * @exports Mongoose#Model Modelo de Orgãos
 */


// Importação de dependências

var mongoose = require('mongoose'),
	Mixed = mongoose.Schema.Types.Mixed;

// Definição do Schema de Ocorrências

var Ocorrencia = mongoose.model('Orgao', {
	nome: String,
	descricao: String,
	email: String,
	telefone: String,
	endereco: String
});

// Exportação do Model resultante

exports = module.exports = Ocorrencia;