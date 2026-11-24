// Generates the static, crawlable pages around the game, after `vite build`:
// how to play, about, privacy, terms, contact and one page per continent, in English and Portuguese,
// plus the Portuguese entry of the game (/pt/), sitemap.xml and robots.txt.
// The pages are plain HTML with no JavaScript of their own, so they load instantly and index well.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ROUTES from '../src/config/pages.json' with { type: 'json' }
import WORLD from '../src/data/generated/world.json' with { type: 'json' }
import { CONTINENT_NAMES, CONTINENTS, META, PAGES, UI } from './pages/content.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const LOCALES = ['en', 'pt']
const CONTINENT_IDS = Object.keys(CONTINENTS)
const UPDATED = '2026-11-24'

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
const ORIGIN = (process.env.SITE_URL ?? (host ? `https://${host}` : '')).replace(/\/$/, '')
const CONTACT = process.env.CONTACT_EMAIL?.trim()

if (!CONTACT) console.warn('build-pages: CONTACT_EMAIL is not set; the legal pages show a placeholder. Set it before applying to AdSense.')
if (!ORIGIN) console.warn('build-pages: SITE_URL is not set; the sitemap and canonical links will be relative.')

const countries = WORLD.countries
const byCode = new Map(countries.map((country) => [country.code, country]))

const escape = (text) =>
  String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

// Escapes the text, then turns bare URLs and the {{contact}} token into links.
function rich(text) {
  const contact = CONTACT
    ? `<a href="mailto:${escape(CONTACT)}">${escape(CONTACT)}</a>`
    : '<strong>[CONTACT_EMAIL]</strong>'
  return escape(text)
    .replace(/https?:\/\/[^\s<]+[^\s<.,;:)]/g, (url) => `<a href="${url}" rel="noopener">${url}</a>`)
    .replaceAll('{{contact}}', contact)
}

function sections(list) {
  return list
    .map(([heading, ...paragraphs]) => {
      const body = paragraphs
        .map((paragraph) =>
          Array.isArray(paragraph)
            ? `<ul>${paragraph.map((item) => `<li>${rich(item)}</li>`).join('')}</ul>`
            : `<p>${rich(paragraph)}</p>`,
        )
        .join('\n')
      return `<section><h2>${escape(heading)}</h2>\n${body}</section>`
    })
    .join('\n')
}

const url = (path) => `${ORIGIN}${path}`
const continentPath = (id, locale) => `${ROUTES.continent[locale]}${id}`
const playPath = (locale, query) => `${ROUTES.home[locale]}?${query}`

