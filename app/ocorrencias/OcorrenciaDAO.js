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
		loc: {type: Mixed, index: '2dsphere'},
		categoria: String,
		orgaos: Array,
		interessados: Array,
		historias: Array,
		comentarios: Array,
		encerrado: Boolean,
		authorID: String
});

Ocorrencia.ensureIndexes(function(err){
	console.log( err );
});

// Exportação do Model resultante

exports = module.exports = Ocorrencia;
