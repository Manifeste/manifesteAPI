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
var Joi = require('joi');
var Config = require('config');

var filterList = ['id', 'titulo', 'descricao', 'loc', 'encerrado', 'comentarios',
					'interessados', 'authorID'];

function getResourcePath(){
	return '/' + Config.endpoints['ocorrencias'];
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
				latitude: Joi.number().required()
			}
		},
		auth: 'session'
	},
	handler: function(req, reply){
		var lat = req.payload.latitude;
		var lon = req.payload.longitude;

		var ocorrencia = {
			titulo: req.payload.titulo,
			descricao: req.payload.descricao,
			loc: {
				type: "Point",
				coordinates: [lon, lat]
			},
			encerrado: false,
			authorID: req.auth.credentials.userID
		};

		OcorrenciaController.create(reply, ocorrencia);
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
		},
		auth: 'session'
	},
	handler: function(req, reply){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		OcorrenciaController.delete(reply, ocorrenciaID, req.auth.credentials.userID);
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
		},
		auth: 'session'
	},
	handler: function(req,reply){
		var filter = req.query.filter;
		var fields = "";
		
		if(!filter){
			fields = filterList.join(' ');
		} else {
			fields = filter.split(',').filter(function(currentValue){
				if(filterList.indexOf(currentValue) != -1){
					return currentValue;
				}
				return '';
			}).join(' ');
		}
		
		var authorID = req.auth.credentials.userID;
		OcorrenciaController.readMine(reply, authorID, fields);
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
				ocorrenciaID: Joi.string().required()
			},
			query: {
				// Aceita somente letras, números e vírgula
				filter: Joi.string().regex(/^[a-zA-Z0-9,]+$/)
			}
		}
	},
	handler: function(req, reply){
		var filter = req.query.filter;
		var fields = "";
		
		if(!filter){
			fields = filterList.join(' ');
		} else {
			fields = filter.split(',').filter(function(currentValue){
				if(filterList.indexOf(currentValue) != -1){
					return currentValue;
				}
				return '';
			}).join(' ');
		}
		
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		OcorrenciaController.read(reply, ocorrenciaID, fields);
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
	handler: function(req, reply){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		var descricao = req.payload.descricao;
		
		OcorrenciaController.updateDescrição(reply, ocorrenciaID, descricao);
	}
});


/*
	Encerrar Ocorrência
*/
Router.push({
	method: 'POST',
	path: getResourcePath() + '/{ocorrenciaID}/encerrado',
	handler: function(req, reply){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		
		OcorrenciaController.encerrar(reply, ocorrenciaID);
	}
});

/*
	Reabrir Ocorrência
*/
Router.push({
	method: 'DELETE',
	path: getResourcePath() + '/{ocorrenciaID}/encerrado',
	handler: function(req, reply){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);

		OcorrenciaController.reabrir(reply, ocorrenciaID);
	}
});

/*
	Adicionar Comentário à Ocorrência
*/
Router.push({
	method: 'POST',
	path: getResourcePath() + '/{ocorrenciaID}/comentarios',
	config: {
		validate: {
			payload: {
				comentario: Joi.string().required()	
			}
		},
		auth: 'session'
	},
	handler: function(req, reply){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		var comentario = {
			texto: req.payload.comentario,
			authorID: req.auth.credentials.userID
		};
			
		OcorrenciaController.comentar(reply, ocorrenciaID, comentario);
	}
});

/*
	Declarar Interesse em Ocorrência
*/
Router.push({
	method	: 'POST',
	path 	: getResourcePath() + '/{ocorrenciaID}/interesse',
	config 	: {
		auth: 'session'
	},
	handler : function(req, reply){
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		var userID 		 = req.auth.credentials.userID;

		OcorrenciaController.declararInteresse(reply, ocorrenciaID, userID);
	}
});

Router.push({
	method: 'POST',
	path  : getResourcePath() + '{ocorrenciaID}/orgao/{orgaoID}',
	config: {
		validate: {
			payload: {
				orgaoID: Joi.string().required()
			}
		},
		auth 	: 'session'
	},
	handler: function (req, reply) {
		var ocorrenciaID = encodeURIComponent(req.params.ocorrenciaID);
		var orgaoID 	 = encodeURIComponent(req.params.orgaoID);

		OcorrenciaController.addOrgao(reply, ocorrenciaID, orgaoID);
	}
});

exports = module.exports = Router;