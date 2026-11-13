import type { ContinentId, Locale } from '../data/types'
import type { ModeId } from '../game/modes'

export interface Messages {
  mapLabel: string
  mapLoading: string
  mapError: string
  lobbyHint: string
  modeLabel: string
  modeGlobal: string
  modeRegional: string
  modeGlobalNote: string
  modeRegionalNote: string
  continentLabel: string
  continents: Record<ContinentId, string>
  capitals: (count: number) => string
  play: string
  personalBest: string
  noRecord: string
  perfectIn: (time: string) => string
  perfectBadge: string
  prompt: string
  correctAnswer: (country: string) => string
  wrongAnswer: (country: string) => string
  progress: (current: number, total: number) => string
  statCorrect: string
  statWrong: string
  statTime: string
  endGame: string
  resultPerfect: string
  resultCompleted: string
  resultEnded: string
  resultScore: (correct: number, total: number) => string
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
  modeQuickNote: string
  lengthLabel: string
  wrongDetail: (country: string, capital: string) => string
  reviewTag: string
  reviewOffer: (count: number) => string
  reviewStart: string
  reviewDone: string
  reviewEnded: string
  statReviewed: string
  missedTitle: string
  showOnMap: (country: string) => string
  masteryToggle: string
  masteryLevels: readonly [string, string, string, string]
  masteryCount: (count: number, total: number) => string
}

const en: Messages = {
  mapLabel: 'Interactive world map',
  mapLoading: 'Loading the world…',
  mapError: 'The map could not be loaded. Check that WebGL is enabled and reload the page.',
  lobbyHint: 'Zoom in on a country to reveal its capital.',
  modeLabel: 'Game mode',
  modeGlobal: 'Global',
  modeRegional: 'Regional',
  modeGlobalNote: 'Every country in the world. A long game.',
  modeRegionalNote: 'Pick a continent and play only its countries.',
  continentLabel: 'Continent',
  continents: {
    africa: 'Africa',
    asia: 'Asia',
    europe: 'Europe',
    'north-america': 'North America',
    'south-america': 'South America',
    oceania: 'Oceania',
  },
  capitals: (count) => `${count} capitals`,
  play: 'Play',
  personalBest: 'Personal best',
  noRecord: 'No record yet',
  perfectIn: (time) => `Perfect in ${time}`,
  perfectBadge: 'Perfect run',
  prompt: 'Which country has this capital?',
  correctAnswer: (country) => `Correct: ${country}`,
  wrongAnswer: (country) => `It was ${country}`,
  progress: (current, total) => `${current} of ${total}`,
  statCorrect: 'Correct',
  statWrong: 'Wrong',
  statTime: 'Time',
  endGame: 'End game',
  resultPerfect: 'Perfect run',
  resultCompleted: 'Round complete',
  resultEnded: 'Game ended',
  resultScore: (correct, total) => `${correct} of ${total} capitals`,
  newBest: 'New personal best',
  fastestPerfect: 'Fastest perfect run',
  playAgain: 'Play again',
  backToLobby: 'Back to lobby',
  records: 'Records',
  recordsNote: 'Your records and mastery map are saved only in this browser. Clearing its site data erases them.',
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
  modeQuickNote: '20 capitals drawn from the whole world.',
  lengthLabel: 'Length',
  wrongDetail: (country, capital) => `You clicked ${country} (capital: ${capital})`,
  reviewTag: 'Review',
  reviewOffer: (count) =>
    count === 1
      ? 'Want to review the one you missed? It comes back until you get it right.'
      : `Want to review the ${count} you missed? Each one comes back until you get it right.`,
  reviewStart: 'Review misses',
  reviewDone: 'Review complete',
  reviewEnded: 'Review ended',
  statReviewed: 'Reviewed',
  missedTitle: 'Missed',
  showOnMap: (country) => `Show ${country} on the map`,
  masteryToggle: 'Mastery map',
  masteryLevels: ['Learning', 'Familiar', 'Good', 'Mastered'],
  masteryCount: (count, total) => `${count} of ${total} mastered`,
}

const pt: Messages = {
  mapLabel: 'Mapa-múndi interativo',
  mapLoading: 'Carregando o mundo…',
  mapError: 'Não foi possível carregar o mapa. Verifique se o WebGL está ativo e recarregue a página.',
  lobbyHint: 'Aproxime-se de um país para revelar a capital.',
  modeLabel: 'Modo de jogo',
  modeGlobal: 'Global',
  modeRegional: 'Regional',
  modeGlobalNote: 'Todos os países do mundo. Uma partida longa.',
  modeRegionalNote: 'Escolha um continente e jogue só com os países dele.',
  continentLabel: 'Continente',
  continents: {
    africa: 'África',
    asia: 'Ásia',
    europe: 'Europa',
    'north-america': 'América do Norte',
    'south-america': 'América do Sul',
    oceania: 'Oceania',
  },
  capitals: (count) => `${count} capitais`,
  play: 'Jogar',
  personalBest: 'Recorde pessoal',
  noRecord: 'Sem recorde ainda',
  perfectIn: (time) => `Gabarito em ${time}`,
  perfectBadge: 'Gabarito',
  prompt: 'De qual país é esta capital?',
  correctAnswer: (country) => `Correto: ${country}`,
  wrongAnswer: (country) => `Era ${country}`,
  progress: (current, total) => `${current} de ${total}`,
  statCorrect: 'Acertos',
  statWrong: 'Erros',
  statTime: 'Tempo',
  endGame: 'Encerrar',
  resultPerfect: 'Gabarito!',
  resultCompleted: 'Partida concluída',
  resultEnded: 'Partida encerrada',
  resultScore: (correct, total) => `${correct} de ${total} capitais`,
  newBest: 'Novo recorde pessoal',
  fastestPerfect: 'Gabarito mais rápido',
  playAgain: 'Jogar de novo',
  backToLobby: 'Voltar ao lobby',
  records: 'Recordes',
  recordsNote: 'Seus recordes e o mapa de domínio ficam salvos só neste navegador. Limpar os dados do site apaga tudo.',
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
  modeQuickNote: '20 capitais sorteadas do mundo todo.',
  lengthLabel: 'Duração',
  wrongDetail: (country, capital) => `Você clicou em ${country} (capital: ${capital})`,
  reviewTag: 'Revisão',
  reviewOffer: (count) =>
    count === 1
      ? 'Quer revisar o erro agora? A capital volta até você acertar.'
      : `Quer revisar os ${count} erros agora? Cada capital volta até você acertar.`,
  reviewStart: 'Revisar erros',
  reviewDone: 'Revisão concluída',
  reviewEnded: 'Revisão encerrada',
  statReviewed: 'Revisadas',
  missedTitle: 'Erros',
  showOnMap: (country) => `Mostrar ${country} no mapa`,
  masteryToggle: 'Mapa de domínio',
  masteryLevels: ['Aprendendo', 'Familiar', 'Bom', 'Dominado'],
  masteryCount: (count, total) => `${count} de ${total} dominados`,
}

export const MESSAGES: Record<Locale, Messages> = { en, pt }

export function modeName(messages: Messages, mode: ModeId): string {
  if (mode === 'global') return messages.modeGlobal
  if (mode === 'quick') return messages.modeQuickName
  return messages.continents[mode]
}
