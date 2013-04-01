var SEGMENT_SIZE = 20;

Segment = function(x, y, next, prev){
	this.x = x;
	this.y = y;
};

Snake = function(){
	
	this.body = [];
	
	this.body.push(new Segment(300, 200));
	
	this.body.push(new Segment(300 + SEGMENT_SIZE, 200));
	this.body.push(new Segment(300 + 2 * SEGMENT_SIZE, 200));
	this.body.push(new Segment(300 + 3 * SEGMENT_SIZE, 200));
	this.body.push(new Segment(300 + 4 * SEGMENT_SIZE, 200));
	
	this.getTail = function(){
		return this.body[this.body.length - 1];
	};
	
	this.getHead = function(){
		return this.body[0];
	};
};

SnakeDrawer = function(_canvas, _snake){
	
	var canvas = _canvas;
	var context = canvas.getContext('2d');
	var snake = _snake;
	
	this.draw_head = function(s){
		this.draw_segment(s, "red");
	};
	
	this.draw_segment = function(s, color){
		context.beginPath();
		context.moveTo(s.x, s.y);
		context.rect(s.x, s.y, SEGMENT_SIZE, SEGMENT_SIZE);
		context.fillStyle = color || "blue";
		context.fill();
	};
	
	this.erase_segment = function(s){
		context.beginPath();
		context.moveTo(s.x, s.y);
		context.clearRect(s.x - 0.5, s.y - 0.5, SEGMENT_SIZE + 1, SEGMENT_SIZE + 1);
		context.stroke();
	};
	
	this.initDraw = function(){
		canvas.width = canvas.width;
		this.draw_head(snake.body[0]);
		for(var i = 1; i < snake.body.length; i++){
			this.draw_segment(snake.body[i]);
		}		
	};
	
	var lastTail = snake.getTail();
	
	this.update = function(){
		this.draw_head(snake.getHead());
		this.erase_segment(lastTail);
		lastTail = snake.getTail();
	};
	
};

SnakeGame = function(canvas){
	
	var snake = new Snake();
	var snakeDrawer = new SnakeDrawer(canvas, snake);
	snakeDrawer.initDraw();
	
	var collisionDetect = function(segment){
		// czy nie w siebie
		// czy nie w innego
		
	};
	
	var ILLEGAL_MOVE = null; //TODO
	var keyDownEvent = function(e){
		
		var ARROWS_CODES = {
			UP: 38,
			DOWN: 40,
			LEFT: 37,
			RIGHT: 39,
		};
		
		var MOVES = {};
		MOVES[ARROWS_CODES.UP] = [0, -20];
		MOVES[ARROWS_CODES.DOWN] = [0, 20];
		MOVES[ARROWS_CODES.RIGHT] = [20, 0];
		MOVES[ARROWS_CODES.LEFT] = [-20, 0];
		
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
		
		var current_head = snake.getHead();
		var new_head = new Segment(current_head.x + current_move[0], current_head.y + current_move[1]);
		
		snake.body.pop();
		
		var new_body = [new_head];
		[].push.apply(new_body, snake.body);
		snake.body = new_body;
		
		snakeDrawer.initDraw();
	};
	
	document.onkeydown = keyDownEvent;
};

document.addEventListener('DOMContentLoaded', function () {
	var canvas = document.getElementById("can");
	SnakeGame(canvas);
});
