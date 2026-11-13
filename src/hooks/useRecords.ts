import { useCallback, useEffect, useState } from 'react'
import {
  applyResult,
  mergeRecords,
  parseRecords,
  serializeRecords,
  type RecordOutcome,
  type Records,
  type RoundResult,
} from '../game/records'
import { readCookie, writeCookie } from '../lib/cookies'
import { readLocal, writeLocal } from '../lib/storage'

const RECORDS_COOKIE = 'polo_pb'
const RECORDS_KEY = 'polo.records'

// Records live in the cookie and are mirrored in localStorage: if one store is cleared or expires, the other restores it.
function loadRecords(): Records {
  return mergeRecords(parseRecords(readCookie(RECORDS_COOKIE)), parseRecords(readLocal(RECORDS_KEY)))
}

export function useRecords(): { records: Records; submit: (result: RoundResult) => RecordOutcome } {
  const [records, setRecords] = useState<Records>(loadRecords)

  // Runs on load too, which re-syncs both stores and renews the cookie's expiry on every visit.
  useEffect(() => {
    const serialized = serializeRecords(records)
    writeCookie(RECORDS_COOKIE, serialized)
    writeLocal(RECORDS_KEY, serialized)
  }, [records])

  const submit = useCallback(
    (result: RoundResult) => {
      const outcome = applyResult(records, result)
      if (outcome.records !== records) setRecords(outcome.records)
      return outcome
    },
    [records],
  )

  return { records, submit }
}
