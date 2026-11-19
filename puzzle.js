
/* =====================================================
   1. CONFIGURAÇÕES GERAIS
===================================================== */

// Elemento HTML onde o puzzle será exibido.
const containerPuzzle = document.getElementById("carta-puzzle");

// Dimensões de referência do tabuleiro.
const LARGURA_PUZZLE = 900;
const ALTURA_PUZZLE = 600;

// Distância máxima para conectar dois fragmentos.
const DISTANCIA_ENCAIXE = 35;

// Quantidade total de fragmentos.
const TOTAL_FRAGMENTOS = 10;

// Redução visual das imagens.
// 0.55 = 55% do tamanho original.
const FATOR_TAMANHO_FRAGMENTO = 0.55;


/* =====================================================
   2. CONFIGURAÇÃO DOS FRAGMENTOS
===================================================== */

/*
   destinoX e destinoY representam as posições finais
   dos fragmentos na montagem da carta.

   Os valores foram preenchidos com as coordenadas
   fornecidas para os dez fragmentos.

   inicioX e inicioY representam as posições iniciais
   em que as peças aparecem para o jogador.
*/

const configuracaoFragmentos = [

    {
        imagem: "Fragmentos/fragmento1.png",
        destinoX: 206.0,
        destinoY: 381.0,
        inicioX: 20,
        inicioY: 25
    },

    {
        imagem: "Fragmentos/fragmento2.png",
        destinoX: 396.5,
        destinoY: 400.1,
        inicioX: 235,
        inicioY: 25
    },

    {
        imagem: "Fragmentos/fragmento3.png",
        destinoX: 205.6,
        destinoY: 337.3,
        inicioX: 450,
        inicioY: 25
    },

    {
        imagem: "Fragmentos/fragmento4.png",
        destinoX: 468.4,
        destinoY: 339.4,
        inicioX: 665,
        inicioY: 25
    },

    {
        imagem: "Fragmentos/fragmento5.png",
        destinoX: 408.9,
        destinoY: 269.3,
        inicioX: 20,
        inicioY: 330
    },

    {
        imagem: "Fragmentos/fragmento6.png",
        destinoX: 204.2,
        destinoY: 277.8,
        inicioX: 235,
        inicioY: 330
    },

    {
        imagem: "Fragmentos/fragmento7.png",
        destinoX: 203.5,
        destinoY: 182.9,
        inicioX: 450,
        inicioY: 330
    },

    {
        imagem: "Fragmentos/fragmento8.png",
        destinoX: 416.4,
        destinoY: 166.9,
        inicioX: 665,
        inicioY: 330
    },

    {
        imagem: "Fragmentos/fragmento9.png",
        destinoX: 448.6,
        destinoY: 75.0,
        inicioX: 235,
        inicioY: 480
    },

    {
        imagem: "Fragmentos/fragmento10.png",
        destinoX: 202.4,
        destinoY: 86.7,
        inicioX: 450,
        inicioY: 480
    }

];


/* =====================================================
   3. CLASSE FRAGMENTO
===================================================== */

/*
   Representa cada peça individualmente.

   Armazena:
   - Identificação;
   - Imagem;
   - Posição atual;
   - Posição correta.
*/

class Fragmento {

    constructor(dados, indice) {

        this.indice = indice;

        // Cria a imagem.
        this.imagem = document.createElement("img");

        this.imagem.src = dados.imagem;

        this.imagem.alt = `Fragmento ${indice + 1}`;

        this.imagem.classList.add("fragmento");

        // Impede o arraste padrão do navegador.
        this.imagem.draggable = false;

        this.imagem.dataset.indice = indice;

        // Posição inicial.
        this.x = dados.inicioX;
        this.y = dados.inicioY;

        // Posição final.
        this.destinoX = dados.destinoX;
        this.destinoY = dados.destinoY;

    }


    // Adiciona a imagem à área do puzzle.
    adicionarNaArea(area) {

        area.appendChild(this.imagem);

    }


    // Atualiza a posição e o tamanho visual.
    atualizarPosicao(escalaX, escalaY) {

        this.imagem.style.left =
            `${this.x * escalaX}px`;

        this.imagem.style.top =
            `${this.y * escalaY}px`;

        // Reduz o tamanho visual da imagem.
        this.imagem.style.width =
            `${this.imagem.naturalWidth *
                escalaX *
                FATOR_TAMANHO_FRAGMENTO}px`;

    }


