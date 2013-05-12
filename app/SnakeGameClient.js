var SnakeGame = {

	init: function(canvas){
		SnakeGame.SnakeGameClient.init();
		
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
		
	snake: null,
	
	SnakeGameClient: {
		
		websocket: null,
			
		init: function(){
			var wsUri = "ws://localhost:1337/";

			websocket = new WebSocket(wsUri);
			
			websocket.onopen = function(evt) {
			};
			
			websocket.onclose = function(evt) {
			};
			websocket.onmessage = function(evt) {
				SnakeGame.snake && console.info("snake #" + SnakeGame.snake.snakeID + " message:");
				SnakeGame.SnakeGameClient.dispatchMsg(JSON.parse(evt.data));
			};
			websocket.onerror = function(evt) {
			};
			
			this.websocket = websocket;
		},
		
		dispatchMsg: function(obj){
			switch (obj.type.id) {
				case SnakeMessage.TYPES.INIT.id:
					
					SnakeGame.snake = new Snake(obj.msg.head);
					this.updateBoard(obj.msg.board);
					SnakeGameBoard.updateBuffer(SnakeGame.snake);
					
					SnakeGame.SnakeGameDrawer.initDraw();	
					break;
					
				case SnakeMessage.TYPES.MOVE.id:
					// TODO cza rejestr wszystkich snakow zrobic... w init messageu tez je przeslac... ZOMG
					break;
	
				default:
					console.info("DEFAULT SWITCH:");
					console.info(obj);
					break;
				}
		},
			
		updateBoard: function(segments_array){
			segments_array.forEach(function(s){
				var segment = new Segment(s.x, s.y, Segment.getTypeByValue(s.typeV), s.snakeID);
				SnakeGameBoard.putSegment(segment);
			});
		},
		
		sendMove: function(_move){
			
			var msg = new SnakeMessage(SnakeMessage.TYPES.MOVE, {
				move: _move,
			});
			
			this.websocket.send(JSON.stringify(msg));
		},	
	},
	
	SnakeGameDrawer: {
		
		canvas: null,
		context: null,
		
		init: function(canvas){
			this.canvas = canvas;
			this.context = canvas.getContext("2d");
			this.initDraw();
		},
		
		// draws every segment
		initDraw: function(){
			var that = this;
			SnakeGameBoard.board.forEach(function(row){
				row.forEach(function(s){
					if(s.type.id == 2){
						console.info(s);
					}
					that.drawSegment(s);
				});
			});
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
		
		// block turn back
		SnakeGame.ILLEGAL_MOVE = SnakeGame.OPPOSITE_MOVE_MAP[e.keyCode];
		
		SnakeGame.SnakeGameClient.sendMove(current_move);
		
		if(!SnakeGame.snake.move(current_move)){
			SnakeGame.SnakeGameDrawer.die(SnakeGame.snake);
		}
		else{
			// if snake is still alive
			SnakeGame.SnakeGameDrawer.update();			
		}
	},
	
};
