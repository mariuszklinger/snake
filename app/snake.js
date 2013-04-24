var SEGMENT_SIZE = 20;
var BOARD_W, BOARD_H;
var BLOCKS_X, BLOCKS_Y;

var Segment = function(x, y, type){
	this.x = x;
	this.y = y;
	this.type = type || Segment.SEGMENT_TYPES.BLANK;
	this.color = undefined;
	
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

var Snake = function(snakeGameBoardBuffer){
	
	this.body = [];
	
	this.body.push(new Segment(300 + 0 * SEGMENT_SIZE, 200, Segment.SEGMENT_TYPES.SNAKE));
//	this.body.push(new Segment(300 + 1 * SEGMENT_SIZE, 200, Segment.SEGMENT_TYPES.SNAKE));
//	this.body.push(new Segment(300 + 2 * SEGMENT_SIZE, 200, Segment.SEGMENT_TYPES.SNAKE));
//	this.body.push(new Segment(300 + 3 * SEGMENT_SIZE, 200, Segment.SEGMENT_TYPES.SNAKE));
//	this.body.push(new Segment(300 + 4 * SEGMENT_SIZE, 200, Segment.SEGMENT_TYPES.SNAKE));
//	this.body.push(new Segment(300 + 5 * SEGMENT_SIZE, 200, Segment.SEGMENT_TYPES.SNAKE));
	
	this.SNAKE_STATES = {
		LIVE: 1,
		DEAD: 2,
	};
	
	this.status = this.SNAKE_STATES.LIVE;
	

	
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
			
			snakeGameBoardBuffer.putSegment(current_segment);
		}
	};
	
	this.move = function(move){
		var current_head = this.getHead();
		var new_head_segment = new Segment(current_head.x + move[0], current_head.y + move[1], Segment.SEGMENT_TYPES.SNAKE);
		
		if(this.isMoveCrossBoard(new_head_segment)){
			this.teleport(new_head_segment);
		}
		
		var move_result = snakeGameBoardBuffer.snakeGameCollisionDetector.processMove(new_head_segment);
		
		if(move_result === snakeGameBoardBuffer.snakeGameCollisionDetector.COLLISION_STATES.SNAKE){
			this.die();
			return;
		}
		
		// cut off snake's tail or eat new segment
		if(move_result !== snakeGameBoardBuffer.snakeGameCollisionDetector.COLLISION_STATES.EATABLE_BLOCK){
			snakeGameBoardBuffer.deleteSegment(this.body.pop());
		}

		var new_body = [new_head_segment];
		[].push.apply(new_body, this.body);
		this.body = new_body;
		
		this.updateBuffer();
	};
	
	this.die = function(){
		
		var dead_colors = ["#D1D1D1", "#BAB6B8", "#A3A0A1", "#878686", "#6B6A6A", "#525252"];
		for(var b in this.body){
			
			var cb = this.body[b];
			
			(function(cb, b){
				setTimeout(function(){
					cb.type = Segment.SEGMENT_TYPES.DEAD_SNAKE;
					cb.color = dead_colors[b] || dead_colors[dead_colors.length - 1];
					
					snakeGameBoardBuffer.putSegment(cb); //TODO remove global!
					snakeGameDrawer.update();
				}, b * 100);
			})(cb, b);
		};
		
		this.status = this.SNAKE_STATES.DEAD;
	};
};

var SnakeGameBoardBuffer = function(){
	var board = [];
	var to_update = [];
	
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
		
		to_update.push(to_erase);
	};
	
	this.putSegment = function(s){
		board[s.y / SEGMENT_SIZE][s.x / SEGMENT_SIZE] = s;
		to_update.push(s);
	};
	
	this.getSegmentsToUpdate = function(){
		return to_update;
	};
	
	this.getSegment = function(x, y){
		return board[y][x];
	};
	
	this.snakeGameCollisionDetector = (function(_snakeGameBoardBuffer){
		var snakeGameBoardBuffer = _snakeGameBoardBuffer;
		
		this.COLLISION_STATES = {
			SNAKE: 1,
			EATABLE_BLOCK: 2,
		};
		
		this.processMove = function(head){

			var block = snakeGameBoardBuffer.getSegment(head.x / SEGMENT_SIZE, head.y / SEGMENT_SIZE);
			
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
	})(this);
	
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
		
		var to_change = snakeGameBoardBuffer.getSegmentsToUpdate();

		for(var i in to_change){
			var current_segment = to_change[i]; 
			this.drawSegment(current_segment);
		};
		
		to_change.length = 0;
	};
	
};

var SnakeGame = function(canvas){
	
	BOARD_W = canvas.width,
	BOARD_H = canvas.height;
	
	BLOCKS_X = BOARD_W / 20;
	BLOCKS_Y = BOARD_H / 20;
	
	snakeGameBoardBuffer = new SnakeGameBoardBuffer();
	var snake = new Snake(snakeGameBoardBuffer);
	snake.updateBuffer();
	snakeGameDrawer = new SnakeGameDrawer(canvas, snakeGameBoardBuffer);
	
	var WSAD_CODES = {
		UP: 87,
		DOWN: 83,
		LEFT: 65,
		RIGHT: 68,
	};
	
	putRandomBlock = function(){ //TODO remove global!
		var x, y;
		do{
			x = Math.floor(((Math.random() * BOARD_W) / SEGMENT_SIZE)) * SEGMENT_SIZE;
			y = Math.floor(((Math.random() * BOARD_H) / SEGMENT_SIZE)) * SEGMENT_SIZE;
		}
		while(snakeGameBoardBuffer.getSegment(x / SEGMENT_SIZE, y / SEGMENT_SIZE).type !==  Segment.SEGMENT_TYPES.BLANK);
		
		snakeGameBoardBuffer.putSegment(new Segment(x, y, Segment.SEGMENT_TYPES.RED_BLOCK));
	};
	
	putRandomBlock();
	putRandomBlock();
	putRandomBlock();
	snakeGameDrawer.update();
	
	var ILLEGAL_MOVE = WSAD_CODES.RIGHT;
	
	var keyDownEvent = function(e){
		
		if(snake.status === snake.SNAKE_STATES.DEAD){
			return;
		}
		
		var MOVES = {};
		MOVES[WSAD_CODES.UP] = [0, -SEGMENT_SIZE];
		MOVES[WSAD_CODES.DOWN] = [0, SEGMENT_SIZE];
		MOVES[WSAD_CODES.RIGHT] = [SEGMENT_SIZE, 0];
		MOVES[WSAD_CODES.LEFT] = [-SEGMENT_SIZE, 0];
		
		// map used to block "turn back" snake
		var OPPOSITE_MOVE_MAP = {};
		OPPOSITE_MOVE_MAP[WSAD_CODES.UP] = WSAD_CODES.DOWN;
		OPPOSITE_MOVE_MAP[WSAD_CODES.DOWN] = WSAD_CODES.UP;
		OPPOSITE_MOVE_MAP[WSAD_CODES.LEFT] = WSAD_CODES.RIGHT;
		OPPOSITE_MOVE_MAP[WSAD_CODES.RIGHT] = WSAD_CODES.LEFT;

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
