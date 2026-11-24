export type ShareResult = 'shared' | 'copied' | 'saved' | 'cancelled' | 'failed'

// The phone's own share sheet first (WhatsApp, Instagram, Messages…); otherwise the clipboard.
// With an image the sheet sends the picture with the text as its caption; the link goes in the text,
// because several apps drop a separate `url` once a file is attached.
export async function shareResult(title: string, text: string, url: string, image: File | null): Promise<ShareResult> {
  const withImage: ShareData | null = image ? { title, text: `${text}\n${url}`, files: [image] } : null
  const attempts = [withImage, { title, text, url }].filter((data): data is ShareData => data !== null)
  if (typeof navigator.share === 'function') {
    for (const data of attempts) {
      if (navigator.canShare && !navigator.canShare(data)) continue
      try {
        await navigator.share(data)
        return 'shared'
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
        // Some browsers refuse the sheet (no user gesture, policy): try the next form, then the clipboard.
        break
      }
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`)
    return 'copied'
  } catch {
    return 'failed'
  }
}

export function saveImage(image: File): ShareResult {
  try {
    const href = URL.createObjectURL(image)
    const link = document.createElement('a')
    link.href = href
    link.download = image.name
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 10_000)
    return 'saved'
  } catch {
    return 'failed'
  }
}
