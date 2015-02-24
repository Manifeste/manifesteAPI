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

var CategoriasController = require('./CategoriasController');
var Joi = require('joi');
var Config = require('config');
var Boom = require('boom');
var _ = require('lodash');


function getResourcePath(){
	return '/' + Config.endpoints['categorias'];
}

function getCategoriaURI( categoriaID ){
	return [
		Config.url,
		Config.endpoints['categorias'],
		categoriaID
	].join('/');
}

function extractCategoria ( payload ){
	var categoria = {};
	_.keys(payload).forEach(function( key ){
		if( payload[key] ){
			categoria[key] = payload[key];
		}
	});

	return categoria;
}

var Router = [];

/*
	Adicionar novo Categoria
*/
Router.push({
	method: 'POST',
	path: getResourcePath(),
	config: {
		validate: {
			payload: {
				titulo: Joi.string().required(),
				categoriaPai: Joi.string().optional()
			}
		},
		auth: 'session'
	},
	handler: function( req, reply ){
		var categoria = extractCategoria( req.payload );

		CategoriasController
			.$create( categoria )
			.then(function( doc ){
				reply({
					success: true,
					id: doc._id
				}).header( 'Location', getCategoriaURI( doc._id ) );
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'GET',
	path: getResourcePath() + '/{categoriaID}',
	handler: function( req, reply ){
		CategoriasController
			.$where({
				_id: encodeURIComponent(req.params.categoriaID)
			})
			.$read()
			.then(function( doc ){
				if( !doc ){
					reply( Boom.notFound() );
				} else {
					reply( doc );
				}
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'PATCH',
	path: getResourcePath() + '/{categoriaID}',
	config: {
		validate: {
			payload: {
				titulo: Joi.string().required(),
				categoriaPai: Joi.string().optional()
			}
		},
		auth: 'session'
	},
	handler: function( req, reply ){
		var categoria = extractCategoria( req.payload );

		CategoriasController
			.$where({
				_id: encodeURIComponent(req.params.categoriaID)
			})
			.$update(categoria)
			.then(function( doc ){
				if( !doc ){
					reply( Boom.notFound() );
				} else {
					reply({
						success: true
					}).header( 'Location', getCategoriaURI( doc._id ) );
				}
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'DELETE',
	path: getResourcePath() + '/{categoriaID}',
	config: {
		auth: 'session'
	},
	handler: function( req, reply ){
		CategoriasController
			.$where({
				_id: encodeURIComponent(req.params.categoriaID)
			})
			.$delete()
			.then(function( qtd ){
				if( qtd === 0 ){
					reply( Boom.notFound() );
				}
				else {
					reply({
						success: true
					});
				}
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'GET',
	path: getResourcePath(),
	handler: function( req, reply ){
		CategoriasController
			.$where()
			.$query()
			.then(function( docs ){
				reply( docs );
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			})
	}
});

exports = module.exports = Router;
