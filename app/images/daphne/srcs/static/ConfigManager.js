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
                speed: 0.1,
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
        this.testConfig = {
            isOnline: 1,
            mode: "normal",
            localIsAI: 0,
            isHost: 1,
            gameID: 123,
            localcustom: {
                leftPlayerName: "knewl",
                leftPlayerColor: 0xff00ff,
                leftPlayerIsAI: 1,
                leftPaddleSize: 4,
                leftPaddleSpeed: 0.1,
                leftPaddleControls: { up: 'w', down: 's' },
                rightPlayerName: "nice",
                rightPlayerColor: 0xffff00,
                rightPlayerIsAI: 1,
                rightPaddleSize: 1,
                rightPaddleSpeed: 0.1,
                rightPaddleControls: { up: 'o', down: 'l' },
                numberOfBalls: 1,
                ballStartingSpeed: 0.05,
                ballSize: 1,
                gameWinningScore: 100,
                isDuplicatePong: 0,
                gameModeName: "customized"
            }  
        }
    }

    setOnlineConfig(){

    }

    setLocalConfig(){
        this.gameManager.mode = this.testConfig.mode;
        this.gameManager.isRemote = this.testConfig.isOnline;
        this.gameManager.ConfigManager.paddles.rightPaddle.isAI = this.testConfig.localIsAI;
        if (this.gameManager.isRemote)
            this.gameManager.gameID = this.testConfig.gameID;
        if (this.gameManager.mode === "normal")
            return;
        else if (this.gameManager.mode === "duplipong"){
            this.playerInfo.gameWinningScore = 5000;
		    this.ballConfigurations.duplicateBall = 1;
		    this.playerInfo.gameModeName = "DupliPong";
        }
        else if (this.gameManager.mode === "custom"){
            this.playerInfo.player1Name = this.testConfig.localcustom.leftPlayerName;
            this.paddles.leftPaddle.color = this.testConfig.localcustom.leftPlayerColor;
            this.paddles.leftPaddle.isAI = this.testConfig.localcustom.leftPlayerIsAI;
            this.paddles.leftPaddle.height = this.testConfig.localcustom.leftPaddleSize;
            this.paddles.leftPaddle.controls = this.testConfig.localcustom.leftPaddleControls;
            this.paddles.leftPaddle.speed = this.testConfig.localcustom.leftPaddleSpeed;


            this.playerInfo.player2Name = this.testConfig.localcustom.rightPlayerName;
            this.paddles.rightPaddle.color = this.testConfig.localcustom.rightPlayerColor;
            this.paddles.rightPaddle.isAI = this.testConfig.localcustom.rightPlayerIsAI;
            this.paddles.rightPaddle.height = this.testConfig.localcustom.rightPaddleSize;
            this.paddles.rightPaddle.controls = this.testConfig.localcustom.rightPaddleControls;
            this.paddles.rightPaddle.speed = this.testConfig.localcustom.rightPaddleSpeed;


            this.ballConfigurations.numberOfBalls = this.testConfig.localcustom.numberOfBalls;
            this.ballConfigurations.speed = this.testConfig.localcustom.ballStartingSpeed;
            this.ballConfigurations.size = this.testConfig.localcustom.ballSize;
            this.playerInfo.gameWinningScore = this.testConfig.localcustom.gameWinningScore;
            this.ballConfigurations.duplicateBall = this.testConfig.localcustom.isDuplicatePong;
            this.playerInfo.gameModeName = this.testConfig.localcustom.gameModeName;
        }

    }

    getGameConfig(){
        // if (this.isOnline)
        //     // setOnlineConfig();
        //     return;
        // else 
            this.setLocalConfig();
        this.gameManager.startGame();
    }

    setLocalNormalConfig() {}

    setLocalDuplipongConfig(){
        this.playerInfo.gameWinningScore = 5000;
		this.ballConfigurations.duplicateBall = 1;
		// this.playerInfo.gameModeName = "DupliPong";
    }

    setLocalCustomConfig(){

    }
}

