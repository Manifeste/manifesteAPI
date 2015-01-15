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


// HELPER METHOD

function getOcorrenciaURI(ocorrenciaID){
	return [
		Config.url,
		Config.endpoints['ocorrencias'],
		ocorrenciaID
	].join('/');
}

// Cria e exporta o Controller

exports = module.exports = {
	/**
	 * Cria uma nova ocorrência
	 * 
	 * @method create
	 * @params ocorrencia {Object} Ocorrencia a ser adicionada
	 * @params ocorrencia.titulo {String} Título da Ocorrência
	 * @params ocorrencia.descricao {String} Descrição da Ocorrência
	 * @params ocorrencia.loc {GeoJSON} Localização da Ocorrência
	 * @params ocorrencia.encerrado {Boolean} Define se a Ocorrência já foi encerrada ou não
	 */ 
	create: function(reply, ocorrencia){
		var novaOcorrencia = new OcorrenciaDAO(ocorrencia);
		novaOcorrencia.save(function(err, product){
			if(err){
				reply(Boom.badImplementation());
			} else {
				reply({
					sucesso: true,
					id: product._id
				}).header('Location', getOcorrenciaURI(product._id));	
			}
		});
	},
	
	/**
	 * Deleta uma ocorrência
	 */ 
	delete: function(reply, ocorrenciaID){
		OcorrenciaDAO.remove({ _id: ObjectID(ocorrenciaID) },
			function(err, product, qtdDocAfetados){
				if(err){
					reply(Boom.badImplementation());
				}
				else if(qtdDocAfetados === 0){
					reply(Boom.notFound());
				} else {
					reply({
						sucesso: true
					});
				}
			}
		);
	},
	
	read: function(reply, ocorrenciaID, fields){
		OcorrenciaDAO.where({
			_id: ObjectID(ocorrenciaID)
		}).select(fields).findOne(
			function(err, product){
				if(err){
					reply(Boom.badImplementation());
				}
				else if(!product){
					reply(Boom.notFound());
				} else {
					if(product.loc){
						product.longitude = product.loc.coordinates[0];
						product.latitude = product.loc.coordinates[1];

						delete product.loc;
					}

					reply(product);
				}
			}
		);
	},
	
	readMine: function(reply, authorID, fields){
		OcorrenciaDAO.
			where({
				authorID: authorID,
			}).select(fields).find(
				function(err, product){
					if(err){
						reply(Boom.badImplementation());
					}
					else if(!product){
						reply(Boom.notFound());
					} else {
						if(product.loc){
							product.longitude = product.loc.coordinates[0];
							product.latitude = product.loc.coordinates[1];

							delete product.loc;
						}

						reply(product);
					}
				}
			);
	},
	
	updateDescrição: function(reply, ocorrenciaID, descricao){
		OcorrenciaDAO.where({
			_id: ObjectID(ocorrenciaID)
		}).update({
			$set: {descricao: descricao}
		}, function(err, numAffected){
			if(err){
				reply(Boom.badImplementation());
			} else if(!numAffected){
				reply(Boom.notFound());
			} else {
				reply({
					sucesso: true
				}).header('Location', getOcorrenciaURI(ocorrenciaID));
			}
		});
	},
	
	comentar: function(reply, ocorrenciaID, comentario){
		OcorrenciaDAO.where({
			_id: ObjectID(ocorrenciaID)
		}).update({
			$push: {comentarios: comentario}
		}, function(err, numAffected){
			console.log(numAffected);
			
			if(err){
				reply(Boom.badImplementation());
			} else if(!numAffected){
				reply(Boom.notFound());
			} else {
				reply({
					sucesso: true
				}).header('Location', getOcorrenciaURI(ocorrenciaID));
			}
		});
	},
	
	encerrar: function(reply, ocorrenciaID){
		OcorrenciaDAO.where({
			_id: ObjectID(ocorrenciaID)
		}).update({
			$set: {encerrado: true}
		}, function(err, numAffected){
			if(err){
				reply(Boom.badImplementation());
			} else if(!numAffected){
				reply(Boom.notFound());
			} else {
				reply({
					sucesso: true
				}).header('Location', getOcorrenciaURI(ocorrenciaID));
			}
		});
	},
	
	reabrir: function(reply, ocorrenciaID){
		OcorrenciaDAO.where({
			_id: ObjectID(ocorrenciaID)
		}).update({
			$set: {encerrado: false}
		}, function(err, numAffected){
			if(err){
				reply(Boom.badImplementation());
			} else if(!numAffected){
				reply(Boom.notFound());
			} else {
				reply({
					sucesso: true
				}).header('Location', getOcorrenciaURI(ocorrenciaID));
			}
		});
	}
};
