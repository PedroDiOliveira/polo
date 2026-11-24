import { ImageResponse } from '@vercel/og'
import { MESSAGES } from '../src/i18n/messages'
import { parsePreview, type Preview } from '../src/share/preview'

// The picture a chat app shows for a shared result: 1200×630, drawn on the edge from the link alone.
// Nothing is stored and nothing is looked up, so the same link always draws the same image.
export const config = { runtime: 'edge' }

const PINE = '#06201A'
const PINE_900 = '#0A2E25'
const SAGE = '#D5E3D6'
const MIST = '#F3F7F2'
const AURORA = '#A8F26A'
const EMERALD = '#1FAF6B'
const AMBER = '#FFC53D'
const DIM = '#A9C0B4'

// public/brand/polo-wordmark.svg, inlined so the function needs no request of its own.
const WORDMARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 52" fill="none"><g stroke="${MIST}" stroke-width="4" stroke-linecap="round"><path d="M8 14v32"/><circle cx="18" cy="24" r="10"/><circle cx="46" cy="24" r="10"/><path d="M64 5v29"/><g transform="rotate(23.5 84 24)"><circle cx="84" cy="24" r="10"/><circle cx="84" cy="7.4" r="2.6" fill="${AURORA}" stroke="none"/></g></g></svg>`

