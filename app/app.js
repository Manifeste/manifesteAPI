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
server.register(require('hapi-auth-cookie'), function (err) {
    server.auth.strategy('session', 'cookie', {
        password: 'secret',
        cookie: 'this_is_manifeste!',
        isSecure: false
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
