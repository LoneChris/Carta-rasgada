/* ==========================================
   1. CONFIGURAÇÕES GERAIS
========================================== */

// Área HTML onde o puzzle será exibido
const container = document.getElementById("carta-puzzle");

// Dimensões de referência da área de jogo
const LARGURA_PUZZLE = 900;
const ALTURA_PUZZLE = 600;

// Distância máxima para conectar dois fragmentos
// Quanto maior o valor, mais fácil será encaixar
const DISTANCIA_ENCAIXE = 35;

// Quantidade total de fragmentos
const TOTAL_FRAGMENTOS = 5;


/* ==========================================
   2. CONFIGURAÇÃO DOS FRAGMENTOS
========================================== */

/*
Cada fragmento possui:

imagem: caminho do PNG.
x: posição horizontal FINAL do arquivo PNG.
y: posição vertical FINAL do arquivo PNG.
inicioX: posição horizontal inicial.
inicioY: posição vertical inicial.

IMPORTANTE:
x e y representam a posição do arquivo inteiro,
incluindo suas bordas transparentes.

As coordenadas são medidas em uma área
de referência de 900 x 600 pixels.

Os valores abaixo são apenas exemplos.
Você deverá ajustá-los conforme seus desenhos.
*/

const configuracaoFragmentos = [

    {
        imagem: "Fragmentos/fragmento1.png",
        x: 91.3,
        y: 81.3,
        inicioX: 20,
        inicioY: 20
    },

    {
        imagem: "Fragmentos/fragmento2.png",
        x: -12.6,
        y: 138.6,
        inicioX: 350,
        inicioY: 20
    },

    {
        imagem: "Fragmentos/fragmento3.png",
        x: 508.4,
        y: 103.4,
        inicioX: 650,
        inicioY: 20
    },

    {
        imagem: "Fragmentos/fragmento4.png",
        x: -41.3,
        y: 378.9,
        inicioX: 20,
        inicioY: 400
    },

    {
        imagem: "Fragmentos/fragmento5.png",
        x: 78.7,
        y: 240.2,
        inicioX: 600,
        inicioY: 400
    }

];


/* ==========================================
   3. VARIÁVEIS DE CONTROLE
========================================== */

// Guarda todos os fragmentos carregados
let pecas = [];

// Cada grupo guarda os índices dos fragmentos conectados
let gruposFragmentos = [];

// Guarda as informações do arraste atual
let arrasteAtual = null;

// Identifica se o puzzle foi concluído
let puzzleFinalizado = false;


/* ==========================================
   4. CRIAÇÃO DA ÁREA DO PUZZLE
========================================== */

// Cria a área onde os fragmentos aparecerão
const area = document.createElement("div");

area.classList.add("puzzle-area");

// Adiciona a área ao HTML
container.appendChild(area);


/* ==========================================
   5. AJUSTE DAS POSIÇÕES
========================================== */

/*
Converte as coordenadas de referência
para o tamanho atual da tela.
*/

function obterEscalaX() {
    return area.clientWidth / LARGURA_PUZZLE;
}

function obterEscalaY() {
    return area.clientHeight / ALTURA_PUZZLE;
}


/*
Atualiza a posição e o tamanho de cada imagem.

As coordenadas internas continuam na escala
de referência, independentemente do tamanho da tela.
*/

function atualizarVisual() {

    const escalaX = obterEscalaX();
    const escalaY = obterEscalaY();

    pecas.forEach(peca => {

        peca.imagem.style.left =
            (peca.x * escalaX) + "px";

        peca.imagem.style.top =
            (peca.y * escalaY) + "px";

        peca.imagem.style.width =
            (peca.imagem.naturalWidth * escalaX) + "px";

    });

}


/* ==========================================
   6. CARREGAMENTO DAS IMAGENS
========================================== */

/*
Carrega os cinco PNGs e prepara os elementos
que serão utilizados no puzzle.
*/

