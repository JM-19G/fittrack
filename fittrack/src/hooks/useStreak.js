import { useMemo } from 'react'
import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns'

export function useStreak(logs) {
  return useMemo(() => {
    if (!logs || !logs.length) return { current: 0, longest: 0, activeDays: new Set() }

    const activeDays = new Set(logs.map(l => l.date))
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    let current = 0
    let check = activeDays.has(today) ? today : activeDays.has(yesterday) ? yesterday : null

    if (check) {
      let d = new Date(check)
      while (activeDays.has(format(d, 'yyyy-MM-dd'))) {
        current++
        d = subDays(d, 1)
      }
    }

    const sorted = [...activeDays].sort()
    let longest = 0, run = 0, prev = null
    for (const day of sorted) {
      if (prev && differenceInCalendarDays(parseISO(day), parseISO(prev)) === 1) {
        run++
      } else {
        run = 1
      }
      if (run > longest) longest = run
      prev = day
    }

    return { current, longest, activeDays }
  }, [logs])
}