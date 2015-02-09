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

var HistoriasController = require('./HistoriasController');
var Joi = require('joi');
var Config = require('config');
var Boom = require('boom');

function getResourcePath(){
    return '/' + Config.endpoints['historias'];
}

function getOcorrenciaURI( orgaoID ){
    return [
        Config.url,
        Config.endpoints['historias'],
        orgaoID
    ].join('/');
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
                tipo: Joi.string().required(),
                data: Joi.date().format('DD/MM/YYYY').optional(),
                historia: Joi.string().email().optional()
            }
        },
        auth: 'session'
    },
    handler: function( req, reply ){
        var historia = {
            nome: req.payload.nome,
            data: req.payload.data,
            historia: req.payload.historia
        };

        OrgaosController
            .create( historia )
            .then(function( doc ){
                reply({
                    success: true,
                    id: doc._id
                }).header( 'Location', getOcorrenciaURI( doc._id ) );
            })
            .fail(function( err ){
                reply( Boom.badImplementation() );
            });
    }
});

Router.push({
    method: 'GET',
    path: getResourcePath() + '/{histID}',
    handler: function( req, reply ){
        OrgaosController
            .read({
                _id: encodeURIComponent(req.params.histID)
            })
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
    path: getResourcePath() + '/{histID}',
    config: {
        validate: {
            payload: {
                tipo: Joi.string().optional(),
                data: Joi.date().format('DD/MM/YYYY').optional(),
                historia: Joi.string().email().optional()
            }
        },
        auth: 'session'
    },
    handler: function( req, reply ){
        var historia = {
            nome: req.payload.nome,
            data: req.payload.data,
            historia: req.payload.historia
        };

        OrgaosController
            .update({
                where: {
                    _id: encodeURIComponent(req.params.histID)
                },
                set: orgao
            })
            .then(function( doc ){
                if( !doc ){
                    reply( Boom.notFound() );
                } else {
                    reply({
                        success: true
                    }).header( 'Location', getOcorrenciaURI( doc._id ) );
                }
            })
            .fail(function( err ){
                reply( Boom.badImplementation() );
            });
    }
});

Router.push({
    method: 'DELETE',
    path: getResourcePath() + '/{histID}',
    config: {
        auth: 'session'
    },
    handler: function( req, reply ){
        OrgaosController
            .delete({
                _id: encodeURIComponent(req.params.histID)
            })
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

exports = module.exports = Router;
