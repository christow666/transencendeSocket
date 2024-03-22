// File: GameManager.js
import { Game } from './Game.js';
import { Configs } from './config.js';
import { ConfigManager } from './ConfigManager.js';
import { SocketManager } from './SocketManager.js';
import { Menu } from './Menu.js';

class GameManager {
	constructor() {
		this.game = null;
		this.isPaused = false;
		this.isMenued = true;
		this.animationFrameId = null;
		this.originalConfigs = Configs; // Store the original configuration
		this.gameData = null;
		this.role = null;
		this.isRemote = 0;
		this.gameID = 0;
		// this.menu = new Menu(this);
		this.ConfigManager = new ConfigManager(this);
		// this.initializeMenu();
		this.initializeKeyPressListener(); // Add event listener for key presses
		this.waitingMessageElement = document.getElementById('waitingMessage');

		this.animateBound = this.animate.bind(this);
		// Initial call to start the animation loop
		this.animateBound();
	}

	sendGameDataToServer() {
		this.socketManager.sendGameData(this.gameData);
	}

	setRole(role) {
		this.role = role;
		console.log("role setted to", role)
	}

	initializeKeyPressListener() {
		document.addEventListener('keydown', (event) => this.handleKeyPress(event));
	}

	async startGame(){
		if (this.isRemote){
			this.socketManager = new SocketManager(this);
			await this.waitForRole();
			if (this.role == "host") {
				this.toggleWaitingMessage(true);
				this.togglePause(true);
			}
			else if (this.role == "guest") {
				this.socketManager.sendGameData({ type: 2, msg: "gameStart" })
			}
		}

		this.game = new Game(this);

		await this.game.initialize(this.ConfigManager, this.socketManager);
		this.isMenued = false;

		this.renderGameScene();
		this.animate();
	}

	// async handleLocalModeSelection(mode, isVsAi) {
	// 	if (isVsAi)
	// 		this.ConfigManager.paddles.rightPaddle.isAI = true;
	// 	if (mode === 'localNormal')
	// 		this.ConfigManager.setLocalNormalConfig();
	// 	else if (mode === 'localDupliPong')
	// 		this.ConfigManager.setLocalDuplipongConfig();
	// 	else if (mode === 'localCustom')
	// 		this.ConfigManager.setLocalCustomConfig();

	// 	this.game = new Game(this);
	// 	document.getElementById('mainMenu').style.display = 'none';
	// 	document.getElementById('localMenu').style.display = 'none';
	// 	document.getElementById('onlineMenu').style.display = 'none';

	// 	await this.game.initialize(this.ConfigManager, this.socketManager);
	// 	this.isMenued = false;

	// 	this.renderGameScene();
	// 	this.animate();
	// }

	// async handleModeSelection(mode) {
	// 	if (this.game) {
	// 		this.stopGame();
	// 	}

	// 	let newConfig = this.deepCopy(this.originalConfigs);

	// 	if (mode === 2) {
	// 		newConfig.playerInfo.gameWinningScore = 5000;
	// 		newConfig.ballConfigurations.duplicateBall = 1;
	// 		newConfig.playerInfo.gameModeName = "DupliPong";
	// 		newConfig.paddles.rightPaddle.isAI = 1;
	// 		newConfig.paddles.leftPaddle.isAI = 1;
	// 	}
	// 	else if (mode === 3) {
	// 		newConfig.playerInfo.gameWinningScore = 500;
	// 		newConfig.ballConfigurations.numberOfBalls = 1;
	// 		newConfig.playerInfo.gameModeName = "Vs AI";
	// 		newConfig.paddles.leftPaddle.height = 3;
	// 		newConfig.paddles.rightPaddle.height = 3;
	// 		newConfig.paddles.rightPaddle.isAI = 1;
	// 		newConfig.paddles.leftPaddle.isAI = 1;
	// 	}
	// 	else if (mode === 4) {
	// 		newConfig.playerInfo.gameModeName = "Remote Play";
	// 		// newConfig.ballConfigurations.duplicateBall = 1;
	// 		this.socketManager = new SocketManager(this);
	// 		await this.waitForRole();
	// 		if (this.role == "host") {
	// 			this.toggleWaitingMessage(true);
	// 			this.togglePause(true);
	// 		}
	// 		else if (this.role == "guest") {
	// 			this.socketManager.sendGameData({ type: 2, msg: "gameStart" })
	// 		}

	// 	}

	// 	this.game = new Game(this);
	// 	document.getElementById('mainMenu').style.display = 'none';
	// 	// document.getElementById('localMenu').style.display = 'none';
	// 	// document.getElementById('onlineMenu').style.display = 'none';
	// 	await this.game.initialize(newConfig, this.socketManager);
	// 	this.isMenued = false;

	// 	this.renderGameScene();
	// 	this.animate();
	// }

	async waitForRole() {
		// Use a promise to wait for the role to be set
		return new Promise(resolve => {
			const checkRole = () => {
				if (this.role) {
					resolve();
				} else {
					setTimeout(checkRole, 100); // Check again after 100ms
				}
			};
			checkRole(); // Initial call to start checking
		});
	}

	handlePaddleMouvement(data) {
		if (this.role == "host") {
			this.game.rightPaddle.mesh.position.x = data.pp.x;
			this.game.rightPaddle.mesh.position.y = data.pp.y;
		}
		else if (this.role == "guest") {
			this.game.leftPaddle.mesh.position.x = data.pp.x;
			this.game.leftPaddle.mesh.position.y = data.pp.y;
		}
	}

