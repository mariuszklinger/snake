var wsUri = "ws://localhost:1337/";

	websocket = new WebSocket(wsUri);
	
	var i = 0;
	websocket.onopen = function(evt) {

		setInterval(function(){websocket.send("hello#" + " " + ++i);}, 1000);
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
	
