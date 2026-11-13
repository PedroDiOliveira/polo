import { useCallback, useEffect, useState } from 'react'
import { applyAnswer, parseMastery, type Mastery } from '../game/mastery'
import { readLocal, writeLocal } from '../lib/storage'

const MASTERY_KEY = 'polo.mastery'

export function useMastery(): { mastery: Mastery; record: (code: string, hit: boolean) => void } {
  const [mastery, setMastery] = useState<Mastery>(() => parseMastery(readLocal(MASTERY_KEY)))

  useEffect(() => {
    writeLocal(MASTERY_KEY, JSON.stringify(mastery))
  }, [mastery])

  const record = useCallback((code: string, hit: boolean) => {
    setMastery((current) => applyAnswer(current, code, hit))
  }, [])

  return { mastery, record }
}
