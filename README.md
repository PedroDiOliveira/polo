<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/polo-wordmark.svg" />
    <img src="public/brand/polo-wordmark-on-light.svg" alt="Polo" width="180" />
  </picture>
</p>

<p align="center"><strong>A capital is drawn. You find its country on the map.</strong></p>

![Polo during a South America round: three countries answered correctly in green, two missed in hatched red](docs/screenshots/game.png)

Polo is a geography game played on a single interactive world map. It runs entirely in the browser: no backend, no database, no account, no API key.

- **Live demo:** _add the Vercel URL here_
- **Stack:** React 19 · TypeScript · Vite · MapLibre GL JS · Natural Earth

## Contents

- [The problem](#the-problem)
- [Features](#features)
- [Tech stack and why](#tech-stack-and-why)
- [Architecture](#architecture)
- [Performance decisions](#performance-decisions)
- [Product decisions](#product-decisions)
- [Design and identity](#design-and-identity)
- [Running locally](#running-locally)
- [Deploying](#deploying)
- [What I would build next](#what-i-would-build-next)
- [Author](#author)

## The problem

Most capital quizzes are multiple choice or a text box. They test whether you can recall a word, not whether you know where a place is. You can score well and still be unable to point at Burkina Faso.

Polo asks the spatial question instead. It shows a capital and you have to click the country on a real map. When you miss, the game takes you to the right country before moving on, so a mistake teaches you something.

## Features

**Lobby.** The first screen is the map itself. You can drag, scroll, pinch and use the zoom buttons, as you would in Google Maps. Capitals appear as you get close to a country, and the mode selector and Play button stay on screen.

![The lobby: a globe with capital labels appearing by zoom level, and the mode selector](docs/screenshots/lobby.png)

**Two games.** In *Capitals*, a capital is shown and you click its country. In *Countries*, a country is shown and you find it on the map. A tab row at the top of the lobby switches between them, with one line underneath that says what the selected game asks of you. Every mode below works in both games. In *Countries* the hover tooltip is switched off during a round, since the country's name is the question.

**Game modes.**

| Mode | Pool | Length |
| --- | --- | --- |
| Global, full | All 197 countries | Long |
| Global, quick | 20 capitals drawn from the whole world | A few minutes |
| Regional | One continent: Africa (54), Asia (49), Europe (45), North America (23), Oceania (14) or South America (12) | Short |

**A round.**

1. A capital is drawn at random and shown at the top of the screen.
2. You click the country it belongs to. Hovering a territory shows only the country name (in *Capitals*; in *Countries* nothing is shown).
3. **Correct:** the country turns green and stays green.
4. **Wrong:** the right country pulses in amber, a pin marks the capital itself, and the panel tells you which country you clicked and what its capital is. The camera moves to the answer if it is off screen. The country then settles to hatched red for the rest of the game.

Every capital in the pool is asked once. A miss does not end the game.

**Optional review round.** The result screen lists what you missed, and each entry flies the map to that country. If there were misses, the game offers a review: only those capitals, on a clean map, each one coming back a few questions later until you get it right. It is an offer, never a gate, and it does not touch your score.

**Mastery map.** The lobby map always colours every country by how well you know it, for the game picked (Capitals or Countries), with its key fixed in the panel. Countries never asked stay plain, so a first visit sees a clean map. Each game keeps its own map, because knowing Paris and knowing where France is are different skills. Four levels, from "learning" to "mastered"; a correct first answer moves a country up one level and a miss moves it down.

**A regional round switches the rest of the world off.** Neighbouring continents touch, and a beginner cannot tell where Europe ends and Asia begins. During a regional round every country outside it is drawn in a dim, desaturated green: still recognisable as land, but clearly out of play. It cannot be hovered or clicked, so a stray click costs nothing. Territories follow where they lie, not who owns them: Greenland is not part of a European round. The shared result card is drawn the same way. Dimming was chosen over marking the excluded countries (with a cross, for example) because a mark on a hundred countries is noise, and the hatch already means "missed".

**Gold medals carry a mastery level.** Every perfect run without help adds one, shown on the medal. A medal can be shared as an image that explains what it means.

**Personal bests and medals.** The best score is stored per game, per mode and per continent. A perfect run earns a planet medal and records the time it took; a faster perfect run replaces it. There are two tiers: **gold** for a perfect run without help, and a simpler **silver** for a perfect run that used the extra life. Gold always outranks silver, and each keeps its own fastest time.

**Extra life (rewarded ad).** Once per regular game, after a wrong click, Polo may offer an extra life: watch a short ad and try the same question again. The offer appears *before* the answer is revealed, only when Google has an ad ready, and declines itself after 8 seconds. The time it is open does not count on the clock. A revived miss still counts as a miss on the mastery map.

**Also included.** Globe and flat projections, English and Brazilian Portuguese (picked from the browser language), touch support, and reduced-motion support.

## Tech stack and why

| Choice | Why |
| --- | --- |
| **React 19** over Angular | The map is an imperative WebGL canvas that owns its own render loop. The framework only has to manage a thin shell around it: a few panels and one state machine. React does that with less ceremony and a smaller bundle. Angular's strengths (dependency injection, forms, routing, structure for large teams) would go unused here. |
| **TypeScript**, strict | The game state is a discriminated union, so "playing" data cannot be read in the lobby by mistake. The compiler enforces the rules of the game. |
| **Vite** | Produces a plain static bundle, which is all Vercel needs. |
| **MapLibre GL JS** | See below. |
| **Natural Earth** | Public domain, maintained by cartographers, and it ships borders, sovereignty and capitals in one consistent dataset. |
| **CSS Modules + custom properties** | Scoped styles with zero runtime cost. A design system of eight colours does not need a CSS framework. |
| **Vitest** | Unit tests for the pure logic: the game reducer, the record rules and the cookie codec. |
| **Vercel** | Static hosting with a CDN and Brotli. The only code that runs there draws the preview of a shared result link. |

### Choosing the map library

The brief was "navigation that feels like Google Maps". That means inertial panning, continuous zoom rather than steps, and pinch gestures.

| | MapLibre GL JS | Leaflet | D3 |
| --- | --- | --- | --- |
| Rendering | WebGL, vector | DOM / SVG / raster | SVG or Canvas |
| Zoom | Continuous, GPU-interpolated | Stepped by default | Hand-built |
| Pan inertia, pinch | Built in | Built in | Hand-built |
| Recolouring 250 polygons per answer | One paint property update | 250 SVG nodes to restyle | Manual redraw |
| Globe projection | Built in | No | Yes, without the gestures |

MapLibre won because it gives Google-Maps-grade gestures for free and repaints countries on the GPU. D3 would have meant rebuilding navigation from scratch, and Leaflet's SVG layer gets heavy with detailed borders.

One point worth calling out: Polo uses **no map tiles**. The style contains only local GeoJSON sources, so there is no tile server, no third-party request and no key.

## Architecture

```
src/
├── config/app.ts        Single source of truth for the product name and metadata
├── data/                Typed access to the generated country data
├── game/                Pure game logic, no React and no DOM
│   ├── session.ts       Reducer: lobby → playing → finished
│   ├── records.ts       Personal-best rules and cookie codec
│   ├── mastery.ts       Per-country mastery levels
│   └── modes.ts         Mode ids and country pools
├── map/                 Everything that touches MapLibre
│   ├── MapController.ts Imperative facade: marks, hover, signals, camera
│   ├── CapitalLabels.ts Zoom- and viewport-aware capital labels
│   ├── layers.ts        Style, layers and paint expressions
│   └── MapView.tsx      The only React component that knows the map exists
├── hooks/               useGame, useRecords, useMastery, useElapsed
├── components/          Presentational UI
├── i18n/                Typed message catalogues (en, pt-BR)
└── styles/              Design tokens and shared primitives
scripts/
├── build-data.mjs       Natural Earth → simplified GeoJSON + country metadata
└── build-brand.mjs      SVG → PNG for the social image and app icons
```

Three boundaries keep the code easy to reason about.

**The game is a pure reducer.** `sessionReducer(session, action)` has no side effects and takes the current time as an argument. That makes every rule testable in a line: input is locked while feedback is showing, a miss is recorded against the target rather than the clicked country, and ending early keeps the partial score.

**React never touches MapLibre directly.** `MapController` exposes a small vocabulary (`setMarks`, `signal`, `focus`, `setCapitals`). React passes state down as props and the controller translates it into paint properties and filters. Pointer movement goes the other way without a re-render: the tooltip is positioned by writing to a ref, and React only re-renders when the hovered country changes.

**The product name lives in one constant.** `APP.name` in `src/config/app.ts` feeds the header, and a small Vite plugin injects it into the page title, the Open Graph and Twitter tags, and the generated web manifest. Renaming the product is a one-line change. The drawn logo is the one exception, since its letters are geometry.

## Performance decisions

**Capitals render by zoom and by viewport.** There are 197 capitals and showing them all would be unreadable. `CapitalLabels` runs three checks on every camera move, throttled to one pass per animation frame:

1. **Zoom.** Each country has a threshold computed at build time from its on-screen size, so Brasília appears early and Luxembourg only when you are close. Countries are pre-sorted by threshold, so the loop stops at the first one that fails.
2. **Viewport.** Capitals outside the screen, or on the far side of the globe, are skipped.
3. **Collision.** A greedy pass places larger countries first and drops any label that would overlap one already placed.

Only the survivors exist in the DOM, usually between 5 and 40 elements. Labels are HTML rather than a WebGL symbol layer, which avoids hosting font glyph files and lets them use the same typeface as the rest of the interface.

**The geometry is prepared at build time.** `scripts/build-data.mjs` takes Natural Earth's 1:10m countries (13 MB), keeps two properties per feature, simplifies the shapes and rounds coordinates to about 100 m. The result is 1.3 MB, or about 450 kB compressed. The output is committed, so a deploy needs no network access to third parties.

**Answering a question costs one GPU update.** Country colours come from a single `match` expression on the fill layer. A correct answer rebuilds that expression and MapLibre repaints; no geometry is re-uploaded and React does not render the map. The mastery map reuses the same mechanism with a different set of colours.

**The map engine loads in its own chunk.** MapLibre is about 300 kB compressed, most of the JavaScript. It is loaded with `React.lazy`, so the shell (about 90 kB) paints first. Parsing and tiling the GeoJSON happens in MapLibre's web worker, off the main thread.

**Tiny countries stay clickable.** Vatican City is smaller than a pixel at most zoom levels. The 34 smallest states also get a dot marker with a generous hit area, coloured by the same expression as the polygons.

## Product decisions

**Ads, and the one exception to "no third parties".** Polo is funded by Google's Ad Placement API (AdSense H5 Games Ads), wrapped in `src/ads/adPlacement.ts`. It is the only third-party request the app makes, and only when `VITE_ADSENSE_CLIENT` is set at build time. Two placements, both at natural breaks:

- **Interstitial** (`next`, named `game_end`): after every second regular game, when the player leaves the result screen (play again, review or back to the lobby), so the score is always seen first. Google applies its own frequency cap on top (`data-ad-frequency-hint="60s"`).
- **Rewarded** (`reward`, named `second_chance`): the extra life above. A rewarded ad must go through this API: rewarding views of a regular AdSense display unit breaks AdSense policy.

There are no display ads over the map, so a click meant for a country can never land on an ad. The game works exactly as before when the script is missing or blocked: every call resolves on its own. Outside production the script runs with `data-adbreak-test="on"`, so testing never generates invalid traffic.

**Static content pages.** `scripts/build-pages.mjs` runs after `vite build` and writes plain HTML pages (how to play, about, privacy, terms, contact and one page per continent, in English and Portuguese), the Portuguese entry of the game at `/pt/`, `sitemap.xml` and `robots.txt`. Country and capital names on those pages come from the game's own data, so they cannot disagree with it.

**No backend.** Nothing in the product needs one. The data is static, the game is single-player and the only state worth keeping is a handful of numbers. Leaving the server out means no cold starts, no cost, no data to protect and no way for the game to be "down" short of the CDN itself.

**One exception, and it keeps nothing: link previews.** A chat app reads a link's social tags before anyone taps it, and that preview decides whether a friend opens a challenge. A static page can only offer one generic image, so `middleware.ts` gives result links (`/?mode=…&seed=…&score=…` and `/?daily=…`) the same page with tags that describe the result, and `api/og.ts` draws the matching 1200×630 picture with `@vercel/og`. Both work from the link alone: no storage, no lookups, no logs of their own. If either fails, the page is served exactly as before and only the preview is lost.

**Progress stays in the browser, and is built to survive.** Two things are stored, both first-party and both only on the player's device:

- **Personal bests** live in one cookie, `polo_pb` (`SameSite=Lax`, `Secure` over HTTPS, a few hundred bytes), and are mirrored in `localStorage`. Records saved before the country game existed are read as capital records, so nobody loses progress. On load the two copies are merged, keeping the best score and the fastest perfect time, and both are written back. That renews the cookie's one-year expiry on every visit and lets either store restore the other if one is cleared or expires.
- **Mastery levels**, one small number per country, live in `localStorage`.

Nothing else is stored; even the language choice is re-detected on each visit. After a finished game the app also asks the browser for persistent storage, so the data is not evicted under disk pressure. Everything read from storage is validated field by field: unknown modes or countries, impossible scores and a perfect time without a perfect score are discarded, so hand-edited data cannot break the interface.

**Bests are counted in correct answers, perfection is timed.** The personal best is the highest number of capitals answered correctly, kept separately for Global and for each continent. Time only matters once you have a perfect run, where it becomes the tiebreaker to beat. This keeps the early goal simple (get more right) and gives experts something to chase.

**The game is designed around how people learn.** I reviewed the research on learning before the second iteration, and three findings shaped the design:

- **Retrieval beats re-reading.** Being asked to produce an answer strengthens memory more than seeing it again, and the effect holds for positions on a map (Rohrer et al., 2010). This is why the core mechanic is a question, and why the lobby is for exploring rather than a required study step.
- **Feedback has to contain the answer.** "Wrong" on its own corrects very little. Polo shows the right country, pins the capital, and names the country you clicked with its own capital, which untangles the confusion in both directions.
- **What you missed should come back.** Karpicke and Roediger (2007) found that repeatedly recalling an item, rather than dropping it, more than doubled retention. That is the review round: missed capitals return, spaced a few questions apart, until each is answered correctly.

I deliberately stopped short of a full spaced-repetition scheduler with due dates. It is the stronger technique on paper, but it would turn a casual game into a study tool. The mastery map gives the same signal, where you are weak, without telling anyone what to do today.

**Quick games.** 197 questions in one sitting is a long, massed session. The quick global game (20 capitals) makes it easy to play often, which is both more casual and closer to how practice is best distributed.

**Scores only count first attempts.** Personal bests and mastery are updated by regular games only. The review round changes neither, so it stays a safe place to be wrong.

**Assumptions made where the brief was open.**

- **Which countries.** 197: the 193 UN member states, the two observer states (Vatican City and Palestine), plus Kosovo and Taiwan, a common convention in geography quizzes.
- **Territories.** A dependency counts as its sovereign state. Clicking Greenland answers Denmark, and Greenland turns green with it. Sovereignty follows Natural Earth's de facto view; Western Sahara and Antarctica belong to no playable country.
- **Countries with more than one capital.** One is used: Pretoria for South Africa, Sucre for Bolivia, Sri Jayawardenepura Kotte for Sri Lanka. Palestine uses Ramallah so that no two countries share an answer.
- **Capitals are hidden during a game**, since showing them would give the answer away.
- **Six continents** for Regional mode, with North and South America separate.

## Design and identity

The full rationale is in [docs/BRAND.md](docs/BRAND.md). In short:

**Concept.** *Polo* is Portuguese for "pole", the fixed point a map is oriented by. The identity uses the globe, its tilted axis and the pole. One number runs through all of it: 23.5°, the Earth's axial tilt, applied to the logo, the favicon and the medal.

**Logo.** The wordmark is drawn from circles and straight stems rather than set in a font. Its final `o` is a tilted globe with a dot at the north pole.

**Colour.** A palette of dark pine greens, pale sage land and one bright accent named after the aurora. I read the research before choosing it, and the evidence is more modest than design blogs claim: Elliot's 2015 review finds colour effects are context-dependent, and much of the "green is calming" evidence comes from nature scenes rather than the colour. So green is used here for what does hold up: its learned association with land and with "correct", and the low glare of dark, desaturated tones over a 197-round game.

**Accessibility of green and red.** The two game states never rely on colour alone. Missed countries carry a diagonal hatch, the hues are a bluish green against an orange-leaning red, the states differ in lightness, and every status in the interface has an icon and a text label.

**Type.** Geist for the interface and Geist Mono for scores and timers, both self-hosted.

## Running locally

Requires Node.js 20.10 or newer.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check, build to `dist/`, then generate the static content pages |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
| `npm run data` | Rebuild the map data from Natural Earth |
| `npm run brand` | Rebuild the PNG brand assets from SVG |

`npm run data` and `npm run brand` are only needed if you change the country list or the logo. Their output is committed.

## Deploying

The project is a static site and deploys to Vercel with no configuration beyond what is in the repository.

1. Push the repository to GitHub.
2. Import it in Vercel. The Vite preset is detected: build command `npm run build`, output directory `dist`.
3. Deploy.

`vercel.json` sets long-lived cache headers for the hashed assets and for the map data, and clean URLs for the content pages. The absolute URL for the social preview image is taken from Vercel's production domain at build time; set a `SITE_URL` environment variable to use a custom domain.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Custom domain, e.g. `https://polo.example`. Used in canonical links, Open Graph and the sitemap. AdSense requires a domain you own. |
| `VITE_ADSENSE_CLIENT` | AdSense publisher id, `ca-pub-…`. Turns on the ad script and generates `ads.txt`. Leave unset for an ad-free build. |
| `CONTACT_EMAIL` | Shown on the privacy, terms and contact pages. The build warns when it is missing. |
| `ADS_TEST=on` | Forces Google's test ads in a production build. Preview deployments get them automatically. |

Any other static host works too: run `npm run build` and serve `dist/`.

## What I would build next

- **Keyboard play.** A searchable country list as an alternative to clicking, so the game is fully playable without a pointer.
- **More question types.** Flags or country shapes, built on the same clue model as *Capitals* and *Countries*.
- **Practice from the mastery map.** A game built from the countries currently at the lowest levels.
- **A "no hints" option.** Hiding country names on hover, for players who want the harder recall.
- **Offline play.** A service worker; the app already has no runtime dependencies on the network.
- **End-to-end tests.** Playwright runs of a full game, alongside the existing unit tests.

## Data and credits

Map data from [Natural Earth](https://www.naturalearthdata.com/), in the public domain. Rendering by [MapLibre GL JS](https://maplibre.org/). Typeface: [Geist](https://vercel.com/font).

## Author

**_Your name_**

- GitHub: [_@your-handle_](https://github.com/your-handle)
- LinkedIn: [_your-profile_](https://www.linkedin.com/in/your-profile)
