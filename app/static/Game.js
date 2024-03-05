import { BallContainer } from './BallContainer.js';
import { Gui } from './Gui.js';
import { Wall } from './Wall.js';
import { Paddle } from './Paddle.js';
import { ScoreTracker } from './ScoreTracker.js';
import { EndGameManager } from './EndGameManager.js';
import { Scene } from './Scene.js';

export class Game {
    constructor(gameManager) {
        this.gameManager =gameManager;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.gui = null;
        this.endGameManager = null;
        this.scoreTracker = null;
        this.ballContainer = null;
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.topWall = null;
        this.bottomWall = null;
        this.isPaused = false;
    }

    async initialize(newConfig) {
        // Create my scene
        const myScene = new Scene();
        this.scene = myScene.getScene();
        this.camera = myScene.getCamera();
        this.renderer = myScene.getRenderer();

        // Create GUI, EndGameManager and scoreTracker
        this.gui = new Gui(this.scene, newConfig.playerInfo);
        await this.gui.initGui();

        this.endGameManager = new EndGameManager(this.scene, this.gui, newConfig.ballConfigurations.duplicateBall, this.gameManager);
        this.scoreTracker = new ScoreTracker(this.gui, this.endGameManager, newConfig.playerInfo, this);
        this.endGameManager.setScoreTracker(this.scoreTracker);

        // Create ball container
        this.ballContainer = new BallContainer(this.scene, newConfig.ballConfigurations, this.scoreTracker);
        this.endGameManager.setBallContainer(this.ballContainer);
        this.endGameManager.setBallConfigurations(newConfig.ballConfigurations);

        // Create walls
        this.topWall = new Wall(this.scene, newConfig.walls.topWall);
        this.bottomWall = new Wall(this.scene, newConfig.walls.bottomWall);

        // Create paddles
        this.leftPaddle = new Paddle(this.scene, newConfig.paddles.leftPaddle, [this.topWall, this.bottomWall], newConfig.paddles.leftPaddle.isAI);
        this.rightPaddle = new Paddle(this.scene, newConfig.paddles.rightPaddle, [this.topWall, this.bottomWall], newConfig.paddles.rightPaddle.isAI);

        this.endGameManager.setLeftpaddle(this.leftPaddle);
        this.endGameManager.setRightpaddle(this.rightPaddle);
        
        if (newConfig.paddles.rightPaddle.isAI)
            this.rightPaddle.setBallContainer(this.ballContainer);
        if (newConfig.paddles.leftPaddle.isAI)
            this.leftPaddle.setBallContainer(this.ballContainer);


    }

    clearScene() {
        // Remove all objects from the scene
        while (this.scene.children.length > 0) {
            const object = this.scene.children[0];
    
            // Dispose of any geometry, material, or textures associated with the object
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
    
            // Remove the object from the scene
            this.scene.remove(object);
        }
    
        // Dispose renderer resources
        this.renderer.dispose();
    
        // Remove event listeners, dispose of other resources, etc.
        // (Add additional cleanup steps as needed)
    
        // Reset other properties
        this.camera = null;
        this.renderer = null;
        this.gui = null;
        this.endGameManager = null;
        this.scoreTracker = null;
        this.ballContainer = null;
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.topWall = null;
        this.bottomWall = null;
    }
}


