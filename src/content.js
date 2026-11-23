/* ============================================================
   CONTEÚDO DO JOGO — história, regiões, personagens, missões
   (separado das regras e da interface: dá para editar só aqui)
   ============================================================ */
'use strict';

const NAMES = {
  faisca: 'Faísca', nevoa: 'Névoa', theo: 'Theo', bia: 'Bia', iara: 'Iara',
  olimpia: 'Dona Olímpia', neide: 'Dona Neide', davi: 'Davi'
};

/* ---------------- PRÓLOGO ---------------- */
const PROLOGUE = [
  { scene: 'cidade', color: true, who: 'faisca', text: 'Esta é Lumiara. Uma cidade cheia de janelas acesas, cheiro de comida e gente indo e vindo.' },
  { scene: 'cidade', color: true, who: 'faisca', text: 'Tudo aqui funciona porque muitas pessoas trabalham todos os dias: cozinham, limpam, plantam, consertam, cuidam.' },
  { scene: 'cidade', color: false, nevoa: true, who: 'faisca', text: 'Mas um dia chegou a Névoa do Esquecimento. Ela não destrói nada... ela faz as pessoas esquecerem.' },
  { scene: 'cidade', color: false, nevoa: true, who: 'faisca', text: 'Os trabalhadores continuam trabalhando. Só que ninguém mais repara neles. E, sem ninguém reparar, as luzes da cidade foram se apagando.' },
  { scene: 'cidade', color: false, who: 'faisca', text: 'Eu sou a Faísca, a última luz acesa de Lumiara. Preciso de ajuda para descobrir quem faz esta cidade funcionar. Vamos juntos?' }
];

/* ---------------- REGIÕES ---------------- */
const REGIONS = [
  { id: 'casas', name: 'Bairro das Casas', color: '#e0705a', music: { root: 60, scale: 'maj', tempo: 92, wave: 'triangle' },
    intro: 'Ruas de casinhas e prédios baixos. Antes, as janelas brilhavam à noite. Agora está tudo cinza e silencioso.',
    faisca: 'Aqui mora muita gente. E muita gente trabalha para que essas casas funcionem.',
    missions: ['cida', 'jorge', 'tania'] },
  { id: 'vila', name: 'Vila do Aprendizado', color: '#e8a93a', music: { root: 62, scale: 'maj', tempo: 104, wave: 'square' },
    intro: 'A escola da cidade, com pátio, cozinha e salas de aula. O sinal tocou, mas ninguém lembra quem deixou tudo pronto.',
    faisca: 'Uma escola não funciona só com professores e alunos. Vamos descobrir quem mais está aqui?',
    missions: ['ze', 'katia'] },
  { id: 'saude', name: 'Estação da Saúde', color: '#4aa6a0', music: { root: 57, scale: 'maj', tempo: 84, wave: 'sine' },
    intro: 'O posto de saúde do bairro e as casas das famílias. A Névoa fez todo mundo esquecer quem cuida da saúde de pertinho.',
    faisca: 'Cuidar da saúde não acontece só no hospital. Acontece na porta de casa também!',
    missions: ['lucia', 'benedito', 'joana'] },
  { id: 'mercado', name: 'Mercado das Mil Histórias', color: '#d0603f', music: { root: 65, scale: 'maj', tempo: 112, wave: 'triangle' },
    intro: 'Barracas de frutas, legumes e temperos. Cada alimento tem uma história, mas a Névoa apagou o caminho que ele fez até aqui.',
    faisca: 'Será que a comida nasce no mercado? Hmm... acho que tem mais gente nessa história.',
    missions: ['zefa', 'rafa'] },
  { id: 'parque', name: 'Parque da Natureza', color: '#5cae6a', music: { root: 59, scale: 'pent', tempo: 88, wave: 'sine' },
    intro: 'Árvores, lago e canteiros de flores. O parque continua bonito, mas ninguém lembra quem cuida dele, nem para onde vai o que jogamos fora.',
    faisca: 'Um parque bonito não fica bonito sozinho. Vamos investigar!',
    missions: ['marina', 'joaquim'] },
  { id: 'caminhos', name: 'Caminhos da Cidade', color: '#6a7fd0', music: { root: 55, scale: 'pent', tempo: 96, wave: 'triangle' },
    intro: 'Ruas, calçadas e postes ligam todos os lugares. É aqui que a Névoa está mais forte: quase todos os postes estão apagados.',
    faisca: 'Se a gente acender os caminhos, todos os bairros voltam a se encontrar!',
    missions: ['denise', 'pedro', 'carlos'] }
];

/* ---------------- SUPERPODERES (carta de herói) ---------------- */
const POWERS = { cida: 'Organização Turbo', jorge: 'Memória de Elefante', ze: 'Panelão de Energia', katia: 'Brilho Total', lucia: 'Escudo da Saúde',
  benedito: 'Abraço Protetor', zefa: 'Mão Verde', rafa: 'Pedal Relâmpago', marina: 'Olho Reciclador', joaquim: 'Floresta Instantânea',
  denise: 'Vassoura Turbo', pedro: 'Raio de Luz', tania: 'Água Cristalina', joana: 'Jato Antifogo', carlos: 'Escudo da Travessia' };