function layout({ locale, path, alternate, title, description, body, adsHead }) {
  const t = UI[locale]
  const other = locale === 'en' ? 'pt' : 'en'
  const nav = ['howTo', 'about', 'privacy', 'terms', 'contact']
    .map((key) => `<a href="${ROUTES[key][locale]}">${escape(t.nav[key])}</a>`)
    .join('')
  const continentNav = CONTINENT_IDS.map(
    (id) => `<a href="${continentPath(id, locale)}">${escape(CONTINENT_NAMES[id][locale])}</a>`,
  ).join('')

  return `<!doctype html>
<html lang="${locale === 'pt' ? 'pt-BR' : 'en'}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escape(title.includes('Polo') ? title : `${title} · Polo`)}</title>
<meta name="description" content="${escape(description)}" />
<meta name="theme-color" content="#06201A" />
<meta name="color-scheme" content="dark" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="canonical" href="${url(path)}" />
<link rel="alternate" hreflang="${locale === 'pt' ? 'pt-BR' : 'en'}" href="${url(path)}" />
<link rel="alternate" hreflang="${other === 'pt' ? 'pt-BR' : 'en'}" href="${url(alternate)}" />
<link rel="alternate" hreflang="x-default" href="${url(locale === 'en' ? path : alternate)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Polo" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:image" content="${url('/og.png')}" />
${adsHead}
<style>
:root{--bg:#06201a;--surface:#0a2e25;--line:rgb(243 247 242/.12);--text:#f3f7f2;--dim:#a9c0b4;--accent:#a8f26a;--ink:#06201a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 ui-sans-serif,system-ui,-apple-system,'Segoe UI',sans-serif}
a{color:var(--accent)}
.skip{position:absolute;left:-999px}.skip:focus{left:12px;top:12px}
header,main,footer{max-width:760px;margin:0 auto;padding:0 20px}
header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:20px;padding-bottom:20px;border-bottom:1px solid var(--line)}
header nav{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:14px}
header nav a,footer a{color:var(--dim);text-decoration:none}
header nav a:hover,footer a:hover{color:var(--text);text-decoration:underline}
h1{font-size:clamp(28px,5vw,40px);line-height:1.15;letter-spacing:-.02em;margin:36px 0 8px}
h2{font-size:20px;margin:32px 0 8px}
.lede{color:var(--dim);margin-top:0}
.cta{display:flex;flex-wrap:wrap;gap:10px;margin:20px 0}
.button{display:inline-block;padding:10px 18px;border-radius:999px;background:var(--accent);color:var(--ink);font-weight:600;text-decoration:none}
.button.ghost{background:transparent;color:var(--text);border:1px solid var(--line)}
table{width:100%;border-collapse:collapse;font-size:15px}
th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line)}
th{color:var(--dim);font-weight:500}
dt{font-weight:600;margin-top:12px}dd{margin:2px 0 0;color:var(--dim)}
button.consent{font:inherit;padding:10px 18px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--text);cursor:pointer}
footer{margin-top:56px;padding-top:20px;padding-bottom:40px;border-top:1px solid var(--line);font-size:14px;color:var(--dim)}
footer p{display:flex;flex-wrap:wrap;gap:4px 14px;margin:6px 0}
</style>
</head>
<body>
<a class="skip" href="#content">${escape(t.skip)}</a>
<header>
<a href="${ROUTES.home[locale]}" aria-label="Polo"><img src="/brand/polo-wordmark.svg" alt="Polo" width="76" height="38" /></a>
<nav aria-label="Polo">${nav}<a href="${alternate}" hreflang="${other === 'pt' ? 'pt-BR' : 'en'}">${escape(t.otherLanguage)}</a></nav>
</header>
<main id="content">
${body}
</main>
<footer>
<p><strong>${escape(t.continents)}:</strong>${continentNav}</p>
<p>${nav}</p>
<p>Map data: Natural Earth · ${escape(t.updated)}: ${UPDATED}</p>
</footer>
</body>
</html>
`
}

function plainPage(key, locale) {
  const page = PAGES[key]
  const consent = page.consent
    ? `<p><button type="button" class="consent" onclick="window.googlefc=window.googlefc||{};googlefc.callbackQueue=googlefc.callbackQueue||[];googlefc.callbackQueue.push(function(){googlefc.showRevocationMessage()})">${escape(UI[locale].manageConsent)}</button></p>`
    : ''
  return {
    title: page.title[locale],
    description: page.description[locale],
    body: `<h1>${escape(page.title[locale])}</h1>
<p class="lede">${escape(page.description[locale])}</p>
<p class="cta"><a class="button" href="${ROUTES.home[locale]}">${escape(UI[locale].play)}</a></p>
${sections(page.sections[locale])}
${consent}`,
  }
}

function continentPage(id, locale) {
  const t = UI[locale]
  const names = CONTINENT_NAMES[id]
  const name = names[locale]
  const of = locale === 'pt' ? names.ptOf : name
  const content = CONTINENTS[id]
  const members = countries
    .filter((country) => country.continent === id)
    .sort((a, b) => a.name[locale].localeCompare(b.name[locale], locale))
  const title = locale === 'pt' ? `Países e capitais ${of}` : `Countries and capitals of ${name}`
  const description =
    locale === 'pt'
      ? `Os ${members.length} países ${of} e suas capitais, as capitais que mais confundem e um jogo para praticar no mapa.`
      : `The ${members.length} countries of ${name} and their capitals, the capitals that trip people up, and a map game to practise.`

  const tricky = content.tricky
    .map(({ code, ...notes }) => {
      const country = byCode.get(code)
      if (!country) throw new Error(`build-pages: unknown country code ${code} in ${id}`)
      if (country.continent !== id) throw new Error(`build-pages: ${code} is not in ${id}`)
      return `<dt>${escape(country.name[locale])}: ${escape(country.capital[locale])}</dt><dd>${escape(notes[locale])}</dd>`
    })
    .join('\n')

  const rows = members
    .map((country) => `<tr><td>${escape(country.name[locale])}</td><td>${escape(country.capital[locale])}</td></tr>`)
    .join('\n')

  return {
    title,
    description,
    body: `<h1>${escape(title)}</h1>
<p class="lede">${escape(description)}</p>
${content.intro[locale].map((paragraph) => `<p>${escape(paragraph)}</p>`).join('\n')}
<p class="cta">
<a class="button" href="${escape(playPath(locale, `mode=${id}&clue=capital`))}">${escape(`${t.playCapitals} ${of}`)}</a>
<a class="button ghost" href="${escape(playPath(locale, `mode=${id}&clue=country`))}">${escape(`${t.playCountries} ${of}`)}</a>
</p>
<h2>${escape(t.tricky)}</h2>
<dl>
${tricky}
</dl>
<h2>${escape(t.countries)} (${members.length})</h2>
<table>
<thead><tr><th scope="col">${escape(t.country)}</th><th scope="col">${escape(t.capital)}</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>`,
  }
}

