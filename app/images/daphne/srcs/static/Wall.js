export class Wall {
    constructor(scene, config) {
        this.geometry = new THREE.BoxGeometry(config.width, config.height, config.depth);
        this.material = new THREE.MeshBasicMaterial({ color: config.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.position = config.position;
        this.scene = scene;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }
}
