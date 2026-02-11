const express = require('express');
const app = express();
const socketio = require('socket.io')

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8000);
const io = socketio(expressServer);

console.log('Server is running on port 8000');

io.on('connection', (socket) => {
    console.log('Client connected', socket.id)
    // socket.on('dataFromClient', (dataFromClient) => { console.log(dataFromClient); });
    socket.on('newMessageToServer', (dataFromClient) => {
        io.emit('newMessageToClients', { text: dataFromClient.text }); // broadcast to all clients
    });
});