/* ---------------- PERSONAGENS (álbum) ---------------- */
const CHARACTERS = {
  tania: { name: 'Tânia', full: 'Tânia Ribeiro', job: 'Técnica de saneamento', region: 'casas', prop: 'copoagua',
    story: 'Tânia trabalha na estação de tratamento de água. Ela adora química e explica para a filha por que a água da torneira é segura.',
    routine: ['Confere a água que chega do rio', 'Mede o cloro e a limpeza', 'Cuida dos filtros e das bombas', 'Corre para consertar canos quebrados'],
    contribution: 'Água limpa na torneira evita doenças e deixa a gente cozinhar, tomar banho e beber sem medo.',
    challenges: 'Plantões de madrugada, canos que quebram na chuva e gente que desperdiça a água tratada.',
    quote: 'Cada copo d’água limpinha passou pelas mãos de muita gente.',
    curiosity: 'Fechar a torneira enquanto escova os dentes economiza até 12 litros de água.',
    reflection: 'Quantas vezes por dia você usa água que alguém tratou?' },
  joana: { name: 'Tenente Joana', full: 'Joana Pereira', job: 'Bombeira', region: 'saude', prop: 'extintor',
    story: 'Joana é bombeira há 12 anos. Já resgatou gente, cachorro e até um gato no alto de um poste. Treina todos os dias.',
    routine: ['Confere o caminhão e as mangueiras', 'Treina resgates e primeiros socorros', 'Atende chamados pelo 193', 'Ensina prevenção nas escolas'],
    contribution: 'Bombeiros salvam vidas em incêndios, enchentes, acidentes e resgates.',
    challenges: 'Fogo, fumaça, calor e plantões de 24 horas longe da família.',
    quote: 'A gente corre para onde todo mundo está fugindo.',
    curiosity: 'O telefone dos bombeiros no Brasil é 193. É grátis!',
    reflection: 'Você sabe para quem ligar numa emergência?' },
  carlos: { name: 'Sargento Carlos', full: 'Carlos Henrique Santos', job: 'Policial comunitário', region: 'caminhos', prop: 'apito',
    story: 'Carlos conhece as famílias do bairro pelo nome. Toda manhã ele cuida da travessia da escola e ajuda quem se perde.',
    routine: ['Ronda a pé pelo bairro', 'Organiza a saída da escola', 'Ajuda crianças perdidas a achar a família', 'Conversa com os moradores'],
    contribution: 'Ajuda o bairro a ser mais seguro e organiza o trânsito para ninguém se machucar.',
    challenges: 'Sol, chuva, trânsito perigoso e situações difíceis todos os dias.',
    quote: 'Segurança se faz junto, conhecendo as pessoas.',
    curiosity: 'O telefone da polícia no Brasil é 190.',
    reflection: 'Quem ajuda você a atravessar a rua perto da escola?' },
  cida: { name: 'Dona Cida', full: 'Aparecida Santos', job: 'Trabalhadora doméstica', region: 'casas', prop: 'roupa',
    story: 'Cida cuida de casas há mais de 20 anos. Com esse trabalho, criou dois filhos. Hoje, à noite, ela estuda Pedagogia.',
    routine: ['Pega dois ônibus para chegar às 8h', 'Lava, passa, cozinha e organiza a casa', 'Sai às 17h e ainda cuida da própria casa'],
    contribution: 'Enquanto ela cuida da casa, a família pode trabalhar e estudar com tranquilidade.',
    challenges: 'É um trabalho cansativo e muitas vezes ninguém agradece. Por muitos anos, essa profissão nem tinha os mesmos direitos das outras.',
    quote: 'Casa arrumada não acontece sozinha. Acontece com as mãos de alguém.',
    curiosity: 'Desde 2015, uma lei garante às trabalhadoras domésticas direitos como férias, 13º salário e jornada de trabalho definida.',
    reflection: 'Quem faz esse trabalho na sua casa? Essa pessoa recebe um "obrigado"?' },
  jorge: { name: 'Seu Jorge', full: 'Jorge Ferreira', job: 'Porteiro', region: 'casas', prop: 'chaves',
    story: 'Seu Jorge é porteiro do Edifício Ipê há 15 anos. Já ajudou a achar criança perdida, chamou ambulância de madrugada e sabe o aniversário de vários moradores.',
    routine: ['Trabalha em turnos, às vezes a noite inteira', 'Controla quem entra e quem sai', 'Recebe encomendas e avisa os moradores', 'Fica atento à segurança de todos'],
    contribution: 'Ele faz o prédio ser um lugar seguro e organizado para todo mundo.',
    challenges: 'Passar muitas horas no mesmo lugar, trabalhar de madrugada e às vezes ser tratado com grosseria.',
    quote: 'Quem cuida da porta conhece o coração da casa.',
    curiosity: 'Muitos porteiros trabalham na escala 12 por 36: 12 horas de trabalho e 36 horas de descanso.',
    reflection: 'Por que um simples "bom dia" pode mudar o dia de alguém?' },
  ze: { name: 'Seu Zé', full: 'José Carlos Lima', job: 'Merendeiro', region: 'vila', prop: 'panelao',
    story: 'Seu Zé aprendeu a cozinhar com a avó. Hoje é merendeiro da escola e sabe o prato preferido de muitos alunos.',
    routine: ['Chega às 6h30', 'Prepara café da manhã e almoço para centenas de alunos', 'Segue as regras de higiene e o cardápio da nutricionista', 'Limpa toda a cozinha no fim do turno'],
    contribution: 'Para muitas crianças, a merenda é a refeição mais importante do dia. Com fome, ninguém consegue aprender.',
    challenges: 'Calor do fogão, panelas pesadas e pouco tempo para cozinhar muita comida.',
    quote: 'Barriga cheia, cabeça pronta para aprender!',
    curiosity: 'Por lei, parte do dinheiro da merenda das escolas públicas deve comprar alimentos de agricultores familiares da região.',
    reflection: 'O que aconteceria se um dia não tivesse merenda na escola?' },
  katia: { name: 'Kátia', full: 'Kátia Nascimento', job: 'Auxiliar de limpeza escolar', region: 'vila', prop: 'vassoura',
    story: 'Kátia trabalha na limpeza da escola há 8 anos. Conhece cada cantinho do prédio e guarda os objetos esquecidos até alguém vir buscar.',
    routine: ['Chega às 6h para limpar antes da entrada', 'Limpa salas, banheiros e pátio entre os turnos', 'Recolhe o lixo e separa o reciclável', 'Usa luvas e produtos de limpeza com cuidado'],
    contribution: 'Ambientes limpos evitam doenças e deixam a escola gostosa de estar.',
    challenges: 'Trabalho físico pesado, produtos químicos e pouca valorização. Muita gente passa por ela sem dizer oi.',
    quote: 'Eu gosto quando a turma entra e diz: "Nossa, que cheirinho bom!"',
    curiosity: 'Muitos trabalhadores da limpeza são contratados por empresas terceirizadas. Às vezes nem aparecem na foto da equipe da escola.',
    reflection: 'O que você pode fazer para deixar o trabalho de limpeza mais leve?' },
  lucia: { name: 'Lúcia', full: 'Lúcia Andrade', job: 'Agente comunitária de saúde', region: 'saude', prop: 'vacina',
    story: 'Lúcia cresceu no bairro onde trabalha. Conhece as famílias pelo nome e sabe quem tem bebê novo, quem precisa de cuidado e quem mora sozinho.',
    routine: ['Sai do posto de saúde com a lista de visitas', 'Caminha muitos quarteirões, no sol ou na chuva', 'Orienta as famílias sobre vacinas e prevenção', 'Conta para a equipe o que cada família precisa'],
    contribution: 'Ela é a ponte entre as famílias e o posto de saúde. Muitos problemas são evitados porque ela chegou antes.',
    challenges: 'Andar o dia inteiro na rua, lidar com situações difíceis e, às vezes, encontrar portas fechadas.',
    quote: 'Saúde começa na porta de casa.',
    curiosity: 'O Brasil tem mais de 200 mil agentes comunitários de saúde trabalhando pelo SUS. Eles precisam morar na comunidade onde trabalham.',
    reflection: 'Quem cuida da saúde na sua comunidade, além de médicos?' },
  benedito: { name: 'Benedito', full: 'Benedito Souza', job: 'Cuidador de idosos', region: 'saude', prop: 'bengala',
    story: 'Benedito virou cuidador depois de cuidar do próprio avô. Fez um curso e hoje acompanha Dona Olímpia, de 84 anos, de segunda a sexta.',
    routine: ['Ajuda no banho, nas refeições e para andar', 'Acompanha os horários dos remédios receitados pelo médico', 'Leva Dona Olímpia às consultas', 'Conversa, faz exercícios leves e passeia com ela'],
    contribution: 'Graças a ele, Dona Olímpia continua morando na casa dela, com segurança e alegria.',
    challenges: 'Esforço físico, muita responsabilidade e o cansaço de cuidar de alguém o dia todo. Quem cuida também precisa de cuidado.',
    quote: 'Cuidar é fazer companhia para a vida continuar bonita.',
    curiosity: 'A população do Brasil está envelhecendo: cada vez mais famílias vão precisar de cuidadores.',
    reflection: 'Cuidar de alguém é trabalho, mesmo quando é feito por amor. Você concorda?' },
  zefa: { name: 'Dona Zefa', full: 'Josefa Lima', job: 'Agricultora familiar', region: 'mercado', prop: 'cesta',
    story: 'Dona Zefa planta num sítio pequeno com a família: tomate, alface, mandioca e banana. Às sextas, vende tudo na feira.',
    routine: ['Acorda às 4h30', 'Tira o mato, aduba e rega a horta', 'Colhe e lava os alimentos', 'Leva tudo para a feira de caminhonete'],
    contribution: 'Muitos alimentos que chegam à mesa das famílias brasileiras vêm de pequenos agricultores como ela.',
    challenges: 'Depende do tempo: chuva demais ou seca podem estragar a plantação. O trabalho é pesado e começa cedo.',
    quote: 'A terra devolve o cuidado que a gente dá.',
    curiosity: 'Parte da merenda das escolas públicas é comprada de agricultores familiares. Talvez até a comida do Seu Zé!',
    reflection: 'Por que quem planta a comida às vezes é esquecido por quem come?' },
  rafa: { name: 'Rafa', full: 'Rafael Costa', job: 'Entregador de bicicleta', region: 'mercado', prop: 'bike',
    story: 'Rafa juntou dinheiro por meses para comprar a bicicleta. Faz entregas todos os dias e sonha em abrir uma oficina de bikes no bairro.',
    routine: ['Liga o aplicativo às 11h', 'Pedala dezenas de quilômetros por dia', 'Espera os pedidos na porta dos restaurantes', 'Faz pausas quando consegue um lugar para beber água'],
    contribution: 'Leva comida, remédios e compras para quem não pode ou não consegue sair de casa.',
    challenges: 'Trânsito perigoso, chuva, calor, pouco descanso e um ganho que muda todo dia.',
    quote: 'Cada entrega é alguém me esperando do outro lado da porta.',
    curiosity: 'Muitos entregadores não têm onde descansar entre uma entrega e outra. Algumas cidades criaram pontos de apoio com água e banheiro.',
    reflection: 'Por que uma avaliação injusta pode atrapalhar o dia de um trabalhador?' },
  marina: { name: 'Marina', full: 'Marina Rodrigues', job: 'Catadora de materiais recicláveis', region: 'parque', prop: 'papelao',
    story: 'Marina começou catando latinhas na rua com a mãe. Hoje é presidenta da Cooperativa Recicla Lumiara, onde 30 pessoas trabalham juntas.',
    routine: ['Recebe o material da coleta seletiva', 'Separa cada tipo na esteira', 'Prensa e amarra os fardos', 'Vende para fábricas que transformam tudo em coisas novas'],
    contribution: 'Catadoras e catadores são responsáveis por boa parte de tudo o que é reciclado no Brasil.',
    challenges: 'Materiais cortantes, cheiro forte, preconceito e um pagamento que depende do preço dos recicláveis.',
    quote: 'O que você chama de lixo, eu chamo de trabalho.',
    curiosity: 'Desde 2002, catador de material reciclável é uma profissão reconhecida oficialmente no Brasil.',
    reflection: 'Se ninguém separasse o lixo, o que aconteceria com o planeta?' },
  joaquim: { name: 'Seu Joaquim', full: 'Joaquim Pereira', job: 'Jardineiro', region: 'parque', prop: 'regador',
    story: 'Seu Joaquim cuida do parque há 12 anos. Plantou metade das árvores que hoje fazem sombra no lago e sabe o nome de cada uma.',
    routine: ['Começa às 7h, antes do sol forte', 'Corta a grama, poda galhos e rega os canteiros', 'Planta mudas e cuida das árvores doentes', 'Recolhe folhas e galhos caídos'],
    contribution: 'Parques bem cuidados deixam a cidade mais fresca, bonita e saudável para todo mundo.',
    challenges: 'Sol forte, máquinas barulhentas e pessoas que estragam o que ele plantou.',
    quote: 'Quem planta uma árvore planta sombra para gente que nem conhece.',
    curiosity: 'Debaixo de uma árvore grande, a temperatura pode ficar vários graus mais fresca.',
    reflection: 'Que espaços públicos você usa e quem cuida deles?' },
  denise: { name: 'Denise', full: 'Denise Oliveira', job: 'Gari', region: 'caminhos', prop: 'vassoura',
    story: 'Denise é gari há 10 anos. Joga vôlei no time da equipe e adora quando as crianças acenam da janela do ônibus escolar.',
    routine: ['Começa às 5h da manhã', 'Varre calçadas e sarjetas', 'Esvazia as lixeiras da rua', 'Limpa os bueiros para a água da chuva passar'],
    contribution: 'Ruas limpas evitam doenças, enchentes e bichos como ratos e baratas.',
    challenges: 'Sol, chuva, trânsito perigoso, objetos cortantes no lixo e gente que age como se ela não existisse.',
    quote: 'Eu não sou invisível. Eu sou o motivo de a rua estar limpa.',
    curiosity: 'No Brasil, o Dia do Gari é comemorado em 16 de maio.',
    reflection: 'O que aconteceria com a cidade se os garis parassem por uma semana?' },
  pedro: { name: 'Pedro', full: 'Pedro Henrique Alves', job: 'Eletricista da iluminação pública', region: 'caminhos', prop: 'lampada',
    story: 'Pedro trabalha consertando os postes da cidade. Quando quase todo mundo está dormindo, a equipe dele percorre as ruas trocando lâmpadas e fios.',
    routine: ['Recebe a lista de postes com defeito', 'Sinaliza a rua e veste o equipamento de proteção', 'Sobe no cesto do caminhão para consertar', 'Testa se a luz voltou'],
    contribution: 'Ruas iluminadas são mais seguras para quem anda a pé, pedala ou dirige.',
    challenges: 'Risco de choque elétrico, trabalho no alto, de noite e até na chuva.',
    quote: 'Quando a luz acende, ninguém lembra de mim. Mas um obrigado sempre faz bem!',
    curiosity: 'Para trabalhar com eletricidade, o eletricista precisa fazer um curso de segurança obrigatório, a NR-10.',
    reflection: 'Quantas coisas na sua rua funcionam sem você ver quem consertou?' }
};

/* ---------------- MISSÕES ----------------
   tipos de etapa: dialog, investigate, spot, match, sequence, sort, route,
   whoami, reveal, choice, reflect
   level: 'det' = só no Detetive; 'inv' = Investigador e Detetive        */
