var SEGMENT_SIZE = 20;
var BOARD_W, BOARD_H;
var BLOCKS_X, BLOCKS_Y;

var Segment = function(x, y, type){
	this.x = x;
	this.y = y;
	this.type = type || Segment.SEGMENT_TYPES.BLANK;
	this.color = null;
	this.changed = true;
	
	this.getColor = function(){
		return this.type.color;
	};
};

Segment.SEGMENT_TYPES = {
	BLANK: {
		color: "#FFF",
	},
	
	RED_BLOCK: {
		color: "#F23",
	},
};

var Snake = function(snakeGameBoardBuffer){
	
	this.body = [];
	
	this.body.push(new Segment(300, 200));
	
	this.body.push(new Segment(300 + 1 * SEGMENT_SIZE, 200));
	this.body.push(new Segment(300 + 2 * SEGMENT_SIZE, 200));
	this.body.push(new Segment(300 + 3 * SEGMENT_SIZE, 200));
	this.body.push(new Segment(300 + 4 * SEGMENT_SIZE, 200));
	this.body.push(new Segment(300 + 5 * SEGMENT_SIZE, 200));
	
	this.getTail = function(){
		return this.body[this.body.length - 1];
	};
	
	this.getHead = function(){
		return this.body[0];
	};
	
	this.isMoveCrossBoard = function(move){
		return ((move.x < 0) || (move.y < 0) || (move.x >= BOARD_W) || (move.y >= BOARD_H));
	};
	
	this.teleport = function(move){
		if(move.x < 0){
			move.x = BOARD_W + move.x;
		}
		
		if(move.y < 0){
			move.y = BOARD_H + move.y;
		}
		
		if(move.x >= BOARD_W){
			move.x = move.x - BOARD_W;
		}
		
		if(move.y >= BOARD_H){
			move.y = move.y - BOARD_H;
		}
	};
	
	this.updateBuffer = function(){
		var colors = ["#5CA315", "#69B81A",  "#74CC1D", "#81DE23", "#8BF026", "#92FA2A", "#A2FF45"];
		
		for(var i = 0; i < this.body.length; i++){
			var current_segment = this.body[i];
			current_segment.color = colors[i] || colors[colors.length - 1];
			current_segment.changed = true;
			
			snakeGameBoardBuffer.putSegment(current_segment);
		}
	};
	
	this.move = function(move){
		var current_head = this.getHead();
		var new_head = new Segment(current_head.x + move[0], current_head.y + move[1]);
		
		if(this.isMoveCrossBoard(new_head)){
			this.teleport(new_head);
		}
		
		// cut off snake's tail
		snakeGameBoardBuffer.deleteSegment(this.body.pop());
		
		var new_body = [new_head];
		[].push.apply(new_body, this.body);
		this.body = new_body;
		
		this.updateBuffer();
	};
};

var SnakeGameBoardBuffer = function(){
	var board = [];
	
	for(var y = 0; y < BLOCKS_Y; y++){
		board[y] = [];
		
		for(var x = 0; x < BLOCKS_X; x++){
			board[y].push(new Segment(x * SEGMENT_SIZE, y * SEGMENT_SIZE));
		};
	}
	
	this.deleteSegment = function(s){
		var to_erase = board[s.y / SEGMENT_SIZE][s.x / SEGMENT_SIZE];
		to_erase.type = Segment.SEGMENT_TYPES.BLANK;
		to_erase.color = Segment.SEGMENT_TYPES.BLANK.color;
		to_erase.changed = true;
	};
	
	this.putSegment = function(s){
		board[s.y / SEGMENT_SIZE][s.x / SEGMENT_SIZE] = s;
	};
	
	this.getSegment = function(x, y){
		return board[y][x];
	};
	
};

var SnakeGameDrawer = function(_canvas, _snakeGameBoardBuffer){
	
	var canvas = _canvas;
	var context = canvas.getContext("2d");

	var snakeGameBoardBuffer = _snakeGameBoardBuffer;
	
	this.drawSegment = function(s){
		context.beginPath();
		context.moveTo(s.x, s.y);
		context.rect(s.x, s.y, SEGMENT_SIZE, SEGMENT_SIZE);
		context.fillStyle = s.color || s.getColor();
		context.fill();
	};
	
	this.update = function(){

		for(var y = 0; y < BLOCKS_Y; y++){
			for(var x = 0; x < BLOCKS_X; x++){
				
				var current_segment = snakeGameBoardBuffer.getSegment(x, y);
				if(current_segment.changed){
					this.drawSegment(current_segment);
					current_segment.changed = false;
				};
			};
		};
	};
	
};

var SnakeGame = function(canvas){
	
	BOARD_W = canvas.width,
	BOARD_H = canvas.height;
	
	BLOCKS_X = BOARD_W / 20;
	BLOCKS_Y = BOARD_H / 20;
	
	var snakeGameBoardBuffer = new SnakeGameBoardBuffer();
	var snake = new Snake(snakeGameBoardBuffer);
	snake.updateBuffer();
	var snakeGameDrawer = new SnakeGameDrawer(canvas, snakeGameBoardBuffer);
	snakeGameDrawer.update();
	
	var ARROWS_CODES = {
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39,
	};
	
	var putRandomBlock = function(){
		var x = Math.floor(((Math.random() * BOARD_W) / SEGMENT_SIZE)) * SEGMENT_SIZE;
		var y = Math.floor(((Math.random() * BOARD_H) / SEGMENT_SIZE)) * SEGMENT_SIZE;
		
		snakeGameBoardBuffer.putSegment(new Segment(x, y, Segment.SEGMENT_TYPES.RED_BLOCK));
	};
	
	var ILLEGAL_MOVE = ARROWS_CODES.RIGHT;
	
	var keyDownEvent = function(e){
		
		putRandomBlock();
		
		var MOVES = {};
		MOVES[ARROWS_CODES.UP] = [0, -SEGMENT_SIZE];
		MOVES[ARROWS_CODES.DOWN] = [0, SEGMENT_SIZE];
		MOVES[ARROWS_CODES.RIGHT] = [SEGMENT_SIZE, 0];
		MOVES[ARROWS_CODES.LEFT] = [-SEGMENT_SIZE, 0];
		
		// map used to block "turn back" snake
		var OPPOSITE_MOVE_MAP = {};
		OPPOSITE_MOVE_MAP[ARROWS_CODES.UP] = ARROWS_CODES.DOWN;
		OPPOSITE_MOVE_MAP[ARROWS_CODES.DOWN] = ARROWS_CODES.UP;
		OPPOSITE_MOVE_MAP[ARROWS_CODES.LEFT] = ARROWS_CODES.RIGHT;
		OPPOSITE_MOVE_MAP[ARROWS_CODES.RIGHT] = ARROWS_CODES.LEFT;
		
		var current_move = MOVES[e.keyCode];
		if(!current_move || (e.keyCode === ILLEGAL_MOVE)){
			return;
		}
		
		ILLEGAL_MOVE = OPPOSITE_MOVE_MAP[e.keyCode];
		snake.move(current_move);
		snakeGameDrawer.update();
	};
	
	document.onkeydown = keyDownEvent;
};

document.addEventListener('DOMContentLoaded', function () {
	var canvas = document.getElementById("can");
	SnakeGame(canvas);
});
