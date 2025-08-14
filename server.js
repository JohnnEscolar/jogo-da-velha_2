const socket = io();

// === Entrar em uma sala ===
let roomId = prompt("Digite o código da sala para jogar com seu amigo:");
socket.emit("joinRoom", roomId);

let simbolo = null; // X ou O
let minhaVez = false;

// Escolher símbolo automaticamente (primeiro jogador é X)
socket.on("connect", () => {
    socket.emit("joinRoom", roomId);
});

// Quando o outro jogador faz uma jogada
socket.on("play", ({ posicao, simbolo: simboloOponente }) => {
    document.getElementById(posicao).innerText = simboloOponente;
    minhaVez = true; // sua vez depois do oponente
});

// === Lógica do jogo ===
const botoes = document.querySelectorAll(".celula");

botoes.forEach(botao => {
    botao.addEventListener("click", () => {
        if (botao.innerText !== "" || !minhaVez) return;

        // Marca no seu jogo
        botao.innerText = simbolo;

        // Envia jogada para o servidor
        socket.emit("play", { roomId, posicao: botao.id, simbolo });

        minhaVez = false;
    });
});

// Definir símbolo inicial
socket.on("connect", () => {
    // Simples: se for o primeiro na sala, é X, senão O
    fetch(`/countPlayers?room=${roomId}`)
        .then(res => res.json())
        .then(data => {
            simbolo = data.players === 1 ? "X" : "O";
            minhaVez = simbolo === "X";
            alert(`Você é o jogador ${simbolo}`);
        });
});

// Contar jogadores na sala
app.get('/countPlayers', (req, res) => {
    const room = req.query.room;
    const count = io.sockets.adapter.rooms.get(room)?.size || 0;
    res.json({ players: count });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