async function write(path, html) {
  const file = join(DIST, path === '/' ? 'index.html' : path.endsWith('/') ? `${path}index.html` : `${path}.html`)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
  return path
}

async function main() {
  const gameHtml = await readFile(join(DIST, 'index.html'), 'utf8')
  // Content pages carry the same Google script as the game, so the consent message works everywhere
  // and Auto ads can run on them. Without VITE_ADSENSE_CLIENT there is nothing to copy.
  const adsHead = (gameHtml.match(/<script[^>]*pagead2\.googlesyndication\.com[^>]*><\/script>/g) ?? []).join('\n')

  const written = []
  const keys = ['howTo', 'about', 'privacy', 'terms', 'contact']
  for (const locale of LOCALES) {
    const other = locale === 'en' ? 'pt' : 'en'
    for (const key of keys) {
      const path = ROUTES[key][locale]
      written.push(await write(path, layout({ locale, path, alternate: ROUTES[key][other], adsHead, ...plainPage(key, locale) })))
    }
    for (const id of CONTINENT_IDS) {
      const path = continentPath(id, locale)
      written.push(await write(path, layout({ locale, path, alternate: continentPath(id, other), adsHead, ...continentPage(id, locale) })))
    }
  }

  // The Portuguese edition of the game: the same app, with Portuguese metadata and a canonical of its own.
  const enDescription = gameHtml.match(/<meta name="description" content="([^"]*)"/)?.[1]
  const enTitle = gameHtml.match(/<title>([^<]*)<\/title>/)?.[1]
  let ptHtml = gameHtml.replace('<html lang="en">', '<html lang="pt-BR">')
  if (enDescription) ptHtml = ptHtml.replaceAll(`content="${enDescription}"`, `content="${escape(META.pt.homeDescription)}"`)
  if (enTitle) ptHtml = ptHtml.replaceAll(enTitle, escape(META.pt.homeTitle))
  ptHtml = ptHtml.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url('/pt/')}"`)
  written.push(await write('/pt/', ptHtml))

  const homes = ['/', '/pt/']
  const pairs = new Map()
  for (const key of keys) pairs.set(ROUTES[key].en, ROUTES[key].pt)
  for (const id of CONTINENT_IDS) pairs.set(continentPath(id, 'en'), continentPath(id, 'pt'))
  pairs.set('/', '/pt/')
  const alternateOf = (path) => {
    for (const [en, pt] of pairs) {
      if (en === path) return { en, pt }
      if (pt === path) return { en, pt }
    }
    return null
  }
  const entries = [...new Set([...homes, ...written])]
    .map((path) => {
      const pair = alternateOf(path)
      const links = pair
        ? `<xhtml:link rel="alternate" hreflang="en" href="${url(pair.en)}"/><xhtml:link rel="alternate" hreflang="pt-BR" href="${url(pair.pt)}"/>`
        : ''
      return `<url><loc>${url(path)}</loc><lastmod>${UPDATED}</lastmod>${links}</url>`
    })
    .join('\n')
  await writeFile(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>\n`,
  )
  await writeFile(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n${ORIGIN ? `\nSitemap: ${url('/sitemap.xml')}\n` : ''}`)

  console.log(`build-pages: ${written.length} pages, sitemap.xml and robots.txt written to dist/`)
}

await main()
