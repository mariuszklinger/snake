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
	this.body.push(new Segment(300 + 5 * SEGMENT_SIZE, 200));
	
	this.getTail = function(){
		return this.body[this.body.length - 1];
	};
	
	this.getHead = function(){
		return this.body[0];
	};
	
	this.move = function(move){
		var current_head = this.getHead();
		var new_head = new Segment(current_head.x + move[0], current_head.y + move[1]);
		
		this.body.pop();
		
		var new_body = [new_head];
		[].push.apply(new_body, this.body);
		this.body = new_body;
	};
};

SnakeDrawer = function(_canvas, _snake){
	
	var canvas = _canvas;
	var context = canvas.getContext('2d');
	var snake = _snake;
	
	this.drawHead = function(s){
		this.drawSegment(s, "red");
	};
	
	this.drawSegment = function(s, color){
		context.beginPath();
		context.moveTo(s.x, s.y);
		context.rect(s.x, s.y, SEGMENT_SIZE, SEGMENT_SIZE);
		context.fillStyle = color || "blue";
		context.fill();
	};
	
	this.eraseSegment = function(s){
		context.beginPath();
		context.moveTo(s.x, s.y);
		context.clearRect(s.x - 0.5, s.y - 0.5, SEGMENT_SIZE + 1, SEGMENT_SIZE + 1);
		context.stroke();
	};
	
	this.initDraw = function(){
		var colors = ["#5CA315", "#69B81A",  "#74CC1D", "#81DE23", "#8BF026", "#92FA2A", "#A2FF45"];
		canvas.width = canvas.width;
		//this.drawHead(snake.body[0]);
		for(var i = 0; i < snake.body.length; i++){
			this.drawSegment(snake.body[i], colors[i]);
		}		
	};
	
	var lastTail = snake.getTail();
	
	this.update = function(){
		this.drawHead(snake.getHead());
		this.eraseSegment(lastTail);
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
	
	var ARROWS_CODES = {
		UP: 38,
		DOWN: 40,
		LEFT: 37,
		RIGHT: 39,
	};
	
	var ILLEGAL_MOVE = ARROWS_CODES.RIGHT;
	
	var keyDownEvent = function(e){
		
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
		snake.move(current_move);
		snakeDrawer.initDraw();
	};
	
	document.onkeydown = keyDownEvent;
};

document.addEventListener('DOMContentLoaded', function () {
	var canvas = document.getElementById("can");
	SnakeGame(canvas);
});
