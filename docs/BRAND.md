# Polo — visual identity

A short record of the decisions behind the logo, the type, the colour and the medal.

## Concept

*Polo* means "pole" in Portuguese. A pole is the fixed point everything else on a map is measured against, so the identity is built on three ideas: the **globe**, its **tilted axis**, and the **pole** as a point of orientation.

One number ties the system together: **23.5°**, the axial tilt of the Earth. The logo, the favicon and the medal are all rotated by exactly that angle.

## Logo

| Asset | File | Use |
| --- | --- | --- |
| Wordmark (on dark) | `public/brand/polo-wordmark.svg` | Header, social image |
| Wordmark (on light) | `public/brand/polo-wordmark-on-light.svg` | Light backgrounds, print |
| Symbol | `public/brand/polo-symbol.svg` | Loading state, avatars |
| Favicon | `public/favicon.svg` | Browser tab, app icon source |
| Social image | `brand/og.svg` → `public/og.png` | Link previews (1200×630) |

**Wordmark.** The four letters are drawn, not typeset: `p`, `o`, `l`, `o` are built from one circle and one straight stem, with a single stroke weight and round caps. The word is its own geometry lesson, and it needs no font to render.

The last `o` is the globe. It is tilted 23.5° and carries a small dot where the north pole would be. That dot is the only coloured element in the logo.

**Symbol.** The same globe on its own, with an equator arc and a short stub for the south end of the axis. The favicon drops the equator so it stays legible at 16 px.

**Rules.** Keep clear space of one stem width around the wordmark. Never recolour the pole dot to anything but the accent, and never straighten the tilt.

## Typography

- **Geist** for the interface. It is a contemporary geometric grotesque whose round forms sit naturally beside the circle-based wordmark, and it stays legible at the small sizes map labels need.
- **Geist Mono** for everything numeric: scores, timers, counts. Tabular figures stop the timer from jittering, and monospaced numerals echo the coordinates printed on a chart.

Both are self-hosted through Fontsource as variable fonts, so no request leaves the site and only the Unicode subsets in use are downloaded.

## Colour

The palette is called **Pine & Aurora**.

| Token | Hex | Role |
| --- | --- | --- |
| Pine 950 | `#06201A` | Page background, text on accent |
| Pine 900 | `#0A2E25` | Ocean, borders between countries |
| Sage 200 | `#D5E3D6` | Unanswered land |
| Mist 50 | `#F3F7F2` | Text, logo |
| Aurora | `#A8F26A` | Primary action, pole dot, earned medal |
| Emerald | `#1FAF6B` | Correct country |
| Vermilion | `#B8321F` | Missed country (always with a hatch) |
| Amber | `#FFC53D` | Brief reveal of the right answer |

**Why green, and why this green.** The research on colour and psychology is more cautious than popular articles suggest. Elliot's 2015 review in *Frontiers in Psychology* concludes that colour effects depend heavily on context, and much of the evidence for green being "restorative" comes from studies of natural scenes rather than of the hue itself. So the palette does not claim that green makes anyone calmer or smarter. It uses green for two things that are well supported:

1. **Learned meaning.** Green already means land, nature and "correct, go ahead". A geography game gets all three for free.
2. **Comfort over long sessions.** A Global game has 197 rounds. Dark, desaturated greens keep the screen low in glare, and the pale sage land gives an 11:1 contrast against the ocean so borders stay crisp without bright colours.

The accent is named after the aurora, the light seen near the poles. It is used sparingly: one primary button, the pole dot, and the medal.

**Keeping brand green apart from "correct" green.** With green as the brand colour, a green success state could get lost. Three separate greens solve it: pine for surfaces, aurora (yellow-green) for actions, and emerald (blue-green) for correct answers. They differ in hue and in lightness.

**Accessibility of the two game states.** Red and green are the pair most often confused in colour vision deficiency, so colour is never the only signal (WCAG 2.2, SC 1.4.1):

- Missed countries carry a **diagonal hatch**, so they differ from correct ones in texture.
- The pair follows MDN's advice of a bluish green against an orange-leaning red.
- The states step down in lightness: land → correct → missed → ocean, each about 2:1 against the next.
- In the interface, every status has an icon (check or cross) and a text label.

**Mastery map.** The lobby's mastery view uses a four-step ramp: sand `#E8C9A0` for countries still being learned, then three greens rising to the same emerald used for a correct answer. Sand rather than red, because a country you have not learned yet is not a mistake.

Measured contrast ratios: body text on panels 13.6:1, secondary text 7.6:1, button label on aurora 12.7:1.

## The planet medal

A perfect run earns a planet: the logo's globe, filled with aurora, with an orbital ring and an amber pole dot. It shares the 23.5° tilt, the stroke weight and the pole dot with the logo, so the reward reads as the brand rather than as a generic trophy. Unearned medals are shown as a faint outline of the same shape, which makes the goal visible before it is reached.

## Sources

- Elliot, A. J. (2015). *Color and psychological functioning: a review of theoretical and empirical work.* Frontiers in Psychology. https://pmc.ncbi.nlm.nih.gov/articles/PMC4383146
- W3C. *Understanding SC 1.4.1: Use of Color.* https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- MDN. *Use of color.* https://developer.mozilla.org/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Use_of_color
