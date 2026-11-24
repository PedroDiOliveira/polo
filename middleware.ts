import { imageQuery, parsePreview, withPreview } from './src/share/preview'

// Vercel Routing Middleware. A shared result link (/?mode=…&seed=…&score=… or /?daily=…) gets the game's own
// page with social tags that describe the result, so a chat app previews "18/20 · Capitals · Africa" with its
// picture instead of the generic card. Every other request passes through to the static files untouched.
export const config = { matcher: ['/', '/pt', '/pt/'] }

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url)
  const preview = parsePreview(url.pathname, url.search)
  if (!preview) return undefined

  // The same static shell the player would get; without a query this request passes straight through.
  const shell = await fetch(new URL(preview.locale === 'pt' ? '/pt' : '/', url.origin)).catch(() => null)
  // If the shell cannot be read, serve the page as usual: only the preview is lost, never the game.
  if (!shell?.ok) return undefined

  const image = `${url.origin}/api/og?${imageQuery(preview.locale, url.search)}`
  return new Response(withPreview(await shell.text(), preview, image), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate' },
  })
}