const MISSIONS = {
  tania: { title: 'A água que chega na torneira', char: 'tania', steps: [
    { t: 'dialog', scene: 'sala', cast: [{ id: 'theo', x: 70, y: 52 }], lines: [
      { who: 'theo', text: 'Abri a torneira e... nada!' },
      { who: '?tania', text: 'Vem ver o caminho da água!' }] },
    { t: 'water' },
    { t: 'reveal', char: 'tania' },
    { t: 'choice', scene: 'sala', cast: [{ id: 'theo', x: 70, y: 52 }],
      prompt: 'Escovando os dentes, a torneira fica aberta. E aí?',
      options: [
        { text: 'Fechar a torneira enquanto escova.', kind: true, result: 'Economiza até 12 litros. A Tânia agradece!' },
        { text: 'Deixar aberta. Água não acaba.', kind: false, result: 'Acaba sim! E cada gota tratada deu trabalho para muita gente.' },
        { text: 'Fechar e contar para a família.', kind: true, result: 'Água limpa é de todo mundo. Cuidar é com a gente também!' }] }
  ] },
  joana: { title: 'Fogo na rua das casas!', char: 'joana', steps: [
    { t: 'dialog', scene: 'ruacasas', cast: [{ id: 'davi', x: 40, y: 40 }], lines: [
      { who: 'davi', text: 'Socorro! Tem fumaça na rua!' },
      { who: '?joana', text: 'Bombeiros chegando! Me ajuda?' }] },
    { t: 'fire' },
    { t: 'reveal', char: 'joana' },
    { t: 'choice', scene: 'ruacasas', cast: [{ id: 'joana', x: 100, y: 40 }],
      prompt: 'Um fio caído solta faíscas na calçada. O que fazer?',
      options: [
        { text: 'Ficar longe e chamar um adulto: 193!', kind: true, result: 'Isso! Longe do perigo e pedindo ajuda certa.' },
        { text: 'Chegar perto para ver.', kind: false, result: 'Perigo! Eletricidade machuca muito. Fique longe.' },
        { text: 'Jogar água no fio.', kind: false, result: 'Nunca! Água e eletricidade juntas dão choque. Ligue 193.' }] }
  ] },
  carlos: { title: 'A travessia da escola', char: 'carlos', steps: [
    { t: 'dialog', scene: 'ruacasas', cast: [{ id: 'bia', x: 40, y: 40 }], lines: [
      { who: 'bia', text: 'Tanto carro! Como eu atravesso?' },
      { who: '?carlos', text: 'Eu cuido da travessia. Me ajuda?' }] },
    { t: 'cross' },
    { t: 'reveal', char: 'carlos' },
    { t: 'choice', scene: 'ruacasas', cast: [{ id: 'bia', x: 40, y: 40 }],
      prompt: 'O sinal está verde para os carros. E você?',
      options: [
        { text: 'Espero na calçada o sinal fechar.', kind: true, result: 'Perfeito! Paciência salva vidas.' },
        { text: 'Corro antes do carro chegar.', kind: false, result: 'Nunca! Atravesse só na faixa e com o sinal fechado.' },
        { text: 'Seguro a mão de um adulto e espero.', kind: true, result: 'Muito bem! Juntos é mais seguro.' }] }
  ] },
  /* ===== BAIRRO DAS CASAS ===== */
  cida: { title: 'A casa que se arruma sozinha?', char: 'cida', steps: [
    { t: 'dialog', scene: 'ruacasas', cast: [{ id: 'you', x: 96, y: 34 }], lines: [
      { who: 'faisca', text: 'Corre! Os Fumacinhas estão vindo atrás da gente!' },
      { who: 'you', text: 'Por aqui! Aquela ali é a minha casa!' }] },
    { t: 'dialog', scene: 'sala', cast: [{ id: 'you', x: 70, y: 52 }], lines: [
      { who: 'faisca', text: 'Ufa! Na sua casa a gente está segura.' },
      { who: 'you', text: 'Ué... a casa fica arrumadinha sozinha?!' },
      { who: 'faisca', text: 'Sozinha? Alguém cuida dela todo dia... e a Névoa fez todo mundo esquecer quem!' }] },
    { t: 'investigate', scene: 'sala', need: 4, prompt: 'Ache as pistas: quem trabalhou aqui?',
      items: [
        { prop: 'roupa', x: 56, y: 35, clue: true, label: 'Roupas dobradas', text: 'Lavadas, secas e dobradas: horas de trabalho!' },
        { prop: 'panela', x: 115, y: 24, clue: true, label: 'Panela no fogão', text: 'Feijão no fogo! Alguém fez o almoço.' },
        { prop: 'planta', x: 22, y: 46, clue: true, label: 'Planta regada', text: 'Terra molhada: alguém regou hoje!' },
        { prop: 'brinquedos', x: 96, y: 62, clue: true, label: 'Brinquedos guardados', text: 'Estavam no chão. Agora, guardadinhos!' },
        { prop: 'balde', x: 138, y: 66, clue: true, label: 'Balde e pano', text: 'Chão limpinho agora há pouco!', level: 'det' },
        { prop: 'gato', x: 58, y: 66, clue: false, label: 'Gato Pipoca', text: 'O Pipoca só dormiu. Não foi ele!' },
        { x: 60, y: 14, w: 22, h: 16, clue: false, label: 'Quadro', text: 'Só um quadro. Nada mudou.' }] },
    { t: 'sequence', prompt: 'Dona Cida cuida das roupas. Coloque o trabalho na ordem certa.',
      items: [
        { prop: 'maquina', label: 'Colocar a roupa para lavar' },
        { prop: 'varal', label: 'Estender a roupa no varal' },
        { prop: 'cesto', label: 'Recolher a roupa seca' },
        { prop: 'ferro', label: 'Passar a roupa', level: 'det' },
        { prop: 'roupa', label: 'Dobrar e guardar nas gavetas' }],
      ok: 'É isso! Só a roupa já dá um tempão de trabalho, e ainda tem a comida, a louça, a faxina...' },
    { t: 'reveal', char: 'cida' },
    { t: 'choice', scene: 'sala', items: [{ prop: 'mochila', x: 50, y: 68 }], cast: [{ id: 'theo', x: 70, y: 52 }, { id: 'cida', x: 120, y: 48 }],
      prompt: 'Theo largou a mochila no meio da sala. E agora?',
      options: [
        { text: 'Guardar a mochila e o tênis no lugar.', kind: true, result: 'Pequenos gestos economizam o tempo de quem cuida da casa. Dona Cida sorri: "Valeu, Theo!"' },
        { text: 'Deixar lá. Alguém guarda depois.', kind: false, result: 'Esse "alguém" tem nome: Dona Cida. E ela já tem muitas tarefas. Quando ninguém repara no trabalho, ele fica invisível.' },
        { text: 'Guardar tudo e perguntar como foi o dia da Dona Cida.', kind: true, result: 'Além de ajudar, Theo mostrou que se importa com ela como pessoa. Isso é reconhecimento!' }] },
    { t: 'reflect', learn: 'Trabalho doméstico é trabalho de verdade, seja feito por uma profissional como a Dona Cida, seja feito por alguém da família sem receber nada.',
      question: 'Quem cuida da comida, da roupa e da limpeza na sua casa? Quantas horas você acha que isso leva?',
      challenge: 'Hoje, ajude em uma tarefa de casa sem ninguém precisar pedir.' }
  ] },

  jorge: { title: 'As encomendas trocadas', char: 'jorge', steps: [
    { t: 'dialog', scene: 'portaria', cast: [{ id: 'jorge', x: 72, y: 26, mode: 'sil' }], lines: [
      { who: 'faisca', text: 'A Névoa apagou as etiquetas das encomendas!' },
      { who: '?jorge', text: 'Conheço todo mundo aqui. Me ajudam a entregar?' }] },
    { t: 'match', prompt: 'Cada encomenda vai para qual apartamento?',
      left: 'Encomenda', right: 'Apartamento',
      pairs: [
        { a: { prop: 'racao', label: 'Saco de ração' }, b: { label: 'Apto 202: a família Okoye tem um cachorro chamado Bolinha.' }, ok: 'Isso! O Bolinha agradece.' },
        { a: { prop: 'violao', label: 'Violão' }, b: { label: 'Apto 303: o Léo começa a aula de música amanhã.' }, ok: 'Certo! O Léo vai poder tocar na primeira aula.' },
        { a: { prop: 'sementes', label: 'Pacote de sementes' }, b: { label: 'Apto 101: Dona Lurdes adora cuidar da horta no quintal.' }, ok: 'Perfeito! A horta da Dona Lurdes vai crescer.' },
        { a: { prop: 'pneu', label: 'Pneu de bicicleta' }, b: { label: 'Apto 404: Seu Ramón está consertando a bicicleta.' }, ok: 'Isso mesmo! A bicicleta do Seu Ramón vai voltar a rodar.', level: 'inv' },
        { a: { prop: 'fraldas', label: 'Pacote de fraldas' }, b: { label: 'Apto 105: a bebê Lia nasceu semana passada.' }, ok: 'Muito bem! A família da Lia agradece.', level: 'det' }],
      decoys: [{ label: 'Apto 201: Dona Cecília está viajando e só volta mês que vem.' }, { label: 'Apto 402: o casal Prado não fez nenhuma compra esta semana.' }],
      wrong: 'Hmm, acho que não. Leia de novo quem mora em cada apartamento.' },
    { t: 'whoami', char: 'jorge', clues: [
      'Eu sei o nome de quase todo mundo que mora aqui.',
      'Recebo encomendas, anoto visitas e cuido de quem entra e de quem sai.',
      'Meu lugar de trabalho fica logo na entrada do prédio, às vezes de madrugada.',
      'Tenho as chaves de vários portões e falo pelo interfone o dia todo.'] },
    { t: 'reveal', char: 'jorge' },
    { t: 'choice', scene: 'portaria', cast: [{ id: 'jorge', x: 72, y: 26 }, { id: 'bia', x: 24, y: 40 }],
      prompt: 'Você chega da escola e o Seu Jorge diz: "Boa tarde!". O que você faz?',
      options: [
        { text: 'Responder "Boa tarde, Seu Jorge!" e sorrir.', kind: true, result: 'Chamar alguém pelo nome é um jeito de dizer: "eu vejo você".' },
        { text: 'Passar direto, olhando o celular.', kind: false, result: 'Seu Jorge fica sem resposta. Ele cumprimenta mais de cem pessoas por dia, e muitas nem olham para ele.' },
        { text: 'Cumprimentar e perguntar se ele precisa de ajuda com as caixas.', kind: true, result: 'Que gentileza! Seu Jorge agradece, e o prédio fica mais acolhedor para todos.' }] },
    { t: 'reflect', learn: 'O porteiro cuida da segurança e da organização do prédio. Conhecer o nome de quem trabalha perto de nós é um primeiro passo para valorizar esse trabalho.',
      question: 'Você sabe o nome de quem trabalha na portaria, na recepção ou no portão da sua escola?',
      challenge: 'Descubra o nome de alguém que trabalha na entrada da sua escola ou do seu prédio e cumprimente essa pessoa pelo nome.' }
  ] },

  /* ===== VILA DO APRENDIZADO ===== */
  ze: { title: 'O cheiro que sumiu', char: 'ze', steps: [
    { t: 'dialog', scene: 'salaaula', cast: [{ id: 'bia', x: 60, y: 46 }], lines: [
      { who: 'bia', text: 'Sumiu o cheirinho de arroz da escola!' },
      { who: 'faisca', text: 'Quem faz a comida? Pra cozinha!' }] },
    { t: 'investigate', scene: 'cozinha', need: 4, prompt: 'Explore a cozinha: como a merenda é feita?',
      items: [
        { prop: 'touca', x: 8, y: 24, clue: true, label: 'Touca e avental', text: 'Touca e avental: higiene é regra!' },
        { prop: 'panelao', x: 116, y: 22, clue: true, label: 'Panelão', text: 'Panelão gigante: arroz para centenas!' },
        { prop: 'cardapio', x: 40, y: 24, clue: true, label: 'Cardápio', text: 'Cardápio saudável, feito com a nutricionista.' },
        { prop: 'legumes', x: 66, y: 28, clue: true, label: 'Caixa de legumes', text: 'Legumes fresquinhos da região!' },
        { prop: 'torneira', x: 90, y: 28, clue: true, label: 'Pia e sabão', text: 'Lavar as mãos antes de cozinhar. Sempre!', level: 'det' },
        { prop: 'relogio', x: 138, y: 6, clue: false, label: 'Relógio', text: '10h! Faltam 2 horas pro almoço. Corre!' },
        { x: 4, y: 8, w: 46, h: 12, clue: false, label: 'Prateleira', text: 'Temperos organizadinhos.' }] },
    { t: 'sequence', prompt: 'Prepare a merenda na ordem certa.',
      items: [
        { prop: 'cardapio', label: 'Conferir o cardápio do dia', level: 'det' },
        { prop: 'sabonete', label: 'Lavar as mãos e pôr a touca' },
        { prop: 'faca', label: 'Lavar e cortar os alimentos' },
        { prop: 'panelao', label: 'Cozinhar' },
        { prop: 'prato', label: 'Servir as crianças' },
        { prop: 'balde', label: 'Lavar as panelas e limpar a cozinha', level: 'inv' }],
      ok: 'Pronto! Tudo isso acontece antes e depois de você comer. Por isso a merenda chega quentinha.' },
    { t: 'reveal', char: 'ze' },
    { t: 'choice', scene: 'cozinha', cast: [{ id: 'ze', x: 120, y: 44 }, { id: 'theo', x: 40, y: 48 }],
      prompt: 'No intervalo, um colega enche o prato e depois joga metade no lixo. O que você faz?',
      options: [
        { text: 'Sugerir que ele pegue menos e repita se ainda tiver fome.', kind: true, result: 'Boa ideia! Assim ninguém desperdiça a comida nem o trabalho do Seu Zé.' },
        { text: 'Fazer igual. É só comida.', kind: false, result: 'Cada prato jogado fora é comida, água, gás e horas de trabalho indo para o lixo.' },
        { text: 'Ir até a cozinha agradecer pela comida.', kind: true, result: 'Seu Zé fica surpreso e feliz: quase ninguém vai até lá agradecer!' }] },
    { t: 'reflect', learn: 'O merendeiro prepara alimentação segura e saudável para todos os alunos. Sem ele, muita criança ficaria com fome e não conseguiria aprender.',
      question: 'Você sabe o nome de quem prepara a comida da sua escola? Já agradeceu?',
      challenge: 'No próximo intervalo, agradeça a quem fez sua merenda.' }
  ] },

  katia: { title: 'A sala que amanhece limpa', char: 'katia', steps: [
    { t: 'dialog', scene: 'salaaula', cast: [{ id: 'katia', x: 126, y: 42, mode: 'sil' }], items: [{ prop: 'papel', x: 30, y: 70 }, { prop: 'casaco', x: 92, y: 66 }, { prop: 'cadeira', x: 60, y: 70 }], lines: [
      { who: 'faisca', text: 'Ontem: bagunça. Hoje: sala brilhando!' },
      { who: '?katia', text: 'Psiu! Chego cedinho. Me ajuda a separar?' }] },
    { t: 'sort', prompt: 'Para onde vai cada coisa que ficou na sala?',
      bins: [
        { id: 'lixo', label: 'Lixo', prop: 'lixeira' },
        { id: 'achados', label: 'Achados e perdidos', prop: 'caixa' },
        { id: 'lugar', label: 'Volta para o lugar', prop: 'livro' }],
      items: [
        { prop: 'papel', label: 'Papel amassado', bin: 'lixo', why: 'Papel amassado e sujo vai para o lixo.' },
        { prop: 'casaco', label: 'Casaco esquecido', bin: 'achados', why: 'Alguém vai sentir frio e procurar por ele. Achados e perdidos!' },
        { prop: 'livro', label: 'Livro da estante', bin: 'lugar', why: 'O livro é da sala. Volta para a estante.' },
        { prop: 'banana', label: 'Casca de banana', bin: 'lixo', why: 'Resto de comida vai para o lixo (ou para a compostagem!).' },
        { prop: 'garrafinha', label: 'Garrafinha com nome', bin: 'achados', why: 'Tem nome escrito: o dono vai poder buscar.', level: 'inv' },
        { prop: 'cadeira', label: 'Cadeira caída', bin: 'lugar', why: 'A cadeira volta para a mesa.', level: 'inv' },
        { prop: 'chiclete', label: 'Chiclete grudado na mesa', bin: 'lixo', why: 'Vai para o lixo, mas antes alguém teve que raspar da mesa. Que trabalhão!', level: 'det' }] },
    { t: 'whoami', char: 'katia', clues: [
      'Chego antes dos alunos ou fico depois que todos vão embora.',
      'Uso vassoura, pano, balde e produtos de limpeza, sempre de luvas.',
      'Quando faço meu trabalho bem feito, quase ninguém percebe... porque está tudo limpo!',
      'Guardo os objetos esquecidos até o dono vir buscar.'] },
    { t: 'reveal', char: 'katia' },
    { t: 'choice', scene: 'salaaula', cast: [{ id: 'theo', x: 50, y: 48 }, { id: 'katia', x: 120, y: 44 }],
      prompt: 'Um colega joga papel no chão: "Tem gente paga pra limpar!" E você?',
      options: [
        { text: 'Explicar que limpar não é desculpa para sujar e pedir que ele jogue no lixo.', kind: true, result: 'Isso! Respeitar o trabalho de alguém é não aumentar esse trabalho de propósito.' },
        { text: 'Rir junto com ele.', kind: false, result: 'Sujar de propósito aumenta o trabalho da Kátia e mostra falta de respeito. Ela também ouve essas piadas.' },
        { text: 'Pegar o papel você mesmo e jogar no lixo.', kind: true, result: 'Atitude que inspira! Às vezes o exemplo convence mais que muitas palavras.' }] },
    { t: 'reflect', learn: 'A limpeza da escola evita doenças e deixa o lugar agradável. Esse trabalho fica "invisível" justamente quando é bem feito.',
      question: 'Por que será que a gente só repara na limpeza quando ela não foi feita?',
      challenge: 'Por uma semana, deixe sua carteira e o chão em volta dela limpos no fim da aula.' }
  ] },

  /* ===== ESTAÇÃO DA SAÚDE ===== */
  lucia: { title: 'A visita de cada mês', char: 'lucia', steps: [
    { t: 'dialog', scene: 'ruacasas', cast: [{ id: 'neide', x: 20, y: 40 }, { id: 'lucia', x: 104, y: 44, mode: 'sil' }], lines: [
      { who: 'neide', text: 'A vacina do meu neto está em dia?' },
      { who: '?lucia', text: 'Calma! Vamos ver casa por casa.' }] },
    { t: 'match', prompt: 'Ligue cada família ao que a Lúcia faz.',
      left: 'Situação', right: 'O que fazer',
      pairs: [
        { a: { prop: 'vacina', label: 'O Davi, de 4 anos, está com uma vacina atrasada.' }, b: { label: 'Avisar a família e orientar a ir ao posto vacinar.' }, ok: 'Isso! Vacina em dia protege o Davi e toda a comunidade.' },
        { a: { prop: 'pneuagua', label: 'Tem um pneu velho com água parada no quintal.' }, b: { label: 'Explicar como evitar a dengue e ajudar a tirar a água parada.' }, ok: 'Certo! Água parada é onde o mosquito da dengue se cria.' },
        { a: { prop: 'idoso', label: 'Seu Osvaldo, de 80 anos, mora sozinho e não vai ao médico há meses.' }, b: { label: 'Contar para a equipe do posto e combinar uma visita.' }, ok: 'Muito bem! Ela leva a necessidade dele até a equipe de saúde.' },
        { a: { prop: 'mudanca', label: 'Uma família acabou de se mudar para a rua.' }, b: { label: 'Fazer o cadastro da família no posto de saúde.' }, ok: 'Perfeito! Com o cadastro, a família passa a ser acompanhada.', level: 'inv' },
        { a: { prop: 'gestante', label: 'Uma gestante não sabe quando é a próxima consulta.' }, b: { label: 'Lembrar a consulta de pré-natal e acompanhar a gravidez.' }, ok: 'Isso mesmo! O pré-natal cuida da mãe e do bebê.', level: 'det' }],
      decoys: [{ label: 'Receitar um remédio para a família.' }, { label: 'Dar uma vacina na hora, ali na casa.' }],
      decoyWhy: 'A agente comunitária não receita remédios nem aplica vacina na casa: isso é com médicos e enfermeiros do posto. Ela orienta e encaminha.',
      wrong: 'Ainda não. Pense: o que resolveria o problema dessa família?' },
    { t: 'whoami', char: 'lucia', clues: [
      'Moro no mesmo bairro onde trabalho.',
      'Visito as famílias em casa, todo mês, e levo informações para o posto de saúde.',
      'Não sou médica nem enfermeira, mas faço parte da equipe de saúde da família.',
      'Ando muito! Conheço quase todas as ruas e casas do bairro.'] },
    { t: 'reveal', char: 'lucia' },
    { t: 'choice', scene: 'ruacasas', cast: [{ id: 'lucia', x: 104, y: 44 }, { id: 'iara', x: 30, y: 44 }],
      prompt: 'A Lúcia chegou para a visita do mês. E aí?',
      options: [
        { text: 'Receber, responder às perguntas e mostrar a carteira de vacinação.', kind: true, result: 'Ótimo! Com essas informações, a equipe consegue cuidar melhor da sua família.' },
        { text: 'Fingir que não tem ninguém em casa.', kind: false, result: 'Ela vai ter que voltar outro dia, e algum problema de saúde pode demorar para ser visto.' },
        { text: 'Agradecer e perguntar como evitar a dengue na rua.', kind: true, result: 'Que curiosidade boa! Informação também é cuidado.' }] },
    { t: 'reflect', learn: 'A agente comunitária de saúde visita as famílias, orienta e liga a comunidade ao posto de saúde. Ela ajuda a evitar que as pessoas fiquem doentes.',
      question: 'Por que é importante que alguém do próprio bairro cuide da saúde das famílias?',
      challenge: 'Procure com sua família algum lugar com água parada em casa e resolvam juntos.' }
  ] },

  benedito: { title: 'O dia de Dona Olímpia', char: 'benedito', steps: [
    { t: 'dialog', scene: 'quarto', cast: [{ id: 'olimpia', x: 20, y: 38 }, { id: 'benedito', x: 116, y: 40, mode: 'sil' }], lines: [
      { who: 'olimpia', text: 'Cadê meus óculos? E meu remédio?' },
      { who: 'faisca', text: 'Alguém cuida dela todo dia. Quem?' }] },
    { t: 'investigate', scene: 'quarto', need: 4, prompt: 'Ache o que ajuda Dona Olímpia a viver bem.',
      cast: [{ id: 'olimpia', x: 20, y: 38 }],
      items: [
        { prop: 'oculos', x: 112, y: 36, clue: true, label: 'Óculos', text: 'No lugar de sempre: quem cuida sabe!' },
        { prop: 'remedios', x: 122, y: 36, clue: true, label: 'Caixa de remédios', text: 'Remédios separados por dia e hora.' },
        { prop: 'bengala', x: 46, y: 48, clue: true, label: 'Bengala', text: 'Bengala por perto: nada de queda!' },
        { prop: 'album', x: 140, y: 64, clue: true, label: 'Álbum de fotos', text: 'Cuidar também é conversar!' },
        { x: 50, y: 75, w: 50, h: 10, clue: true, label: 'Tapete preso', text: 'Tapete preso: ninguém escorrega!', level: 'det' },
        { prop: 'radio', x: 86, y: 50, clue: false, label: 'Rádio', text: 'Samba no rádio. Ela adora!' },
        { x: 112, y: 12, w: 30, h: 14, clue: false, label: 'Fotos na parede', text: 'Fotos dos netos!' }] },
    { t: 'sequence', prompt: 'Organize a manhã de cuidados com Dona Olímpia.',
      items: [
        { prop: 'cama', label: 'Ajudar a levantar da cama com segurança' },
        { prop: 'chuveiro', label: 'Ajudar no banho e a se vestir', level: 'inv' },
        { prop: 'xicara', label: 'Preparar o café da manhã' },
        { prop: 'remedios', label: 'Dar o remédio no horário certo' },
        { prop: 'passeio', label: 'Caminhar juntos até a praça' }],
      ok: 'Isso! E o dia ainda nem chegou na hora do almoço...' },
    { t: 'reveal', char: 'benedito' },
    { t: 'choice', scene: 'quarto', cast: [{ id: 'olimpia', x: 20, y: 38 }, { id: 'benedito', x: 70, y: 44 }],
      prompt: 'Dona Olímpia conta a mesma história pela 3ª vez. E você?',
      options: [
        { text: 'Ouvir com atenção e perguntar como era a música.', kind: true, result: 'Para ela, ser ouvida é tão importante quanto o remédio.' },
        { text: 'Dizer: "Você já contou essa história."', kind: false, result: 'Ela pode se sentir esquecida. As pessoas idosas também correm o risco de ficar "invisíveis".' },
        { text: 'Pedir para ela te ensinar um passo de dança.', kind: true, result: 'Dona Olímpia ri e se levanta, devagar, com o Benedito do lado. Que manhã boa!' }] },
    { t: 'reflect', learn: 'O cuidador ajuda a pessoa idosa no dia a dia, com segurança e carinho. Quem cuida também precisa de descanso e reconhecimento.',
      question: 'Quem cuida das pessoas idosas da sua família? Essa pessoa recebe ajuda ou descansa?',
      challenge: 'Ligue ou visite uma pessoa idosa da sua família e peça para ela contar uma história de quando era criança.' }
  ] },

  /* ===== MERCADO ===== */
  zefa: { title: 'O caminho do tomate', char: 'zefa', steps: [
    { t: 'dialog', scene: 'feira', cast: [{ id: 'iara', x: 40, y: 54 }], lines: [
      { who: 'iara', text: 'Mãe, o tomate nasce no mercado?' },
      { who: 'faisca', text: 'Nada disso! Vamos ver a viagem dele!' },] },
    { t: 'whoami', char: 'zefa', clues: [
      'Acordo antes de o sol nascer.',
      'Trabalho com a terra, com as sementes e com a chuva.',
      'Sem o meu trabalho, não haveria comida no prato de ninguém.',
      'Às sextas, levo o que colhi para vender na feira.'] },
    { t: 'sequence', prompt: 'Monte o caminho do tomate, do começo até a feira.',
      items: [
        { prop: 'terra', label: 'Preparar a terra', level: 'inv' },
        { prop: 'semente', label: 'Plantar as sementes' },
        { prop: 'regador', label: 'Regar e cuidar da plantação' },
        { prop: 'cesta', label: 'Colher os tomates maduros' },
        { prop: 'caminhonete', label: 'Levar até a feira', level: 'det' },
        { prop: 'barraca', label: 'Vender na barraca' }],
      ok: 'Meses de trabalho para o tomate chegar até a salada!' },
    { t: 'reveal', char: 'zefa' },
    { t: 'choice', scene: 'feira', cast: [{ id: 'zefa', x: 68, y: 40 }, { id: 'iara', x: 30, y: 54 }],
      prompt: 'Um tomate está amassadinho, mas bom. E aí?',
      options: [
        { text: 'Levar assim mesmo: ele ainda serve para fazer molho.', kind: true, result: 'Alimento bom não deve ir para o lixo. Muita gente trabalhou para ele existir.' },
        { text: 'Reclamar alto com a feirante.', kind: false, result: 'Tomate amassa no transporte. Dona Zefa fica chateada: ela cuidou dele por meses.' },
        { text: 'Perguntar à Dona Zefa qual tomate é melhor para salada.', kind: true, result: 'Ela adora explicar! Quem planta sabe muito sobre os alimentos.' }] },
    { t: 'reflect', learn: 'A agricultora familiar planta grande parte da comida que chega às nossas mesas. O trabalho dela começa muito antes de o alimento aparecer no mercado.',
      question: 'Que alimento você comeu hoje? Quantas pessoas trabalharam para ele chegar até você?',
      challenge: 'No almoço de hoje, tente adivinhar de onde veio cada alimento do seu prato.' }
  ] },

  rafa: { title: 'Entregas na chuva', char: 'rafa', steps: [
    { t: 'dialog', scene: 'feira', cast: [{ id: 'rafa', x: 100, y: 52, mode: 'sil' }], lines: [
      { who: 'faisca', text: 'Choveu e o mapa embaralhou!' },
      { who: '?rafa', text: 'Me ajuda a planejar as entregas?' }] },
    { t: 'route', prompt: 'Toque nas ruas e entregue tudo! Remédio primeiro.',
      grids: {
        exp: { w: 6, h: 5, start: [0, 2], drops: [{ x: 5, y: 0, prop: 'casa', label: 'Casa da Dona Neide' }, { x: 4, y: 4, prop: 'farmacia', label: 'Remédio para o Seu Osvaldo' }],
          blocks: [{ x: 2, y: 1, prop: 'obra' }, { x: 2, y: 2, prop: 'obra' }, { x: 3, y: 3, prop: 'agua' }] },
        inv: { w: 7, h: 5, start: [0, 2], drops: [{ x: 6, y: 0, prop: 'casa', label: 'Casa da Dona Neide' }, { x: 3, y: 4, prop: 'farmacia', label: 'Remédio para o Seu Osvaldo' }, { x: 6, y: 4, prop: 'predio', label: 'Pizza para o Edifício Ipê' }],
          blocks: [{ x: 2, y: 1, prop: 'obra' }, { x: 2, y: 2, prop: 'obra' }, { x: 4, y: 3, prop: 'agua' }, { x: 5, y: 1, prop: 'agua' }, { x: 4, y: 1, prop: 'obra' }] },
        det: { w: 8, h: 6, start: [0, 3], drops: [{ x: 7, y: 0, prop: 'casa', label: 'Casa da Dona Neide' }, { x: 3, y: 5, prop: 'farmacia', label: 'Remédio para o Seu Osvaldo' }, { x: 7, y: 5, prop: 'predio', label: 'Pizza para o Edifício Ipê' }, { x: 4, y: 0, prop: 'livro', label: 'Lanche para a escola' }],
          blocks: [{ x: 2, y: 2, prop: 'obra' }, { x: 2, y: 3, prop: 'obra' }, { x: 2, y: 4, prop: 'obra' }, { x: 5, y: 1, prop: 'agua' }, { x: 5, y: 2, prop: 'agua' }, { x: 4, y: 4, prop: 'agua' }, { x: 6, y: 4, prop: 'obra' }] }
      },
      urgent: 'farmacia', urgentText: 'Primeiro o remédio! O Seu Osvaldo está esperando e é urgente.',
      blockText: { obra: 'Rua em obra! Não dá para passar de bicicleta.', agua: 'Rua alagada! Perigoso pedalar aqui.' },
      ok: 'Todas as entregas feitas com segurança!' },
    { t: 'whoami', char: 'rafa', clues: [
      'Passo o dia inteiro na rua, no sol e na chuva.',
      'Uso capacete e uma mochila grande e quadrada nas costas.',
      'Levo comida e compras até a porta da sua casa.',
      'Meu "carro" não tem motor: são as minhas pernas que fazem ele andar.'] },
    { t: 'reveal', char: 'rafa' },
    { t: 'choice', scene: 'ruacasas', cast: [{ id: 'rafa', x: 100, y: 44 }, { id: 'theo', x: 30, y: 44 }],
      prompt: 'Seu lanche chegou 10 minutos atrasado porque choveu forte. O que você diz?',
      options: [
        { text: '"Obrigado! Toma cuidado na chuva."', kind: true, result: 'Rafa sorri. Uma palavra gentil depois de pedalar na chuva vale muito.' },
        { text: 'Reclamar e dar nota baixa no aplicativo.', kind: false, result: 'A nota baixa pode prejudicar o trabalho do Rafa, e o atraso foi por causa da chuva, não dele.' },
        { text: 'Oferecer um copo de água.', kind: true, result: 'Que cuidado! Muitos entregadores passam horas sem um lugar para beber água.' }] },
    { t: 'reflect', learn: 'O entregador leva comida, compras e remédios até a nossa casa enfrentando trânsito, sol e chuva. Respeito e paciência fazem diferença no dia dele.',
      question: 'Quando um pedido chega na sua casa, você pensa em quem trouxe?',
      challenge: 'Na próxima entrega na sua casa, agradeça olhando nos olhos de quem trouxe.' }
  ] },

  /* ===== PARQUE ===== */
  marina: { title: 'A montanha de recicláveis', char: 'marina', steps: [
    { t: 'dialog', scene: 'cooperativa', cast: [{ id: 'marina', x: 66, y: 22, mode: 'sil' }], lines: [
      { who: 'faisca', text: 'Sobrou uma montanha de lixo da festa!' },
      { who: '?marina', text: 'Vamos separar? Muita coisa vira nova!' }] },
    { t: 'sort', prompt: 'Cada material na lixeira certa!',
      bins: [
        { id: 'papel', label: 'Papel', color: '#4a78c9', prop: 'jornal' },
        { id: 'plastico', label: 'Plástico', color: '#d9534f', prop: 'pet' },
        { id: 'metal', label: 'Metal', color: '#f4c542', prop: 'lata' },
        { id: 'vidro', label: 'Vidro', color: '#5cae6a', prop: 'vidro' },
        { id: 'organico', label: 'Orgânico', color: '#8b5a2b', prop: 'banana', level: 'inv' },
        { id: 'rejeito', label: 'Não reciclável', color: '#9aa3ad', prop: 'guardanapo', level: 'inv' }],
      items: [
        { prop: 'jornal', label: 'Jornal velho', bin: 'papel', why: 'Papel limpo vira papel novo!' },
        { prop: 'pet', label: 'Garrafa PET', bin: 'plastico', why: 'Garrafa PET pode virar até tecido para camiseta.' },
        { prop: 'lata', label: 'Lata de refrigerante', bin: 'metal', why: 'A latinha de alumínio pode ser reciclada muitas e muitas vezes.' },
        { prop: 'vidro', label: 'Pote de vidro', bin: 'vidro', why: 'Vidro pode ser derretido e virar um pote novo.' },
        { prop: 'papelao', label: 'Caixa de papelão', bin: 'papel', why: 'Papelão desmontado ocupa menos espaço e é ótimo para reciclar.' },
        { prop: 'iogurte', label: 'Pote de iogurte', bin: 'plastico', why: 'Plástico! E fica melhor ainda se for lavado antes.' },
        { prop: 'banana', label: 'Casca de banana', bin: 'organico', why: 'Orgânico pode virar adubo na compostagem.', level: 'inv' },
        { prop: 'guardanapo', label: 'Guardanapo sujo', bin: 'rejeito', why: 'Papel sujo de comida não dá para reciclar.', level: 'inv' },
        { prop: 'espelho', label: 'Espelho quebrado', bin: 'rejeito', why: 'Espelho não é reciclado junto com o vidro comum. E precisa ser bem embrulhado para não cortar ninguém!', level: 'det' }] },
    { t: 'whoami', char: 'marina', clues: [
      'Separo, prenso e vendo materiais recicláveis.',
      'Trabalho numa cooperativa com outras pessoas e dividimos o que ganhamos.',
      'Graças ao meu trabalho, toneladas de material não vão parar no lixão.',
      'Uso luvas porque às vezes encontro vidro quebrado no meio das coisas.'] },
    { t: 'reveal', char: 'marina' },
    { t: 'choice', scene: 'cooperativa', cast: [{ id: 'marina', x: 66, y: 22 }],
      prompt: 'Na sua casa, todo mundo joga tudo no mesmo saco de lixo. O que você pode propor?',
      options: [
        { text: 'Separar o lixo reciclável (seco) do lixo de comida (úmido).', kind: true, result: 'Perfeito! Separado, o material chega limpo na cooperativa e vira coisa nova.' },
        { text: 'Deixar como está. Alguém separa depois.', kind: false, result: 'Esse "alguém" é a Marina. Misturado com resto de comida, muito material se perde.' },
        { text: 'Lavar as embalagens antes de separar.', kind: true, result: 'Embalagem limpa é mais segura e mais fácil de reciclar. A Marina agradece!' }] },
    { t: 'reflect', learn: 'Catadoras e catadores separam o que pode ser reciclado. Esse trabalho protege o meio ambiente e gera renda, mas ainda sofre muito preconceito.',
      question: 'Para onde você acha que vai o lixo da sua casa depois que o caminhão leva?',
      challenge: 'Separe o lixo reciclável na sua casa durante uma semana.' }
  ] },

  joaquim: { title: 'O jardim que não para de crescer', char: 'joaquim', steps: [
    { t: 'dialog', scene: 'parque', cast: [{ id: 'theo', x: 54, y: 52 }, { id: 'bia', x: 74, y: 52 }], lines: [
      { who: 'bia', text: 'As flores se plantam sozinhas?' },
      { who: 'faisca', text: 'Jardim bonito precisa de alguém. Vamos achar!' }] },
    { t: 'investigate', scene: 'parque', need: 4, prompt: 'Ache sinais de quem cuida do parque.',
      items: [
        { prop: 'muda', x: 4, y: 60, clue: true, label: 'Mudas novas', text: 'Mudas novas: um dia, árvores!' },
        { prop: 'regador', x: 24, y: 60, clue: true, label: 'Regador', text: 'Regador molhado: regaram hoje!' },
        { prop: 'folhas', x: 76, y: 70, clue: true, label: 'Folhas amontoadas', text: 'Alguém varreu as folhas!' },
        { prop: 'carrinho', x: 108, y: 40, clue: true, label: 'Carrinho de mão', text: 'Carrinho com terra: tem trabalho aqui!' },
        { prop: 'tesoura', x: 58, y: 44, clue: true, label: 'Tesoura de poda', text: 'Tesoura de poda: tira galho seco.', level: 'det' },
        { prop: 'pato', x: 124, y: 60, clue: false, label: 'Pato', text: 'Quá! O pato não ajudou. Mas é fofo!' },
        { prop: 'flor', x: 40, y: 72, clue: false, label: 'Flor', text: 'Alguém plantou e regou esta flor!' }] },
    { t: 'sequence', prompt: 'Vamos plantar uma muda de ipê! Coloque os passos na ordem.',
      items: [
        { prop: 'pa', label: 'Cavar um buraco' },
        { prop: 'adubo', label: 'Colocar adubo no buraco', level: 'inv' },
        { prop: 'muda', label: 'Colocar a muda' },
        { prop: 'terra', label: 'Cobrir a raiz com terra' },
        { prop: 'regador', label: 'Regar' }],
      ok: 'Plantada! Agora é cuidar por anos até virar uma árvore grande.' },
    { t: 'reveal', char: 'joaquim' },
    { t: 'choice', scene: 'parque', cast: [{ id: 'joaquim', x: 100, y: 40 }, { id: 'bia', x: 40, y: 52 }],
      prompt: 'Uma criança quer arrancar flores do canteiro para levar para casa. O que você sugere?',
      options: [
        { text: 'Explicar que as flores são de todo mundo e tirar uma foto delas.', kind: true, result: 'Boa! A foto fica guardada e as flores continuam lá para todo mundo ver.' },
        { text: 'Arrancar também.', kind: false, result: 'Seu Joaquim levou semanas para essas flores crescerem. Arrancadas, elas murcham em poucas horas.' },
        { text: 'Perguntar ao Seu Joaquim se ele tem uma muda para doar.', kind: true, result: 'Ele adora! Ele dá uma muda e ensina como cuidar dela em casa.' }] },
    { t: 'reflect', learn: 'O jardineiro cuida das plantas, árvores e canteiros que deixam a cidade mais fresca e bonita. Espaço público bem cuidado é trabalho de alguém.',
      question: 'Que lugares públicos você usa (praça, parque, quadra) e quem cuida deles?',
      challenge: 'Cuide de uma planta, em casa ou na escola, por uma semana.' }
  ] },

  /* ===== CAMINHOS DA CIDADE ===== */
  denise: { title: 'A rua de antes e de depois', char: 'denise', steps: [
    { t: 'dialog', scene: 'rua', cast: [{ id: 'denise', x: 120, y: 48, mode: 'sil' }], lines: [
      { who: 'faisca', text: '5h da manhã... e agora, 7h. O que mudou?' },] },
    { t: 'spot', scene: 'rua', prompt: 'Toque nas diferenças!',
      diffs: [
        { prop: 'papel', x: 20, y: 52, after: null, label: 'Papéis na calçada', text: 'Os papéis espalhados foram varridos.' },
        { prop: 'saco', x: 46, y: 46, after: null, label: 'Saco de lixo rasgado', text: 'Saco recolhido antes dos bichos!' },
        { prop: 'bueiro', x: 64, y: 62, after: 'bueirolimpo', label: 'Bueiro entupido', text: 'Bueiro limpo: a rua não alaga!' },
        { prop: 'lixeiracheia', x: 98, y: 44, after: 'lixeira', label: 'Lixeira cheia', text: 'Lixeira cheia? Agora vazia!', level: 'inv' },
        { prop: 'garrafa', x: 138, y: 54, after: null, label: 'Garrafa na calçada', text: 'Vidro recolhido: ninguém se machuca!', level: 'det' }] },
    { t: 'whoami', char: 'denise', clues: [
      'Começo a trabalhar quando a cidade ainda está dormindo.',
      'Uso uniforme laranja com faixas que brilham no escuro.',
      'Varro as ruas e recolho o lixo para a cidade não ficar suja nem alagar.',
      'Meu carrinho tem vassoura, pá e muitos sacos de lixo.'] },
    { t: 'reveal', char: 'denise' },
    { t: 'choice', scene: 'rua', cast: [{ id: 'denise', x: 110, y: 48 }, { id: 'iara', x: 40, y: 48 }],
      prompt: 'Alguém joga uma lata pela janela do carro. E você?',
      options: [
        { text: 'Guardar o meu lixo comigo até achar uma lixeira, sempre.', kind: true, result: 'Exemplo é tudo! Se cada um cuidar do seu lixo, o trabalho da Denise fica mais leve.' },
        { text: 'Achar normal. Afinal, o gari limpa.', kind: false, result: 'O trabalho da Denise é limpar a cidade, não aguentar falta de respeito. Lixo jogado no chão também pode entupir bueiros.' },
        { text: 'Cumprimentar a Denise e agradecer pela rua limpa.', kind: true, result: 'Denise acena de volta, com um sorriso enorme. Ela quase nunca ouve um obrigado.' }] },
    { t: 'reflect', learn: 'A gari limpa ruas, esvazia lixeiras e desentope bueiros. Esse trabalho protege a saúde de todos e evita enchentes.',
      question: 'O que aconteceria com a cidade se os garis parassem de trabalhar por uma semana?',
      challenge: 'Guarde seu lixo com você até encontrar uma lixeira. Sempre!' }
  ] },

  pedro: { title: 'Religar as luzes', char: 'pedro', steps: [
    { t: 'dialog', scene: 'ruanoite', cast: [{ id: 'pedro', x: 64, y: 44, mode: 'sil' }], lines: [
      { who: 'faisca', text: 'Os postes apagaram! Que perigo!' },
      { who: '?pedro', text: 'Eu conserto, com segurança. Me ajudam?' }] },
    { t: 'match', prompt: 'Para que serve cada equipamento?', left: 'Equipamento', right: 'Para quê',
      pairs: [
        { a: { prop: 'capacete', label: 'Capacete' }, b: { label: 'Proteger a cabeça.' }, ok: 'Isso! O capacete protege contra batidas e objetos que caem.' },
        { a: { prop: 'luvas', label: 'Luvas isolantes' }, b: { label: 'Proteger as mãos de choque elétrico.' }, ok: 'Certo! Essas luvas não deixam a eletricidade passar.' },
        { a: { prop: 'cone', label: 'Cones' }, b: { label: 'Avisar os carros que tem gente trabalhando.' }, ok: 'Muito bem! A rua precisa estar sinalizada.' },
        { a: { prop: 'caminhao', label: 'Caminhão com cesto' }, b: { label: 'Alcançar o alto do poste.' }, ok: 'Perfeito! O cesto sobe com o eletricista em segurança.', level: 'inv' },
        { a: { prop: 'lampada', label: 'Lâmpada nova' }, b: { label: 'Trocar a lâmpada queimada.' }, ok: 'Isso! Hoje muitas cidades usam lâmpadas de LED, que gastam menos energia.', level: 'det' }],
      decoys: [{ label: 'Deixar a rua mais bonita.' }, { label: 'Trabalhar mais rápido sem precisar desligar a energia.' }],
      wrong: 'Hmm, ainda não. Pense no perigo que cada equipamento evita.' },
    { t: 'sequence', prompt: 'Coloque o conserto do poste na ordem segura.',
      items: [
        { prop: 'cone', label: 'Sinalizar a rua com cones' },
        { prop: 'luvas', label: 'Vestir capacete e luvas' },
        { prop: 'desligar', label: 'Desligar a energia do poste', level: 'inv' },
        { prop: 'caminhao', label: 'Subir no cesto do caminhão', level: 'det' },
        { prop: 'lampada', label: 'Trocar a lâmpada' },
        { prop: 'poste', label: 'Religar e testar a luz' }],
      ok: 'Luz acesa e ninguém se machucou. Segurança em primeiro lugar!' },
    { t: 'reveal', char: 'pedro' },
    { t: 'choice', scene: 'ruanoite', cast: [{ id: 'pedro', x: 64, y: 44 }, { id: 'theo', x: 110, y: 46 }],
      prompt: 'Um poste da sua rua está apagado há vários dias. O que você faz?',
      options: [
        { text: 'Pedir para um adulto avisar a prefeitura.', kind: true, result: 'Isso! A iluminação das ruas é responsabilidade da prefeitura, e o aviso chega até equipes como a do Pedro.' },
        { text: 'Pensar: ninguém vai consertar mesmo.', kind: false, result: 'Tem gente pronta para consertar, como o Pedro. Mas alguém precisa avisar!' },
        { text: 'Nunca mexer em fios ou postes, e contar para um adulto.', kind: true, result: 'Atitude segura! Eletricidade é perigosa e só profissionais treinados mexem nela.' }] },
    { t: 'reflect', learn: 'O eletricista da iluminação pública mantém as ruas iluminadas e seguras. Ele trabalha com riscos e segue regras de segurança à risca.',
      question: 'Quantas coisas na sua rua funcionam sem você ver quem instalou ou consertou?',
      challenge: 'Repare em três coisas na sua rua que alguém precisou instalar ou consertar.' }
  ] }
};

