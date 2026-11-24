import type { ContinentId, Locale } from '../data/types'
import type { Clue, ModeId } from '../game/modes'
import type { MedalTier } from '../game/records'
import type { Verdict } from '../share/challenge'

// Everything that reads differently in the capital game and in the country game.
export interface ClueMessages {
  name: string
  note: string
  prompt: string
  correctAnswer: (country: string) => string
  wrongAnswer: (country: string) => string
  wrongDetail: (country: string, capital: string) => string
  count: (count: number) => string
  score: (correct: number, total: number) => string
  quickNote: string
  reviewOffer: (count: number) => string
  reviewed: string
}

export interface Messages {
  mapLabel: string
  mapLoading: string
  mapError: string
  lobbyHint: string
  lobbyCollapse: string
  lobbyExpand: string
  clueLabel: string
  clues: Record<Clue, ClueMessages>
  modeLabel: string
  modeGlobal: string
  modeRegional: string
  modeGlobalNote: string
  continentLabel: string
  continents: Record<ContinentId, string>
  play: string
  personalBest: string
  noRecord: string
  perfectIn: (time: string) => string
  perfectBadge: string
  progress: (current: number, total: number) => string
  statCorrect: string
  statWrong: string
  statTime: string
  endGame: string
  resultPerfect: string
  resultCompleted: string
  resultEnded: string
  newBest: string
  fastestPerfect: string
  playAgain: string
  backToLobby: string
  records: string
  recordsNote: string
  close: string
  zoomIn: string
  zoomOut: string
  showGlobe: string
  showFlat: string
  switchLanguage: string
  dataCredit: string
  modeFull: string
  modeQuick: string
  modeQuickName: string
  lengthLabel: string
  reviewTag: string
  reviewStart: string
  reviewDone: string
  reviewEnded: string
  missedTitle: string
  showOnMap: (country: string) => string
  masteryTitle: string
  masteryEmpty: string
  masteryLevels: readonly [string, string, string, string]
  masteryCount: (count: number, total: number) => string
  offerTitle: string
  offerBody: (picked: string) => string
  offerWatch: string
  offerDecline: string
  offerCountdown: (seconds: number) => string
  adPlaying: string
  extraLife: string
  extraLifeUsed: string
  resultPerfectAssisted: string
  fastestAssisted: string
  goldInvite: string
  medalGold: string
  medalSilver: string
  assistedIn: (time: string) => string
  share: string
  shareCopied: string
  shareFailed: string
  shareSave: string
  shareSaved: string
  medalGoldShort: string
  medalSilverShort: string
  // Mastery: the number of perfect runs without help, carried by the gold medal.
  mastery: (level: number) => string
  masteryRuns: (count: number) => string
  medalMeaning: (tier: MedalTier, total: number) => string
  medalDare: string
  medalShare: string
  medalOpen: (round: string) => string
  bestTime: string
  back: string
  shareDare: string
  shareVerdict: (verdict: Verdict) => string
  challengeTitle: string
  challengeBody: (round: string, correct: number, total: number, time: string) => string
  challengeAccept: string
  challengeDismiss: string
  challengeResult: (verdict: Verdict) => string
  challengeYou: string
  challengeFriend: string
  challengeAgain: string
  dailyTitle: string
  dailyRound: (day: number, clue: string) => string
  dailyNote: (clue: Clue) => string
  dailyDone: (correct: number, total: number) => string
  dailyStreak: (days: number) => string
  dailyNext: (time: string) => string
  dailyShare: string
  dailyDare: string
  // The link preview a chat app shows: the score up front, then the dare.
  previewTitle: (correct: number, total: number, round: string) => string
  dailyInviteTitle: string
  dailyInviteBody: (clue: Clue) => string
  dailyAccept: string
  pages: { howTo: string; about: string; privacy: string; terms: string; contact: string; label: string }
}

