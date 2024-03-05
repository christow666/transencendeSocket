export class Gui {
    constructor(scene, playerInfo) {
        this.font = null;
        this.scene = scene;
        this.player1Name = playerInfo.player1Name;
        this.player2Name = playerInfo.player2Name;
        this.gameModeName = playerInfo.gameModeName;
        this.numberMeshes = []; // Initialize numberMeshes as an empty array
        this.playerScores = {
            1: { score: 0, position: { x: -4, y: 5.5, z: 0 } }, // Initial score and position for player 1
            2: { score: 0, position: { x: 6.5, y: 5.5, z: 0 } }   // Initial score and position for player 2
        }; 
    }

    async initGui() {
        await this.createFont(); // Load the font
        this.createPongText(this.gameModeName);
        this.createPlayerNameText(this.player1Name, { x: -7, y: 5.5, z: 0 });
        this.createPlayerNameText(this.player2Name, { x: 3, y: 5.5, z: 0 });
        this.createEndGameMessage();
        this.createScoreTextMeshes();
        this.updateScoreTextMesh(0, this.playerScores[1].position); // Update score text for player 1
        this.updateScoreTextMesh(0, this.playerScores[2].position); // Update score text for player 2
    }

    createEndGameMessage() {
        this.endGameMessageElement = document.createElement('div');
        this.endGameMessageElement.innerText = 'Game Over! Press "r" to reset.';
        this.endGameMessageElement.style.position = 'absolute';
        this.endGameMessageElement.style.top = '50%';
        this.endGameMessageElement.style.left = '50%';
        this.endGameMessageElement.style.transform = 'translate(-50%, -50%)';
        this.endGameMessageElement.style.fontSize = '24px';
        this.endGameMessageElement.style.color = '#ffffff';
        this.endGameMessageElement.style.display = 'none';
        document.body.appendChild(this.endGameMessageElement);
    }

    showEndGameMessage(winnerName) {
        this.endGameMessageElement.innerText = `Game Over! Winner: ${winnerName}. Press "r" to reset.`;
        this.endGameMessageElement.style.display = 'block';
    }

    hideEndGameMessage() {
        this.endGameMessageElement.style.display = 'none';
    }

    async createFont() {
        const fontLoader = new THREE.FontLoader();
        return new Promise((resolve, reject) => {
            fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', (font) => {
                ;
                this.font = font;
                resolve(font); // Resolve the promise with the loaded font
            }, undefined, reject); // Reject the promise if there's an error loading the font
        });
    }

    createPongText(pongText) {
        const text = pongText;
        const textGeometry = new THREE.TextGeometry(text, {
            font: this.font,
            size: 1, // Size of the text
            height: 0.1, // Thickness of the text
            curveSegments: 12, // Number of points on the curves
            bevelEnabled: false // Disable bevel for simplicity
        });

        // Center the text geometry
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-0.5 * textWidth, 0, 0);

        // Create a basic material for the text
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

        // Create a mesh for the text
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position the text in the center of the scene
        textMesh.position.set(0, 6.5, 0); // Adjust position as needed

        // Add the text mesh to the scene
        this.scene.add(textMesh);
    }

    createPlayerNameText(customName, position) {

        const playerName = customName + " :";
    
        let cls = this;
        const textGeometry = new THREE.TextGeometry(playerName, {
            font: cls.font,
            size: 0.5, // Size of the text
            height: 0.1, // Thickness of the text
            curveSegments: 12, // Number of points on the curves
            bevelEnabled: false // Disable bevel for simplicity
        });
    
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
        textMesh.position.set(position.x, position.y, position.z);
    
        // Add the text mesh to the scene
        this.scene.add(textMesh);
    }

    updateScoreTextMesh(score, position) {
        const scoreAsString = score.toString();
    
        for (let offsetX = 0; offsetX < scoreAsString.length * 0.5; offsetX += 0.5) {
            const existingScoreMeshes = this.scene.children.filter(child => 
                child.userData && 
                child.userData.playerScoreMesh && 
                child.position.equals(new THREE.Vector3(position.x + offsetX, position.y, position.z))
            );
            this.scene.remove(...existingScoreMeshes);
        }
        // Adjust position for each digit
        let offsetX = 0;
        for (const digitChar of scoreAsString) {
            const digit = parseInt(digitChar);
            const digitMesh = this.numberMeshes[digit];
            if (digitMesh) {
                const meshClone = digitMesh.clone();
                meshClone.position.set(position.x + offsetX, position.y, position.z);
                meshClone.userData.playerScoreMesh = true;
                this.scene.add(meshClone);
            }
            offsetX += 0.5;
        }
    }
    
    
    createScoreTextMeshes() {
        // Create meshes for numbers 0 to 9
        for (let i = 0; i < 10; i++) {
            const textGeometry = new THREE.TextGeometry(i.toString(), {
                font: this.font,
                size: 0.5, // Size of the text
                height: 0.1, // Thickness of the text
                curveSegments: 12, // Number of points on the curves
                bevelEnabled: false // Disable bevel for simplicity
            });
    
            const textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            this.numberMeshes.push(textMesh); // Push the created mesh into numberMeshes array
        }
    }
    
    updatePlayerScores(player1Score, player2Score) {
        this.updateScoreTextMesh(player1Score, this.playerScores[1].position); // Update score text for player 1
        this.updateScoreTextMesh(player2Score, this.playerScores[2].position); // Update score text for player 2
    }

    resetScores() {
        // Remove all digit meshes for player 1
        for (const offset in this.playerScores[1].position) {
            const position = this.playerScores[1].position;
            for (let offsetX = 0; offsetX < 10 * 0.5; offsetX += 0.5) {
                const existingScoreMeshes = this.scene.children.filter(child => 
                    child.userData && 
                    child.userData.playerScoreMesh && 
                    child.position.equals(new THREE.Vector3(position.x + offsetX, position.y, position.z))
                );
                this.scene.remove(...existingScoreMeshes);
            }
        }
        
        // Remove all digit meshes for player 2
        for (const offset in this.playerScores[2].position) {
            const position = this.playerScores[2].position;
            for (let offsetX = 0; offsetX < 10 * 0.5; offsetX += 0.5) {
                const existingScoreMeshes = this.scene.children.filter(child => 
                    child.userData && 
                    child.userData.playerScoreMesh && 
                    child.position.equals(new THREE.Vector3(position.x + offsetX, position.y, position.z))
                );
                this.scene.remove(...existingScoreMeshes);
            }
        }
    
        // Reset scores to 0 for both players
        this.playerScores[1].score = 0;
        this.playerScores[2].score = 0;
    
        // Update the score display to show the reset scores
        this.updateScoreTextMesh(0, this.playerScores[1].position);
        this.updateScoreTextMesh(0, this.playerScores[2].position);
    }
    
}