/* ---------------- CARTAS SURPRESA ---------------- */
const SURPRISES = [
  { title: 'A Névoa apagou uma placa!', text: 'Uma rua de Lumiara ficou sem nome. Inventem um nome novo para ela, em homenagem a um trabalhador que vocês conheceram.' },
  { title: 'Hora da mímica', text: 'Uma pessoa imita um trabalho sem falar nada. Quem assiste tenta adivinhar. (Jogando sozinho? Faça para alguém da sua casa!)' },
  { title: 'Um feriado novo', text: 'Criem um feriado para homenagear quem trabalha sem ser visto. Qual seria o nome? Como seria a comemoração?' },
  { title: 'Tempestade no parque!', text: 'Uma tempestade derrubou galhos e entupiu os bueiros. Que trabalhadores precisam ajudar? O que cada um faz?' },
  { title: 'Inventores de Lumiara', text: 'Inventem uma máquina ou ferramenta que deixaria o trabalho de alguém menos cansativo. Como ela funcionaria?' },
  { title: 'O som da cidade', text: 'Que barulhos a cidade faz de manhã cedo, enquanto muita gente ainda dorme? Imitem juntos!' },
  { title: 'Bilhete de uma frase', text: 'Pensem num bilhete de obrigado, de uma frase só, para alguém que trabalha na sua escola. Para quem seria?' },
  { title: 'Troca-troca', text: 'Se você trabalhasse um dia no lugar de alguém que conheceu hoje, qual seria a parte mais difícil?' },
  { title: 'Desfile de uniformes', text: 'Descrevam (ou desenhem no ar) o uniforme de um trabalhador que vocês viram hoje na vida real.' },
  { title: 'Cidade sem…', text: 'Escolham um trabalho. Como seria um dia em Lumiara se ninguém fizesse esse trabalho?' }
];