async function carregarFragmentos() {

    for (let i = 0; i < configuracaoFragmentos.length; i++) {

        const dados = configuracaoFragmentos[i];

        // Cria o elemento de imagem
        const imagem = document.createElement("img");

        // Define o caminho do PNG
        imagem.src = dados.imagem;

        // Define um texto alternativo
        imagem.alt = `Fragmento ${i + 1}`;

        // Adiciona a classe visual
        imagem.classList.add("fragmento");

        // Desativa o arraste padrão do navegador
        imagem.draggable = false;

        // Guarda o número do fragmento
        imagem.dataset.indice = i;

        // Espera a imagem carregar
        await new Promise((resolve, reject) => {

            imagem.onload = resolve;

            imagem.onerror = () => {
                reject(
                    new Error("Não foi possível carregar: " + dados.imagem)
                );
            };

        });

        // Guarda as informações do fragmento
        pecas.push({

            imagem: imagem,

            // Posição correta do arquivo PNG
            x: dados.inicioX,
            y: dados.inicioY,

            // Posição onde ele deverá ficar ao montar a carta
            destinoX: dados.x,
            destinoY: dados.y

        });

        // Adiciona a imagem à área do puzzle
        area.appendChild(imagem);

        // Permite selecionar o fragmento
        imagem.addEventListener(
            "pointerdown",
            iniciarArraste
        );

    }

    // Inicialmente, cada fragmento é um grupo independente
    gruposFragmentos = pecas.map((peca, indice) => [indice]);

    // Ajusta o tamanho e a posição das imagens
    atualizarVisual();

}


/* ==========================================
   7. INICIAR O ARRASTE
========================================== */

function iniciarArraste(evento) {

    // Impede movimentação depois da conclusão
    if (puzzleFinalizado || arrasteAtual) {
        return;
    }

    // Identifica qual fragmento foi selecionado
    const indice = Number(evento.currentTarget.dataset.indice);

    // Procura o grupo ao qual ele pertence
    const grupo = gruposFragmentos.find(
        grupo => grupo.includes(indice)
    );

    if (!grupo) {
        return;
    }

    // Impede o comportamento padrão do navegador
    evento.preventDefault();

    // Guarda a posição inicial de cada integrante do grupo
    const posicoesIniciais = new Map();

    grupo.forEach(indicePeca => {

        posicoesIniciais.set(indicePeca, {

            x: pecas[indicePeca].x,
            y: pecas[indicePeca].y

        });

        // Aplica o efeito visual de movimentação
        pecas[indicePeca].imagem.classList.add("arrastando");

    });

    // Captura os movimentos do mouse ou toque
    evento.currentTarget.setPointerCapture(evento.pointerId);

    // Guarda todas as informações necessárias para movimentar o grupo
    arrasteAtual = {

        grupo: grupo,

        ponteiro: evento.pointerId,

        inicioMouseX: evento.clientX,
        inicioMouseY: evento.clientY,

        posicoesIniciais: posicoesIniciais

    };

}


/* ==========================================
   8. MOVIMENTAR O GRUPO
========================================== */

/*
Quando um grupo é movimentado, todos os seus
fragmentos recebem o mesmo deslocamento.

Isso mantém as peças conectadas.
*/

function moverGrupo(evento) {

    if (!arrasteAtual) {
        return;
    }

    if (evento.pointerId !== arrasteAtual.ponteiro) {
        return;
    }

    // Calcula a escala atual da área
    const escalaX = obterEscalaX();
    const escalaY = obterEscalaY();

    // Calcula o deslocamento do mouse ou toque
    const deslocamentoX =
        (evento.clientX - arrasteAtual.inicioMouseX) / escalaX;

    const deslocamentoY =
        (evento.clientY - arrasteAtual.inicioMouseY) / escalaY;

    // Movimenta todos os integrantes do grupo
    arrasteAtual.grupo.forEach(indice => {

        const peca = pecas[indice];

        const posicaoOriginal =
            arrasteAtual.posicoesIniciais.get(indice);

        peca.x = posicaoOriginal.x + deslocamentoX;

        peca.y = posicaoOriginal.y + deslocamentoY;

    });

    // Atualiza a posição visual dos fragmentos
    atualizarVisual();

}


/* ==========================================
   9. PROCURAR CONEXÕES ENTRE GRUPOS
========================================== */

/*
Compara dois grupos para descobrir se algum
fragmento está próximo da posição correta
em relação a outro fragmento.

A comparação utiliza as coordenadas de destino,
não as bordas visíveis dos PNGs.
*/

