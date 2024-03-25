
var Display_Ball_Update = false;
var Display_Paddle_Update = false;
var Display_Score_update = false;


export class SocketManager {


	// Constructor
	constructor(gameManager) {
		this.socket = null;
		this.gameManager = gameManager;
		this.serverUrl = 'wss://' + window.location.host + '/ws/game/' + this.gameManager.gameID + '/';
		this.connect();
		this.isHost = 0;			// -1 ? spectator ?

		this.MessageType = {
			PING: 0,				//
			PONG: 1,				//
			GAME_POSITION: 2,
			GAME_START: 3,
			GAME_END: 4,			//
			CLIENT_TYPE: 5,
			DISCONNECT: 6			//
		}
	}


	// Try to Connect
	connect() {
		this.socket = new WebSocket(this.serverUrl);

		// On Creation
		this.socket.onopen = () => { console.log('Socket connected'); };

		// On Data Received
		this.socket.onmessage = (event) => {

			// Jsonify
			const obj = JSON.parse(event.data);

			// List of Data
			if (Array.isArray(obj)) { obj.forEach(data => { this.parseMessage(data); }); }

			// Single Data
			else if (obj) { this.parseMessage(obj); }



		};

		// On Close
		this.socket.onclose = () => 		{ console.log('------> Socket connection closed <------ '); };

		// Error
		this.socket.onerror = (error) => 	{ console.log(`------> Socket encountered error: ${error} <------`); };
	}

	// PARSE DATA
	parseMessage(data) {

		switch (data.type) {

			// --------------------------------------------------------------------------- Message Type [ TYPE 5 ]
			case this.MessageType.CLIENT_TYPE:

				console.log(`Set Role: ${data}`);

				this.gameManager.setRole(data.msg);

				// Set as Host
				if (data.msg = "host") { this.isHost = 1; }


				break;

			// --------------------------------------------------------------------------- Game Data [ TYPE 2 ]
			case this.MessageType.GAME_POSITION:

				// Start Game
				if (data.msg == "gameStart") {
					console.log(`Start Game: ${JSON.stringify(data)}`);
					this.gameManager.toggleWaitingMessage(false);
					this.gameManager.togglePause(false);
				}

				// Paddle
				else if (data.pp) {

					if (Display_Paddle_Update) console.log(`Paddle Update: ${JSON.stringify(data)}`);

					this.gameManager.handlePaddleMouvement(data);
				}

				// Ball Update
				else if (data.ballPositions) { 

					if (Display_Ball_Update) console.log(`Ball Update: ${JSON.stringify(data)}`);

					this.gameManager.handleBallMouvement(data); 
				} 


				// Score Update
				else if (data.ps) {

					if (Display_Score_update) console.log(`Score Update: ${JSON.stringify(data)}`);
					
					this.gameManager.game.gui.updatePlayerScores(data.ps.l, data.ps.r); 
				}

				// Score End
				break;

			


			// --------------------------------------------------------------------------- Game Start [ TYPE 3 ]
			case this.MessageType.GAME_START: 
				console.log(`Game Start: ${JSON.stringify(data)}`);

				// Game Start End
				break;



			// OTHERS
			default:
				console.error(`Not yet Added Message Type: ${JSON.stringify(data)}`);

				// OTHERS End
				break
		}
	}

	// Sending Data
	sendGameData(gameData) {


		if (this.socket.readyState === WebSocket.OPEN) {

			const jsonData = JSON.stringify(gameData);

			console.log("Message Sent [0]: ", jsonData);
			this.socket.send(jsonData);
		}
		else { console.error('Socket connection not open. Unable to send data.'); }
	}

	// Game Message
	sendGameMessage(gameMessage) {
		if (this.socket.readyState === WebSocket.OPEN) {

			const jsonData = JSON.stringify(gameMessage);
			console.log("Message Sent [1]", jsonData);

			this.socket.send(jsonData);
		} else {
			console.error('Socket connection not open. Unable to send data.');
		}
	}
}
