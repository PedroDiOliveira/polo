// Vercel Routing Middleware. A shared result link (/?mode=…&seed=…&score=… or /?daily=…) gets the game's own
// page with social tags that describe the result, so a chat app previews "18/20 · Capitals · Africa" with its
// picture instead of the generic card. Every other request passes through to the static files untouched.
export const config = { matcher: ['/', '/pt', '/pt/'] }

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url)
  // Every result link carries its total; anything else passes through before any code is loaded.
  if (!url.searchParams.has('total')) return undefined

  // Whatever goes wrong here, the page is served as usual: only the preview is lost, never the game.
  try {
    // Loaded lazily, so a failure in the preview code can never take the home page down with it.
    const { imageQuery, parsePreview, withPreview } = await import('./src/share/preview.js')
    const preview = parsePreview(url.pathname, url.search)
    if (!preview) return undefined

    // The same static shell the player would get; without a query this request passes straight through.
    const shell = await fetch(new URL(preview.locale === 'pt' ? '/pt' : '/', url.origin))
    if (!shell.ok) return undefined

    const image = `${url.origin}/api/og?${imageQuery(preview.locale, url.search)}`
    return new Response(withPreview(await shell.text(), preview, image), {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' },
    })
  } catch (error) {
    console.error('middleware: preview failed', error)
    return undefined
  }
}
