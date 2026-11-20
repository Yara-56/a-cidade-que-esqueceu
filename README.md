# A Cidade que Esqueceu

Jogo digital infantil (7 a 12 anos) sobre **profissões e sujeitos invisíveis**. É o projeto final da disciplina de Gamificação (UNILESTE).

Uma névoa fez a cidade de Lumiara esquecer quem a faz funcionar. As crianças exploram 6 regiões, conhecem 12 trabalhadores e acendem a cidade de novo. O jogo é cooperativo, não tem eliminação e funciona offline.

## Como rodar

- **Jogar online:** https://yara-56.github.io/a-cidade-que-esqueceu/
- **Jogar sem internet:** abra `index.html` (ou `dist/index.html`) em qualquer navegador. É um arquivo único, sem instalação.
- **Gerar o build:** `python3 build.py` junta `src/` em `dist/index.html`, com as fontes embutidas.
- **Publicar:** depois do build, copie `dist/index.html` para `index.html` na raiz. O GitHub Pages serve a raiz da branch `main`.

## Estrutura

```
src/
  sprites.js   paleta, objetos em pixel art, personagens montáveis, avatares (AVATAR_OPTS, avatarId)
  scenes.js    cenários 160x90 desenhados com retângulos (SCENES, composeScene)
  content.js   TODO o conteúdo: regiões, personagens, missões, cartas surpresa, medalhas, final, desafios extras (BONUS)
  audio.js     música generativa (WebAudio) + leitura em voz alta (speechSynthesis pt-BR)
  core.js      estado G, salvamento local, níveis (DIFFS), planos de duração (PLANS), código de pistas
  steps.js     mecânicas: dialog, investigate (com avatar andando), spot, match, sequence, sort, route,
               whoami, memory, logic, reveal, choice, reflect
  screens.js   telas: título, configuração + criador de personagem, mapa, região, missão, recompensa, álbum, ajustes
  finale.js    Festa das Luzes (mural do obrigado, última carta) + desafios extras como mini-missões
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
- Criador de personagem por jogador. O avatar anda nas cenas de investigação e no mapa.
- Estrelas por missão (concluir, errar pouco, não pedir dica) e um desafio extra por região (memória ou lógica).
- Pistas secretas no celular de cada jogador, por código de 5 dígitos, para jogar por chamada de vídeo sem servidor.
- Acessibilidade: leitura em voz alta, alto contraste, letras maiores, reduzir animações, teclado.
- Os testes automáticos passam em todos os modos e níveis, sem erros no console.

## Próximos passos

1. **Andar com o personagem no mapa.** Hoje ele só anda até a região tocada. Ideia: setas no teclado e um direcional na tela (D-pad) no celular; ao chegar perto de uma região, aparece o botão "Entrar". O D-pad também vale para as cenas de investigação no celular.
2. **PDF exigido pela professora:** manual de regras, guia do professor e QR code para o jogo.
3. **Documentação das metodologias** (brainstorming, seis chapéus, brainwriting, SCAMPER, storytelling, marketing sensorial, Design Thinking) e apresentação para o dia 24/11.
4. Teste com uma criança de verdade e registro das melhorias.
5. (Opcional) Online de verdade: hospedar fora e usar WebRTC/PeerJS ou Firebase.

## Créditos

Pixel art, música e sons gerados por código. Fontes Pixelify Sans e Nunito sob licença SIL Open Font License.
