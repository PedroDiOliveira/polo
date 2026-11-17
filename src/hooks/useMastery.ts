import { useCallback, useEffect, useState } from 'react'
import { applyAnswer, parseMastery, type Mastery } from '../game/mastery'
import { CLUES, type Clue } from '../game/modes'
import { readLocal, writeLocal } from '../lib/storage'

export type MasteryByClue = Readonly<Record<Clue, Mastery>>

// Knowing a capital and knowing where a country is are different skills, so each game keeps its own map.
// The capital game keeps the original key, so progress saved before the country game existed carries over.
const MASTERY_KEYS: Record<Clue, string> = { capital: 'polo.mastery', country: 'polo.mastery.country' }

function loadMastery(): MasteryByClue {
  return { capital: parseMastery(readLocal(MASTERY_KEYS.capital)), country: parseMastery(readLocal(MASTERY_KEYS.country)) }
}

export function useMastery(): { mastery: MasteryByClue; record: (clue: Clue, code: string, hit: boolean) => void } {
  const [mastery, setMastery] = useState<MasteryByClue>(loadMastery)

  useEffect(() => {
    for (const clue of CLUES) writeLocal(MASTERY_KEYS[clue], JSON.stringify(mastery[clue]))
  }, [mastery])

  const record = useCallback((clue: Clue, code: string, hit: boolean) => {
    setMastery((current) => {
      const next = applyAnswer(current[clue], code, hit)
      return next === current[clue] ? current : { ...current, [clue]: next }
    })
  }, [])

  return { mastery, record }
}
