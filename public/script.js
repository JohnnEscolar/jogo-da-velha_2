const socket = io();

const tabuleiroGrande = document.getElementById("container-tabuleiro");
const jogadorAtualSpan = document.getElementById("jogador-atual");
const botaoReiniciar = document.getElementById("reiniciar");

let meuSimbolo = null; // recebido do servidor
let turnoAtual = "X";  // controlado pelo servidor
let estadoTabuleiros = Array(9).fill(null).map(() => Array(9).fill(null));
let tabuleiroAtual = null;
let estadoTabuleiroGrande = Array(9).fill(null);

function criarTabuleiroPequeno(indiceTabuleiro) {
    const tabuleiro = document.createElement("div");
    tabuleiro.classList.add("tabuleiro-pequeno");
    tabuleiro.dataset.indice = indiceTabuleiro;

    for (let i = 0; i < 9; i++) {
        const casa = document.createElement("div");
        casa.classList.add("casa");
        casa.dataset.indice = i;
        casa.addEventListener("click", () => {
            if (meuSimbolo !== turnoAtual) return; // bloqueia se não for minha vez
            if (!estadoTabuleiros[indiceTabuleiro][i]) {
                fazerJogada(indiceTabuleiro, i);
                socket.emit("jogada", { indiceTabuleiro, indiceCasa: i, jogador: meuSimbolo });
            }
        });
        tabuleiro.appendChild(casa);
    }

    return tabuleiro;
}

function inicializarJogo() {
    tabuleiroGrande.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const tabuleiro = criarTabuleiroPequeno(i);
        tabuleiroGrande.appendChild(tabuleiro);
    }

    estadoTabuleiros = Array(9).fill(null).map(() => Array(9).fill(null));
    estadoTabuleiroGrande = Array(9).fill(null);
    tabuleiroAtual = null;
    atualizarEstado();
}

function atualizarEstado() {
    document.querySelectorAll(".tabuleiro-pequeno").forEach(tabuleiro => {
        const indiceTabuleiro = parseInt(tabuleiro.dataset.indice);
        const concluido = estadoTabuleiroGrande[indiceTabuleiro];

        tabuleiro.querySelectorAll(".casa").forEach(casa => {
            const indiceCasa = parseInt(casa.dataset.indice);

            if (estadoTabuleiros[indiceTabuleiro][indiceCasa] || concluido) {
                casa.classList.add("disabled");
                casa.textContent = estadoTabuleiros[indiceTabuleiro][indiceCasa];
            } else {
                casa.classList.remove("disabled");
            }
        });

        tabuleiro.style.pointerEvents =
            tabuleiroAtual === null || tabuleiroAtual === indiceTabuleiro || concluido ? "auto" : "none";
        tabuleiro.style.opacity =
            tabuleiroAtual === null || tabuleiroAtual === indiceTabuleiro || concluido ? "1" : "0.5";
    });

    // 🔹 Exibe mensagem clara de vez
    if (meuSimbolo === turnoAtual) {
        jogadorAtualSpan.textContent = "Agora é a sua vez!";
    } else {
        jogadorAtualSpan.textContent = "Agora é a vez do oponente!";
    }
}

function verificarVencedor(casas) {
    const combinacoes = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const combinacao of combinacoes) {
        const [a, b, c] = combinacao;
        if (casas[a] && casas[a] === casas[b] && casas[a] === casas[c]) {
            return casas[a];
        }
    }

    return casas.every(casa => casa) ? "E" : null;
}

function fazerJogada(indiceTabuleiro, indiceCasa, jogadorForcado = null) {
    if (estadoTabuleiros[indiceTabuleiro][indiceCasa]) return;

    const jogadorUsado = jogadorForcado || meuSimbolo;
    estadoTabuleiros[indiceTabuleiro][indiceCasa] = jogadorUsado;
    const vencedorTabuleiro = verificarVencedor(estadoTabuleiros[indiceTabuleiro]);

    if (vencedorTabuleiro) {
        estadoTabuleiroGrande[indiceTabuleiro] = vencedorTabuleiro === "E" ? "E" : jogadorUsado;

        if (verificarVencedor(estadoTabuleiroGrande)) {
            alert(`O jogador ${jogadorUsado} venceu o jogo!`);
            inicializarJogo();
            return;
        }
    }

    if (estadoTabuleiros[indiceCasa].every(casa => casa) || estadoTabuleiroGrande[indiceCasa]) {
        tabuleiroAtual = null;
    } else {
        tabuleiroAtual = indiceCasa;
    }

    // 🔹 Alterna turno ao final da jogada
    turnoAtual = (jogadorUsado === "X") ? "O" : "X";
    atualizarEstado();
}

// Recebe símbolo do servidor
socket.on("symbol", (symbol) => {
    meuSimbolo = symbol;
    console.log(`Você é o jogador ${meuSimbolo}`);
    atualizarEstado();
});

// Recebe turno do servidor
socket.on("turn", (turn) => {
    turnoAtual = turn;
    atualizarEstado();
});

// Recebe jogada de outro jogador
socket.on("jogada", (data) => {
    fazerJogada(data.indiceTabuleiro, data.indiceCasa, data.jogador);
});

const rotuloscolunas = document.getElementById("rotulos-colunas");
for (let i = 1; i <= 9; i++) {
    const div = document.createElement("div");
    div.textContent = i;
    rotuloscolunas.appendChild(div);
}

const rotulosLinhas = document.getElementById("rotulos-linhas");
for (let i = 0; i < 9; i++) {
    const div = document.createElement("div");
    div.textContent = String.fromCharCode(65 + i);
    rotulosLinhas.appendChild(div);
}

function jogarCoordenada() {
    const input = document.getElementById("input-coordenada");
    const valor = input.value.toUpperCase().trim();
    input.value = "";

    if (!/^[A-I][1-9]$|^[1-9][A-I]$/i.test(valor)) {
        alert("Digite algo como A1 ou 1A (de A a I e de 1 a 9)");
        return;
    }

    let letra = valor[0], numero = valor[1];
    if (letra >= "1" && letra <= "9") {
        [letra, numero] = [numero, letra];
    }

    const linhas = "ABCDEFGHI";
    const linha = linhas.indexOf(letra);
    const coluna = parseInt(numero) - 1;

    const linhaTabuleiro = Math.floor(linha / 3);
    const colunaTabuleiro = Math.floor(coluna / 3);
    const indiceTabuleiro = linhaTabuleiro * 3 + colunaTabuleiro;

    const linhaDentro = linha % 3;
    const colunaDentro = coluna % 3;
    const indiceCasa = linhaDentro * 3 + colunaDentro;

    if (tabuleiroAtual !== null &&
        tabuleiroAtual !== indiceTabuleiro &&
        !estadoTabuleiroGrande[indiceTabuleiro]) {
        alert(`Você só pode jogar no tabuleiro ${tabuleiroAtual + 1}.`);
        return;
    }

    if (meuSimbolo !== turnoAtual) {
        alert("Não é a sua vez!");
        return;
    }

    if (estadoTabuleiros[indiceTabuleiro][indiceCasa]) {
        alert("Essa casa já foi jogada!");
        return;
    }

    fazerJogada(indiceTabuleiro, indiceCasa);
    socket.emit("jogada", { indiceTabuleiro, indiceCasa, jogador: meuSimbolo });
}

document.getElementById("input-coordenada").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        jogarCoordenada();
    }
});

botaoReiniciar.addEventListener("click", inicializarJogo);

inicializarJogo();
