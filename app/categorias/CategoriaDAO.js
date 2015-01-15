/*
 * Cria o Objeto de Acesso de Dados para a coleção de Categorias
 * 
 * @exports Mongoose#Model Modelo de Categorias
 */


// Importação de dependências

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Definição do Schema de Categorias

var Categoria = mongoose.model('Categoria', {
	titulo: String,
	categoriaPai: Schema.Types.ObjectId
});

// Exportação do Model resultante

exports = module.exports = Categoria;