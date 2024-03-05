export class SocketManager {
    constructor() {
        this.socket = null;
        this.serverUrl = 'wss://' + window.location.host + '/ws/game/123/'; // Replace 'your-server-url' with the actual server URL
        this.connect();

        this.MessageType = {
            PING: 0,
            PONG: 1,
            GAME_POSITION: 2
        }
    }

    connect() {
        this.socket = new WebSocket(this.serverUrl);

        this.socket.onopen = () => {
            console.log('Socket connected');
        };

        this.socket.onmessage = (event) => {
            // Handle incoming messages from the server
            const data = JSON.parse(event.data);
            console.log('Received message from server:', data);
            // Process data received from the server
            // Example: Update game state based on received data
        };

        this.socket.onclose = () => {
            console.log('Socket connection closed');
        };

        this.socket.onerror = (error) => {
            console.error('Socket encountered error:', error);
        };
    }

    sendGameData(gameData) {
        // Send game data to the server
        if (this.socket.readyState === WebSocket.OPEN) {
            const jsonData = JSON.stringify(gameData);
            console.log("msg sent", jsonData);
            this.socket.send(jsonData);
        } else {
            console.error('Socket connection not open. Unable to send data.');
        }
    }
}
