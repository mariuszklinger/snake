var WebSocketServer = require("websocket").server;
var http = require("http");
var SnakeGameCore = require("../shared/SnakeGameCore.js");

var SEGMENT_SIZE = SnakeGameCore.SEGMENT_SIZE;
var BOARD_W = SnakeGameCore.BOARD_W;
var BOARD_H = SnakeGameCore.BOARD_H;

var BLOCKS_X = SnakeGameCore.BLOCKS_X;
var BLOCKS_Y = SnakeGameCore.BLOCKS_Y;

var Segment = SnakeGameCore.Segment;
var Snake = SnakeGameCore.Snake;
var SnakeMessage = SnakeGameCore.SnakeMessage;

var SnakeGameServer = {

	snake_board: SnakeGameCore.SnakeGameBoard,
	clients: [],
	connections: [],
		
	init: function(){
		
		var server = http.createServer(function(request, response){});
		server.listen(1337, function(){});

		wsServer = new WebSocketServer({
		    httpServer: server,
		});
		
		SnakeGameServer.putRedBlock();

		wsServer.on("request", function(request) {
			
			// current client's ID
			var SNAKE_ID = SnakeGameServer.clients.length;

			// current connection
			var connection = request.accept(null, request.origin);
			SnakeGameServer.connections[SNAKE_ID] = connection;

		    console.log("===== CONNECTION ON");
		    
		    // snake for connected client
		    SnakeGameServer.spawnNewSnake(SNAKE_ID);
		    connection.send(JSON.stringify(SnakeGameServer.initMessage(SNAKE_ID)));
		    
		    // notice others clients about new snake 
		    SnakeGameServer.broadcastMessage(new SnakeMessage(SnakeMessage.TYPES.NEW_SNAKE, {
		    	snake: SnakeGameServer.clients[SNAKE_ID],
		    }), SNAKE_ID);
		    
		    connection.on("message", function(message) {
		    	SnakeGameServer.parseMessage(message, SNAKE_ID);
		    });

		    connection.on("close", function(connection) {
		    	SnakeGameServer.removeSnake(SNAKE_ID);
		    	console.log("===== CLOOOOSEEE");
		    });
		});
	},
	
	initMessage: function(SNAKE_ID){
		
		var msg_content = {
			head: SnakeGameServer.clients[SNAKE_ID].getHead(),
			board: SnakeGameServer.getNonBlankSegments(),
		};
		
		return new SnakeMessage(SnakeMessage.TYPES.INIT, msg_content);
	},
	
	spawnNewSnake: function(SNAKE_ID){
		
		var new_snake_head = SnakeGameServer.putBlock(new Segment(null, null, Segment.SEGMENT_TYPES.SNAKE, SNAKE_ID));
		console.info("\t+snake id = " + SNAKE_ID);
		
		SnakeGameServer.clients[SNAKE_ID] = new Snake(new_snake_head);
		
		return new_snake_head;
	},
	
	// convert segment object to object easy to send and receive
	serializeSegment: function(segment){
		return {
			x: segment.x,
			y: segment.y,
			typeV: segment.type.id,
			snakeID: segment.snakeID,
			color: segment.color,
		};
	},
	
	getNonBlankSegments: function(){
		var not_blank = [];
		
		this.snake_board.board.forEach(function(row){
			row.forEach(function(segment){
				if(segment.type.id !== Segment.SEGMENT_TYPES.BLANK.id){
					not_blank.push(SnakeGameServer.serializeSegment(segment));
				}
			});
		});
		
		return not_blank;
	},
	
	removeSnake: function(snakeID){
		
		var snake = this.clients[snakeID];
		
		snake.body.forEach(function(s){
			s.type = Segment.SEGMENT_TYPES.BLANK;
		});
	},
	
	putRedBlock: function(){
		SnakeGameServer.putBlock(new Segment(null, null, Segment.SEGMENT_TYPES.RED_BLOCK, null));
	},
	
	// draw random position for segment
	putBlock: function(segment){
		var x, y;
		do{
			x = Math.floor(((Math.random() * BOARD_W) / SEGMENT_SIZE)) * SEGMENT_SIZE;
			y = Math.floor(((Math.random() * BOARD_H) / SEGMENT_SIZE)) * SEGMENT_SIZE;
		}
		while(SnakeGameServer.snake_board.getSegment(x / SEGMENT_SIZE, y / SEGMENT_SIZE).type !==  Segment.SEGMENT_TYPES.BLANK);
		
		segment.x = x;
		segment.y = y;
		
		SnakeGameServer.snake_board.putSegment(segment);
		
		return segment;
	},
	
	// sending new messages to all clients except one with snakeID
	broadcastMessage: function(msg, snakeID){

		this.clients.forEach(function(c, i){
			if(i === snakeID){
				return;
			}
			
			console.log("\t wysylam msg z: #" + snakeID + " do: #" + i);
			SnakeGameServer.connections[i].send(JSON.stringify(msg));
		});
	},
	
	parseMessage: function(data, snakeID){
		if(data.type === "utf8"){
			var content = JSON.parse(data.utf8Data);
			
			console.log(content);
			
			switch(content.type.id){
			
				case SnakeMessage.TYPES.MOVE.id:
					var snake = SnakeGameServer.clients[snakeID];
					snake.move(content.msg.move);
					SnakeGameServer.broadcastMessage(new SnakeMessage(SnakeMessage.TYPES.MOVE, content.msg), snakeID);
					break;
				};

			console.log(content);
		}
	},
};

SnakeGameServer.init();