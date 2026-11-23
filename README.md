# A Cidade que Esqueceu

Jogo digital infantil (7 a 12 anos) sobre **profissões e sujeitos invisíveis**. É o projeto final da disciplina de Gamificação (UNILESTE).

Uma névoa fez a cidade de Lumiara esquecer quem a faz funcionar. As crianças exploram 6 regiões, conhecem 12 trabalhadores e acendem a cidade de novo. O jogo é cooperativo, não tem eliminação e funciona offline.

## Como rodar

- **Jogar online:** https://yara-56.github.io/a-cidade-que-esqueceu/
- **Jogar sem internet:** abra `index.html` (ou `dist/index.html`) em qualquer navegador. É um arquivo único, sem instalação.
- **Gerar o build:** `python3 build.py` junta `src/` em `dist/index.html`, com as fontes embutidas.
- **Publicar:** `python3 build.py` já gera `index.html` na raiz. O GitHub Pages publica a branch `gh-pages`: depois de enviar para a `main`, rode `git push origin main:gh-pages`.

## Estrutura

```
src/
  sprites.js   paleta, objetos em pixel art, personagens montáveis, avatares (AVATAR_OPTS, avatarId)
  scenes.js    cenários 160x90 desenhados com retângulos (SCENES, composeScene)
  content.js   TODO o conteúdo: regiões, personagens, missões, cartas surpresa, medalhas, final, desafios extras (BONUS)
  online.js    sala online (PeerJS/WebRTC): anfitrião manda as telas, convidados espelham toques; pista secreta em cada aparelho
  audio.js     música generativa (WebAudio) + leitura em voz alta (speechSynthesis pt-BR)
  core.js      estado G, salvamento local, níveis (DIFFS), planos de duração (PLANS), código de pistas
  steps.js     mecânicas: dialog, investigate (com avatar andando), spot, match, sequence, sort, route,
               whoami, memory, logic, reveal, choice, reflect
  screens.js   telas: título, configuração + criador de personagem, mapa, região, missão, recompensa, álbum, ajustes
  finale.js    Festa das Luzes (mural do obrigado, última carta) + desafios extras como mini-missões
  cinema.js    motor de cenas animadas (prólogo, interlúdios, final) e a mecânica de passagem dos dias
  main.js      início
  style.css    identidade visual
  fonts/       Pixelify Sans e Nunito (OFL), embutidas no build
test/
  play.py      jogador automático (Playwright): `python3 test/play.py juntos 6 det full`
  gallery.py   capturas de tela de telas específicas
```

O conteúdo fica separado das regras e da interface. Para mudar textos, pistas ou missões, edite só `content.js`.

## O que já existe (versão 2)

- 3 modos: Aventureiro (solo), Juntos (2 a 6 no mesmo aparelho) e Sala de aula (projetor, com barra do professor).
- 3 níveis (Explorador, Investigador e Detetive) e 3 durações (3, 6 ou 12 missões).
- 12 personagens com ficha completa. Os tons de pele estão distribuídos por igual entre as profissões, de propósito.
- Criador de personagem por jogador. O avatar anda pelo mapa e pelas cenas de investigação com o direcional na tela (celular), as setas do teclado ou tocando no destino.
- Estrelas por missão (concluir, errar pouco, não pedir dica) e um desafio extra por região (memória ou lógica).
- **E se ninguém fizesse?**: depois de conhecer cada trabalhador, a criança dá um palpite, passa os dias (1, 3, 7) e vê as consequências se acumularem (lixo, mato, escuridão, fome...). Depois a pessoa volta ao trabalho e a cena se recupera.
- **Um turno com a Denise**: mini-jogo em que a criança pega a vassoura e varre a rua junto com a gari (direcional, setas ou toque). Pessoas passam sujando de novo, e a criança escolhe como resolver (placa ou conversa).
- Menos leitura: narração só quando a pessoa aperta o botão de som (nunca automática) e ficha do personagem mais curta, com "História", "Desafios" e "Curiosidade" em botões.
- História animada: prólogo, interlúdios da Névoa ao restaurar cada região (a Névoa vai revelando quem é) e final na Festa das Luzes.
- Pistas secretas no celular de cada jogador, por código de 5 dígitos, para jogar por chamada de vídeo sem servidor.
- Acessibilidade: leitura em voz alta, alto contraste, letras maiores, reduzir animações, teclado.
- Os testes automáticos passam em todos os modos e níveis, sem erros no console.

## Próximos passos

1. **PDF exigido pela professora:** manual de regras, guia do professor e QR code para o jogo.
2. **Documentação das metodologias** (brainstorming, seis chapéus, brainwriting, SCAMPER, storytelling, marketing sensorial, Design Thinking) e apresentação para o dia 24/11.
3. Teste com uma criança de verdade e registro das melhorias.
4. ~~Online de verdade~~ feito: sala com código via WebRTC/PeerJS.

## Créditos

Pixel art, música e sons gerados por código. Fontes Pixelify Sans e Nunito sob licença SIL Open Font License.

## Jogar online com amigos (cada um na sua casa)

1. Uma pessoa abre o link, toca em **Jogar online com amigos → Criar sala** e recebe um código de 4 letras.
2. Manda o código para os amigos (WhatsApp, por exemplo).
3. Os amigos abrem o mesmo link, tocam em **Entrar numa sala** e digitam o código (até 4 jogadores).
4. Quem criou toca em **Começar**. A tela de todos anda junto; qualquer um pode tocar.
5. No "Quem sou eu?", cada aparelho mostra uma **pista secreta** só para aquela pessoa — conversem por chamada de voz para descobrir juntos.

Teste local: `npx peer --port 9000` e abra o jogo com `?peer=127.0.0.1:9000`.

## Vida na cidade
Vira-lata caramelo patrulhando a rua, bicicletas, carros, passarinhos e um cachorro dormindo na sala — animações leves em cada cenário.
