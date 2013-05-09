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
		
	init: function(){
		
		var server = http.createServer(function(request, response) {});
		server.listen(1337, function() {});

		wsServer = new WebSocketServer({
		    httpServer: server,
		});
		
		SnakeGameServer.putRedBlock();

		wsServer.on("request", function(request) {
			
		    var connection = request.accept(null, request.origin);

		    console.log("==== CONNECTION ON");
		    

		    var SNAKE_ID = SnakeGameServer.clients.length;
		    
		    var msg = SnakeGameServer.initMessage();
		    connection.send(JSON.stringify(msg));
		    
		    connection.on("message", function(message) {

		    });

		    connection.on("close", function(connection) {
		    	SnakeGameServer.removeSnake(SNAKE_ID);
		    	console.log("===== CLOOOOSEEE");
		    });
		});
	},
	
	initMessage: function(SNAKE_ID){
		
		var msg_content = {
			head: SnakeGameServer.spawnNewSnake(SNAKE_ID),
			board: SnakeGameServer.getNonBlankSegments(),
		};
		
		SnakeGameServer.clients.push(msg_content.head);
		
		return new SnakeMessage(SnakeMessage.TYPES.INIT, msg_content);
	},
	
	spawnNewSnake: function(SNAKE_ID){
		
		var new_snake_head = SnakeGameServer.putBlock(new Segment(null, null, Segment.SEGMENT_TYPES.SNAKE, SNAKE_ID));
		console.info("\t+snake id = " + SNAKE_ID);
		
		SnakeGameServer.clients.push(new Snake(new_snake_head));
		
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
};

SnakeGameServer.init();