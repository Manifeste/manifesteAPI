// Importa dependências
var UserController = require('./UserController');
var Joi = require('joi');
var Boom = require('boom');
var Config = require('config');
var randomToken = require('random-token');
var sha1 = require('sha1');

/*
	Centraliza a definição do path
		Retorna: /auth
*/
function getResourcePath(){
	return '/' + Config.endpoints['auth'];
}

/*
*/
var Router = [];

Router.push({
	method: 'POST',
	path: getResourcePath() + '/signup',
	config: {
		validate: {
			payload: {
				email: Joi.string().email().required(),
				senha: Joi.string().required(),
				nome: Joi.string().optional(),
				dataNascimento: Joi.date().format('DD/MM/YYYY').optional(),
				sobreMim: Joi.string().optional()
			}
		}
	},
	handler: function( req, reply ){
		UserController
			.$create({
				email: req.payload.email,
				senha: req.payload.senha,
				nome: req.payload.nome,
				dataNascimento: req.payload.dataNascimento,
				sobreMim: req.payload.sobreMim
			})
			.then(function( user ){
				var newToken = randomToken( 16 );

				UserController
					.$where({
						_id: user._id
					})
					.$update({
						token: newToken
					})
					.then(function(){
						reply({
							token: newToken
						});
					});
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'POST',
	path: getResourcePath() + '/login',
	config: {
		validate: {
			payload: {
				email: Joi.string().required(),
				senha: Joi.string().required()
			}
		}
	},
	handler: function(req, reply){
		var email = req.payload.email;
		var senha = req.payload.senha;

		UserController
			.$where({
				email: email,
				senha: sha1(senha)
			})
			.$read()
			.then(function( user ){
				var newToken = randomToken( 16 );

				if( !user ){
					reply( Boom.unauthorized() );
				} else {
					UserController
						.$where({
							_id: user._id
						})
						.$update({
							token: newToken
						})
						.then(function( count ){
							if( count ){
								reply({
									token: newToken
								});
							}
						});
				}
			})
			.fail(function(){
				reply( Boom.badImplementation() );
			});
	}
});

Router.push({
	method: 'POST',
	path: getResourcePath() + '/logoff',
	handler: function(req, reply){

	}
});

module.exports = exports = Router;
