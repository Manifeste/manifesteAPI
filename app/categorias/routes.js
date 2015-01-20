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

var CategoriaController = require('./CategoriaController');
var Joi = require('joi');
var Config = require('config');

function getResourcePath(){
	return '/' + Config.endpoints['categorias'];
}

var Router = [];

Router.push({
	method: 'POST',
	path: getResourcePath(),
	config: {
		validate: {
			payload: {
				titulo: Joi.string().required(),
				categoriaPai: Joi.string()
			}
		},
		auth: 'session'
	},
	handler: function(req, reply){
		var categoria = {
			titulo: req.payload.titulo
		};
		
		var categoriaPai = req.payload.categoriaPai;
		if(categoriaPai){
			categoria['categoriaPai'] = categoriaPai;
		}

		CategoriaController.create(reply, categoria);
	}
});

Router.push({
	method: 'DELETE',
	path: getResourcePath() + '/{categoriaID}',
	config: {
		validate: {
			params: {
				categoriaID: Joi.string().required()
			}
		}
	},
	handler: function(req, reply){
		var categoriaID = encodeURIComponent(req.params.categoriaID);
		CategoriaController.delete(reply, categoriaID);
	}
});

exports = module.exports = Router;