export class ConfigManager {
    constructor(gameManager) {
        this.gameManager = gameManager;

        this.walls = {
            topWall: {
                width: 15,
                height: 0.1,
                depth: 0.1,
                color: 0x0000ff,
                position: { x: 0, y: 5, z: 0 }
            },
            bottomWall: {
                width: 15,
                height: 0.1,
                depth: 0.1,
                color: 0x0000ff,
                position: { x: 0, y: -5, z: 0 }
            }
        };
        this.paddles = {
            leftPaddle: {
                isLeft: 1,
                width: 1,
                height: 4,
                depth: 1,
                speed: 0.1,
                color: 0xff0000,
                position: { x: -7, y: 0, z: 0 },
                controls: { up: 'w', down: 's' },
                isAI: 0,
                AIInitialDelay: 0
            },
            rightPaddle: {
                isLeft: 0,
                width: 1,
                height: 4,
                depth: 1,
                speed: 0.05,
                color: 0xff0000,
                position: { x: 7, y: 0, z: 0 },
                controls: { up: 'o', down: 'l' },
                isAI: 0,
                AIInitialDelay: 500
            }
        };
        this.ballConfigurations = {
            position: new THREE.Vector3(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            size: 0.5,
            color: 0xff0000,
            maxVelocity: 0.1,
            numberOfBalls: 1,
            duplicateBall: 0,
            speed: 0.05
        };
        this.playerInfo = {
            player1Name: "NANI",
            player2Name: "Twaza",
            gameModeName: "Normal",
            gameWinningScore: 4000
        };
    }

    setLocalNormalConfig() {}

    setLocalDuplipongConfig(){
        this.playerInfo.gameWinningScore = 5000;
		this.ballConfigurations.duplicateBall = 1;
		this.playerInfo.gameModeName = "DupliPong";
    }

    setLocalCustomConfig(){

    }
}

