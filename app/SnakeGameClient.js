var putRandomBlock = function(){ //TODO remove global!
	var x, y;
	do{
		x = Math.floor(((Math.random() * BOARD_W) / SEGMENT_SIZE)) * SEGMENT_SIZE;
		y = Math.floor(((Math.random() * BOARD_H) / SEGMENT_SIZE)) * SEGMENT_SIZE;
	}
	while(SnakeGameBoard.getSegment(x / SEGMENT_SIZE, y / SEGMENT_SIZE).type !==  Segment.SEGMENT_TYPES.BLANK);
	
	SnakeGameBoard.putSegment(new Segment(x, y, Segment.SEGMENT_TYPES.RED_BLOCK));
};

var SnakeGame = {

	init: function(canvas){
		SnakeGame.snake = new Snake(SnakeGameBoard);
		SnakeGameBoard.updateBuffer(SnakeGame.snake);
		SnakeGame.SnakeGameClient.init();
		
		putRandomBlock();
		putRandomBlock();
		putRandomBlock();
		
		this.SnakeGameDrawer.init(canvas);
		this.SnakeGameDrawer.update();
		
		document.onkeydown = this.keyDownEvent;
		
		SnakeGame.MOVES[SnakeGame.WSAD_CODES.UP] = [0, -SEGMENT_SIZE];
		SnakeGame.MOVES[SnakeGame.WSAD_CODES.DOWN] = [0, SEGMENT_SIZE];
		SnakeGame.MOVES[SnakeGame.WSAD_CODES.RIGHT] = [SEGMENT_SIZE, 0];
		SnakeGame.MOVES[SnakeGame.WSAD_CODES.LEFT] = [-SEGMENT_SIZE, 0];
	
		SnakeGame.OPPOSITE_MOVE_MAP[SnakeGame.WSAD_CODES.UP] = SnakeGame.WSAD_CODES.DOWN;
		SnakeGame.OPPOSITE_MOVE_MAP[SnakeGame.WSAD_CODES.DOWN] = SnakeGame.WSAD_CODES.UP;
		SnakeGame.OPPOSITE_MOVE_MAP[SnakeGame.WSAD_CODES.LEFT] = SnakeGame.WSAD_CODES.RIGHT;
		SnakeGame.OPPOSITE_MOVE_MAP[SnakeGame.WSAD_CODES.RIGHT] = SnakeGame.WSAD_CODES.LEFT;
	},	
		
	snake: new Snake(SnakeGameBoard),
	
	SnakeGameClient: {
			
		init: function(){
			var wsUri = "ws://localhost:1337/";

			websocket = new WebSocket(wsUri);
			
			var i = 0;
			websocket.onopen = function(evt) {
				SnakeGameClient.getBoard(evt);
			};
			websocket.onclose = function(evt) {
				//onClose(evt)
			};
			websocket.onmessage = function(evt) {
				//onMessage(evt)
				console.log(evt.data);
			};
			websocket.onerror = function(evt) {
				//onError(evt)
			};
			
		},
			
		getBoard: function(evt){
			console.info(evt.data.y)
		},
		
		sendMove: function(move){
			
		},	
	},
	
	SnakeGameDrawer: {
		
		canvas: null,
		context: null,
		
		init: function(canvas){
			this.canvas = canvas;
			this.context = canvas.getContext("2d");
		},
		
		drawSegment: function(s){
			this.context.beginPath();
			this.context.moveTo(s.x, s.y);
			this.context.rect(s.x, s.y, SEGMENT_SIZE, SEGMENT_SIZE);
			this.context.fillStyle = s.color || s.getColor();
			this.context.fill();
		},
		
		update: function(){
			
			var to_change = SnakeGameBoard.getSegmentsToUpdate();

			for(var i in to_change){
				var current_segment = to_change[i]; 
				this.drawSegment(current_segment);
			};
			
			to_change.length = 0;
		},
		
		die: function(snake){
			
			var dead_colors = ["#D1D1D1", "#BAB6B8", "#A3A0A1", "#878686", "#6B6A6A", "#525252"];
			for(var b in snake.body){
				
				var cb = snake.body[b];
				
				(function(cb, b){
					setTimeout(function(){
						cb.type = Segment.SEGMENT_TYPES.DEAD_SNAKE;
						cb.color = dead_colors[b] || dead_colors[dead_colors.length - 1];
						
						SnakeGameBoard.putSegment(cb);
						SnakeGame.SnakeGameDrawer.update();
					}, b * 100);
				})(cb, b);
			};
			
			snake.die();
		},
	},
	
	WSAD_CODES: {
		UP: 87,
		DOWN: 83,
		LEFT: 65,
		RIGHT: 68,
	},
	
	ILLEGAL_MOVE: undefined,
	
	MOVES: {},
	
	// map used to block "turn back" snake
	OPPOSITE_MOVE_MAP: {},
	
	keyDownEvent: function(e){
		
		if(SnakeGame.snake.status === SnakeGame.snake.SNAKE_STATES.DEAD){
			return;
		}

		var current_move = SnakeGame.MOVES[e.keyCode];
		if(!current_move || (e.keyCode === SnakeGame.ILLEGAL_MOVE)){
			return;
		}
		
		SnakeGame.ILLEGAL_MOVE = SnakeGame.OPPOSITE_MOVE_MAP[e.keyCode];
		
		if(!SnakeGame.snake.move(current_move)){
			SnakeGame.SnakeGameDrawer.die(SnakeGame.snake);
		}
		else{
			SnakeGame.SnakeGameDrawer.update();			
		}
	},
	
};
