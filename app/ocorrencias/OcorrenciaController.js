/**
 * O Controller tem 2 responsabilidades básicas:
 * 		1 - Reagir à requisição, certificando-se
 * 		de que o servidor responde apropriadamente
 * 		ao que foi pedido
 * 		2 - Gerar e enviar a resposta apropriada
 * 		ao usuário
 */

// Faz as importações necessárias

var OcorrenciaDAO = require('./OcorrenciaDAO');
var ObjectID = require('mongoose').Types.ObjectId;
var Boom = require('boom');
var Config = require('config');
var Crude = require('make-me-crude');
var q = require('q');


// HELPER METHOD

function getOcorrenciaURI(ocorrenciaID){
	return [
		Config.url,
		Config.endpoints['ocorrencias'],
		ocorrenciaID
	].join('/');
}

// Cria e exporta o Controller

exports = module.exports = Crude.crud({
	DAO: OcorrenciaDAO,
	custom: {
		encerrar: {
			handler: function( payload, query, DAO ){
				var deferred = q.defer();

				DAO
					.update(
						query,
						{
							$set: {
								encerrado: true
							}
						},
						function( err, numAffected ){
						if( err ){
							deferred.reject( err );
						} else {
							deferred.resolve( numAffected );
						}
					});

				return deferred.promise;
			}
		},
		reabrir: {
			handler: function( payload, query, DAO ){
				var deferred = q.defer();

				DAO
					.update(
						query,
						{
							$set: {
								encerrado: false
							}
						},
						function( err, numAffected ){
						if( err ){
							deferred.reject( err );
						} else {
							deferred.resolve( numAffected );
						}
					});

				return deferred.promise;
			}
		}
	},
	subCrud: {
		interessados: {
			attribute: 'interessados'
		},
		historias: {
				attribute: 'historias'
		},
		comentarios: {
			attribute: 'comentarios'
		},
		orgaoCompetente: {
			attribute: 'orgaos'
		}
	}
});