    // Altera a posição interna do fragmento.
    moverPara(x, y) {

        this.x = x;
        this.y = y;

    }


    // Adiciona uma classe visual.
    adicionarClasse(nomeClasse) {

        this.imagem.classList.add(nomeClasse);

    }


    // Remove uma classe visual.
    removerClasse(nomeClasse) {

        this.imagem.classList.remove(nomeClasse);

    }

}


/* =====================================================
   4. CLASSE PAINEL DE COORDENADAS
===================================================== */

/*
   Controla o painel temporário.

   Pressione E para abrir.
   Pressione E novamente para fechar.
*/

class PainelCoordenadas {

    constructor() {

        this.visivel = false;

        this.painel = document.createElement("div");

        this.painel.id = "painel-coordenadas";

        this.painel.style.cssText = `
            position: fixed;
            top: 15px;
            right: 15px;
            width: 270px;
            max-width: calc(100vw - 30px);
            max-height: 75vh;
            overflow-y: auto;
            box-sizing: border-box;
            background: #151515;
            color: white;
            padding: 15px;
            border: 1px solid #777;
            border-radius: 8px;
            z-index: 5000;
            font-family: monospace;
            font-size: 12px;
            display: none;
        `;

        document.body.appendChild(this.painel);

    }


    // Abre ou fecha o painel.
    alternar(fragmentos) {

        this.visivel = !this.visivel;

        this.painel.style.display =
            this.visivel ? "block" : "none";

        if (this.visivel) {

            this.atualizar(fragmentos);

        }

    }


    // Atualiza as coordenadas exibidas.
    atualizar(fragmentos) {

        if (!this.visivel) {

            return;

        }

        let conteudo = `
            <h3>COORDENADAS DOS FRAGMENTOS</h3>

            <p>Valores na escala 900 x 600</p>

            <p>Pressione E para fechar.</p>

            <hr>
        `;


        fragmentos.forEach(fragmento => {

            conteudo += `

                <div style="
                    margin-bottom: 12px;
                    padding: 8px;
                    background: #292929;
                    border-radius: 5px;
                ">

                    <strong>
                        FRAGMENTO ${fragmento.indice + 1}
                    </strong>

                    <p>
                        Posição atual:<br>

                        X: ${fragmento.x.toFixed(1)}<br>

                        Y: ${fragmento.y.toFixed(1)}
                    </p>

                    <p>
                        Posição de destino:<br>

                        X: ${fragmento.destinoX}<br>

                        Y: ${fragmento.destinoY}
                    </p>

                    <p>
                        Preencher no código:<br>

                        destinoX: ${fragmento.destinoX},<br>

                        destinoY: ${fragmento.destinoY}
                    </p>

                </div>

            `;

        });


        this.painel.innerHTML = conteudo;

    }

}


/* =====================================================
   5. CLASSE GERENCIADOR DO PUZZLE
===================================================== */

/*
   Classe principal responsável por controlar:

   - Carregamento das imagens;
   - Movimentação dos fragmentos;
   - Grupos de peças;
   - Encaixes;
   - Centralização;
   - Conclusão;
   - Painel de coordenadas.
*/

class GerenciadorPuzzle {

    constructor(container, configuracoes) {

        this.container = container;

        this.configuracoes = configuracoes;

        // Lista de fragmentos.
        this.fragmentos = [];

        // Grupos de fragmentos conectados.
        this.gruposFragmentos = [];

        // Informações do arraste atual.
        this.arrasteAtual = null;

        // Estado de conclusão.
        this.puzzleFinalizado = false;

        // Cria a área do puzzle.
        this.area = document.createElement("div");

        this.area.classList.add("puzzle-area");

        this.container.appendChild(this.area);

        // Cria o painel de coordenadas.
        this.painelCoordenadas =
            new PainelCoordenadas();

        // Configura os eventos.
        this.configurarEventos();

    }


    /* =============================================
       5.1. ESCALA DA ÁREA
    ============================================= */

    obterEscalaX() {

        return this.area.clientWidth / LARGURA_PUZZLE;

    }


    obterEscalaY() {

        return this.area.clientHeight / ALTURA_PUZZLE;

    }


    /* =============================================
       5.2. ATUALIZAÇÃO VISUAL
    ============================================= */