const en: Messages = {
  mapLabel: 'Interactive world map',
  mapLoading: 'Loading the world…',
  mapError: 'The map could not be loaded. Check that WebGL is enabled and reload the page.',
  lobbyHint: 'Zoom in on a country to reveal its capital.',
  lobbyCollapse: 'Hide the panel and explore the map',
  lobbyExpand: 'Show game options',
  clueLabel: 'Game',
  clues: {
    capital: {
      name: 'Capitals',
      note: 'We show a capital. You click its country.',
      prompt: 'Which country has this capital?',
      correctAnswer: (country) => `Correct: ${country}`,
      wrongAnswer: (country) => `It was ${country}`,
      wrongDetail: (country, capital) => `You clicked ${country} (capital: ${capital})`,
      count: (count) => `${count} capitals`,
      score: (correct, total) => `${correct} of ${total} capitals`,
      quickNote: '20 capitals drawn from the whole world.',
      reviewOffer: (count) =>
        count === 1
          ? 'Want to review the one you missed? It comes back until you get it right.'
          : `Want to review the ${count} you missed? Each one comes back until you get it right.`,
      reviewed: 'Reviewed',
    },
    country: {
      name: 'Countries',
      note: 'We show a country. You find it on the map.',
      prompt: 'Where is this country?',
      correctAnswer: () => 'Correct',
      wrongAnswer: () => 'Missed. See where it is on the map',
      wrongDetail: (country) => `You clicked ${country}`,
      count: (count) => `${count} countries`,
      score: (correct, total) => `${correct} of ${total} countries`,
      quickNote: '20 countries drawn from the whole world.',
      reviewOffer: (count) =>
        count === 1
          ? 'Want to review the one you missed? It comes back until you find it.'
          : `Want to review the ${count} you missed? Each one comes back until you find it.`,
      reviewed: 'Reviewed',
    },
  },
  modeLabel: 'Game mode',
  modeGlobal: 'Global',
  modeRegional: 'Regional',
  modeGlobalNote: 'Every country in the world. A long game.',
  continentLabel: 'Continent',
  continents: {
    africa: 'Africa',
    asia: 'Asia',
    europe: 'Europe',
    'north-america': 'North America',
    'south-america': 'South America',
    oceania: 'Oceania',
  },
  play: 'Play',
  personalBest: 'Personal best',
  noRecord: 'No record yet',
  perfectIn: (time) => `Perfect in ${time}`,
  perfectBadge: 'Perfect run',
  progress: (current, total) => `${current} of ${total}`,
  statCorrect: 'Correct',
  statWrong: 'Wrong',
  statTime: 'Time',
  endGame: 'End game',
  resultPerfect: 'Perfect run',
  resultCompleted: 'Round complete',
  resultEnded: 'Game ended',
  newBest: 'New personal best',
  fastestPerfect: 'Fastest perfect run',
  playAgain: 'Play again',
  backToLobby: 'Back to lobby',
  records: 'Records',
  recordsNote: 'Your records and mastery maps are saved only in this browser. Clearing its site data erases them.',
  close: 'Close',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  showGlobe: 'Switch to globe view',
  showFlat: 'Switch to flat map',
  switchLanguage: 'Mudar para português',
  dataCredit: 'Map data: Natural Earth',
  modeFull: 'Full',
  modeQuick: 'Quick',
  modeQuickName: 'Quick global',
  lengthLabel: 'Length',
  reviewTag: 'Review',
  reviewStart: 'Review misses',
  reviewDone: 'Review complete',
  reviewEnded: 'Review ended',
  missedTitle: 'Missed',
  showOnMap: (country) => `Show ${country} on the map`,
  masteryTitle: 'Mastery map',
  masteryEmpty: 'Play to colour the map with what you know.',
  masteryLevels: ['Learning', 'Familiar', 'Good', 'Mastered'],
  masteryCount: (count, total) => `${count} of ${total} mastered`,
  offerTitle: 'Missed. Keep your perfect run?',
  offerBody: (picked) => `You clicked ${picked}. Watch a short ad to try this question again. Once per game.`,
  offerWatch: 'Watch ad and retry',
  offerDecline: 'Show the answer',
  offerCountdown: (seconds) => `Answer in ${seconds}s`,
  adPlaying: 'Ad playing…',
  extraLife: 'Extra life available in this game',
  extraLifeUsed: 'Extra life used',
  resultPerfectAssisted: 'Perfect, with help',
  fastestAssisted: 'Fastest perfect run with help',
  goldInvite: 'Do it without the extra life to earn the gold medal.',
  medalGold: 'Gold medal: perfect without help',
  medalSilver: 'Silver medal: perfect with the extra life',
  assistedIn: (time) => `Perfect with help in ${time}`,
  share: 'Challenge a friend',
  shareCopied: 'Link copied. Paste it in any chat.',
  shareFailed: 'Could not share from this browser.',
  shareSave: 'Save image',
  shareSaved: 'Image saved.',
  medalGoldShort: 'Gold medal',
  medalSilverShort: 'Silver medal',
  mastery: (level) => `Mastery ${level}`,
  masteryRuns: (count) => (count === 1 ? '1 perfect run without help' : `${count} perfect runs without help`),
  medalMeaning: (tier, total) =>
    tier === 'gold'
      ? `All ${total} right: not a single miss and no extra life.`
      : `All ${total} right, with the help of the extra life.`,
  medalDare: 'Can you earn yours?',
  medalShare: 'Share medal',
  medalOpen: (round) => `See the medal for ${round}`,
  bestTime: 'Best time',
  back: 'Back',
  shareDare: 'Same questions. Can you beat me?',
  shareVerdict: (verdict) =>
    verdict === 'win'
      ? 'I beat the challenge. Can you beat me?'
      : verdict === 'tie'
        ? 'I tied the challenge. Can you break it?'
        : 'I lost the challenge. Can you do better?',
  challengeTitle: 'You have been challenged',
  challengeBody: (round, correct, total, time) =>
    `A friend scored ${correct}/${total} in ${time} on ${round}. You get the same questions in the same order.`,
  challengeAccept: 'Accept challenge',
  challengeDismiss: 'Not now',
  challengeResult: (verdict) =>
    verdict === 'win' ? 'You won the challenge' : verdict === 'tie' ? 'A perfect tie' : 'Your friend wins this one',
  challengeYou: 'You',
  challengeFriend: 'Friend',
  challengeAgain: 'Send it back',
  dailyTitle: 'Daily Polo',
  dailyRound: (day, clue) => `Daily Polo #${day} · ${clue}`,
  dailyNote: (clue) => `10 ${clue === 'capital' ? 'capitals' : 'countries'} from around the world. One try.`,
  dailyDone: (correct, total) => `Today: ${correct}/${total}`,
  dailyStreak: (days) => (days === 1 ? '1 day in a row' : `${days} days in a row`),
  dailyNext: (time) => `Next in ${time}`,
  dailyShare: 'Share result',
  dailyDare: "Take on today's challenge. Can you beat me?",
  previewTitle: (correct, total, round) => `${correct}/${total} · ${round}. Can you beat it?`,
  dailyInviteTitle: "Today's Polo is waiting",
  dailyInviteBody: (clue) =>
    `10 ${clue === 'capital' ? 'capitals' : 'countries'} from around the world, one try. Play and compare with whoever sent you this.`,
  dailyAccept: "Play today's Polo",
  pages: {
    howTo: 'How to play',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    label: 'About Polo',
  },
}

