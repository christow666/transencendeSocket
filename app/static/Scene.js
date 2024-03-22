export class Scene {
    constructor() {
        // Set up scene
        this.scene = new THREE.Scene();

        // Set up camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.5, 10); // Move the camera away from the origin
        

        // Create a new target position slightly to the right of the scene's position
        var targetPosition = new THREE.Vector3().copy(this.scene.position);
        var offsetY = 1.5;
        targetPosition.y += offsetY;

        // Set the camera to look at the new target position
        this.camera.lookAt(targetPosition);
        // this.camera.lookAt(this.scene.position);

        // Set up renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Add ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Color, Intensity
        this.scene.add(this.ambientLight);

        // Add directional light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Color, Intensity
        this.directionalLight.position.set(0.5, 1, 1); // Set light position (from top-right-front)
        this.scene.add(this.directionalLight);
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
