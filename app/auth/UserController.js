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

// HELPER METHOD

function getResourceURI(userID){
	return [
		Config.url,
		Config.endpoints['auth'],
		userID
	].join('/');
}

exports = module.exports = {
	create: function(req, reply, user){
		// Impede a criação de dois usuários com o mesmo e-mail
		UserDAO.count({email: user.email},
			function(err,count){
				if(count != 0)
					return reply(Boom.badRequest('O email está em uso'));
			}
		);

		user.senha = sha1(user.senha);

		var newUser = new UserDAO(user);
		newUser.save(function(err, product){
			if(err){
				reply(Boom.badImplementation());
			}
			
			SessionController.createSession(product._id);
			
			reply({
				sucesso: true,
				id: product._id
			}).header('Location', getResourceURI(product._id));
		});
	},

	read: function(reply, userID, fields){
		UserDAO.where({
			_id: ObjectID(userID)
		}).select(fields).findOne(
			function(err, product){
				if(err){
					reply(Boom.badImplementation());
				}
				else if(!product){
					reply(Boom.notFound());
				} else {
					reply(product);
				}
			}
		);
	},

	login: function(req, reply, email, senha){
		UserDAO.find({
			email: user.email,
			senha: sha1(user.senha)
		}, function(err, product){
			if(err){
				return reply(Boom.badImplementation());
			} else if(!product) {
				return reply(Boom.unauthorized());
			} else {
				SessionController.login(req, product._id)

				return reply({
					sucesso: true
				}).header('Location', getResourceURI(product._id));
			}
		});
	},

	logoff: function(req, reply){
		SessionController.logoff(req);
	}

};