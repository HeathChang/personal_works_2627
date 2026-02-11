const express = require('express');
const app = express();
const socketio = require('socket.io')

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(8000);
const io = socketio(expressServer);

console.log('Server is running on port 8000');

// 새 클라이언트가 서버에 연결될 때 실행되는 서버 전역 이벤트
io.on('connection', (socket) => {
    console.log('Client connected', socket.id)
    // socket.on('dataFromClient', (dataFromClient) => { console.log(dataFromClient); });

    // 특정 클라이언트가 보낸 이벤트를 수신 (이미 연결된 하나의 socket에 대해)
    socket.on('newMessageToServer', (dataFromClient) => {
        io.emit('newMessageToClients', { text: dataFromClient.text }); // broadcast to all clients
    });
});