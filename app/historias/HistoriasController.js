/**
 * O Controller tem 2 responsabilidades básicas:
 * 		1 - Reagir à requisição, certificando-se
 * 		de que o servidor responde apropriadamente
 * 		ao que foi pedido
 * 		2 - Gerar e enviar a resposta apropriada
 * 		ao usuário
 */

// Faz as importações necessárias

var HistoriasDAO = require('./HistoriasDAO');
var Crude = require('make-me-crude');

// HELPER METHOD

exports = module.exports = Crude.crud({
    DAO: HistoriasDAO
});