function encontrarConexao(grupoMovido) {

    let melhorConexao = null;

    // Percorre os outros grupos existentes
    for (const outroGrupo of gruposFragmentos) {

        // Ignora o próprio grupo movimentado
        if (outroGrupo === grupoMovido) {
            continue;
        }

        // Compara cada fragmento dos dois grupos
        for (const indiceA of grupoMovido) {

            for (const indiceB of outroGrupo) {

                const pecaA = pecas[indiceA];
                const pecaB = pecas[indiceB];

                // Distância horizontal esperada entre as peças
                const distanciaAlvoX =
                    pecaB.destinoX - pecaA.destinoX;

                // Distância vertical esperada entre as peças
                const distanciaAlvoY =
                    pecaB.destinoY - pecaA.destinoY;

                // Distância horizontal atual entre as peças
                const distanciaAtualX =
                    pecaB.x - pecaA.x;

                // Distância vertical atual entre as peças
                const distanciaAtualY =
                    pecaB.y - pecaA.y;

                // Calcula o erro de posicionamento
                const erroX =
                    distanciaAtualX - distanciaAlvoX;

                const erroY =
                    distanciaAtualY - distanciaAlvoY;

                // Calcula a distância necessária para alinhar
                const distancia = Math.sqrt(
                    erroX * erroX + erroY * erroY
                );

                // Verifica se está dentro da distância de encaixe
                if (distancia <= DISTANCIA_ENCAIXE) {

                    // Guarda a conexão mais próxima encontrada
                    if (
                        !melhorConexao ||
                        distancia < melhorConexao.distancia
                    ) {

                        melhorConexao = {

                            outroGrupo: outroGrupo,

                            // Deslocamento necessário para alinhar
                            ajusteX: erroX,
                            ajusteY: erroY,

                            distancia: distancia

                        };

                    }

                }

            }

        }

    }

    return melhorConexao;

}


/* ==========================================
   10. CONECTAR OS GRUPOS
========================================== */

/*
Ajusta a posição do grupo movimentado
e une os integrantes dos dois grupos.
*/

function conectarGrupos(grupoMovido, conexao) {

    // Ajusta a posição de todos os fragmentos do grupo
    grupoMovido.forEach(indice => {

        pecas[indice].x += conexao.ajusteX;

        pecas[indice].y += conexao.ajusteY;

    });

    // Adiciona os integrantes do outro grupo
    grupoMovido.push(...conexao.outroGrupo);

    // Remove o grupo que acabou de ser unido
    gruposFragmentos = gruposFragmentos.filter(
        grupo => grupo !== conexao.outroGrupo
    );

    // Marca os fragmentos como conectados
    grupoMovido.forEach(indice => {

        pecas[indice].imagem.classList.add("conectado");

    });

    // Atualiza a aparência das peças
    atualizarVisual();

}


/* ==========================================
   11. VERIFICAR ENCAIXES
========================================== */

/*
Procura conexões após o jogador soltar
um fragmento ou grupo.

Se houver mais de uma conexão possível,
continua procurando até não encontrar outras.
*/

function verificarEncaixes(grupoMovido) {

    let conexaoEncontrada;

    do {

        // Procura uma conexão possível
        conexaoEncontrada =
            encontrarConexao(grupoMovido);

        // Se encontrar, conecta os grupos
        if (conexaoEncontrada) {

            conectarGrupos(
                grupoMovido,
                conexaoEncontrada
            );

        }

    } while (conexaoEncontrada);

    // Verifica se todos os fragmentos foram unidos
    verificarConclusao();

}


/* ==========================================
   12. FINALIZAR O ARRASTE
========================================== */

function finalizarArraste(evento) {

    if (!arrasteAtual) {
        return;
    }

    if (evento.pointerId !== arrasteAtual.ponteiro) {
        return;
    }

    // Guarda o grupo que estava sendo movimentado
    const grupoMovido = arrasteAtual.grupo;

    // Remove o efeito visual de arraste
    grupoMovido.forEach(indice => {

        pecas[indice].imagem.classList.remove("arrastando");

    });

    // Libera o controle do arraste
    arrasteAtual = null;

    // Verifica se alguma conexão pode ser realizada
    verificarEncaixes(grupoMovido);

}


/* ==========================================
   13. CONCLUSÃO DO PUZZLE
========================================== */
function centralizarCarta() {
    // Pega o grupo que contém todos os fragmentos
    const grupo = gruposFragmentos[0];

    // Encontra os limites da carta montada
    let menorX = Infinity;
    let menorY = Infinity;
    let maiorX = -Infinity;
    let maiorY = -Infinity;

    grupo.forEach(indice => {
        const peca = pecas[indice];

        menorX = Math.min(menorX, peca.x);
        menorY = Math.min(menorY, peca.y);

        maiorX = Math.max(maiorX, peca.x + peca.imagem.naturalWidth);
        maiorY = Math.max(maiorY, peca.y + peca.imagem.naturalHeight);
    });

    // Calcula o centro da carta montada
    const centroCartaX = (menorX + maiorX) / 2;
    const centroCartaY = (menorY + maiorY) / 2;

    // Calcula o centro da área do puzzle
    const centroAreaX = LARGURA_PUZZLE / 2;
    const centroAreaY = ALTURA_PUZZLE / 2;

    // Calcula quanto a carta precisa se deslocar
    const deslocamentoX = centroAreaX - centroCartaX;
    const deslocamentoY = centroAreaY - centroCartaY;

    // Move todos os fragmentos juntos
    grupo.forEach(indice => {
        pecas[indice].x += deslocamentoX;
        pecas[indice].y += deslocamentoY;
    });

    // Atualiza a posição visual dos fragmentos
    atualizarVisual();
}


