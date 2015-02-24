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
var OrgaosController = require('../orgaoCompetente/OrgaosController');
var Joi = require('joi');
var Boom = require('boom');
var Config = require('config');

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
	Adicionar novo Orgão
*/
Router.push({
	method: 'POST',
	path: getResourcePath() + '/{ocorID}/orgaos/{orgaoID}',
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent( req.params.ocorID );
		var orgaoID = encodeURIComponent( req.params.orgaoID );

		OrgaosController
			.$where({
				_id: orgaoID
			})
			.$read()
			.then(function( orgao ){
				if( !orgao ){
					reply( Boom.notFound( 'orgão não encontrado' ) );
				} else {
					return OcorrenciaController
								.orgaoCompetente( ocorrenciaID )
								.$create( {
									orgaoID: orgaoID
								});
				}
			})
			.then(function( ocorrenciaOrgao ){
				reply({
					success: true
				}).header( 'Location', getOcorrenciaURI( ocorrenciaID ) );
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

/*
	Remover Órgão Competente
*/
Router.push({
	method: 'DELETE',
	path: getResourcePath() + '/{ocorID}/orgaos/{orgaoID}',
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent(req.params.ocorID);
		var orgaoID 	 = encodeURIComponent(req.params.orgaoID);

		OcorrenciaController
			.orgaoCompetente( ocorrenciaID )
			.$where({
				orgaoID: orgaoID
			})
			.$delete()
			.then(function( ocorrenciaOrgao ){
				reply({
					success: true
				}).header( 'Location', getOcorrenciaURI( ocorrenciaID ) );
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

/*
	Retornar Orgãos relacionados a uma ocorrência
*/
Router.push({
	method: 'GET',
	path: getResourcePath() + '/{ocorID}/orgaos',
	handler: function( req, reply ){
		var ocorrenciaID = encodeURIComponent(req.params.ocorID);

		OcorrenciaController
			.orgaoCompetente( ocorrenciaID )
			.$query(['orgaoID', '-_id'])
			.then(function( ocorrenciaOrgaos ){
				reply( ocorrenciaOrgaos )
			})
			.fail(function( err ){
				reply( Boom.badImplementation() );
			});
	}
});

exports = module.exports = Router;
