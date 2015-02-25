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

var OrgaosController = require('./OrgaosController');
var Joi = require('joi');
var Config = require('config');
var Boom = require('boom');
var _ = require('lodash');

var filterList = ['_id', 'nome', 'descricao', 'email', 'telefone', 'endereco'];

function getResourcePath(){
	return '/' + Config.endpoints['orgaos'];
}

function getOrgaoURI( orgaoID ){
	return [
		Config.url,
		Config.endpoints['orgaos'],
		orgaoID
	].join('/');
}

function extractOrgao ( payload ){
	var orgao = {};
	_.keys(payload).forEach(function( key ){
		if( payload[key] ){
			orgao[key] = payload[key];
		}
	});

	return orgao;
}

var Router = [];

/*
	Adicionar novo Orgao
*/
Router.push({
	method: 'POST',
	path: getResourcePath(),
	config: {
		validate: {
			payload: {
				nome: Joi.string().required(),
				descricao: Joi.string().optional(),
				email: Joi.string().email().optional(),
				telefone: Joi.string().alphanum().optional(),
				endereco: Joi.string().optional()
			}
		}
	},
	handler: function( req, reply ){
		var orgao = extractOrgao( req.payload );

		OrgaosController
			.$create( orgao )
			.then(function( doc ){
				reply({
					success: true,
					id: doc._id
				}).header( 'Location', getOrgaoURI( doc._id ) );
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'GET',
	path: getResourcePath() + '/{orgaoID}',
	handler: function( req, reply ){
		OrgaosController
			.$where({
				_id: encodeURIComponent(req.params.orgaoID)
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
	path: getResourcePath() + '/{orgaoID}',
	config: {
		validate: {
			payload: {
				nome: Joi.string().optional(),
				descricao: Joi.string().optional(),
				email: Joi.string().email().optional(),
				telefone: Joi.string().alphanum().optional(),
				endereco: Joi.string().optional()
			}
		}
	},
	handler: function( req, reply ){
		var orgao = extractOrgao( req.payload );

		OrgaosController
			.$where({
				_id: encodeURIComponent(req.params.orgaoID)
			})
			.$update(orgao)
			.then(function( doc ){
				if( !doc ){
					reply( Boom.notFound() );
				} else {
					reply({
						success: true
					}).header( 'Location', getOrgaoURI( doc._id ) );
				}
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'DELETE',
	path: getResourcePath() + '/{orgaoID}',
	handler: function( req, reply ){
		OrgaosController
			.$where({
				_id: encodeURIComponent(req.params.orgaoID)
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
		var filter = encodeURIComponent( req.query.filter );
		var fields;

		if(!filter){
			fields = filterList;
		} else {
			fields = filter.split(',').filter(function(currentValue){
				if(filterList.indexOf(currentValue) != -1){
					return currentValue;
				}
				return '';
			});
		}

		OrgaosController
			.$where()
			.$query( fields )
			.then(function( docs ){
				reply( docs );
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			})
	}
});

exports = module.exports = Router;
