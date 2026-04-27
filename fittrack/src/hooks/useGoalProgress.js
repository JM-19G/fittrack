import { useMemo } from 'react'
import {
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  isWithinInterval, parseISO
} from 'date-fns'

export function useGoalProgress(goals, logs) {
  return useMemo(() => {
    const now = new Date()
    const weekInterval = {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 })
    }
    const monthInterval = {
      start: startOfMonth(now),
      end: endOfMonth(now)
    }

    return goals.map(goal => {
      const interval = goal.type === 'weekly' ? weekInterval : monthInterval
      const relevant = logs.filter(l => {
        try { return isWithinInterval(parseISO(l.date), interval) }
        catch { return false }
      })

      const count = goal.unit === 'workouts' ? relevant.length
        : goal.unit === 'minutes' ? relevant.reduce((s, l) => s + (l.duration || 0), 0)
        : goal.unit === 'calories' ? relevant.reduce((s, l) => s + (l.calories || 0), 0)
        : relevant.length

      const pct = Math.min(100, Math.round((count / goal.target) * 100))

      return {
        ...goal,
        current: count,
        percentage: pct,
        done: count >= goal.target
      }
    })
  }, [goals, logs])
}