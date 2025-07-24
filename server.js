const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // sua pasta do jogo

// Conexão de jogadores
io.on('connection', (socket) => {
    console.log('Um jogador entrou:', socket.id);

    socket.on('play', (data) => {
        socket.broadcast.emit('play', data); // repassa a jogada para o outro
    });
});

server.listen(3000, () => console.log('Servidor rodando na porta 3000'));
