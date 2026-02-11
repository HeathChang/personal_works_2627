const express = require('express');
const app = express();
const socketio = require('socket.io')

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8000);
const io = socketio(expressServer);

console.log('Server is running on port 8000');

io.on('connect', (socket) => {
    console.log('Client connected', socket.id);
    /**
     * socket.emit is used to send a message to the client
     * socket.on is used to listen for a message from the client
     * never add
     */
    socket.emit('messageFromServer', { data: 'Welcome to the socket.io server!' });
    socket.on('messageFromClient', (data) => { console.log(data); });
});