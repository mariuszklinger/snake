var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

var i = 0;
// WebSocket server
wsServer.on('request', function(request) {
	
    var connection = request.accept(null, request.origin);

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

