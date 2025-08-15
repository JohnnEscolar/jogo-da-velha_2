const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Contagem de jogadores por sala
app.get('/countPlayers', (req, res) => {
  const room = req.query.room;
  const count = io.sockets.adapter.rooms.get(room)?.size || 0;
  res.json({ players: count });
});

io.on('connection', (socket) => {
  console.log('Jogador conectado:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Jogador ${socket.id} entrou na sala ${roomId}`);
  });

  socket.on('play', ({ roomId, posicao, simbolo }) => {
    socket.to(roomId).emit('play', { posicao, simbolo });
  });

  socket.on('disconnect', () => {
    console.log('Jogador saiu:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
