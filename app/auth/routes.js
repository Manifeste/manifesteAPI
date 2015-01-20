// Importa dependências
var UserController = require('./UserController');
var Joi = require('joi');
var Config = require('config');

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
	handler: function(req, reply){
		var user = {
			email: req.payload.email,
			senha: req.payload.senha,
			nome: req.payload.nome,
			dataNascimento: req.payload.dataNascimento,
			sobreMim: req.payload.sobreMim
		};
		
		UserController.create(req, reply, user);
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
		
		UserController.login(req, reply, email, senha);
	}
});

Router.push({
	method: 'POST',
	path: getResourcePath() + '/logoff',
	handler: function(req, reply){
		UserController.logoff(req, reply);
	}
});

module.exports = exports = Router;
