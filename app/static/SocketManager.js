export class SocketManager {

	generateUUID() {
		return 'xxxx-xxxx-xxxx'.replace(/[x]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			return r.toString(16);
		});
	}

	constructor(gameManager) {
		this.socket = null;
		this.gameManager = gameManager;
		// temp solution
		let userID = localStorage.getItem('userID');
		if (!userID) {
			userID = this.generateUUID();
			localStorage.setItem('userID', userID);
		}
		console.log("userid:" + userID);
		this.serverUrl = 'wss://' + window.location.host + '/ws/game/' + this.gameManager.gameID + `/?userID=${userID}`;
		this.connect();
		this.isHost = 0;

		this.MessageType = {
			PING: 0,
			PONG: 1,
			GAME_POSITION: 2,
			GAME_START: 3,
			GAME_END: 4,
			CLIENT_TYPE: 5,
			DISCONNECT: 6
		}
	}

	connect() {
		this.socket = new WebSocket(this.serverUrl);

		this.socket.onopen = () => {
			console.log('Socket connected');
		};

		this.socket.onmessage = (event) => {
			// Handle incoming messages from the server
			console.log(event.data);
			const obj = JSON.parse(event.data);
			if (Array.isArray(obj)) {
				obj.forEach(data => {
					this.parseMessage(data);
				});
			}
			else if (obj) {
				this.parseMessage(obj);
			}
			// console.log('Received message from server:', event.data);

		};

		this.socket.onclose = () => {
			console.log('Socket connection closed');
		};

		this.socket.onerror = (error) => {
			console.error('Socket encountered error:', error);
		};
	}

	parseMessage(data) {
		console.log(data);
		switch (data.type) {
			case this.MessageType.CLIENT_TYPE:
				this.gameManager.setRole(data.msg);
				if (data.msg === "host") {
					this.isHost = 1;
				}
				break;
			case this.MessageType.GAME_POSITION:
				if (data.msg == "gameStart") {
					this.gameManager.toggleWaitingMessage(false);
					this.gameManager.togglePause(false);
				}
				else if (data.pp) {/* The code `this.gameManager.handlePaddleMouvement(data);` is calling a method
				named `handlePaddleMouvement` on the `gameManager` object with the `data`
				parameter passed to it. This method is likely responsible for handling the
				movement of a paddle in the game based on the data received from the server. */

					this.gameManager.handlePaddleMouvement(data);
				}
				else if (data.ballPositions)
					this.gameManager.handleBallMouvement(data); // Handle ball movement
				else if (data.ps)
					this.gameManager.game.gui.updatePlayerScores(data.ps.l, data.ps.r)
				break;
			case this.MessageType.GAME_START:
			// console.log(data);
			// break;
			// Add cases for other message types if needed
			default:
				console.log('Unknown message type:', data)
			// console.error('Unknown message type:', data);
		}
	}


	sendGameData(gameData) {
		// Send game data to the server
		if (this.socket.readyState === WebSocket.OPEN) {
			const jsonData = JSON.stringify(gameData);
			console.log("msg sent", jsonData);
			this.socket.send(jsonData);
		} else {
			console.error('Socket connection not open. Unable to send data.');
		}
	}

	sendGameMessage(gameMessage) {
		if (this.socket.readyState === WebSocket.OPEN) {
			const jsonData = JSON.stringify(gameMessage);
			console.log("message sent", jsonData);
			this.socket.send(jsonData);
		} else {
			console.error('Socket connection not open. Unable to send data.');
		}
	}
}