    atualizarVisual() {

        const escalaX = this.obterEscalaX();

        const escalaY = this.obterEscalaY();

        // Atualiza cada fragmento.
        this.fragmentos.forEach(fragmento => {

            fragmento.atualizarPosicao(
                escalaX,
                escalaY
            );

        });

        // Atualiza o painel se estiver aberto.
        this.painelCoordenadas.atualizar(
            this.fragmentos
        );

    }


    /* =============================================
       5.3. CARREGAMENTO DOS FRAGMENTOS
    ============================================= */

    async carregarFragmentos() {

        try {

            for (
                let i = 0;
                i < this.configuracoes.length;
                i++
            ) {

                const dados = this.configuracoes[i];

                // Cria o objeto Fragmento.
                const fragmento = new Fragmento(
                    dados,
                    i
                );

                // Aguarda o carregamento da imagem.
                await new Promise((resolve, reject) => {

                    fragmento.imagem.onload = resolve;

                    fragmento.imagem.onerror = () => {

                        reject(
                            new Error(
                                "Não foi possível carregar: " +
                                dados.imagem
                            )
                        );

                    };

                });


                // Guarda o fragmento.
                this.fragmentos.push(fragmento);

                // Adiciona à área do puzzle.
                fragmento.adicionarNaArea(this.area);

                // Configura o início do arraste.
                fragmento.imagem.addEventListener(
                    "pointerdown",
                    evento => this.iniciarArraste(evento)
                );

            }


            // Cada peça começa em um grupo separado.
            this.gruposFragmentos = this.fragmentos.map(
                fragmento => [fragmento.indice]
            );


            // Atualiza as posições visuais.
            this.atualizarVisual();


            console.log(
                "Todos os fragmentos foram carregados!"
            );

        } catch (erro) {

            console.error(
                "Erro ao iniciar o puzzle:",
                erro
            );

        }

    }


    /* =============================================
       5.4. INICIAR ARRASTE
    ============================================= */

    iniciarArraste(evento) {

        if (
            this.puzzleFinalizado ||
            this.arrasteAtual
        ) {

            return;

        }


        // Identifica a peça selecionada.
        const indice = Number(
            evento.currentTarget.dataset.indice
        );


        // Encontra o grupo ao qual ela pertence.
        const grupo = this.gruposFragmentos.find(
            grupo => grupo.includes(indice)
        );


        if (!grupo) {

            return;

        }


        evento.preventDefault();


        // Guarda as posições iniciais do grupo.
        const posicoesIniciais = new Map();

        grupo.forEach(indicePeca => {

            const fragmento =
                this.fragmentos[indicePeca];

            posicoesIniciais.set(indicePeca, {

                x: fragmento.x,

                y: fragmento.y

            });

            fragmento.adicionarClasse("arrastando");

        });


        // Captura o ponteiro.
        evento.currentTarget.setPointerCapture(
            evento.pointerId
        );


        // Guarda os dados do arraste.
        this.arrasteAtual = {

            grupo: grupo,

            ponteiro: evento.pointerId,

            inicioMouseX: evento.clientX,

            inicioMouseY: evento.clientY,

            posicoesIniciais: posicoesIniciais

        };

    }


    /* =============================================
       5.5. MOVIMENTAR GRUPO
    ============================================= */

    moverGrupo(evento) {

        if (!this.arrasteAtual) {

            return;

        }


        if (
            evento.pointerId !==
            this.arrasteAtual.ponteiro
        ) {

            return;

        }


        const escalaX = this.obterEscalaX();

        const escalaY = this.obterEscalaY();


        // Calcula o deslocamento do mouse ou toque.
        const deslocamentoX =
            (evento.clientX - this.arrasteAtual.inicioMouseX) /
            escalaX;

        const deslocamentoY =
            (evento.clientY - this.arrasteAtual.inicioMouseY) /
            escalaY;


        // Movimenta todas as peças do grupo.
        this.arrasteAtual.grupo.forEach(indice => {

            const fragmento =
                this.fragmentos[indice];

            const posicaoOriginal =
                this.arrasteAtual.posicoesIniciais.get(indice);


            fragmento.moverPara(

                posicaoOriginal.x + deslocamentoX,

                posicaoOriginal.y + deslocamentoY

            );

        });


        this.atualizarVisual();

    }


    /* =============================================
       5.6. ENCONTRAR CONEXÕES
    ============================================= */

