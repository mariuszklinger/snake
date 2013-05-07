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

		wsServer.on("request", function(request) {
			
		    var connection = request.accept(null, request.origin);

		    console.log("==== CONNECTION ON");
		    
		    connection.send(JSON.stringify(SnakeGameServer.spawnNewSnake()));
		    
		    connection.on("message", function(message) {

		    });

		    connection.on("close", function(connection) {
		    	console.log("===== CLOOOOSEEE");
		    });
		});
	},
	
	spawnNewSnake: function(){
		
		var getNewSnakeID = function(){
			return SnakeGameServer.clients.length;
		};
		
		console.info("\t+snake id = " + getNewSnakeID());
		
		SnakeGameServer.snake_board.board[3][3].color = "red";
		
		var new_snake_head = SnakeGameServer.putBlock(new Segment(null, null, Segment.SEGMENT_TYPES.SNAKE, getNewSnakeID()));
		var msg_content = {
			head: new_snake_head,
			board: SnakeGameServer.snake_board.board,
		};
		
		SnakeGameServer.clients.push(new Snake(new_snake_head));
		
		return new SnakeMessage(SnakeMessage.TYPES.INIT, msg_content);
	},
	
	compressBoard: function(){
		var not_blank = [];
		
		snake_board.board.forEach(function(row){
			row.forEach(function(segment){
				if(segment.type.id !== Segment.SEGMENT_TYPES.BLANK.id){
					not_blank.push({
						x: segment.x,
						y: segment.y,
						typeV: segment.type,
						snakeID: segment.snakeID,
						color: segment.color,
					});
				}
			});
		});
		
		return not_blank;
	},
	
	putRedBlock: function(){
		SnakeGameServer.putBlock(new Segment(null, null, Segment.SEGMENT_TYPES.RED_BLOCK, null));
	},
	
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