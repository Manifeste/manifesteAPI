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
    Criação de história
*/
Router.push({
    method: 'POST',
    path: getResourcePath() + '/{ocorID}/historias',
    config: {
        validate:{
            payload: {
                texto: Joi.string().required(),
                data: Joi.date().format('DD/MM/YYYY').optional()
            }
        },
        auth: 'session'
    },
    handler: function( req, reply ){
        var texto = req.payload.texto;
        var data = req.payload.data;
        var ocorrenciaID = encodeURIComponent( req.params.ocorID );

        if( !data ){
            var atual = new Date();
            var data = [
                            atual.getDate(),
                            atual.getMonth(),
                            atual.getFullYear()
                        ].join('/');
        }

        OcorrenciaController
            .historias( ocorrenciaID )
            .$create({
                texto: texto,
                data: data
            })
            .$then(function( data ){
                reply({
                    success: true
                }).header('Location', getOcorrenciaURI( ocorrenciaID ));
            })
            .fail(function(){
                reply( Boom.badImplementation() );
            });

    }
});

/*
    Deleção de história
*/
Router.push({
    method: 'DELETE',
    path: getResourcePath() + '{ocorID}/historias/{histID}',
    handler: function( req, reply ){
        var ocorrenciaID = encodeURIComponent( req.params.ocorID );
        var historiaID   = encodeURIComponent( req.params.histID );

        OcorrenciaController
            .historias( ocorrenciaID )
            .$where({
                _id: historiaID
            })
            .$delete()
            .then(function(){
                reply({
                    success: true
                }).header('Location', getOcorrenciaURI( ocorrenciaID ) );
            })
            .fail(function(){
                reply( Boom.badImplementation() );
            });
    }
});

exports = module.exports = Router;
