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

var OrgaoController = require('./OrgaosDAO');
var Joi = require('joi');
var Config = require('config');

function getResourcePath(){
	return '/' + Config.endpoints['orgao'];
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
			}
		},
		auth: 'session'
	},
	handler: function(req, reply){
		var orgao = {
			nome: req.payload.titulo,
			descricao: req.payload.descricao,
			email: req.payload.email,
			telefone: req.payload.telefone,
			endereco: req.payload.endereco
		};

		OrgaoController.create(reply, orgao);
	}
});

exports = module.exports = Router;