// Text of the static pages, in English and Brazilian Portuguese.
// Country and capital names are never written here: they come from the game's own data at build time,
// so a page can never disagree with the game. Notes refer to countries by their ISO code.

export const UI = {
  en: {
    play: 'Play now',
    playCapitals: 'Play the capitals of',
    nav: { howTo: 'How to play', about: 'About', privacy: 'Privacy', terms: 'Terms', contact: 'Contact' },
    playCountries: 'Find the countries of',
    countries: 'Countries and capitals',
    country: 'Country',
    capital: 'Capital',
    tricky: 'Capitals people often get wrong',
    continents: 'Continents',
    otherLanguage: 'Português',
    manageConsent: 'Review your ad consent choices',
    updated: 'Last updated',
    skip: 'Skip to content',
  },
  pt: {
    play: 'Jogar agora',
    playCapitals: 'Jogar as capitais',
    nav: { howTo: 'Como jogar', about: 'Sobre', privacy: 'Privacidade', terms: 'Termos', contact: 'Contato' },
    playCountries: 'Encontrar os países',
    countries: 'Países e capitais',
    country: 'País',
    capital: 'Capital',
    tricky: 'Capitais que muita gente erra',
    continents: 'Continentes',
    otherLanguage: 'English',
    manageConsent: 'Rever suas escolhas de consentimento de anúncios',
    updated: 'Última atualização',
    skip: 'Pular para o conteúdo',
  },
}

export const META = {
  en: {
    homeTitle: 'Polo · Find the country behind every capital.',
    homeDescription:
      'A minimalist geography game played on an interactive world map: a capital is drawn, you find its country.',
  },
  pt: {
    homeTitle: 'Polo · Encontre o país de cada capital.',
    homeDescription:
      'Um jogo de geografia minimalista num mapa-múndi interativo: sorteamos uma capital e você encontra o país dela.',
  },
}

// Continent names, with the preposition Portuguese needs in "as capitais da/do/de …".
export const CONTINENT_NAMES = {
  africa: { en: 'Africa', pt: 'África', ptOf: 'da África' },
  asia: { en: 'Asia', pt: 'Ásia', ptOf: 'da Ásia' },
  europe: { en: 'Europe', pt: 'Europa', ptOf: 'da Europa' },
  'north-america': { en: 'North America', pt: 'América do Norte', ptOf: 'da América do Norte' },
  'south-america': { en: 'South America', pt: 'América do Sul', ptOf: 'da América do Sul' },
  oceania: { en: 'Oceania', pt: 'Oceania', ptOf: 'da Oceania' },
}

