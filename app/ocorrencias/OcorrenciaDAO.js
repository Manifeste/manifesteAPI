/*
 * Cria o Objeto de Acesso de Dados para a coleção de Ocorrências
 * 
 * @exports Mongoose#Model Modelo de Ocorrência
 */


// Importação de dependências

var mongoose = require('mongoose'),
	Mixed = mongoose.Schema.Types.Mixed;

// Definição do Schema de Ocorrências

var Ocorrencia = mongoose.model('Ocorrencia', {
	titulo: String,
	descricao: String,
	loc: Mixed,
	categoria: String,
	encerrado: Boolean,
	interessados: Array,
	comentarios: Array,
	authorID: String
});

// Exportação do Model resultante

exports = module.exports = Ocorrencia;