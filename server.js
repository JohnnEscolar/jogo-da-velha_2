const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Controle de jogadores e turnos
let players = {};
let currentTurn = "X";

io.on('connection', (socket) => {
  console.log('Um jogador entrou');

  // Definir símbolo para o jogador
  if (!players.X) {
    players.X = socket.id;
    socket.emit('symbol', 'X');
  } else if (!players.O) {
    players.O = socket.id;
    socket.emit('symbol', 'O');
  } else {
    socket.emit('full', true);
    socket.disconnect();
    return;
  }

  // Enviar vez atual para o jogador que entrou
  socket.emit('turn', currentTurn);

  // Quando um jogador fizer uma jogada
  socket.on('jogada', (data) => {
    const playerSymbol = Object.keys(players).find(key => players[key] === socket.id);

    // Bloqueia jogada se não for a vez do jogador
    if (playerSymbol !== currentTurn) return;

    // Envia jogada para todos
    io.emit('jogada', data);

    // Alterna turno
    currentTurn = currentTurn === "X" ? "O" : "X";
    io.emit('turn', currentTurn);
  });

  socket.on('disconnect', () => {
    console.log('Um jogador saiu');

    // Remove o jogador do registro
    if (players.X === socket.id) {
      delete players.X;
    } else if (players.O === socket.id) {
      delete players.O;
    }

    // Resetar turno se necessário
    if (!players.X && !players.O) {
      currentTurn = "X";
    }
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
