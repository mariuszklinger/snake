var SEGMENT_SIZE = 50;
var BOARD_W = 700;
var BOARD_H = 700;

var BLOCKS_X = BOARD_W / SEGMENT_SIZE;
var BLOCKS_Y = BOARD_H / SEGMENT_SIZE;

var Segment = function (x, y, type, snake){
	this.x = x;
	this.y = y;
	this.type = type || Segment.SEGMENT_TYPES.BLANK;
	this.color = undefined;
	this.snake = snake;
	
	this.getColor = function(){
		return this.type.color;
	};
};

Segment.SEGMENT_TYPES = {
	BLANK: {
		id: 1,
		color: "#FFF",
	},
	
	RED_BLOCK: {
		id: 2,
		color: "#F23",
	},
	
	SNAKE: {
		id: 3,
		color: null,
	},
	
	DEAD_SNAKE: {
		id: 4,
		color: "#A8969D",
	},
};

var Snake = function(){
	
	this.body = [];
	
	this.body.push(new Segment(300 + 0 * SEGMENT_SIZE, 200, Segment.SEGMENT_TYPES.SNAKE, this));
	
	this.SNAKE_STATES = {
		LIVE: 1,
		DEAD: 2,
	};
	
	this.status = this.SNAKE_STATES.LIVE;
};

Snake.prototype.getTail = function(){
	return this.body[this.body.length - 1];
};

Snake.prototype.getHead = function(){
	return this.body[0];
};

Snake.prototype.move = function(move){
	var current_head = this.getHead();
	var new_head_segment = new Segment(current_head.x + move[0], current_head.y + move[1], Segment.SEGMENT_TYPES.SNAKE);
	
	return SnakeGameBoard.moveSnake(this, new_head_segment);
};

Snake.prototype.die = function(){
	this.status = this.SNAKE_STATES.DEAD;
};

var SnakeGameBoard = {

	to_update: [],
	
	board: (function(){
		var board = [];
		for(var y = 0; y < BLOCKS_Y; y++){
	
			board[y] = [];
			
			for(var x = 0; x < BLOCKS_X; x++){
				board[y].push(new Segment(x * SEGMENT_SIZE, y * SEGMENT_SIZE));
			};
		}
		return board;
	})(),
	
	deleteSegment: function(s){
		var to_erase = this.board[s.y / SEGMENT_SIZE][s.x / SEGMENT_SIZE];
		to_erase.type = Segment.SEGMENT_TYPES.BLANK;
		to_erase.color = Segment.SEGMENT_TYPES.BLANK.color;
		
		this.to_update.push(to_erase);
	},
	
	putSegment: function(s){
		this.board[s.y / SEGMENT_SIZE][s.x / SEGMENT_SIZE] = s;
		this.to_update.push(s);
	},
	
	getSegmentsToUpdate: function(){
		return this.to_update;
	},
	
	getSegment: function(x, y){
		return this.board[y][x];
	},
	
	isMoveCrossBoard: function(move){
		return ((move.x < 0) || (move.y < 0) || (move.x >= BOARD_W) || (move.y >= BOARD_H));
	},
	
	teleport: function(move){
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
	},
	
	updateBuffer: function(snake){
		var colors = ["#5CA315", "#69B81A",  "#74CC1D", "#81DE23", "#8BF026", "#92FA2A", "#A2FF45"];
		
		for(var i = 0; i < snake.body.length; i++){
			var current_segment = snake.body[i];
			current_segment.color = colors[i] || colors[colors.length - 1];
			
			this.putSegment(current_segment);
		};
	},
	
	moveSnake: function(snake, new_head_segment){
		
		if(this.isMoveCrossBoard(new_head_segment)){
			this.teleport(new_head_segment);
		}
		
		var move_result = SnakeGameBoard.snakeGameCollisionDetector.processMove(new_head_segment);
		
		if(move_result === SnakeGameBoard.snakeGameCollisionDetector.COLLISION_STATES.SNAKE){
			snake.die();
			return false;
		}
		
		// cut off snake's tail or eat new segment
		if(move_result !== SnakeGameBoard.snakeGameCollisionDetector.COLLISION_STATES.EATABLE_BLOCK){
			SnakeGameBoard.deleteSegment(snake.body.pop());
		}

		var new_body = [new_head_segment];
		[].push.apply(new_body, snake.body);
		snake.body = new_body;
		
		this.updateBuffer(snake);
		return true;
	},
	
	snakeGameCollisionDetector: (function(_snakeGameBoardBuffer){
		
		this.COLLISION_STATES = {
			SNAKE: 1,
			EATABLE_BLOCK: 2,
		};
		
		this.processMove = function(head){

			var block = SnakeGameBoard.getSegment(head.x / SEGMENT_SIZE, head.y / SEGMENT_SIZE);
			
			switch (block.type.id) {
				case Segment.SEGMENT_TYPES.RED_BLOCK.id:
					putRandomBlock();
					return COLLISION_STATES.EATABLE_BLOCK;
					break;
					
				case Segment.SEGMENT_TYPES.SNAKE.id:
					return COLLISION_STATES.SNAKE;
					break;
		
				case Segment.SEGMENT_TYPES.BLANK.id:
					return false;
					break;
				default:
					break;
			}
		};
		
		return this;
	})(this),
	
};

if(typeof exports !== "undefined"){
	exports.SEGMENT_SIZE = SEGMENT_SIZE;
	exports.BOARD_W = BOARD_W;
	exports.BOARD_H = BOARD_H;

	exports.BLOCKS_X = BLOCKS_X;
	exports.BLOCKS_Y = BLOCKS_Y;
	
	exports.Snake = Snake;
	exports.Segment = Segment;
	exports.SnakeGameBoard = SnakeGameBoard;
}