	handleBallMouvement(data) {
		// Ensure that this.game.ballContainer is not null
		if (this.game.ballContainer) {
			const balls = this.game.ballContainer.getBalls();
			// Ensure that data.ballPositions is not null and has at least one element
			if (data.ballPositions && data.ballPositions.length > 0) {
				let length = balls.length;
				let positionLength = data.ballPositions.length;
				for (let index = 0; index < length; index++) {
					if (index < positionLength) {
						// Set the position of the current ball based on the corresponding element of data.ballPositions
						balls[index].mesh.position.x = data.ballPositions[index * 2];
						balls[index].mesh.position.y = data.ballPositions[index * 2 + 1];
					} else {
						console.error('Invalid ball positions data:', data.ballPositions);
						break; // Exit the loop if there are no corresponding ball positions
					}
				}
			} else {
				console.error('Invalid or empty ball positions data:', data.ballPositions);
			}
		} else {
			console.error('Ball container is not initialized.');
		}
	}

	serializePaddlePosition(paddle) {
		const playerPositions = {
			type: 2,
			"pp": {
				"x": paddle.mesh.position.x,
				"y": parseFloat(paddle.mesh.position.y.toFixed(1))
			}
		};
		return playerPositions;
	}

	serializeBallPosition() {
		const ballPositions = this.game.ballContainer.getBalls().reduce((acc, ball) => {
			acc.push(parseFloat(ball.mesh.position.x.toFixed(2)));
			acc.push(parseFloat(ball.mesh.position.y.toFixed(2)));
			return acc;
		}, []);
		return {
			type: 2,
			ballPositions: ballPositions
		};
	}

	animate() {
		if (!this.isPaused && this.game && !this.isMenued) {
			if (this.role == "host") {
				let playerScore1 = this.game.scoreTracker.player1Score;
				let playerScore2 = this.game.scoreTracker.player2Score;
				let array = [];
				if (this.game.leftPaddle.update()) {
					// this.socketManager.sendGameMessage(this.serializePaddlePosition(this.game.leftPaddle));
					array.push(this.serializePaddlePosition(this.game.leftPaddle))
				}
				this.game.ballContainer.update(this.game.leftPaddle.mesh, this.game.rightPaddle.mesh, this.game.topWall, this.game.bottomWall);
				// this.socketManager.sendGameData(this.serializeBallPosition());
				array.push(this.serializeBallPosition());
				if (playerScore1 !== this.game.scoreTracker.player1Score
					|| playerScore2 !== this.game.scoreTracker.player2Score) {
					if (this.socketManager.isHost)
						array.push(this.game.scoreTracker.serializePlayerScore());
					// this.socketManager.sendGameData(this.game.scoreTracker.serializePlayerScore());
				}
				this.socketManager.sendGameData(array);
			}
			else if (this.role == "guest") {
				if (this.game.rightPaddle.update()) {
					let array = [];
					// this.socketManager.sendGameMessage(this.serializePaddlePosition(this.game.rightPaddle));
					array.push(this.serializePaddlePosition(this.game.rightPaddle));
					this.socketManager.sendGameMessage(array);
				}
				// this.socketManager.sendGameMessage(this.serializePaddlePosition(this.game.rightPaddle));
			}
			else {
				this.game.rightPaddle.update();
				this.game.leftPaddle.update();
				this.game.ballContainer.update(this.game.leftPaddle.mesh, this.game.rightPaddle.mesh, this.game.topWall, this.game.bottomWall);
			}
			this.game.renderer.render(this.game.scene, this.game.camera);
		}
		if (!this.isPaused && !this.isMenued)
			this.animationFrameId = requestAnimationFrame(this.animateBound);
	}

	renderGameScene() {
		const gameContainer = document.getElementById('gameContainer');
		gameContainer.innerHTML = '';
		gameContainer.appendChild(this.game.renderer.domElement);
	}

	stopGame() {
		if (this.game) {
			this.game.clearScene();
			this.game = null;
			this.isMenued = true;
		}
		cancelAnimationFrame(this.animationFrameId);
		document.getElementById('startMenu').style.display = 'block';
	}

	handleKeyPress(event) {
		if (event.key === 'p' && !this.isMenued) {
			console.log("p")
			this.togglePause();
		}
		else if (event.key === 'r')
			this.resetGame();
		else if (event.key === 'm' && !this.isMenued) {
			this.game.endGameManager.hideEndGameMessage();
			this.stopGame();
			// if (this.isPaused)
			this.togglePause(false);
		}
		else if (event.key === 'd') {
			if (this.socketManager)
				this.socketManager.socket.close();
		}
	}

	resetGame() {
		if (this.game && this.game.endGameManager) {
			this.game.endGameManager.resetGame();
			// if (this.isPaused) {
			// this.togglePause(true);
			// }
		}
	}

	togglePause(paused) {
		if (paused !== undefined) {
			this.isPaused = !this.isPaused;
			requestAnimationFrame(this.animateBound);
			return;
		}
		this.isPaused = paused ? paused : !this.isPaused;
		if (!this.isPaused)
			requestAnimationFrame(this.animateBound);
	}

	deepCopy(obj) {
		if (typeof obj !== 'object' || obj === null) {
			return obj;
		}
		const newObj = Array.isArray(obj) ? [] : {};
		for (let key in obj) {
			if (obj[key] instanceof THREE.Vector3) {
				newObj[key] = new THREE.Vector3().copy(obj[key]);
			} else {
				newObj[key] = this.deepCopy(obj[key]);
			}
		}
		return newObj;
	}

	toggleWaitingMessage(visible) {
		this.waitingMessageElement.style.display = visible ? 'block' : 'none';
	}
}

export { GameManager };
