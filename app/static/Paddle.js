import { AI } from './AI.js'

export class Paddle {
    constructor(scene, config, walls, isAI) {
        this.geometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
        this.material = new THREE.MeshStandardMaterial({ color: config.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene = scene;
        this.isAI = isAI;
        this.height = config.height;
        this.BallContainer = null;
        this.isLeft = config.isLeft;
        this.config = config;
        if (isAI)  
            this.AI = new AI(this, walls, config.AIInitialDelay);

        // Set initial position of the paddle
        this.mesh.position.copy(config.position);

        // Add the paddle mesh to the scene
        this.scene.add(this.mesh);

        // Set up paddle speed
        this.speed = config.speed;

        // Set up paddle movement flags
        this.moveUp = false;
        this.moveDown = false;

        // Set up controls
        this.controls = config.controls;

        // Bind event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Create a raycaster instance
        this.raycaster = new THREE.Raycaster(
            this.position,
            new THREE.Vector3(0, 0, 0),
            0,
            config.height / 2
        );

        // Reference to walls
        this.walls = walls;
    }

    setBallContainer(ballContainer) {
        this.ballContainer = ballContainer;
        // If the paddle is AI, update AI with the new BallContainer instance
        if (this.isAI && this.AI) {
            this.AI.setBallContainer(ballContainer);
        }
    }

    // Event handlers for keydown and keyup events
    handleKeyDown(event) {
        if (event.key === this.controls.up) {
            this.moveUp = true;
        } else if (event.key === this.controls.down) {
            this.moveDown = true;
        }
    }

    handleKeyUp(event) {
        if (event.key === this.controls.up) {
            this.moveUp = false;
        } else if (event.key === this.controls.down) {
            this.moveDown = false;
        }
    }

    // Update paddle position based on key events
    update() {
        if (!this.isAI) {
            if (this.moveUp && !this.checkWallCollision(this.walls, new THREE.Vector3(0, 1, 0))) {
                this.mesh.position.y += this.speed;
            }
            if (this.moveDown && !this.checkWallCollision(this.walls, new THREE.Vector3(0, -1, 0))) {
                this.mesh.position.y -= this.speed;
            }
        }
        else {
            this.AI.update();
        }
    }

    checkWallCollision(walls, direction) {
        // Iterate over each wall
        for (let wall of walls) {
            // Update the raycaster with the current paddle position and direction
            this.raycaster.set(this.mesh.position, direction);

            // Perform raycasting for the current wall
            const intersects = this.raycaster.intersectObject(wall.mesh);

            // Check for collision with the current wall
            if (intersects.length > 0) {
                return true; // Collision detected with this wall
            }
        }

        return false; // No collision detected with any wall
    }

    reset() {
        this.mesh.position.y = this.config.position.y;
    }
}