// The globe of the logo, drawn large as the card's backdrop: tilted 23.5° with its pole dot.
const GLOBE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><g transform="rotate(23.5 50 50)"><circle cx="50" cy="50" r="40" stroke="${PINE_900}" stroke-width="2.4"/><ellipse cx="50" cy="50" rx="40" ry="13" stroke="${PINE_900}" stroke-width="1.6"/><path d="M50 2v8M50 90v8" stroke="${PINE_900}" stroke-width="2.4" stroke-linecap="round"/><circle cx="50" cy="10" r="3.4" fill="${AURORA}"/></g></svg>`

// components/PlanetMedal.tsx, with its colours written in: gold is filled with a halo, silver is an outline.
function medalSvg(tier: 'gold' | 'silver'): string {
  const gold = tier === 'gold'
  const orbit = gold ? MIST : DIM
  const halo = gold ? `<circle cx="24" cy="24" r="16" stroke="${AMBER}" stroke-opacity="0.55" stroke-width="1.5"/>` : ''
  const planet = gold
    ? `<circle cx="24" cy="24" r="11" fill="${AURORA}" stroke="${AURORA}" stroke-width="2.5"/>`
    : `<circle cx="24" cy="24" r="11" fill="${SAGE}" fill-opacity="0.14" stroke="${SAGE}" stroke-width="2.5"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><g transform="rotate(23.5 24 24)" stroke-linecap="round">${halo}<ellipse cx="24" cy="24" rx="21" ry="6.5" stroke="${orbit}" stroke-width="2.5"/>${planet}<path d="M3 24a21 6.5 0 0 0 42 0" stroke="${orbit}" stroke-width="2.5"/><circle cx="24" cy="7" r="2.6" fill="${gold ? AMBER : SAGE}"/></g></svg>`
}

const svg = (markup: string) => `data:image/svg+xml;base64,${btoa(markup)}`

type Style = Record<string, string | number>
interface Node {
  type: string
  props: { style?: Style; src?: string; width?: number; height?: number; children?: Node | string | (Node | string)[] }
}

// Satori takes React-shaped elements; plain objects keep this file free of JSX and of React.
function h(type: string, style: Style, ...children: (Node | string)[]): Node {
  return { type, props: { style: { display: 'flex', ...style }, children } }
}

function image(src: string, width: number, height: number, style: Style = {}): Node {
  return { type: 'img', props: { src, width, height, style } }
}

function card(preview: Preview, host: string): Node {
  const t =
    preview.locale === 'pt' ? { dare: 'Consegue bater?', time: 'tempo' } : { dare: 'Can you beat it?', time: 'time' }
  const share = preview.total > 0 ? preview.correct / preview.total : 0

  return h(
    'div',
    {
      width: '100%',
      height: '100%',
      background: PINE,
      color: MIST,
      position: 'relative',
      padding: 72,
      flexDirection: 'column',
    },
    image(svg(GLOBE), 620, 620, { position: 'absolute', right: -120, top: 5 }),
    image(svg(WORDMARK), 144, 72),
    h(
      'div',
      { flexDirection: 'column', marginTop: 28 },
      h('div', { fontSize: 34, color: AURORA, letterSpacing: 1 }, preview.round),
      h(
        'div',
        { alignItems: 'flex-end', marginTop: 4 },
        h('div', { fontSize: 196, lineHeight: 1, letterSpacing: -6 }, String(preview.correct)),
        h('div', { fontSize: 88, lineHeight: 1.2, color: SAGE, opacity: 0.7, marginLeft: 8 }, `/${preview.total}`),
        ...(preview.time
          ? [h('div', { fontSize: 44, lineHeight: 2, color: SAGE, marginLeft: 40 }, `${t.time} ${preview.time}`)]
          : []),
      ),
    ),
    h(
      'div',
      { width: 640, height: 14, borderRadius: 7, background: PINE_900, marginTop: 24, marginBottom: 32 },
      h('div', { width: `${Math.round(share * 100)}%`, height: 14, borderRadius: 7, background: EMERALD }),
    ),
    h(
      'div',
      { marginTop: 'auto', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' },
      h('div', { fontSize: 52 }, t.dare),
      h('div', { fontSize: 28, color: SAGE, opacity: 0.8 }, host),
    ),
  )
}

function medalCard(preview: Preview, medal: NonNullable<Preview['medal']>, host: string): Node {
  const t = MESSAGES[preview.locale]
  const gold = medal.tier === 'gold'
  const stats = [medal.mastery ? t.mastery(medal.mastery) : '', `${t.bestTime} ${preview.time}`].filter(Boolean)

  return h(
    'div',
    {
      width: '100%',
      height: '100%',
      background: PINE,
      color: MIST,
      position: 'relative',
      padding: 72,
      flexDirection: 'column',
    },
    h(
      'div',
      {
        position: 'absolute',
        right: 60,
        top: 95,
        width: 440,
        height: 440,
        borderRadius: 220,
        background: gold
          ? 'radial-gradient(circle, rgba(168, 242, 106, 0.22), rgba(6, 32, 26, 0) 70%)'
          : 'radial-gradient(circle, rgba(213, 227, 214, 0.12), rgba(6, 32, 26, 0) 70%)',
      },
      image(svg(medalSvg(medal.tier)), 440, 440),
      ...(medal.mastery
        ? [
            h(
              'div',
              {
                position: 'absolute',
                right: 40,
                bottom: 50,
                minWidth: 104,
                height: 104,
                padding: '0 28px',
                borderRadius: 52,
                background: AMBER,
                border: `8px solid ${PINE}`,
                color: PINE,
                fontSize: 60,
                justifyContent: 'center',
                alignItems: 'center',
              },
              String(medal.mastery),
            ),
          ]
        : []),
    ),
    image(svg(WORDMARK), 144, 72),
    h(
      'div',
      { flexDirection: 'column', marginTop: 28, width: 640 },
      h('div', { fontSize: 28, color: gold ? AURORA : SAGE, letterSpacing: 4 }, medal.label.toUpperCase()),
      h('div', { fontSize: 54, lineHeight: 1.1, marginTop: 10 }, preview.round),
      h('div', { fontSize: 28, lineHeight: 1.35, color: SAGE, marginTop: 16 }, medal.meaning),
      h('div', { fontSize: 28, color: MIST, marginTop: 16 }, stats.join('  ·  ')),
    ),
    h(
      'div',
      { marginTop: 'auto', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' },
      h('div', { fontSize: 44 }, t.medalDare),
      h('div', { fontSize: 28, color: SAGE, opacity: 0.8 }, host),
    ),
  )
}

export default function handler(request: Request): Response {
  const url = new URL(request.url)
  const locale = url.searchParams.get('lang') === 'pt' ? '/pt' : '/'
  const preview = parsePreview(locale, url.search)
  // A broken link still gets a picture: the site's own social image.
  if (!preview) return Response.redirect(new URL('/og.png', url.origin), 302)
  return new ImageResponse(
    (preview.medal
      ? medalCard(preview, preview.medal, url.host)
      : card(preview, url.host)) as unknown as ConstructorParameters<typeof ImageResponse>[0],
    {
      width: 1200,
      height: 630,
      // The same link always draws the same image, so caches may keep it for good.
      headers: { 'cache-control': 'public, max-age=31536000, immutable' },
    },
  )
}
