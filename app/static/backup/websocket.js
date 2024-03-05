
const MessageType = {
    PING: 0,
    PONG: 1,
    GAME_POSITION: 2
}

class PingMsg {
    type = MessageType.PING;
}

class PongMsg {
    type = MessageType.PING;
}


class GamePositionMsg {
    type = MessageType.GAME_POSITION;
    paddle_position = 0.0;
    balls_positions = new Float32Array();
}

document.addEventListener('DOMContentLoaded', function () {

    const MessageType = {
        PING: 0,
        PONG: 1,
        GAME_POSITION: 2
    }
    const messageHandlers = [];
    var pingMsg = JSON.stringify({ type: MessageType.PING });
    var ping_time = Date.now();

    function handlePing(data) {
        ping_time = Date.now();
        var data = pingMsg;
        socket.send(data);
    }

    function handlePong(data) {
        let msg = "";
        ping_time = Date.now() - ping_time;
        document.getElementById("ping").textContent = ping_time;
    }

    function handleGamePosition(data) {
        // console.log(data);
    }

    messageHandlers[MessageType.PING] = handlePing;
    messageHandlers[MessageType.PONG] = handlePong;
    messageHandlers[MessageType.GAME_POSITION] = handleGamePosition;

    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var ws_path = ws_scheme + '://' + window.location.host + "/ws/game/123/";
    console.log("Connecting to " + ws_path);

    var socket = new WebSocket(ws_path);

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const messageType = data['type'];
        console.log(data);
        const handler = messageHandlers[messageType];
        if (handler) {
            handler(data);
        } else {
            console.error(`No handler for message type: ${messageType}`);
        }
    };

    function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async function sendPings() {
        while (true) {
            await sleep(1000);
            handlePing();
        }
    }

    var pb = 0.1111111111111;
    var pa = 0.1111111111111;
    var inc = 0.0000000002;

    // const num_balls = 1000;
    // const balls_buffer = new Float32Array(num_balls);
    // const serializer = new BinaryBuffer(new Float32Array((num_balls * 2) + 100), true);

    // function processGamePosition() {
    //     var msg = new GamePositionMsg();
    //     msg.paddle_position = pb += inc;
    //     for (var i = 0; i < num_balls; i++) {
    //         balls_buffer[i] = pb;
    //     }
    //     msg.balls_positions = balls_buffer;
    //     var data = serializer.serializeObjToBuffer(msg);
    //     console.log(data);
    //     var msg_deserialize = new GamePositionMsg();
    //     var dataObj = serializer.deserializeBufferToObj(msg_deserialize);
    //     console.log(dataObj);
    //     // socket.send(JSON.stringify({ type: MessageType.GAME_POSITION, msg: msgs }));
    // }

    const balls = new Float32Array(100);
    function processGamePosition() {
        const msg = new GamePositionMsg()
        msg.paddle_position = pb;
        var positions = "";
        for (var i = 0; i < 100; i++) {
            positions += String(pb) + ",";
        }
        let str = JSON.stringify({ type: MessageType.GAME_POSITION, p_pos: pb += inc, bals_pos: positions })

        socket.send(str);
    }

    async function sendGamePositions() {
        while (true) {
            await sleep(16);
            if (start)
                processGamePosition();
        }
    }

    var start = false;

    document.getElementById('stop').addEventListener('click', function () {
        start = false;
    });

    document.getElementById('start').addEventListener('click', function () {
        start = true;
    });

    // Listen for WebSocket errors
    socket.onerror = function (e) {
        console.error("WebSocket error observed:", e);
    };

    socket.onclose = function (e) {
        console.log("WebSocket connection closed");
    };
    socket.onopen = function (e) {
        console.log("Connected to WebSocket");
        sendPings();
        sendGamePositions();
        // socket.send(JSON.stringify({
        //     'message': 'Hello from client!'
        // }));
    };

    // sendGamePositions();
});