/* ---------------- MEDALHAS ---------------- */
const MEDALS = {
  colaboracao: { name: 'Colaboração', need: 3, prop: 'coracao', desc: 'Resolver desafios conversando e dividindo pistas.' },
  curiosidade: { name: 'Curiosidade', need: 5, prop: 'oculos', desc: 'Explorar além do necessário e descobrir curiosidades.' },
  criatividade: { name: 'Criatividade', need: 2, prop: 'estrela', desc: 'Inventar soluções nas cartas surpresa.' },
  gentileza: { name: 'Gentileza', need: 5, prop: 'carta', desc: 'Fazer escolhas gentis e aceitar desafios da vida real.' }
};

/* ---------------- FINAL ---------------- */
const FINALE = {
  intro: [
    { who: 'faisca', text: 'Lumiara acendeu! Mas olha quem voltou...' },
    { who: 'nevoa', text: 'MUAHAHA! Vou apagar tudo de novo!' },
    { who: 'faisca', text: 'Heróis, juntos!' }],
  after: [
    { who: 'nevoa', text: 'Ai... Eu não sou má. Nasci dos "obrigados" esquecidos.' },
    { who: 'faisca', text: 'Então vamos encher o céu de obrigados!' }],
  without: { /* o que aconteceria sem cada trabalhador */
    cida: 'A casa ficaria sem comida pronta e sem roupa limpa.', jorge: 'Ninguém saberia quem entra no prédio, e as encomendas se perderiam.',
    ze: 'Muitas crianças estudariam com fome.', katia: 'A escola ficaria suja, e muita gente poderia ficar doente.',
    lucia: 'Vacinas atrasariam e a dengue se espalharia pelo bairro.', benedito: 'Dona Olímpia não poderia continuar morando na casa dela.',
    zefa: 'Não haveria tomate, alface nem mandioca na feira.', rafa: 'Quem não pode sair de casa ficaria sem comida e remédio.',
    marina: 'Toneladas de material reciclável iriam parar no lixão.', joaquim: 'O parque viraria um matagal sem sombra.',
    denise: 'As ruas ficariam sujas e alagariam na primeira chuva.', pedro: 'As ruas ficariam escuras e perigosas à noite.',
    tania: 'A água da torneira chegaria suja e muita gente ficaria doente.', joana: 'Ninguém apagaria incêndios nem salvaria quem está em perigo.',
    carlos: 'A saída da escola viraria uma confusão perigosa.' },
  thanks: ['Obrigado por cuidar da gente!', 'Seu trabalho é muito importante.', 'Eu reparei em você!', 'Obrigada por deixar tudo funcionando!', 'Sem você, a cidade parava.', 'Você faz a diferença todos os dias.'],
  outro: [
    { who: 'nevoa', text: 'Que quentinho... Obrigada!' },
    { who: 'nevoa', text: 'Agora sou a Nuvem das Lembranças!' },
    { who: 'faisca', text: 'Falta só uma carta no álbum...' }],
  mirror: 'Tem gente que trabalha cuidando de nós sem receber salário: cozinha, lava, leva à escola, cuida quando estamos doentes. Quem faz isso na sua casa?'
};


