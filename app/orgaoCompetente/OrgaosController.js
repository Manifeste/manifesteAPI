/**
 * O Controller tem 2 responsabilidades básicas:
 * 		1 - Reagir à requisição, certificando-se
 * 		de que o servidor responde apropriadamente
 * 		ao que foi pedido
 * 		2 - Gerar e enviar a resposta apropriada
 * 		ao usuário
 */ 

// Faz as importações necessárias
 
var OrgaosDAO = require('./OrgaosDAO');
var ObjectID = require('mongoose').Types.ObjectId;
var Boom = require('boom');
var Config = require('config');

// HELPER METHOD

function getOcorrenciaURI(orgaoID){
	return [
		Config.url,
		Config.endpoints['orgaos'],
		orgaoID
	].join('/');
}

exports = module.exports = {
	create: function(reply, orgao){
		var newOrgao = new OrgaosDAO(orgao);
		
		newOrgao.save(function(err, product){
			if(err){
				return reply(Boom.badImplementation());
			}

			return reply({
				sucesso: true,
				id: product._id
			}).header('Location', getOcorrenciaURI(product._id));
		});
	}
};