export const CONTINENTS = {
  africa: {
    intro: {
      en: [
        'Africa has more countries than any other continent: 54 sovereign states, from Algeria, the largest, to the Seychelles, the smallest. That makes it the longest regional game in Polo and, for most players, the one with the most room to improve.',
        'Many African capitals are not the biggest city in their country. Several states moved their capital inland or to a planned city after independence, to start fresh or to sit closer to the geographic centre. Those moves are exactly where quizzes trip people up.',
      ],
      pt: [
        'A África é o continente com mais países: 54 Estados soberanos, da Argélia, o maior, às Seicheles, o menor. Por isso é a partida regional mais longa do Polo e, para a maioria dos jogadores, a que tem mais espaço para melhorar.',
        'Muitas capitais africanas não são a maior cidade do país. Vários Estados mudaram a capital para o interior ou para uma cidade planejada depois da independência, para recomeçar ou para ficar mais perto do centro do território. É justamente nessas mudanças que muita gente erra.',
      ],
    },
    tricky: [
      { code: 'NGA', en: 'Replaced Lagos as the capital in 1991.', pt: 'Substituiu Lagos como capital em 1991.' },
      { code: 'CIV', en: 'The official capital since 1983; Abidjan is still the economic centre.', pt: 'Capital oficial desde 1983; Abidjan continua sendo o centro econômico.' },
      { code: 'TZA', en: 'The official capital; Dar es Salaam is the largest city and main port.', pt: 'Capital oficial; Dar es Salaam é a maior cidade e o principal porto.' },
      { code: 'MAR', en: 'Not Casablanca, which is larger.', pt: 'Não é Casablanca, que é maior.' },
      { code: 'ZAF', en: 'South Africa has three capitals; Polo uses Pretoria, the seat of the executive. Cape Town hosts parliament and Bloemfontein the judiciary.', pt: 'A África do Sul tem três capitais; o Polo usa Pretória, sede do Executivo. A Cidade do Cabo abriga o Parlamento e Bloemfontein, o Judiciário.' },
      { code: 'BDI', en: 'Became the political capital in 2019, taking over from Bujumbura.', pt: 'Virou a capital política em 2019, no lugar de Bujumbura.' },
    ],
  },
  asia: {
    intro: {
      en: [
        'Asia is the largest and most populous continent. Polo counts 49 countries in it, from Russia\'s neighbours in Central Asia to the island states of Southeast Asia, plus Taiwan and Palestine, which many geography quizzes include.',
        'Asian capitals mix ancient cities with some of the newest planned capitals in the world. A few countries have moved their capital within living memory, and in several of them the most famous city is not the capital at all.',
      ],
      pt: [
        'A Ásia é o maior e o mais populoso dos continentes. O Polo conta 49 países nela, dos vizinhos da Rússia na Ásia Central aos países insulares do Sudeste Asiático, além de Taiwan e da Palestina, que muitos quizzes de geografia incluem.',
        'As capitais asiáticas misturam cidades milenares com algumas das capitais planejadas mais novas do mundo. Alguns países mudaram de capital há poucas décadas, e em vários deles a cidade mais famosa nem é a capital.',
      ],
    },
    tricky: [
      { code: 'TUR', en: 'The capital since 1923, not Istanbul.', pt: 'Capital desde 1923; não é Istambul.' },
      { code: 'KAZ', en: 'Took over from Almaty in 1997; it was called Nur-Sultan from 2019 to 2022.', pt: 'Substituiu Almaty em 1997; chamou-se Nur-Sultan de 2019 a 2022.' },
      { code: 'MMR', en: 'A planned capital that replaced Yangon in the mid-2000s.', pt: 'Capital planejada que substituiu Yangon em meados dos anos 2000.' },
      { code: 'PAK', en: 'Built in the 1960s to replace Karachi.', pt: 'Construída nos anos 1960 para substituir Karachi.' },
      { code: 'VNM', en: 'Not Ho Chi Minh City, the largest city.', pt: 'Não é a Cidade de Ho Chi Minh, a maior do país.' },
      { code: 'LKA', en: 'The legislative capital; Colombo, next to it, is the commercial capital.', pt: 'Capital legislativa; Colombo, vizinha, é a capital comercial.' },
    ],
  },
  europe: {
    intro: {
      en: [
        'Europe packs 45 countries into a small area, including four of the world\'s smallest states: Vatican City, Monaco, San Marino and Liechtenstein. Polo gives the tiniest ones a dot with a generous click area, so you can still hit them on a world map.',
        'Most European capitals are old, large and well known, which makes the exceptions memorable. The hard part of this game is usually not the capital but the map: the Balkans and the Baltic states are where most misses happen.',
      ],
      pt: [
        'A Europa concentra 45 países numa área pequena, incluindo quatro dos menores Estados do mundo: Vaticano, Mônaco, San Marino e Liechtenstein. O Polo dá aos menores um ponto com área de clique generosa, para que dê para acertá-los num mapa-múndi.',
        'A maioria das capitais europeias é antiga, grande e conhecida, e isso torna as exceções memoráveis. A parte difícil deste jogo costuma ser o mapa, não a capital: os Bálcãs e os países bálticos são onde mais se erra.',
      ],
    },
    tricky: [
      { code: 'CHE', en: 'Officially the "federal city": Switzerland has no capital in its constitution. Zurich is larger.', pt: 'Oficialmente a "cidade federal": a Suíça não define capital na Constituição. Zurique é maior.' },
      { code: 'NLD', en: 'The constitutional capital, although the government sits in The Hague.', pt: 'É a capital pela Constituição, embora o governo fique em Haia.' },
      { code: 'MLT', en: 'One of the smallest capitals in the European Union.', pt: 'Uma das menores capitais da União Europeia.' },
      { code: 'LIE', en: 'Liechtenstein is doubly landlocked, between Switzerland and Austria.', pt: 'Liechtenstein não tem saída para o mar, e nenhum dos vizinhos (Suíça e Áustria) tem.' },
      { code: 'VAT', en: 'A city-state and the smallest country in the world.', pt: 'Uma cidade-Estado e o menor país do mundo.' },
    ],
  },
  'north-america': {
    intro: {
      en: [
        'North America, as Polo counts it, has 23 countries: Canada, the United States and Mexico, the seven countries of Central America, and thirteen island states in the Caribbean.',
        'The Caribbean is the challenge here. Several island nations are only a few kilometres across, and Polo marks them with a dot so they stay clickable. Greenland belongs to Denmark, so clicking it answers Denmark, not a North American country.',
      ],
      pt: [
        'A América do Norte, como o Polo a conta, tem 23 países: Canadá, Estados Unidos e México, os sete países da América Central e treze países insulares do Caribe.',
        'O desafio aqui é o Caribe. Várias nações insulares têm poucos quilômetros de extensão, e o Polo as marca com um ponto para que continuem clicáveis. A Groenlândia pertence à Dinamarca, então clicar nela responde Dinamarca, e não um país da América do Norte.',
      ],
    },
    tricky: [
      { code: 'CAN', en: 'Not Toronto or Montreal, the two largest cities.', pt: 'Não é Toronto nem Montreal, as duas maiores cidades.' },
      { code: 'USA', en: 'Not New York.', pt: 'Não é Nova York.' },
      { code: 'BLZ', en: 'A planned inland capital, built after a 1961 hurricane devastated Belize City.', pt: 'Capital planejada no interior, construída depois que um furacão devastou a Cidade de Belize em 1961.' },
      { code: 'HND', en: 'One of the few Central American capitals far from the coast.', pt: 'Uma das poucas capitais da América Central longe do litoral.' },
    ],
  },
  'south-america': {
    intro: {
      en: [
        'South America has 12 countries, which makes it the quickest regional game in Polo and a good place to aim for your first perfect run.',
        'French Guiana, on the north-east coast, is not a country: it is part of France, so clicking it answers France. Guyana and Suriname, its neighbours, are the only South American countries where the official language is English and Dutch respectively.',
      ],
      pt: [
        'A América do Sul tem 12 países, o que a torna a partida regional mais rápida do Polo e um bom lugar para buscar seu primeiro gabarito.',
        'A Guiana Francesa, no litoral nordeste, não é um país: faz parte da França, então clicar nela responde França. Os vizinhos Guiana e Suriname são os únicos países sul-americanos cuja língua oficial é, respectivamente, o inglês e o holandês.',
      ],
    },
    tricky: [
      { code: 'BRA', en: 'Inaugurated in 1960 to replace Rio de Janeiro.', pt: 'Inaugurada em 1960 para substituir o Rio de Janeiro.' },
      { code: 'BOL', en: 'The constitutional capital; the government sits in La Paz. Polo uses Sucre.', pt: 'Capital constitucional; o governo fica em La Paz. O Polo usa Sucre.' },
      { code: 'ECU', en: 'At about 2,850 m, one of the highest capitals in the world. Not Guayaquil.', pt: 'A cerca de 2.850 m, uma das capitais mais altas do mundo. Não é Guayaquil.' },
    ],
  },
  oceania: {
    intro: {
      en: [
        'Oceania has 14 countries: Australia, New Zealand, Papua New Guinea and eleven island nations spread across the Pacific. Most of them are tiny on a world map, which is why this short game is harder than it looks.',
        'Several Pacific capitals are small towns, and a few are not formally capitals at all. Zooming in on the map before a game is the fastest way to learn where Micronesia, Polynesia and Melanesia sit.',
      ],
      pt: [
        'A Oceania tem 14 países: Austrália, Nova Zelândia, Papua-Nova Guiné e onze nações insulares espalhadas pelo Pacífico. A maioria é minúscula num mapa-múndi, e é por isso que esta partida curta é mais difícil do que parece.',
        'Várias capitais do Pacífico são cidades pequenas, e algumas nem são capitais formalmente. Aproximar o mapa antes de jogar é o jeito mais rápido de aprender onde ficam a Micronésia, a Polinésia e a Melanésia.',
      ],
    },
    tricky: [
      { code: 'AUS', en: 'A planned capital, chosen as a compromise between Sydney and Melbourne.', pt: 'Capital planejada, escolhida como meio-termo entre Sydney e Melbourne.' },
      { code: 'NZL', en: 'Often cited as the southernmost capital of a sovereign state. Not Auckland.', pt: 'Costuma ser citada como a capital mais ao sul de um país soberano. Não é Auckland.' },
      { code: 'PLW', en: 'The capital since 2006, replacing Koror.', pt: 'Capital desde 2006, no lugar de Koror.' },
      { code: 'NRU', en: 'Nauru has no official capital; Yaren is the seat of government.', pt: 'Nauru não tem capital oficial; Yaren é a sede do governo.' },
    ],
  },
}

