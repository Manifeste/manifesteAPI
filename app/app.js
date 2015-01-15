var Hapi = require('hapi');
var server = new Hapi.Server();

// Abre a conexão com o DB, se necessário
var config = require('config');
config.launchDB();

server.connection({
	port: 4000,
	routes: {
		cors: true
	}
});

[
	'./ocorrencias/routes.js',
	'./categorias/routes.js'
].forEach(function(routeFile){
	server.route(require(routeFile));
});

server.start(function(){
	console.log('Running at ' + server.info.uri);
});