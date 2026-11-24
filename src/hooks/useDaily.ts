import { useCallback, useEffect, useState } from 'react'
import { dayKey, parseDailyLog, type DailyLog, type DailyResult, type DayKey } from '../game/daily'
import { readLocal, writeLocal } from '../lib/storage'

const DAILY_KEY = 'polo.daily'

export function useDaily(): { log: DailyLog; record: (day: DayKey, result: DailyResult) => void } {
  const [log, setLog] = useState<DailyLog>(() => parseDailyLog(readLocal(DAILY_KEY)))

  useEffect(() => writeLocal(DAILY_KEY, JSON.stringify(log)), [log])

  // One attempt per day: a second finish of the same day (it cannot happen from the UI) keeps the first.
  const record = useCallback((day: DayKey, result: DailyResult) => {
    setLog((current) => (current[day] ? current : { ...current, [day]: result }))
  }, [])

  return { log, record }
}

// Today's key, kept current: a lobby left open over midnight moves on to the new daily by itself.
export function useToday(): DayKey {
  const [today, setToday] = useState(() => dayKey(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setToday(dayKey(new Date())), 60_000)
    return () => window.clearInterval(id)
  }, [])
  return today
}
