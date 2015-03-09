// Importação de dependências

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Definição do Schema de Categorias

var User = mongoose.model('User', {
	email: String,
	senha: String,
	nome: String,
	dataNascimento: Date,
	sobreMim: String,
	contas: Schema.Types.Mixed,
	token: String,
	ttl: Date
});

// Exportação do Model resultante

exports = module.exports = User;
