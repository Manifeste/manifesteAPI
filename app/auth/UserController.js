/**
 * O Controller tem 2 responsabilidades básicas:
 * 		1 - Reagir à requisição, certificando-se
 * 		de que o servidor responde apropriadamente
 * 		ao que foi pedido
 * 		2 - Gerar e enviar a resposta apropriada
 * 		ao usuário
 */

// Faz as importações necessárias

var UserDAO = require('./UserDAO');
var ObjectID = require('mongoose').Types.ObjectId;
var Boom = require('boom');
var sha1 = require('sha1');
var Config = require('config');
var SessionController = require('./SessionController');
var Q = require('q');

// HELPER METHOD

function getResourceURI(userID){
	return [
		Config.url,
		Config.endpoints['auth'],
		userID
	].join('/');
}

var Crude = require('make-me-crude');

exports = module.exports = Crude.crud({
	DAO: UserDAO
});
