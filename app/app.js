/*
	Arquivo principal da API.
*/

// Importa dependências
var Hapi = require('hapi');
var server = new Hapi.Server();
var config = require('config');

// Abre a conexão com o DB
config.launchDB();

// Configura o servidor
server.connection({
	port: 4000,
	routes: {
		cors: {
			origin: ['*'],
			credentials: true
		}
	}
});

// Configura plugin de autenticação
server.register(require('hapi-auth-bearer-token'), function (err) {

    server.auth.strategy('session', 'bearer-access-token', {
        allowQueryToken: true,              // optional, true by default
        allowMultipleHeaders: false,        // optional, false by default
        accessTokenName: 'token',		    // optional, 'access_token' by default
        validateFunc: function( passedToken, callback ) {
			var UserController = require('./auth/UserController.js');

			console.log('Token: ' + passedToken);

			UserController
				.$where({
					token: passedToken
				})
				.$read()
				.then(function( user ){
					if( user ){
						callback( null, true, {
							userID: user._id
						});
						reply({
							success: true
						});
					} else {
						callback( Boom.unauthorized(), false );
					}
				})
				.fail(function(){
					reply( Boom.badImplementation() );
				});
        }
    });
});

// Busca e adiciona rotas definidas nos arquivos citados
[
	'./auth/routes.js',
	'./categorias/routes.js',
	'./ocorrencias/routes.js',
	'./ocorrencias/orgaosRoute.js',
	'./orgaoCompetente/routes.js'
].forEach(function( routeFile ){
	server.route( require( routeFile ) );
});

// Inicia o servidor
server.start(function(){
	console.log('Running at ' + server.info.uri);
});
