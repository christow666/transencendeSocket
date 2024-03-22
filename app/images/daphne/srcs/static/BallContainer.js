import { Ball } from './Ball.js'; // Import the Ball class from Ball.js
import { CollisionManager } from './CollisionManager.js';

// BallContainer.js
export class BallContainer {
    constructor(scene, ballConfigurations, scoreTracker) {
        this.scene = scene;
        this.balls = [];
        this.collisionManager = new CollisionManager();

        // Initialize ball configurations
        this.ballConfigurations = ballConfigurations;

        const numberOfBallsToAdd = ballConfigurations.numberOfBalls;
        for (let i = 0; i < numberOfBallsToAdd; i++) {
            const ball = new Ball(scene, ballConfigurations, scoreTracker, this, this.collisionManager); // Pass the collisionManager
            this.balls.push(ball);
        }
    }

    getBalls() {
        return this.balls;
    }

    update(player1Paddle, player2Paddle, topWall, bottomWall) {
        this.balls.forEach(ball => {
            ball.update(player1Paddle, player2Paddle, topWall, bottomWall);
        });
    }

    freezeAll() {
        this.balls.forEach(ball => {
            ball.freeze();
        });
    }
}