// Plain pages. Each section is [heading, ...paragraphs]; a paragraph that is an array renders as a list.
export const PAGES = {
  howTo: {
    title: { en: 'How to play Polo', pt: 'Como jogar o Polo' },
    description: {
      en: 'The rules of Polo: the two games, the modes, the extra life, the review round, medals and the mastery map.',
      pt: 'As regras do Polo: os dois jogos, os modos, a vida extra, a revisão, as medalhas e o mapa de domínio.',
    },
    sections: {
      en: [
        ['The idea', 'Polo asks you where places are, not just what they are called. You answer by clicking a real, zoomable world map, the way you would use an online map.'],
        ['Two games', [
          'Capitals: we show a capital and you click its country.',
          'Countries: we show a country and you find it on the map. In this game the hover tooltip is off during a round, because the name is the question.',
        ]],
        ['Modes', [
          'Global, full: every one of the 197 countries. A long game.',
          'Global, quick: 20 countries drawn from the whole world. A few minutes.',
          'Regional: one continent, from South America (12 countries) to Africa (54).',
        ]],
        ['A round', 'A question appears at the top of the screen. Click the country it belongs to. A correct answer turns the country green. A wrong answer shows you the right country, pins its capital and tells you which country you clicked, so every miss teaches you something. Each question is asked once and a miss never ends the game.'],
        ['The extra life', 'Once per game, after a wrong click, Polo may offer an extra life: watch a short ad and try the same question again, before the answer is revealed. You can always say no; the answer is then shown as usual. The offer only appears when an ad is available, and the time it takes does not count against your clock.'],
        ['Medals', [
          'Gold medal: a perfect run without the extra life.',
          'Silver medal: a perfect run that used the extra life.',
          'Your best score and your fastest perfect time are kept for every game and mode. A gold medal always outranks a silver one.',
        ]],
        ['Review round', 'After a game, Polo offers to review what you missed. Each missed question comes back a few questions later until you get it right. The review never changes your records.'],
        ['Mastery map', 'A switch in the lobby colours every country by how well you know it, from "learning" to "mastered". A correct first answer moves a country up one level and a miss moves it down. A miss you then fix with the extra life still counts as a miss here, so the map stays an honest picture of what you know.'],
        ['Tips', [
          'Explore before you play: zoom in on a region and the capitals appear on the map.',
          'Start with a short continent and work up to the full world.',
          'Replay your weakest continent the next day: spaced practice beats one long session.',
        ]],
      ],
      pt: [
        ['A ideia', 'O Polo pergunta onde os lugares ficam, e não só como se chamam. Você responde clicando num mapa-múndi real, com zoom, como num mapa on-line.'],
        ['Dois jogos', [
          'Capitais: mostramos uma capital e você clica no país dela.',
          'Países: mostramos um país e você o encontra no mapa. Neste jogo o nome ao passar o mouse fica desligado durante a partida, porque o nome é a pergunta.',
        ]],
        ['Modos', [
          'Global, completa: todos os 197 países. Uma partida longa.',
          'Global, rápida: 20 países sorteados do mundo todo. Alguns minutos.',
          'Regional: um continente, da América do Sul (12 países) à África (54).',
        ]],
        ['Uma partida', 'Uma pergunta aparece no alto da tela. Clique no país correspondente. Se acertar, o país fica verde. Se errar, o Polo mostra o país certo, marca a capital e diz em qual país você clicou, para que cada erro ensine alguma coisa. Cada pergunta aparece uma vez e um erro nunca encerra a partida.'],
        ['A vida extra', 'Uma vez por partida, depois de um clique errado, o Polo pode oferecer uma vida extra: assista a um anúncio curto e tente a mesma pergunta de novo, antes de a resposta ser revelada. Você sempre pode recusar, e a resposta aparece como de costume. A oferta só aparece quando há um anúncio disponível, e o tempo dela não conta no seu cronômetro.'],
        ['Medalhas', [
          'Medalha de ouro: gabarito sem usar a vida extra.',
          'Medalha de prata: gabarito usando a vida extra.',
          'Sua melhor pontuação e seu gabarito mais rápido ficam guardados para cada jogo e modo. A medalha de ouro sempre vale mais que a de prata.',
        ]],
        ['Revisão', 'Depois de uma partida, o Polo oferece revisar o que você errou. Cada pergunta errada volta algumas perguntas depois, até você acertar. A revisão nunca altera seus recordes.'],
        ['Mapa de domínio', 'Um botão no lobby colore cada país conforme você o conhece, de "aprendendo" a "dominado". Acertar de primeira sobe o país um nível e errar o desce. Um erro corrigido com a vida extra continua contando como erro aqui, para que o mapa mostre com honestidade o que você sabe.'],
        ['Dicas', [
          'Explore antes de jogar: aproxime uma região e as capitais aparecem no mapa.',
          'Comece por um continente curto e vá até o mundo inteiro.',
          'Jogue de novo o seu continente mais fraco no dia seguinte: praticar em intervalos rende mais que uma sessão longa.',
        ]],
      ],
    },
  },
  about: {
    title: { en: 'About Polo', pt: 'Sobre o Polo' },
    description: {
      en: 'Why Polo exists, how it is designed around how people learn, and where its map data comes from.',
      pt: 'Por que o Polo existe, como ele foi pensado a partir de como as pessoas aprendem e de onde vêm os dados do mapa.',
    },
    sections: {
      en: [
        ['Why Polo', 'Most capital quizzes are multiple choice or a text box. They test whether you can recall a word, not whether you know where a place is. You can score well and still be unable to point at Burkina Faso. Polo asks the spatial question instead.'],
        ['Designed around how people learn', [
          'Retrieval beats re-reading: being asked to produce an answer strengthens memory more than seeing it again, and the effect holds for positions on a map (Rohrer et al., 2010). That is why the core of Polo is a question.',
          'Feedback has to contain the answer. Polo shows the right country, pins its capital and names the country you clicked, which untangles the confusion in both directions.',
          'What you missed should come back. Repeatedly recalling an item, rather than dropping it, greatly improves long-term retention (Karpicke and Roediger, 2007). That is the review round.',
        ]],
        ['The name', '"Polo" is Portuguese for "pole", the fixed point a map is oriented by. The logo\'s globe is tilted 23.5°, the Earth\'s axial tilt.'],
        ['Which countries', 'Polo includes 197 countries: the 193 UN member states, the two observer states (Vatican City and Palestine), plus Kosovo and Taiwan, a common convention in geography quizzes. Dependencies count as their sovereign state, so clicking Greenland answers Denmark. Where a country has more than one capital, Polo uses one and says which on the continent pages.'],
        ['Data and credits', 'Map data from Natural Earth, in the public domain. Rendering by MapLibre GL JS. Typeface: Geist.'],
        ['How Polo is funded', 'Polo is free to play. It is supported by ads from Google, shown between games and, if you choose, in exchange for an extra life. Ads never appear over the map while you are answering.'],
      ],
      pt: [
        ['Por que o Polo', 'A maioria dos quizzes de capitais é de múltipla escolha ou de digitar a resposta. Eles testam se você lembra uma palavra, e não se sabe onde um lugar fica. Dá para ir bem e ainda não saber apontar Burkina Faso no mapa. O Polo faz a pergunta espacial.'],
        ['Pensado a partir de como as pessoas aprendem', [
          'Lembrar vale mais que reler: ser solicitado a produzir uma resposta fortalece a memória mais do que vê-la de novo, e o efeito vale para posições num mapa (Rohrer et al., 2010). Por isso o centro do Polo é uma pergunta.',
          'O retorno tem que trazer a resposta. O Polo mostra o país certo, marca a capital e diz em qual país você clicou, o que desfaz a confusão nos dois sentidos.',
          'O que você errou precisa voltar. Recuperar um item várias vezes, em vez de descartá-lo, melhora muito a retenção de longo prazo (Karpicke e Roediger, 2007). Essa é a revisão.',
        ]],
        ['O nome', '"Polo" é o ponto fixo pelo qual um mapa se orienta. O globo do logotipo está inclinado 23,5°, a inclinação do eixo da Terra.'],
        ['Quais países', 'O Polo inclui 197 países: os 193 membros da ONU, os dois Estados observadores (Vaticano e Palestina), além de Kosovo e Taiwan, uma convenção comum em quizzes de geografia. Territórios dependentes contam como o país soberano, então clicar na Groenlândia responde Dinamarca. Quando um país tem mais de uma capital, o Polo usa uma e diz qual nas páginas dos continentes.'],
        ['Dados e créditos', 'Dados do mapa: Natural Earth, em domínio público. Renderização: MapLibre GL JS. Fonte: Geist.'],
        ['Como o Polo se mantém', 'O Polo é gratuito. Ele é mantido por anúncios do Google, exibidos entre partidas e, se você quiser, em troca de uma vida extra. Os anúncios nunca aparecem sobre o mapa enquanto você responde.'],
      ],
    },
  },
  privacy: {
    title: { en: 'Privacy policy', pt: 'Política de privacidade' },
    description: {
      en: 'What Polo stores on your device, how Google uses cookies to show ads, and the choices you have.',
      pt: 'O que o Polo guarda no seu aparelho, como o Google usa cookies para exibir anúncios e quais são as suas escolhas.',
    },
    consent: true,
    sections: {
      en: [
        ['In short', 'Polo has no accounts and no server of its own that receives your data. Your progress is stored only in your browser. Ads are provided by Google, which uses cookies and similar technologies as described below.'],
        ['What Polo stores on your device', [
          'Personal bests and medals: a first-party cookie named polo_pb (about a few hundred bytes, one year, renewed on each visit), mirrored in localStorage.',
          'Mastery levels: one small number per country, in localStorage.',
          'Interface preferences, such as whether the lobby panel is folded, in localStorage; and a count of games played in the current tab, in sessionStorage, used to space out ads.',
          'None of this is sent to us. Clearing your browser\'s site data deletes it.',
        ]],
        ['Advertising', [
          'Polo uses Google AdSense to show ads. Google and its partners use cookies and identifiers to serve ads, to limit how often you see them, to measure them and, where you allow it, to personalise them based on your visits to this and other websites.',
          'Learn how Google uses information from sites that use its services: https://policies.google.com/technologies/partner-sites',
          'You can turn off personalised ads at https://adssettings.google.com. You can also opt out of third-party vendors\' use of cookies for personalised advertising at https://www.aboutads.info/choices.',
          'In the European Economic Area, the United Kingdom and Switzerland, and in other places where the law requires it, we ask for your consent before cookies are used for ads, through a consent message provided by Google. You can change your choice at any time with the button below.',
        ]],
        ['Rewarded ads', 'The extra life is optional. If you choose to watch an ad, Google handles the ad; Polo only learns whether it was watched to the end, so it can give you the extra life.'],
        ['Brazil (LGPD)', 'For users in Brazil, the processing carried out by Google for advertising relies on consent or on legitimate interest as allowed by the Lei Geral de Proteção de Dados (Law 13.709/2018). You may request information about the processing, and the correction or deletion of your data, through the contact below. Because Polo itself keeps no personal data on a server, most requests are answered by clearing your browser\'s site data and by using the Google tools above.'],
        ['Children', 'Polo is intended for a general audience and is not directed at children under 13.'],
        ['Changes', 'If this policy changes, the new version will be published on this page with a new date.'],
        ['Contact', 'Questions about privacy: {{contact}}.'],
      ],
      pt: [
        ['Em resumo', 'O Polo não tem contas nem servidor próprio que receba seus dados. Seu progresso fica salvo só no seu navegador. Os anúncios são fornecidos pelo Google, que usa cookies e tecnologias semelhantes como descrito abaixo.'],
        ['O que o Polo guarda no seu aparelho', [
          'Recordes e medalhas: um cookie próprio chamado polo_pb (algumas centenas de bytes, validade de um ano, renovada a cada visita), espelhado no localStorage.',
          'Níveis de domínio: um número pequeno por país, no localStorage.',
          'Preferências da interface, como o painel do lobby recolhido, no localStorage; e a contagem de partidas na aba atual, no sessionStorage, usada para espaçar os anúncios.',
          'Nada disso é enviado para nós. Limpar os dados do site no navegador apaga tudo.',
        ]],
        ['Publicidade', [
          'O Polo usa o Google AdSense para exibir anúncios. O Google e seus parceiros usam cookies e identificadores para veicular anúncios, limitar quantas vezes você os vê, medi-los e, quando você permite, personalizá-los com base nas suas visitas a este e a outros sites.',
          'Saiba como o Google usa informações de sites que usam os serviços dele: https://policies.google.com/technologies/partner-sites',
          'Você pode desativar os anúncios personalizados em https://adssettings.google.com. Também pode recusar o uso de cookies de terceiros para publicidade personalizada em https://www.aboutads.info/choices.',
          'No Espaço Econômico Europeu, no Reino Unido e na Suíça, e em outros lugares onde a lei exige, pedimos seu consentimento antes de usar cookies para anúncios, por meio de uma mensagem de consentimento fornecida pelo Google. Você pode mudar sua escolha a qualquer momento pelo botão abaixo.',
        ]],
        ['Anúncios com recompensa', 'A vida extra é opcional. Se você escolher assistir a um anúncio, quem cuida dele é o Google; o Polo só fica sabendo se ele foi assistido até o fim, para liberar a vida extra.'],
        ['Brasil (LGPD)', 'Para usuários no Brasil, o tratamento feito pelo Google para publicidade se baseia no consentimento ou no legítimo interesse, conforme permite a Lei Geral de Proteção de Dados (Lei 13.709/2018). Você pode pedir informações sobre o tratamento, e a correção ou exclusão dos seus dados, pelo contato abaixo. Como o próprio Polo não guarda dados pessoais em servidor, a maioria dos pedidos se resolve limpando os dados do site no navegador e usando as ferramentas do Google acima.'],
        ['Crianças', 'O Polo é destinado ao público geral e não é direcionado a menores de 13 anos.'],
        ['Mudanças', 'Se esta política mudar, a nova versão será publicada nesta página com uma nova data.'],
        ['Contato', 'Dúvidas sobre privacidade: {{contact}}.'],
      ],
    },
  },
  terms: {
    title: { en: 'Terms of use', pt: 'Termos de uso' },
    description: {
      en: 'The terms for playing Polo, a free browser geography game.',
      pt: 'Os termos para jogar o Polo, um jogo de geografia gratuito no navegador.',
    },
    sections: {
      en: [
        ['Using Polo', 'Polo is a free game you play in your browser. You may play it for personal, non-commercial use. Please do not try to disrupt the site or its ads, for example by automating clicks or views.'],
        ['Content and borders', 'Country borders, names and capitals follow Natural Earth\'s de facto view and a common quiz convention. They are a teaching aid, not a statement on any territorial dispute.'],
        ['Ads', 'Polo shows ads from Google. Ads and the products they promote are the responsibility of their advertisers. Watching an ad for an extra life is always optional.'],
        ['No warranty', 'Polo is provided "as is", without warranties of any kind. Your progress is stored only in your browser and can be lost if its site data is cleared.'],
        ['Changes', 'These terms may change; the current version is always on this page.'],
        ['Contact', '{{contact}}'],
      ],
      pt: [
        ['Uso do Polo', 'O Polo é um jogo gratuito que você joga no navegador, para uso pessoal e não comercial. Não tente atrapalhar o site ou os anúncios, por exemplo automatizando cliques ou visualizações.'],
        ['Conteúdo e fronteiras', 'Fronteiras, nomes e capitais seguem a visão de fato do Natural Earth e uma convenção comum em quizzes. São um recurso didático, não uma posição sobre disputas territoriais.'],
        ['Anúncios', 'O Polo exibe anúncios do Google. Os anúncios e os produtos anunciados são responsabilidade dos anunciantes. Assistir a um anúncio por uma vida extra é sempre opcional.'],
        ['Sem garantias', 'O Polo é oferecido "no estado em que se encontra", sem garantias de qualquer tipo. Seu progresso fica salvo só no navegador e pode se perder se os dados do site forem apagados.'],
        ['Mudanças', 'Estes termos podem mudar; a versão atual está sempre nesta página.'],
        ['Contato', '{{contact}}'],
      ],
    },
  },
  contact: {
    title: { en: 'Contact', pt: 'Contato' },
    description: {
      en: 'How to reach the people behind Polo with feedback, corrections or privacy requests.',
      pt: 'Como falar com quem faz o Polo para enviar sugestões, correções ou pedidos de privacidade.',
    },
    sections: {
      en: [
        ['Get in touch', 'Found a wrong capital, a border problem or a bug? Have an idea for the game? Write to {{contact}}. Privacy requests go to the same address.'],
        ['When you write about a bug', 'Tell us the browser and device you use, the game and mode you were playing, and what you expected to happen. A screenshot helps.'],
      ],
      pt: [
        ['Fale com a gente', 'Achou uma capital errada, um problema de fronteira ou um bug? Tem uma ideia para o jogo? Escreva para {{contact}}. Pedidos de privacidade vão para o mesmo endereço.'],
        ['Se for um bug', 'Conte qual navegador e aparelho você usa, qual jogo e modo estava jogando e o que esperava que acontecesse. Uma captura de tela ajuda.'],
      ],
    },
  },
}
