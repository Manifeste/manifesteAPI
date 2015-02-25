/**
 * O Router tem 3 responsabilidades básicas:
 * 		1 - Gerar uma lista de rotas a ser adi-
 * 		cionada à aplicação
 * 		2 - Tratar a requisição, traduzindo as
 * 		informações recebidas do usuário para um
 * 		formato que faça sentido para o Controller
 * 		3 - Passar a requisição para o Controller
 * 		responsável por ela
 */

var OcorrenciaController = require('./OcorrenciaController');
var CategoriasController = require('../categorias/CategoriasController');
var Joi = require('joi');
var Boom = require('boom');
var Config = require('config');

var filterList = ['id', 'titulo', 'descricao', 'loc', 'encerrado', 'comentarios',
					'interessados', 'authorID'];

function getResourcePath(){
	return '/' + Config.endpoints['ocorrencias'];
}

function getOcorrenciaURI(ocorrenciaID){
	return [
		Config.url,
		Config.endpoints['ocorrencias'],
		ocorrenciaID
	].join('/');
}

var Router = [];

/*
	Adicionar nova Ocorrência
*/
Router.push({
	method: 'POST',
	path: getResourcePath(),
	config: {
		validate: {
			payload: {
				titulo: Joi.string().required(),
				descricao: Joi.string().required(),
				longitude: Joi.number().required(),
				latitude: Joi.number().required(),
				categoria: Joi.string().required()
			}
		}
	},
	handler: function( req, reply ){
		var lat = req.payload.latitude;
		var lon = req.payload.longitude;
		var categoriaID = req.payload.categoria;

		var ocorrencia = {
			titulo: req.payload.titulo,
			descricao: req.payload.descricao,
			loc: {
				type: "Point",
				coordinates: [lon, lat]
			},
			encerrado: false,
			authorID: req.auth.credentials.userID,
			categoria: categoriaID
		};

		CategoriasController
			.$where({
				_id: categoriaID
			})
			.$read()
			.then(function( categoria ){
				if( !categoria ){
					reply( Boom.notFound( 'categoria não encontrada' ) );
				} else {
					return OcorrenciaController.$create( ocorrencia )
				}
			})
			.then(function( ocorrencia ){
				reply({
					success: true
				}).header( 'Location', getOcorrenciaURI( ocorrencia._id ) );
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

/*
	Listar Ocorrências
*/

Router.push({
	method: 'GET',
	path: getResourcePath(),
	config: {
		validate: {
			query: Joi.object().keys({
				latitude: Joi.number(),
				longitude: Joi.number(),
				categoria: Joi.string()
			}).and('latitude', 'longitude')
		}
	},
	handler: function( req, reply ){
		var latitude = req.query.latitude;
		var longitude = req.query.longitude;
		var categoria = req.query.categoria;

		var query = {};
		if( latitude ){
			query['loc'] = {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [longitude, latitude]
					},
					$maxDistance: 1000 //meters
				}
			}
		}
		if( categoria ){
			query['categoria'] = categoria;
		}

		OcorrenciaController
			.$where(query)
			.$query()
			.then(function( docs ){
				console.log( docs );
				reply( docs );
			})
			.fail(function( err ){
				console.log( err );
			});
	}
});

/*
	Deletar Ocorrência
*/
Router.push({
	method: 'DELETE',
	path: getResourcePath() + '/{ocorrenciaID}',
	config: {
		validate: {
			params: {
				ocorrenciaID: Joi.string().required()
			}
		}
	},
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);

		OcorrenciaController
			.$where({
				_id: ocorrenciaID
			})
			.$read()
			.then(function( ocorrencia ){
				if( !ocorrencia ){
					reply( Boom.notFound() )
				} else if( ocorrencia.authorID !== req.auth.credentials.userID ){
					reply( Boom.unauthorized() );
				} else {
					OcorrenciaController
						.$where({
							_id: ocorrenciaID
						})
						.$delete()
						.then(function( qtd ){
							reply({
								success: true
							});
						})
						.fail(function(){
							reply( Boom.badImplementation() );
						});
				}
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
});

/*
	Retornar Ocorrências do Usuário logado
*/
Router.push({
	method: 'GET',
	path: getResourcePath() + '/me',
	config: {
		validate: {
			query: {
				// Aceita somente letras, números e vírgula
				filter: Joi.string().regex(/^[a-zA-Z0-9,]+$/)
			}
		}
	},
	handler: function(req,reply){
		var filter = encodeURIComponent( req.query.filter );
		var fields;

		if( !filter ){
			fields = filterList;
		} else {
			fields = filter.split(',').filter(function(currentValue){
				if(filterList.indexOf(currentValue) != -1){
					return currentValue;
				}
				return '';
			});
		}

		OcorrenciaController
			.$where({
				authorID: req.auth.credentials.userID
			})
			.$query()
			.then(function( ocorrencias ){
				reply( ocorrencias );
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
})

/*
	Retornar Detalhes de Ocorrência
*/
Router.push({
	method: 'GET',
	path: getResourcePath() + '/{ocorrenciaID}',
	config: {
		validate: {
			params: {
				ocorrenciaID: Joi.string().max(12).min(12).required()
			},
			query: {
				// Aceita somente letras, números e vírgula
				filter: Joi.string().regex(/^[a-zA-Z0-9,]+$/)
			}
		}
	},
	handler: function( req, reply ){
		var filter = encodeURIComponent( req.query.filter );
		var fields;

		if( !filter ){
			fields = filterList;
		} else {
			fields = filter.split(',').filter(function(currentValue){
				if(filterList.indexOf(currentValue) != -1){
					return currentValue;
				}
				return '';
			});
		}

		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		OcorrenciaController
			.$where({
				_id: ocorrenciaID
			})
			.$read( fields )
			.then(function( ocorrencia ){
				if( !ocorrencia ){
					reply( Boom.notFound() );
				} else {
					reply( ocorrencia );
				}
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
});

/*
	Editar Descrição de Ocorrência
*/
Router.push({
	method: 'PATCH',
	path: getResourcePath() + '/{ocorrenciaID}',
	config: {
		validate: {
			payload: {
				descricao: Joi.string().required()
			}
		}
	},
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		var descricao = req.payload.descricao;

		OcorrenciaController
			.$where({
				_id: ocorrenciaID
			})
			.$update({
				descricao: descricao
			})
			.then(function( ocorrencia ){
				if( !ocorrencia ){
					reply( Boom.notFound() );
				} else {
					reply({
						success: true,
						id: doc._id
					}).header( 'Location', getOcorrenciaURI( ocorrencia._id ) );
				}
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
});

/*
	Mudar Categoria da Ocorrência
*/
Router.push({
	method: 'PATCH',
	path: getResourcePath() + '/{ocorID}/categorias',
	config: {
		validate: {
			payload: {
				categoriaID: Joi.string().required()
			}
		}
	},
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent(req.params.ocorID);
		var categoriaID = req.payload.categoriaID;

		CategoriasController
			.$where({
				_id: categoriaID
			})
			.$read()
			.then(function( categoria ){
				if( !categoria ){
					reply( Boom.notFound( 'categoria não encontrada' ) );
				} else {
					return OcorrenciaController
								.$where({
									_id: ocorrenciaID
								})
								.$update({
									categoria: categoriaID
								});
				}
			})
			.then(function( ocorrencia ){
				reply({
					success: true
				}).header( 'Location', getOcorrenciaURI( ocorrenciaID ) );
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
})


/*
	Encerrar Ocorrência
*/
Router.push({
	method: 'POST',
	path: getResourcePath() + '/{ocorrenciaID}/encerrado',
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);

		OcorrenciaController
			.$where({
				_id: ocorrenciaID
			})
			.$encerrar()
			.then(function( numAffected ){
				if( !numAffected ){
					reply( Boom.notFound() );
				} else {
					reply({
						success: true,
						id: ocorrenciaID
					}).header( 'Location', getOcorrenciaURI( ocorrenciaID ) );
				}
			})
			.fail(function( err ){
				reply( Boom.badImplementation( err ) );
			});
	}
});

/*
	Reabrir Ocorrência
*/
Router.push({
	method: 'DELETE',
	path: getResourcePath() + '/{ocorrenciaID}/encerrado',
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);

		OcorrenciaController
			.$where({
				_id: ocorrenciaID
			})
			.$reabrir()
			.then(function( numAffected ){
				if( !numAffected ){
					reply( Boom.notFound() );
				} else {
					reply({
						success: true,
						id: ocorrenciaID
					}).header( 'Location', getOcorrenciaURI( ocorrenciaID ) );
				}
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

/*
	Postar comentários
*/

Router.push({
    method: 'POST',
    path: getResourcePath() + '/{ocorID}/comentarios',
    config: {
        validate: {
            payload: {
                comentario: Joi.string().required()
            }
        }
    },
    handler: function( req, reply ){
        var ocorID = encodeURIComponent(req.params.ocorID);
		var comment = req.payload.comentario;
		var author = req.auth.credentials.userID;

        OcorrenciaController
            .comentarios( ocorID )
            .$create({
            	texto: comment,
				authorID: author
            })
            .then(function( comentario ){
                reply({
                    success: true
                }).header( 'Location', getOcorrenciaURI( ocorID ) );
            })
            .fail(function( err ){
                reply( Boom.badImplementation() );
            });
    }
});

exports = module.exports = Router;
