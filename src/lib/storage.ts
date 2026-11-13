export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeLocal(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable (private mode, quota); progress then lives only in memory.
  }
}

// Asks the browser not to evict this origin's data under storage pressure.
export function requestPersistence(): void {
  void navigator.storage
    ?.persist?.()
    .catch(() => false)
}
