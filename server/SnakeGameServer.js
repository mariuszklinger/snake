var WebSocketServer = require('websocket').server;
var http = require('http');
var SnakeGameCore = require("../shared/SnakeGameCore.js");


var server = http.createServer(function(request, response) {
});
server.listen(1337, function() { });

wsServer = new WebSocketServer({
    httpServer: server
});

var i = 0;
// WebSocket server
wsServer.on('request', function(request) {
	
    var connection = request.accept(null, request.origin);
    
    connection.send(JSON.stringify({
    	x: 555,
    	y: "asdasddas",
    	
    }));

    console.log("CONNECTION ON");
    connection.on('message', function(message) {

            // process WebSocket message
        	console.log("dostalem: " + message.utf8Data);
        	connection.send(++i);
        	

        	if(++i%10 == 0){
        		connection.send("OOOPS x10");
        	}


    });

    connection.on('close', function(connection) {
        // close user connection
    });
});

