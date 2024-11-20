const WebSocket = require('ws');
const { consumer } = require('../config/kafka');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');

    consumer.on('message', (message) => {
        const data = JSON.parse(message.value);
        ws.send(JSON.stringify(data));
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});