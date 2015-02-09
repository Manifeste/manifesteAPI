/**
 * O Controller tem 2 responsabilidades básicas:
 * 		1 - Reagir à requisição, certificando-se
 * 		de que o servidor responde apropriadamente
 * 		ao que foi pedido
 * 		2 - Gerar e enviar a resposta apropriada
 * 		ao usuário
 */

// Faz as importações necessárias

var CategoriaDAO = require('./CategoriaDAO');
var ObjectID = require('mongoose').Types.ObjectId;
var Boom = require('boom');
var Config = require('config');

// HELPER METHOD

function getOcorrenciaURI(categoriaID){
	return [
		Config.url,
		Config.endpoints['categorias'],
		categoriaID
	].join('/');
}

exports = module.exports = {
	create: function(reply, categoria){
		// garante que uma categoria não vai ser
		// criada se a categoria pai for inválida
		if(categoria.categoriaPai){
			if(!ObjectID.isValid(categoria.categoriaPai)){
				return reply(Boom.notFound());
			}

			CategoriaDAO.count({
				_id: ObjectID(categoria.categoriaPai)
			}, function(err, count){
				if(err)
					return reply(Boom.badImplementation());
				else if(count == 0)
					return reply(Boom.notFound());
			});
		}

		var newCategoria = new CategoriaDAO(categoria);

		newCategoria.save(function(err, product){
			if(err){
				return reply(Boom.badImplementation());
			}

			return reply({
				sucesso: true,
				id: product._id
			}).header('Location', getOcorrenciaURI + '/' + product._id);
		});
	},

	/**
	 * Deleta uma ocorrência
	 */
	delete: function(reply, categoriaID){
		CategoriaDAO.remove({ _id: ObjectID(categoriaID) },
			function(err, product, qtdDocAfetados){
				if(err){
					reply(Boom.badImplementation());
				}
				else if(qtdDocAfetados === 0){
					reply(Boom.notFound());
				} else {
					reply({
						sucesso: true
					});
				}
			}
		);
	}
};
