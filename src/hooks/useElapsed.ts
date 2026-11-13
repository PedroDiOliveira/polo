import { useEffect, useState } from 'react'

export function useElapsed(startedAt: number | null): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (startedAt === null) return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [startedAt])

  return startedAt === null ? 0 : Math.max(0, now - startedAt)
}
