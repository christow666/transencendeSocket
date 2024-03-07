// File: GameManager.js
import { Game } from './Game.js';
import { Configs } from './config.js';
import { SocketManager } from './SocketManager.js';

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
        this.initializeMenu();
        this.initializeKeyPressListener(); // Add event listener for key presses
        this.waitingMessageElement = document.getElementById('waitingMessage');
    }

    sendGameDataToServer() {
        this.socketManager.sendGameData(this.gameData);
    }

    setRole(role) {
        this.role = role;
        console.log("role setted to", role)
    }

    serializeGameData() {
        if (this.isMenued)
            return
        const playerPositions = {
            "lp": {"x": this.game.leftPaddle.mesh.position.x,
                            "y": parseFloat(this.game.leftPaddle.mesh.position.y.toFixed(1))},
            "rp": {"x": this.game.rightPaddle.mesh.position.x,
                            "y": parseFloat(this.game.rightPaddle.mesh.position.y.toFixed(1))}
        };
        
        const ballPositions = this.game.ballContainer.getBalls().map(ball => {
            return {"x":parseFloat(ball.mesh.position.x.toFixed(1)) , "y": parseFloat(ball.mesh.position.y.toFixed(1))};
        });

        this.gameData = {
            type : 2,
            pp : playerPositions,
            bp : ballPositions,
        };
    }

    

    initializeKeyPressListener() {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
    }
    
    initializeMenu() {
        document.addEventListener('DOMContentLoaded', () => {
            const startMenu = document.getElementById('startMenu');
            startMenu.style.display = 'block';

            document.getElementById('mode1').addEventListener('click', () => this.handleModeSelection(1));
            document.getElementById('mode2').addEventListener('click', () => this.handleModeSelection(2));
            document.getElementById('mode3').addEventListener('click', () => this.handleModeSelection(3));
            document.getElementById('mode4').addEventListener('click', () => this.handleModeSelection(4));
        });
    }

    async handleModeSelection(mode) {
        if (this.game) {
            this.stopGame();
        }

        let newConfig = this.deepCopy(this.originalConfigs);

        if (mode === 2) {
            newConfig.playerInfo.gameWinningScore = 5000;
            newConfig.ballConfigurations.duplicateBall = 1;
            newConfig.playerInfo.gameModeName = "DupliPong";
            newConfig.paddles.rightPaddle.isAI = 1;
            newConfig.paddles.leftPaddle.isAI = 1;
        }
        else if (mode === 3) {
            newConfig.playerInfo.gameWinningScore = 500;
            newConfig.ballConfigurations.numberOfBalls = 1;
            newConfig.playerInfo.gameModeName = "Vs AI";
            newConfig.paddles.leftPaddle.height = 3;
            newConfig.paddles.rightPaddle.height = 3;
        	newConfig.paddles.rightPaddle.isAI = 1;
            newConfig.paddles.leftPaddle.isAI = 1;
        }
        else if (mode === 4){
            newConfig.playerInfo.gameModeName = "Remote Play";
            this.socketManager = new SocketManager(this);
            await this.waitForRole();
            if (this.role == "host") {
                this.toggleWaitingMessage(true);
                this.togglePause(true);
            }
            else if (this.role == "guest"){
                this.socketManager.sendGameData({type : 2, msg: "gameStart"})
            }
            
        }

        this.game = new Game(this);
        document.getElementById('startMenu').style.display = 'none';
        await this.game.initialize(newConfig);
        this.isMenued = false;

        this.renderGameScene();
        this.animate();
    }

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
        if (this.role == "host"){
            this.game.rightPaddle.mesh.position.x = data.pp.x;
            this.game.rightPaddle.mesh.position.y = data.pp.y;
        }
        else if (this.role == "guest") {
            this.game.leftPaddle.mesh.position.x = data.pp.x;
            this.game.leftPaddle.mesh.position.y = data.pp.y;
        }
    }

    serializePaddlePosition(paddle) {
        const playerPositions = {
            type : 2,
            "pp": { "x": paddle.mesh.position.x,
                    "y": parseFloat(paddle.mesh.position.y.toFixed(1))}
        };
        return playerPositions;
    }

    serializeBallPosition() {
        const ballPositions = this.game.ballContainer.getBalls().map(ball => {
            return {"x":parseFloat(ball.mesh.position.x.toFixed(1)) , "y": parseFloat(ball.mesh.position.y.toFixed(1))};
        });
        return ballPositions;
    }

    animate() {
        if (!this.isPaused && this.game && !this.isMenued) {
            if (this.role == "host") {
                if (this.game.leftPaddle.update())
                    this.socketManager.sendGameMessage(this.serializePaddlePosition(this.game.leftPaddle));
                this.game.ballContainer.update(this.game.leftPaddle.mesh, this.game.rightPaddle.mesh, this.game.topWall, this.game.bottomWall);
                this.socketManager.sendGameData(this.serializeBallPosition());
            }
            else if (this.role == "guest") {
                if (this.game.rightPaddle.update())
                    this.socketManager.sendGameMessage(this.serializePaddlePosition(this.game.rightPaddle));
                // this.game.ballContainer.updateFromHost(this.game.leftPaddle.mesh, this.game.rightPaddle.mesh, this.game.topWall, this.game.bottomWall);
                // this.game.rightPaddle.updateFromHost();
            }
            else {
                this.game.rightPaddle.update();
                this.game.leftPaddle.update();
                this.game.ballContainer.update(this.game.leftPaddle.mesh, this.game.rightPaddle.mesh, this.game.topWall, this.game.bottomWall);
            }


            // this.game.ballContainer.update(this.game.leftPaddle.mesh, this.game.rightPaddle.mesh, this.game.topWall, this.game.bottomWall);
            this.game.renderer.render(this.game.scene, this.game.camera);
        }



        // Schedule serialization and logging every 2 seconds
        // if (!this.isPaused && !this.isMenued && !this.serializationTimeoutId) {
        //     this.serializationTimeoutId = setTimeout(() => {
        //         this.serializeGameData();
        //         // const jsonData = JSON.stringify(this.gameData)
        //         // console.log(jsonData);
        //         this.sendGameDataToServer(); // Uncomment this line to send game data to the server
        //         this.serializationTimeoutId = null;
        //     }, 2000);
        // }

        if (!this.isPaused && !this.isMenued)
            this.animationFrameId = requestAnimationFrame(() => this.animate());
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
        if (event.key === 'p' && !this.isMenued){
            console.log("p")
            this.togglePause();
        }
        else if (event.key === 'r')
            this.resetGame();
        else if (event.key === 'm' && !this.isMenued){
            this.game.endGameManager.hideEndGameMessage();
            this.stopGame();
            // if (this.isPaused)
                this.togglePause(false);   
        }
        else if (event.key === 'd'){
            if (this.socketManager)
                this.socketManager.socket.close();
        }
    }

    resetGame() {
        if (this.game && this.game.endGameManager) {
            this.game.endGameManager.resetGame();
            // if (this.isPaused) {
                this.togglePause(false);
            // }
        }
    }

    togglePause(paused) {
        if (paused !== undefined) {
            this.isPaused = !this.isPaused;
            requestAnimationFrame(() => this.animate());
            return;
        }
        this.isPaused = paused ? paused : !this.isPaused;
        if (!this.isPaused)
            requestAnimationFrame(() => this.animate());
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
