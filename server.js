const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Comunicação Socket.IO
io.on('connection', (socket) => {
  console.log('Um jogador entrou');

  socket.on('jogada', (data) => {
    // Envia a jogada para todos, exceto quem jogou
    socket.broadcast.emit('jogada', data);
  });

  socket.on('disconnect', () => {
    console.log('Um jogador saiu');
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
