import { useCallback, useState } from 'react'
import { applyResult, parseRecords, serializeRecords, type RecordOutcome, type Records, type RoundResult } from '../game/records'
import { readCookie, writeCookie } from '../lib/cookies'

const RECORDS_COOKIE = 'polo_pb'

export function useRecords(): { records: Records; submit: (result: RoundResult) => RecordOutcome } {
  const [records, setRecords] = useState<Records>(() => parseRecords(readCookie(RECORDS_COOKIE)))

  const submit = useCallback(
    (result: RoundResult) => {
      const outcome = applyResult(records, result)
      if (outcome.records !== records) {
        writeCookie(RECORDS_COOKIE, serializeRecords(outcome.records))
        setRecords(outcome.records)
      }
      return outcome
    },
    [records],
  )

  return { records, submit }
}