/* ---------------- DESAFIOS EXTRAS (um por região, opcionais, valem estrelas) ---------------- */
const BONUS = {
  casas: { t: 'memory', title: 'Memória do bairro', prompt: 'Memória: cada pessoa com seu objeto!',
    pairs: [['cida', 'roupa'], ['jorge', 'chaves'], ['ze', 'panelao'], ['katia', 'vassoura'], ['lucia', 'vacina'], ['benedito', 'bengala'], ['zefa', 'cesta'], ['rafa', 'bike']] },
  vila: { t: 'logic', title: 'Quem chega primeiro?', prompt: 'Que horas cada um chega? Marque ✓ ou ✗.',
    people: ['Kátia', 'Seu Zé', 'Professora Rita'], options: ['6h', '6h30', '7h30'], answer: [0, 1, 2],
    clues: ['A professora Rita não chega às 6h.', 'Seu Zé chega depois da Kátia.', 'Quem chega às 7h30 dá a primeira aula do dia.'] },
  saude: { t: 'memory', title: 'Memória da cidade', prompt: 'Memória: cada pessoa com seu objeto!',
    pairs: [['lucia', 'vacina'], ['benedito', 'remedios'], ['marina', 'papelao'], ['joaquim', 'tesoura'], ['denise', 'lixeira'], ['pedro', 'lampada'], ['zefa', 'tomate'], ['rafa', 'mochila']] },
  mercado: { t: 'logic', title: 'Cada um no seu caminho', prompt: 'Descubra qual veículo cada pessoa usa no trabalho.',
    people: ['Rafa', 'Dona Zefa', 'Marina', 'Pedro'], options: ['Bicicleta', 'Caminhonete', 'Carrinho de recicláveis', 'Caminhão com cesto'], answer: [0, 1, 2, 3],
    clues: ['Quem planta usa a caminhonete para levar a colheita até a feira.', 'Rafa não usa nada com motor.', 'Pedro precisa alcançar o alto dos postes.', 'Marina não pedala nas entregas.'] },
  parque: { t: 'memory', title: 'Memória do parque', prompt: 'Memória: junte coisas do mesmo material!',
    pairs: [['jornal', 'papelao'], ['pet', 'iogurte'], ['lata', 'chaves'], ['vidro', 'garrafa'], ['banana', 'folhas'], ['guardanapo', 'espelho'], ['muda', 'regador'], ['tesoura', 'galho']],
    labels: { jornal: 'Papel', papelao: 'Papel', pet: 'Plástico', iogurte: 'Plástico', lata: 'Metal', chaves: 'Metal', vidro: 'Vidro', garrafa: 'Vidro', banana: 'Orgânico', folhas: 'Orgânico', guardanapo: 'Não reciclável', espelho: 'Não reciclável', muda: 'Jardim', regador: 'Jardim', tesoura: 'Poda', galho: 'Poda' } },
  caminhos: { t: 'logic', title: 'Os turnos da cidade', prompt: 'Descubra onde e quando cada pessoa trabalha.',
    people: ['Denise', 'Pedro', 'Seu Jorge', 'Lúcia'], options: ['Na rua, de madrugada', 'Na rua, à noite', 'Na portaria do prédio', 'De casa em casa, de dia'], answer: [0, 1, 2, 3],
    clues: ['Pedro conserta os postes quando já está escuro.', 'Denise começa antes de o sol nascer.', 'Seu Jorge não trabalha na rua.', 'Quem visita as famílias não trabalha de noite nem na portaria.'] }
};

