export class AI {
    constructor(paddle, walls, initialDelay) {
        this.paddle = paddle;
        this.ballContainer = null;
        this.walls = walls;
        this.nextBallPosition = null;
        this.lastBallPosition = new THREE.Vector3(0, 0, 0);
        this.centerPositionThreshold = 5;

        // Create a raycaster instance
        this.raycaster = new THREE.Raycaster(
            this.position,
            new THREE.Vector3(0, 0, 0),
            0,
            this.paddle.height / 2
        );
        this.currentTime = Date.now();
        this.initialDelay = initialDelay; // Initial delay before this AI starts calculating (in milliseconds)
        this.lastUpdateTime = this.currentTime - this.initialDelay;
        this.updateInterval = 1000; 
    }

    setBallContainer(ballContainer) {
        this.ballContainer = ballContainer;
    }

    checkWallCollision(walls, direction) {
        // Iterate over each wall
        for (let wall of walls) {
            // Update the raycaster with the current paddle position and direction
            this.raycaster.set(this.paddle.mesh.position, direction);

            // Perform raycasting for the current wall
            const intersects = this.raycaster.intersectObject(wall.mesh);

            // Check for collision with the current wall
            if (intersects.length > 0) {
                // console.log("col");
                return true; // Collision detected with this wall
            }
        }

        return false; // No collision detected with any wall
    }

    update() {
        if (!this.ballContainer) {
            console.error("Ball container not set for AI.");
            return;
        }

        // Get the ball from the container
        const balls = this.ballContainer.getBalls();

        // Assuming there's only one ball, retrieve the first one
        const ball = balls[0];

        // Check if ball or its mesh is undefined
        if (!ball || !ball.mesh) {
            console.error("Ball or its mesh is undefined.");
            return;
        }

        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime >= this.updateInterval) {
            // Calculate the velocity of the ball

            let velocity = ball.mesh.position.clone().sub(this.lastBallPosition);

            // Predict the next position of the ball based on its velocity
            this.nextBallPosition = ball.mesh.position.clone().add(velocity);

            // const randomY = (Math.random() * 2) - 1; // Random value between -1 and +1 for y-coordinate
            // this.nextBallPosition.y += randomY;

            // console.log("nextball pos", this.nextBallPosition.y);
            // console.log("paddle y pos", this.paddle.mesh.position.y);
            this.lastBallPosition = ball.mesh.position.clone();
            this.lastUpdateTime = currentTime; // Update the lastUpdateTime
        }
        if (this.BallIsGoingLeft(this.lastBallPosition, ball.mesh.position) === this.paddle.isLeft) {
            if (this.paddle.mesh.position.y > 0 + this.paddle.speed) {
                // Paddle is above the center, move down
                this.paddle.mesh.position.y -= this.paddle.speed;
            }
            else if (this.paddle.mesh.position.y < 0 - this.paddle.speed) {
                // Paddle is below the center, move up
                this.paddle.mesh.position.y += this.paddle.speed;
            }
        }
        else {
            if (this.nextBallPosition && this.nextBallPosition.y > this.paddle.mesh.position.y && this.nextBallPosition.y - this.paddle.mesh.position.y > 0.1) {
                // Check for collision with the wall before moving
                if (!this.checkWallCollision(this.paddle.walls, new THREE.Vector3(0, 1, 0))) {
                    this.paddle.mesh.position.y += this.paddle.speed;
                    // console.log("move up");
                }
            }
            else if (this.nextBallPosition && this.nextBallPosition.y < this.paddle.mesh.position.y && this.paddle.mesh.position.y - this.nextBallPosition.y > 0.1) {
                // Check for collision with the wall before moving
                if (!this.checkWallCollision(this.paddle.walls, new THREE.Vector3(0, -1, 0))) {
                    this.paddle.mesh.position.y -= this.paddle.speed;
                    // console.log("move down");
                }
            }
        }
    }

    BallIsGoingLeft(lastBallPosition, ballPosition) {
        if (lastBallPosition && ballPosition) {
            // Check if the ball is moving towards the paddle or away from it in the x-axis
            if (ballPosition.x > lastBallPosition.x) {
                return 1; // Ball is moving towards the paddle
            } else if (ballPosition.x < lastBallPosition.x) {
                return 0; // Ball is moving away from the paddle
            }
        }
    }
}