    encontrarConexao(grupoMovido) {

        let melhorConexao = null;


        // Percorre os outros grupos.
        for (const outroGrupo of this.gruposFragmentos) {

            if (outroGrupo === grupoMovido) {

                continue;

            }


            // Compara cada peça dos dois grupos.
            for (const indiceA of grupoMovido) {

                for (const indiceB of outroGrupo) {

                    const pecaA =
                        this.fragmentos[indiceA];

                    const pecaB =
                        this.fragmentos[indiceB];


                    // Distância esperada entre as peças.
                    // Utiliza diretamente as coordenadas
                    // fornecidas, sem multiplicar por 0.55.
                    const distanciaAlvoX =
                        pecaB.destinoX - pecaA.destinoX;

                    const distanciaAlvoY =
                        pecaB.destinoY - pecaA.destinoY;


                    // Distância atual entre as peças.
                    const distanciaAtualX =
                        pecaB.x - pecaA.x;

                    const distanciaAtualY =
                        pecaB.y - pecaA.y;


                    // Calcula o erro de posicionamento.
                    const erroX =
                        distanciaAtualX - distanciaAlvoX;

                    const erroY =
                        distanciaAtualY - distanciaAlvoY;


                    // Calcula a distância necessária para alinhar.
                    const distancia = Math.sqrt(
                        erroX * erroX +
                        erroY * erroY
                    );


                    // Verifica se está dentro da distância permitida.
                    if (distancia <= DISTANCIA_ENCAIXE) {

                        if (
                            !melhorConexao ||
                            distancia < melhorConexao.distancia
                        ) {

                            melhorConexao = {

                                outroGrupo: outroGrupo,

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


    /* =============================================
       5.7. CONECTAR GRUPOS
    ============================================= */

    conectarGrupos(grupoMovido, conexao) {

        // Ajusta a posição de todas as peças.
        grupoMovido.forEach(indice => {

            const fragmento =
                this.fragmentos[indice];

            fragmento.moverPara(

                fragmento.x + conexao.ajusteX,

                fragmento.y + conexao.ajusteY

            );

        });


        // Adiciona os integrantes do outro grupo.
        grupoMovido.push(...conexao.outroGrupo);


        // Remove o grupo que acabou de ser unido.
        this.gruposFragmentos =
            this.gruposFragmentos.filter(
                grupo => grupo !== conexao.outroGrupo
            );


        // Marca as peças como conectadas.
        grupoMovido.forEach(indice => {

            this.fragmentos[indice].adicionarClasse(
                "conectado"
            );

        });


        this.atualizarVisual();

    }


    /* =============================================
       5.8. VERIFICAR ENCAIXES
    ============================================= */

    verificarEncaixes(grupoMovido) {

        let conexaoEncontrada;

        // Continua procurando até não encontrar
        // mais nenhuma conexão possível.
        do {

            conexaoEncontrada =
                this.encontrarConexao(grupoMovido);

            if (conexaoEncontrada) {

                this.conectarGrupos(
                    grupoMovido,
                    conexaoEncontrada
                );

            }

        } while (conexaoEncontrada);


        // Verifica se todos os fragmentos foram unidos.
        this.verificarConclusao();

    }


    /* =============================================
       5.9. FINALIZAR ARRASTE
    ============================================= */

    finalizarArraste(evento) {

        if (!this.arrasteAtual) {

            return;

        }


        if (
            evento.pointerId !==
            this.arrasteAtual.ponteiro
        ) {

            return;

        }


        // Guarda o grupo movimentado.
        const grupoMovido = this.arrasteAtual.grupo;


        // Remove o efeito visual de arraste.
        grupoMovido.forEach(indice => {

            this.fragmentos[indice].removerClasse(
                "arrastando"
            );

        });


        // Libera o controle do arraste.
        this.arrasteAtual = null;


        // Verifica possíveis encaixes.
        this.verificarEncaixes(grupoMovido);

    }


    /* =============================================
       5.10. CENTRALIZAR CARTA
    ============================================= */

    centralizarCarta() {

        const grupo = this.gruposFragmentos[0];

        let menorX = Infinity;

        let menorY = Infinity;

        let maiorX = -Infinity;

        let maiorY = -Infinity;


        // Encontra os limites visuais da carta.
        grupo.forEach(indice => {

            const fragmento =
                this.fragmentos[indice];


            menorX = Math.min(
                menorX,
                fragmento.x
            );

            menorY = Math.min(
                menorY,
                fragmento.y
            );


            // Considera o tamanho reduzido das imagens.
            const larguraVisual =
                fragmento.imagem.naturalWidth *
                FATOR_TAMANHO_FRAGMENTO;

            const alturaVisual =
                fragmento.imagem.naturalHeight *
                FATOR_TAMANHO_FRAGMENTO;


            maiorX = Math.max(
                maiorX,
                fragmento.x + larguraVisual
            );

            maiorY = Math.max(
                maiorY,
                fragmento.y + alturaVisual
            );

        });


        // Calcula o centro da carta.
        const centroCartaX =
            (menorX + maiorX) / 2;

        const centroCartaY =
            (menorY + maiorY) / 2;


        // Calcula o centro do tabuleiro.
        const centroAreaX =
            LARGURA_PUZZLE / 2;

        const centroAreaY =
            ALTURA_PUZZLE / 2;


        // Calcula o deslocamento necessário.
        const deslocamentoX =
            centroAreaX - centroCartaX;

        const deslocamentoY =
            centroAreaY - centroCartaY;


        // Move todos os fragmentos juntos.
        grupo.forEach(indice => {

            const fragmento =
                this.fragmentos[indice];

            fragmento.moverPara(

                fragmento.x + deslocamentoX,

                fragmento.y + deslocamentoY

            );

        });


        this.atualizarVisual();

    }


    /* =============================================
       5.11. VERIFICAR CONCLUSÃO
    ============================================= */

    verificarConclusao() {

        if (

            this.gruposFragmentos.length === 1 &&

            this.gruposFragmentos[0].length ===
            TOTAL_FRAGMENTOS &&

            !this.puzzleFinalizado

        ) {

            // Impede novas movimentações.
            this.puzzleFinalizado = true;


            // Centraliza a carta montada.
            this.centralizarCarta();


            // Cria a mensagem de conclusão.
            const mensagem =
                document.createElement("div");

            mensagem.classList.add(
                "mensagem-conclusao"
            );

            mensagem.textContent =
                "Os fragmentos parecem pertencer a uma carta escrita à mão. Apesar de algumas partes estarem danificadas, é possível reconstruir a maior parte da mensagem.";


            // Exibe a mensagem na área.
            this.area.appendChild(mensagem);


            // Avisa o jogo principal que o puzzle terminou.
            this.container.dispatchEvent(
                new CustomEvent("puzzleConcluido")
            );


            console.log(
                "Puzzle da carta concluído!"
            );

        }

    }


    /* =============================================
       5.12. PAINEL DE COORDENADAS
    ============================================= */

    alternarPainelCoordenadas() {

        this.painelCoordenadas.alternar(
            this.fragmentos
        );

    }


    /* =============================================
       5.13. CONFIGURAR EVENTOS
    ============================================= */

    configurarEventos() {

        // Movimento do mouse ou toque.
        this.area.addEventListener(
            "pointermove",
            evento => this.moverGrupo(evento)
        );


        // Quando o jogador solta o fragmento.
        this.area.addEventListener(
            "pointerup",
            evento => this.finalizarArraste(evento)
        );


        // Quando o movimento é cancelado.
        this.area.addEventListener(
            "pointercancel",
            evento => this.finalizarArraste(evento)
        );


        // Atualiza as posições quando a tela muda.
        window.addEventListener(
            "resize",
            () => this.atualizarVisual()
        );


        // Atalho E para abrir ou fechar coordenadas.
        window.addEventListener(
            "keydown",
            evento => {

                // Ignora campos de texto.
                if (
                    evento.target.tagName === "INPUT" ||
                    evento.target.tagName === "TEXTAREA" ||
                    evento.target.isContentEditable
                ) {

                    return;

                }


                if (
                    evento.key.toLowerCase() === "e" &&
                    !evento.repeat
                ) {

                    evento.preventDefault();

                    this.alternarPainelCoordenadas();

                }

            }
        );

    }

}


/* =====================================================
   6. INICIALIZAÇÃO DO PUZZLE
===================================================== */

// Verifica se o elemento HTML existe.
if (!containerPuzzle) {

    console.error(
        'Não foi encontrado o elemento com id "carta-puzzle".'
    );

} else {

    // Cria o gerenciador do puzzle.
    const gerenciadorPuzzle =
        new GerenciadorPuzzle(
            containerPuzzle,
            configuracaoFragmentos
        );


    // Disponibiliza o gerenciador para testes.
    window.gerenciadorPuzzle =
        gerenciadorPuzzle;


    // Inicia o carregamento das imagens.
    gerenciadorPuzzle.carregarFragmentos();

}