/* ---------------- "E SE NINGUÉM FIZESSE?" — a passagem dos dias ----------------
   A criança faz uma previsão, passa os dias e vê as consequências crescerem.
   Depois quem trabalha volta e a cena se recupera.                                     */
const DAYS = {
  cida: { scene: 'sala', unit: 'Dia', title: 'Uma semana sem ninguém cuidar da casa', meter: 'Bagunça', tint: '#5a3d1a',
    predict: { q: 'Se ninguém cuidar da casa por uma semana, o que você acha que acontece?', options: ['Nada muda, a casa se arruma sozinha', 'Fica bagunçada e falta comida e roupa limpa', 'A casa fica mais bonita'], answer: 1 },
    stages: [
      { n: 1, text: 'A louça do jantar ficou na pia e a roupa suja ficou no chão.', add: [['louca', 118, 24], ['roupasuja', 30, 68]] },
      { n: 3, text: 'Acabou a roupa limpa para ir à escola. Ninguém cozinhou: só tem biscoito.', add: [['louca', 136, 24], ['roupasuja', 98, 70], ['brinquedos', 74, 68], ['mosca', 128, 8]] },
      { n: 7, text: 'A planta secou, apareceram formigas na cozinha e ninguém acha mais nada!', add: [['murcha', 22, 46], ['roupasuja', 56, 38], ['mosca', 40, 20], ['vazia', 140, 66]] }],
    back: 'Dona Cida voltou. E a família entendeu: cuidar da casa é trabalho de verdade, e todo mundo pode ajudar um pouco.' },
  jorge: { scene: 'portaria', unit: 'Dia', title: 'Uma semana sem porteiro', meter: 'Confusão', tint: '#2b2233',
    predict: { q: 'E se o prédio ficasse uma semana sem porteiro?', options: ['Ninguém ia perceber', 'As encomendas se perdem e ninguém sabe quem entra', 'O prédio fica mais seguro'], answer: 1 },
    stages: [
      { n: 1, text: 'As encomendas ficaram empilhadas na entrada, sem ninguém para avisar os moradores.', add: [['caixa', 58, 66], ['caixa', 74, 68]] },
      { n: 3, text: 'Um pacote sumiu. Ninguém sabe quem entrou e quem saiu do prédio.', add: [['caixa', 66, 54], ['racao', 92, 66], ['papel', 30, 70]] },
      { n: 7, text: 'Visitas esperando no portão, moradores sem chave e ninguém para chamar ajuda quando alguém precisou.', add: [['chaves', 12, 70], ['caixa', 120, 66], ['fraldas', 136, 68], ['papel', 104, 72]] }],
    back: 'Seu Jorge voltou para a portaria, e o prédio voltou a ser um lugar seguro e organizado.' },
  ze: { scene: 'cozinha', unit: 'Dia', title: 'Uma semana sem merenda na escola', meter: 'Fome', tint: '#3a2f2a',
    predict: { q: 'O que acontece se a escola ficar uma semana sem merenda?', options: ['Tudo fica igual', 'As crianças ficam com fome e é difícil prestar atenção', 'As aulas ficam mais divertidas'], answer: 1 },
    stages: [
      { n: 1, text: 'O fogão ficou desligado. No intervalo, os pratos ficaram vazios.', add: [['prato', 40, 34], ['prato', 60, 34]] },
      { n: 3, text: 'Os legumes estragaram na caixa. Com a barriga roncando, ficou difícil prestar atenção na aula.', add: [['legumes', 80, 34], ['mosca', 86, 18], ['vazia', 20, 68]] },
      { n: 7, text: 'Muita gente sem energia para estudar e brincar. Para várias crianças, a merenda é a refeição mais importante do dia.', add: [['vazia', 60, 70], ['vazia', 100, 70], ['mosca', 110, 10]] }],
    back: 'Seu Zé acendeu o fogão de novo. O cheirinho de comida voltou, e com ele a energia para aprender!' },
  katia: { scene: 'salaaula', unit: 'Dia', title: 'Uma semana sem limpeza na escola', meter: 'Sujeira', tint: '#5a3d1a',
    predict: { q: 'E se ninguém limpasse a sala por uma semana?', options: ['Ela continua limpinha', 'Fica suja, com cheiro ruim e poeira', 'Fica só um pouco diferente'], answer: 1 },
    stages: [
      { n: 1, text: 'Papéis e restos de lanche ficaram espalhados pelo chão.', add: [['papel', 30, 70], ['banana', 80, 72]] },
      { n: 3, text: 'O lixo transbordou e começou um cheiro ruim. As carteiras ficaram grudentas.', add: [['lixeiracheia', 140, 62], ['chiclete', 74, 56], ['papel', 110, 74], ['mosca', 120, 30]] },
      { n: 7, text: 'Muita poeira, gente espirrando e banheiro sem condições de usar. Ninguém quer ficar na escola!', add: [['papel', 50, 76], ['garrafa', 96, 70], ['mosca', 50, 20], ['casaco', 12, 72]] }],
    back: 'A Kátia voltou com a vassoura e o balde, e a escola voltou a ser um lugar gostoso de estar.' },
  lucia: { scene: 'ruacasas', unit: 'Semana', title: 'Um mês sem visitas de saúde no bairro', meter: 'Risco à saúde', tint: '#2b2233',
    predict: { q: 'E se ninguém visitasse as famílias para cuidar da saúde por um mês?', options: ['Nada acontece', 'Problemas de saúde crescem sem ninguém perceber', 'Todo mundo fica mais saudável'], answer: 1 },
    stages: [
      { n: 1, text: 'A água parada no quintal ficou lá, e ninguém avisou a família.', add: [['pneuagua', 20, 46]] },
      { n: 2, text: 'Os mosquitos se espalharam pela rua. A vacina do Davi continua atrasada.', add: [['mosquito', 30, 30], ['mosquito', 70, 20], ['vacina', 60, 46], ['pneuagua', 110, 46]] },
      { n: 4, text: 'Várias pessoas ficaram doentes ao mesmo tempo, e o Seu Osvaldo ficou sem acompanhamento.', add: [['mosquito', 100, 14], ['mosquito', 140, 30], ['mosquito', 50, 10], ['idoso', 130, 44]] }],
    back: 'A Lúcia voltou a visitar as casas: água parada eliminada, vacinas em dia e o Seu Osvaldo acompanhado.' },
  benedito: { scene: 'quarto', unit: 'Dia', title: 'Uma semana sem o cuidador', meter: 'Dificuldades', tint: '#2b2233',
    predict: { q: 'Como fica a Dona Olímpia se ninguém a ajudar por uma semana?', options: ['Igualzinha', 'Ela tem dificuldades e se sente sozinha', 'Ela fica mais animada'], answer: 1 },
    stages: [
      { n: 1, text: 'Dona Olímpia não achou os óculos e não conseguiu ler o jornal.', add: [['oculos', 70, 72]] },
      { n: 3, text: 'Ela se confundiu com os horários do remédio e ficou com medo de andar sozinha pela casa.', add: [['remedios', 110, 66], ['bengala', 130, 70]] },
      { n: 7, text: 'Sem conversa e sem passeio, ela passou os dias sozinha e triste.', add: [['xicara', 106, 36], ['album', 20, 70]] }],
    back: 'O Benedito voltou, e a família combinou de ajudar também. Quem cuida também precisa de folga!' },
  zefa: { scene: 'feira', unit: 'Semana', title: 'Um mês sem quem planta', meter: 'Falta de comida', tint: '#3a2f2a',
    predict: { q: 'E se os agricultores parassem de plantar por um mês?', options: ['O mercado continua cheio', 'Começa a faltar comida e tudo fica mais caro', 'A comida aparece sozinha'], answer: 1 },
    stages: [
      { n: 1, text: 'Ainda tinha um pouco de tomate, mas menos que o normal.', add: [['vazia', 8, 37]] },
      { n: 2, text: 'As barracas de verdura ficaram vazias. O preço do que sobrou subiu muito.', add: [['vazia', 26, 37], ['vazia', 62, 37], ['vazia', 82, 37]] },
      { n: 4, text: 'A merenda da escola ficou sem salada e muitas famílias não conseguiram comprar comida fresca.', add: [['vazia', 116, 37], ['vazia', 136, 37], ['papel', 60, 70]] }],
    back: 'Dona Zefa e outros agricultores voltaram a plantar, e a feira se encheu de cores de novo!' },
  rafa: { scene: 'ruacasas', unit: 'Dia', title: 'Uma semana sem entregas', meter: 'Pedidos parados', tint: '#2b2233',
    predict: { q: 'E se ninguém fizesse entregas por uma semana?', options: ['Ninguém sente falta', 'Quem não pode sair de casa fica sem remédio e comida', 'Fica tudo mais rápido'], answer: 1 },
    stages: [
      { n: 1, text: 'O remédio do Seu Osvaldo não chegou.', add: [['farmacia', 20, 44]] },
      { n: 3, text: 'Quem não pode sair de casa ficou sem compras. Os pedidos se acumularam no restaurante.', add: [['sacola', 60, 46], ['caixa', 100, 46], ['pizza', 120, 46]] },
      { n: 7, text: 'Restaurantes pequenos quase fecharam, porque não tinha quem levasse os pedidos.', add: [['caixa', 80, 46], ['caixa', 140, 46], ['sacola', 40, 46]] }],
    back: 'O Rafa voltou a pedalar, e as entregas chegaram a quem precisava.' },
  marina: { scene: 'cooperativa', unit: 'Dia', title: 'Uma semana sem catadores', meter: 'Lixo no lixão', tint: '#3a2f2a',
    predict: { q: 'E se ninguém separasse os recicláveis por uma semana?', options: ['Eles se separam sozinhos', 'Vai tudo misturado para o lixão e para os rios', 'Não faz diferença nenhuma'], answer: 1 },
    stages: [
      { n: 1, text: 'Os recicláveis chegaram e ficaram parados, sem ninguém para separar.', add: [['pet', 30, 66], ['lata', 50, 68]] },
      { n: 3, text: 'Tudo foi misturado com resto de comida e mandado para o lixão.', add: [['saco', 70, 64], ['papelao', 90, 68], ['banana', 110, 70], ['mosca', 96, 50]] },
      { n: 7, text: 'O lixão encheu mais rápido, e muitas garrafas foram parar no rio. As fábricas usaram material novo em vez de reciclado.', add: [['saco', 10, 62], ['pet', 130, 68], ['lata', 146, 70], ['garrafa', 60, 74]] }],
    back: 'Marina e a cooperativa voltaram ao trabalho: o material foi separado e virou coisa nova!' },
  joaquim: { scene: 'parque', unit: 'Dia', title: 'Uma semana sem jardineiro', meter: 'Mato', tint: '#1f3a1f',
    predict: { q: 'E se ninguém cuidasse do parque por uma semana?', options: ['Fica tudo igual', 'O mato cresce, as flores morrem e ninguém consegue usar', 'O parque fica mais organizado'], answer: 1 },
    stages: [
      { n: 1, text: 'A grama cresceu um pouquinho e as folhas começaram a cair no caminho.', add: [['folhas', 44, 72], ['mato', 10, 72]] },
      { n: 3, text: 'As flores murcharam sem água e as folhas cobriram a trilha.', add: [['murcha', 40, 54], ['folhas', 70, 70], ['mato', 26, 74]] },
      { n: 7, text: 'O mato ficou tão alto que fecharam o parque. Um galho seco caiu bem perto do banco!', add: [['galho', 100, 46], ['mato', 60, 60], ['mato', 0, 56], ['obra', 130, 40]] }],
    back: 'Seu Joaquim voltou com a tesoura e o regador, e o parque reabriu, verdinho de novo.' },
  denise: { scene: 'rua', unit: 'Dia', title: 'Uma semana sem gari', meter: 'Sujeira', tint: '#5a3d1a',
    predict: { q: 'O que você acha que acontece com a rua se ninguém varrer por uma semana?', options: ['Nada muda', 'Fica um pouco suja', 'Fica muito suja e pode até alagar'], answer: 2 },
    stages: [
      { n: 1, text: 'Alguns papéis e garrafas ficaram na calçada.', add: [['papel', 20, 52], ['garrafa', 60, 54]] },
      { n: 3, text: 'As lixeiras transbordaram. Começou um cheiro ruim e apareceram moscas.', add: [['lixeiracheia', 98, 44], ['saco', 46, 46], ['saco', 120, 46], ['mosca', 100, 30]] },
      { n: 7, text: 'O lixo entupiu os bueiros. Choveu, a rua alagou e apareceram ratos!', add: [['bueiro', 64, 62], ['poca', 30, 70], ['poca', 100, 72], ['rato', 140, 54]] }],
    back: 'A Denise e a equipe dela voltaram: rua limpa, bueiro livre e nada de enchente.' },
  pedro: { scene: 'ruanoite', unit: 'Dia', title: 'Uma semana sem conserto nos postes', meter: 'Escuridão', tint: '#05060f',
    predict: { q: 'E se ninguém consertasse os postes por uma semana?', options: ['A rua continua clara', 'A rua fica escura e perigosa à noite', 'Os postes se consertam sozinhos'], answer: 1 },
    stages: [
      { n: 1, text: 'Uma lâmpada queimou e ninguém trocou.', add: [['lampadaqueimada', 32, 30]] },
      { n: 3, text: 'A rua toda ficou escura. As pessoas tropeçam e têm medo de voltar para casa.', add: [['lampadaqueimada', 112, 30], ['papel', 60, 70]] },
      { n: 7, text: 'Os carros quase não enxergam quem atravessa a rua. Ficou perigoso para todo mundo.', add: [['cone', 80, 66], ['poca', 120, 72]] }],
    back: 'O Pedro e a equipe dele trocaram as lâmpadas: a rua acendeu e todo mundo voltou a caminhar tranquilo.' }
};
for (const mid in DAYS) {
  const st = MISSIONS[mid].steps, i = st.findIndex(s => s.t === 'reveal');
  st.splice(i + 1, 0, { t: 'days', char: MISSIONS[mid].char, ...DAYS[mid] });
}

