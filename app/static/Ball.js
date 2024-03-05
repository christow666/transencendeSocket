// Ball.js
export class Ball {
    constructor(scene, ballConfigurations, scoreTracker, container, collisionManager) {
        this.scene = scene;
        this.container = container;
        this.collisionManager = collisionManager;
        this.ballConfigurations = ballConfigurations;
        this.geometry = new THREE.SphereGeometry(ballConfigurations.size, 32, 32);
        this.material = new THREE.MeshStandardMaterial({ color: ballConfigurations.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.velocity = ballConfigurations.velocity.clone();
        this.maxVelocity = ballConfigurations.maxVelocity;
        this.duplicateBall = ballConfigurations.duplicateBall;
        this.scoreTracker = scoreTracker;
        this.speed = ballConfigurations.speed;

        // Set initial position of the ball
        this.mesh.position.copy(ballConfigurations.position); // Set ball position

        // Set initial velocity of the ball
        this.velocity.x = 0.1 * (Math.random() > 0.5 ? 1 : -1);// (randomize direction)
        this.velocity.y = Math.random() * 0.1 - 0.05;
        this.velocity.y = parseFloat((Math.random() * 0.1 - 0.05).toFixed(2));
        this.velocity.clampLength(0, this.speed);

        // Add the ball mesh to the scene
        this.scene.add(this.mesh);

        // Initialize last collision time for paddles
        this.lastPlayerCollisionTime = Date.now();
        this.lastPlayer2CollisionTime = Date.now();
        this.paddleCollisionCooldown = 500; // Adjust the cooldown time as needed

        // Create a raycaster instance
        this.raycaster = new THREE.Raycaster(
            this.position,
            new THREE.Vector3(0, 0, 0),
            0,
            ballConfigurations.size
        );

        // Set duplicateBall paramaters
        this.duplicateCounter = 0;

        // Set audio
        // this.soundBozo = new Audio('./bozo.mp3');
    }

    // Function to play sound effect 1
    playSoundBozo() {
        // this.soundBozo.play();
    }

    update(player1Paddle, player2Paddle, topWall, bottomWall) {

        // Update ball's position
        this.mesh.position.add(this.velocity);
    
        // Check for collisions with walls
        if (this.checkWallCollision(topWall.mesh) || this.checkWallCollision(bottomWall.mesh)) {
            this.velocity.y *= -1; // Reverse direction on collision with top or bottom walls
        }
    
        // Check for collisions with paddles
        const currentTime = Date.now();
        if (this.checkPaddleCollision(player1Paddle, currentTime)) {
            
            this.collisionManager.handlePaddleCollision(player1Paddle, currentTime, this.mesh, this.velocity, this.maxVelocity);
            if (this.duplicateBall) {
                this.manageDuplicateBall();
            }
            // this.playSoundEffect1();
        }
        else if (this.checkPaddleCollision(player2Paddle, currentTime)) {
            this.collisionManager.handlePaddleCollision(player2Paddle, currentTime, this.mesh, this.velocity, this.maxVelocity);
            if (this.duplicateBall) {
                this.manageDuplicateBall();
            }
            // this.playSoundEffect2();
        }

        // Check for scoring
        if (this.mesh.position.x <= -10) {
            if (this.scoreTracker.incrementPlayer2Score(this.duplicateCounter, this.duplicateBall))
                this.reset();
            this.playSoundBozo();
            
        }
        else if (this.mesh.position.x >= 10) {
            if (this.scoreTracker.incrementPlayer1Score(this.duplicateCounter, this.duplicateBall))
                this.reset();
             this.playSoundBozo();
        }
    }
    
    checkWallCollision(wallMesh) {
        return this.collisionManager.checkCollisionWall(wallMesh, this.mesh, this.velocity, this.raycaster);
    }

    checkPaddleCollision(paddle, currentTime) {
        return this.collisionManager.checkCollision(paddle, this.mesh, this.velocity, this.raycaster) && this.canCollide(currentTime);
    }

    canCollide(currentTime) {
        return currentTime - this.lastPlayerCollisionTime >= this.paddleCollisionCooldown;
    }

    manageDuplicateBall() {
        if (this.duplicateCounter === 0) {
            this.mesh.material.color.set(0xffff00); // Set the color to yellow
            this.duplicateCounter++;
        }
        else if (this.duplicateCounter === 1) {
            this.mesh.material.color.set(0x00ff00); // Set the color to green
            this.duplicateCounter++;
        }
        else {
            this.mesh.material.color.set(0xff0000);
            // Create a new ball by cloning the current ball
            const oppositeBall = new Ball(this.scene, this.ballConfigurations, this.scoreTracker, this.container, this.collisionManager);
            oppositeBall.mesh.position.copy(this.mesh.position);
            const randomMultiplier = 0.75 + Math.random() * 0.2; // Random number between 0.75 and 1.25
            oppositeBall.velocity.x = this.velocity.x * randomMultiplier;
            oppositeBall.velocity.y = -this.velocity.y;
            this.velocity.clampLength(0, this.speed);
            // Add the new ball to the container
            this.container.balls.push(oppositeBall);

            // Add the new ball to the scene
            this.scene.add(oppositeBall.mesh);
            this.duplicateCounter = 0;
        }
    }

    removeFromContainer() {
        // Remove the ball from the container's array
        const index = this.container.balls.indexOf(this);
        if (index !== -1) {
            this.container.balls.splice(index, 1);
        }

        // Remove the ball from the scene
        this.scene.remove(this.mesh);
    }
    
    reset() {
        // Reset ball position and velocity
        this.mesh.position.set(0, 0, 0); // Reset ball position to z = 0
        this.velocity.x = 0.1 * (Math.random() > 0.5 ? 1 : -1); // Reset ball velocity (randomize direction)
        this.velocity.y = Math.random() * 0.1 - 0.05;
        this.velocity.clampLength(0, this.speed);
        this.maxVelocity = 0.1;
        this.duplicateCounter = 0;
        this.mesh.material.color.set(0xff0000);
    }

    freeze() {
        this.mesh.position.set(0, 0, 0); // Reset ball position to z = 0
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
}
