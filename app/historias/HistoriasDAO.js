/*
 * Cria o Objeto de Acesso de Dados para Histórias
 *
 * @exports Mongoose#Model Modelo de Orgãos
 */


// Importação de dependências

var mongoose = require('mongoose'),
    Mixed = mongoose.Schema.Types.Mixed;

// Definição do Schema de Ocorrências

var Ocorrencia = mongoose.model('Historias', {
    data: Date,
    historia: String
});

// Exportação do Model resultante

exports = module.exports = Ocorrencia;