const pt: Messages = {
  mapLabel: 'Mapa-múndi interativo',
  mapLoading: 'Carregando o mundo…',
  mapError: 'Não foi possível carregar o mapa. Verifique se o WebGL está ativo e recarregue a página.',
  lobbyHint: 'Aproxime-se de um país para revelar a capital.',
  lobbyCollapse: 'Esconder o painel e explorar o mapa',
  lobbyExpand: 'Mostrar opções de jogo',
  clueLabel: 'Jogo',
  clues: {
    capital: {
      name: 'Capitais',
      note: 'Mostramos uma capital. Você clica no país dela.',
      prompt: 'De qual país é esta capital?',
      correctAnswer: (country) => `Correto: ${country}`,
      wrongAnswer: (country) => `Era ${country}`,
      wrongDetail: (country, capital) => `Você clicou em ${country} (capital: ${capital})`,
      count: (count) => `${count} capitais`,
      score: (correct, total) => `${correct} de ${total} capitais`,
      quickNote: '20 capitais sorteadas do mundo todo.',
      reviewOffer: (count) =>
        count === 1
          ? 'Quer revisar o erro agora? A capital volta até você acertar.'
          : `Quer revisar os ${count} erros agora? Cada capital volta até você acertar.`,
      reviewed: 'Revisadas',
    },
    country: {
      name: 'Países',
      note: 'Mostramos um país. Você o encontra no mapa.',
      prompt: 'Onde fica este país?',
      correctAnswer: () => 'Correto',
      wrongAnswer: () => 'Errou. Veja onde fica no mapa',
      wrongDetail: (country) => `Você clicou em ${country}`,
      count: (count) => `${count} países`,
      score: (correct, total) => `${correct} de ${total} países`,
      quickNote: '20 países sorteados do mundo todo.',
      reviewOffer: (count) =>
        count === 1
          ? 'Quer revisar o erro agora? O país volta até você acertar.'
          : `Quer revisar os ${count} erros agora? Cada país volta até você acertar.`,
      reviewed: 'Revisados',
    },
  },
  modeLabel: 'Modo de jogo',
  modeGlobal: 'Global',
  modeRegional: 'Regional',
  modeGlobalNote: 'Todos os países do mundo. Uma partida longa.',
  continentLabel: 'Continente',
  continents: {
    africa: 'África',
    asia: 'Ásia',
    europe: 'Europa',
    'north-america': 'América do Norte',
    'south-america': 'América do Sul',
    oceania: 'Oceania',
  },
  play: 'Jogar',
  personalBest: 'Recorde pessoal',
  noRecord: 'Sem recorde ainda',
  perfectIn: (time) => `Gabarito em ${time}`,
  perfectBadge: 'Gabarito',
  progress: (current, total) => `${current} de ${total}`,
  statCorrect: 'Acertos',
  statWrong: 'Erros',
  statTime: 'Tempo',
  endGame: 'Encerrar',
  resultPerfect: 'Gabarito!',
  resultCompleted: 'Partida concluída',
  resultEnded: 'Partida encerrada',
  newBest: 'Novo recorde pessoal',
  fastestPerfect: 'Gabarito mais rápido',
  playAgain: 'Jogar de novo',
  backToLobby: 'Voltar ao lobby',
  records: 'Recordes',
  recordsNote: 'Seus recordes e mapas de domínio ficam salvos só neste navegador. Limpar os dados do site apaga tudo.',
  close: 'Fechar',
  zoomIn: 'Aproximar',
  zoomOut: 'Afastar',
  showGlobe: 'Mudar para o globo',
  showFlat: 'Mudar para o mapa plano',
  switchLanguage: 'Switch to English',
  dataCredit: 'Dados do mapa: Natural Earth',
  modeFull: 'Completa',
  modeQuick: 'Rápida',
  modeQuickName: 'Global rápida',
  lengthLabel: 'Duração',
  reviewTag: 'Revisão',
  reviewStart: 'Revisar erros',
  reviewDone: 'Revisão concluída',
  reviewEnded: 'Revisão encerrada',
  missedTitle: 'Erros',
  showOnMap: (country) => `Mostrar ${country} no mapa`,
  masteryTitle: 'Mapa de domínio',
  masteryEmpty: 'Jogue para pintar o mapa com o que você sabe.',
  masteryLevels: ['Aprendendo', 'Familiar', 'Bom', 'Dominado'],
  masteryCount: (count, total) => `${count} de ${total} dominados`,
  offerTitle: 'Errou. Quer manter o gabarito?',
  offerBody: (picked) =>
    `Você clicou em ${picked}. Assista a um anúncio curto para tentar esta pergunta de novo. Uma vez por partida.`,
  offerWatch: 'Assistir e tentar de novo',
  offerDecline: 'Mostrar a resposta',
  offerCountdown: (seconds) => `Resposta em ${seconds}s`,
  adPlaying: 'Anúncio em exibição…',
  extraLife: 'Vida extra disponível nesta partida',
  extraLifeUsed: 'Vida extra usada',
  resultPerfectAssisted: 'Gabarito com ajuda',
  fastestAssisted: 'Gabarito com ajuda mais rápido',
  goldInvite: 'Faça sem a vida extra para ganhar a medalha de ouro.',
  medalGold: 'Medalha de ouro: gabarito sem ajuda',
  medalSilver: 'Medalha de prata: gabarito com a vida extra',
  assistedIn: (time) => `Gabarito com ajuda em ${time}`,
  share: 'Desafiar um amigo',
  shareCopied: 'Link copiado. Cole em qualquer conversa.',
  shareFailed: 'Não foi possível compartilhar deste navegador.',
  shareSave: 'Salvar imagem',
  shareSaved: 'Imagem salva.',
  medalGoldShort: 'Medalha de ouro',
  medalSilverShort: 'Medalha de prata',
  mastery: (level) => `Maestria ${level}`,
  masteryRuns: (count) => (count === 1 ? 'Gabaritou 1 vez sem ajuda' : `Gabaritou ${count} vezes sem ajuda`),
  medalMeaning: (tier, total) =>
    tier === 'gold'
      ? `Acertou todas as ${total}: nenhum erro e sem usar a vida extra.`
      : `Acertou todas as ${total}, com a ajuda da vida extra.`,
  medalDare: 'Consegue ganhar a sua?',
  medalShare: 'Compartilhar medalha',
  medalOpen: (round) => `Ver a medalha de ${round}`,
  bestTime: 'Melhor tempo',
  back: 'Voltar',
  shareDare: 'Mesmas perguntas. Consegue me bater?',
  shareVerdict: (verdict) =>
    verdict === 'win'
      ? 'Venci o desafio. Consegue me bater?'
      : verdict === 'tie'
        ? 'Empatei o desafio. Consegue desempatar?'
        : 'Perdi o desafio. Consegue fazer melhor?',
  challengeTitle: 'Você foi desafiado',
  challengeBody: (round, correct, total, time) =>
    `Um amigo fez ${correct}/${total} em ${time} em ${round}. Você recebe as mesmas perguntas, na mesma ordem.`,
  challengeAccept: 'Aceitar desafio',
  challengeDismiss: 'Agora não',
  challengeResult: (verdict) =>
    verdict === 'win' ? 'Você venceu o desafio' : verdict === 'tie' ? 'Empate perfeito' : 'Seu amigo levou essa',
  challengeYou: 'Você',
  challengeFriend: 'Amigo',
  challengeAgain: 'Devolver o desafio',
  dailyTitle: 'Polo do dia',
  dailyRound: (day, clue) => `Polo do dia #${day} · ${clue}`,
  dailyNote: (clue) =>
    clue === 'capital'
      ? '10 capitais do mundo todo. Uma tentativa.'
      : '10 países do mundo todo. Uma tentativa.',
  dailyDone: (correct, total) => `Hoje: ${correct}/${total}`,
  dailyStreak: (days) => (days === 1 ? '1 dia seguido' : `${days} dias seguidos`),
  dailyNext: (time) => `Próximo em ${time}`,
  dailyShare: 'Compartilhar resultado',
  dailyDare: 'Encare o desafio de hoje. Consegue me bater?',
  previewTitle: (correct, total, round) => `${correct}/${total} · ${round}. Consegue bater?`,
  dailyInviteTitle: 'O Polo do dia está esperando',
  dailyInviteBody: (clue) =>
    clue === 'capital'
      ? '10 capitais do mundo todo, uma tentativa. Jogue e compare com quem te mandou.'
      : '10 países do mundo todo, uma tentativa. Jogue e compare com quem te mandou.',
  dailyAccept: 'Jogar o Polo do dia',
  pages: {
    howTo: 'Como jogar',
    about: 'Sobre',
    privacy: 'Privacidade',
    terms: 'Termos',
    contact: 'Contato',
    label: 'Sobre o Polo',
  },
}

export const MESSAGES: Record<Locale, Messages> = { en, pt }

export function modeName(messages: Messages, mode: ModeId): string {
  if (mode === 'global') return messages.modeGlobal
  if (mode === 'quick') return messages.modeQuickName
  return messages.continents[mode]
}

// "Countries · Europe": the game and the pool, for places that show a round out of the lobby's context.
export function roundName(messages: Messages, clue: Clue, mode: ModeId): string {
  return `${messages.clues[clue].name} · ${modeName(messages, mode)}`
}