function verificarConclusao() {
    // Verifica se os cinco fragmentos foram unidos
    if (
        gruposFragmentos.length === 1 &&
        gruposFragmentos[0].length === TOTAL_FRAGMENTOS &&
        !puzzleFinalizado
    ) {
        // Impede novas movimentações
        puzzleFinalizado = true;

        // Centraliza a carta montada
        centralizarCarta();

        // Cria a mensagem de conclusão
        const mensagem = document.createElement("div");
        mensagem.classList.add("mensagem-conclusao");

        mensagem.textContent =
            "Os fragmentos parecem pertencer a uma carta escrita à mão. Apesar de algumas partes estarem danificadas, é possível reconstruir a maior parte da mensagem.";

        // Exibe a mensagem na área do puzzle
        area.appendChild(mensagem);

        // Comunica ao jogo principal que o puzzle terminou
        container.dispatchEvent(
            new CustomEvent("puzzleConcluido")
        );

        console.log("Puzzle da carta concluído!");
    }
}


/* ==========================================
   14. EVENTOS DE MOVIMENTAÇÃO
========================================== */

// Captura o movimento do mouse ou toque
area.addEventListener(
    "pointermove",
    moverGrupo
);

// Identifica quando o jogador solta o fragmento
area.addEventListener(
    "pointerup",
    finalizarArraste
);

// Identifica quando o movimento é cancelado
area.addEventListener(
    "pointercancel",
    finalizarArraste
);


/* ==========================================
   15. RESPONSIVIDADE
========================================== */

// Atualiza o posicionamento quando a tela mudar
window.addEventListener("resize", atualizarVisual);


/* ==========================================
   16. INICIAR O PUZZLE
========================================== */

// Carrega as imagens e prepara o jogo
carregarFragmentos().catch(erro => {

    console.error("Erro ao iniciar o puzzle:", erro);

});













// ==========================================
// PAINEL TEMPORÁRIO DE COORDENADAS
// REMOVER DEPOIS DOS TESTES
// ==========================================

// Cria o painel lateral
const painel = document.createElement("div");

painel.id = "painel-coordenadas";

painel.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    width: 270px;
    max-height: 90vh;
    overflow-y: auto;
    background: #151515;
    color: white;
    padding: 15px;
    border: 1px solid #777;
    border-radius: 8px;
    z-index: 5000;
    font-family: monospace;
    font-size: 12px;
`;

// Título do painel
painel.innerHTML = `
    <h3>COORDENADAS DOS FRAGMENTOS</h3>
    <p>Arraste as peças para visualizar.</p>
`;

document.body.appendChild(painel);


// Atualiza as informações do painel
function atualizarPainelCoordenadas() {

    let conteudo = `
        <h3>COORDENADAS DOS FRAGMENTOS</h3>
        <p>Valores na escala 900 x 600</p>
        <hr>
    `;

    pecas.forEach((peca, indice) => {

        conteudo += `
            <div style="
                margin-bottom: 12px;
                padding: 8px;
                background: #292929;
                border-radius: 5px;
            ">

                <strong>FRAGMENTO ${indice + 1}</strong>

                <p>
                    Posição atual:<br>
                    X: ${peca.x.toFixed(1)}<br>
                    Y: ${peca.y.toFixed(1)}
                </p>

                <p>
                    Posição de destino:<br>
                    X: ${peca.destinoX}<br>
                    Y: ${peca.destinoY}
                </p>

                <p>
                    Preencher no código:<br>
                    x: ${peca.destinoX},<br>
                    y: ${peca.destinoY}
                </p>

            </div>
        `;

    });

    painel.innerHTML = conteudo;
}


// Atualiza o painel durante a movimentação
const atualizarVisualOriginal = atualizarVisual;

atualizarVisual = function() {

    atualizarVisualOriginal();

    atualizarPainelCoordenadas();

};


// Atualização inicial
atualizarPainelCoordenadas();