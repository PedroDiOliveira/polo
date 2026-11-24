export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

// The phone's own share sheet first (WhatsApp, Instagram, Messages…); otherwise the clipboard.
export async function shareLink(title: string, text: string, url: string): Promise<ShareResult> {
  const data: ShareData = { title, text, url }
  if (typeof navigator.share === 'function' && (navigator.canShare?.(data) ?? true)) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // Some browsers refuse the sheet (no user gesture, policy): fall back to copying.
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}
