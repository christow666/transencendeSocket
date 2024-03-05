export class EndGameManager {
    constructor(scene, gui, duplacateBall, gameManager) {
        this.gameManager = gameManager;
        this.scene = scene;
        this.doReset = false;
        this.duplicateBall = duplacateBall;
        this.lastResetTime = 0;
        this.gui = gui;
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.animationFrameId = null; // Declare animationFrameId at the class level

        // // Bind event listener for keydown event
        // this.handleKeyPress = this.handleKeyPress.bind(this);
        // document.addEventListener('keydown', this.handleKeyPress);
    }

    setLeftpaddle(leftPaddle){
        this.leftPaddle =leftPaddle;
    }

    setRightpaddle(rightPaddle){
        this.rightPaddle = rightPaddle;
    }

    setBallConfigurations(ballConfigurations) {
        this.ballConfigurations = ballConfigurations; // Assign the provided scoreTracker instance
    }

    setScoreTracker(scoreTracker) {
        this.scoreTracker = scoreTracker; // Assign the provided scoreTracker instance
    }
    
    setBallContainer(ballContainer) {
        this.ballContainer = ballContainer; // Assign the provided ballContainer instance
    }
    
    // End game method
    endGame(winnerName) {
        this.ballContainer.balls.forEach(ball => {
            ball.freeze(); // Freeze all balls
        });
        this.gameManager.togglePause();
        this.gui.showEndGameMessage(winnerName);
    }

    resetGame() {
        if (this.duplicateBall){
            if (this.ballContainer) {
                const ballsToRemove = this.ballContainer.balls.length - this.ballConfigurations.numberOfBalls;
                for (let i = 0; i < ballsToRemove; i++) {
                    const ball = this.ballContainer.balls.pop(); // Remove ball from the end of the array
                    ball.removeFromContainer(); // Custom method to remove ball from container and scene
                }

                // Reset remaining balls
                this.ballContainer.balls.forEach(ball => {
                    ball.reset(); // Reset ball properties
                });
            }
        }
        else {
            // Reset existing balls instead of removing them
            if (this.ballContainer) {
                this.ballContainer.balls.forEach(ball => {
                    ball.reset(); // Reset ball properties
                });
            }
        }
    
        // Reset the scores using the ScoreTracker
        this.scoreTracker.resetScores();
    
        // Update GUI
        this.gui.hideEndGameMessage();
        this.gui.resetScores();
        this.doReset = false;
        this.leftPaddle.reset();
        this.rightPaddle.reset(); 

    }

    hideEndGameMessage() {
        this.gui.hideEndGameMessage();
    }

    removeFromContainer(ball) {
        // Remove the ball from the container's array
        const index = this.ballContainer.balls.indexOf(ball);
        if (index !== -1) {
            this.ballContainer.balls.splice(index, 1);
        }

        // Remove the ball from the scene
        this.scene.remove(ball.mesh);
    }

    // Cleanup method to remove event listener
    cleanup() {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    
}