/* ---------------- INTERLÚDIOS DA NÉVOA (entre regiões) ---------------- */
const INTERLUDES = [
  [{ who: 'nevoa', text: 'Hmm? Uma luz acendeu lá embaixo... Por que vocês se importam tanto com essas pessoas?' }, { who: 'faisca', text: 'Sem elas, nada funciona! E olha: minha luz ficou mais forte!' }],
  [{ who: 'nevoa', text: 'Sabe... antigamente eu era só uma nuvenzinha do tamanho de uma pipoca.' }, { who: 'nevoa', text: 'Quando ninguém olha um trabalhador, eu cresço.' }, { who: 'faisca', text: 'Eu sei como é ser esquecida... Na cidade, quase ninguém repara numa vaga-lume.' }],
  [{ who: 'nevoa', text: 'Quando vocês sorriem para quem trabalha... eu sinto um calorzinho estranho. Parece que eu encolho.' }, { who: 'faisca', text: 'Ela está diminuindo! Se a gente continuar, quem sabe minha família volta pro parque?' }],
  [{ who: 'nevoa', text: 'Vocês estão me deixando pequena... e eu não sei se isso é ruim.' }, { who: 'nevoa', text: 'Ninguém nunca me agradeceu...' }, { who: 'faisca', text: 'Obrigada por enxergar quem ninguém vê. Inclusive eu.' }],
  [{ who: 'nevoa', text: 'Eu vi vocês ajudando, conversando, agradecendo... Eu queria saber fazer isso também.' }, { who: 'faisca', text: 'Ainda dá tempo, Névoa!' }],
  [{ who: 'nevoa', text: 'Me encontrem na praça. Quero ver as luzes!' }]
];
