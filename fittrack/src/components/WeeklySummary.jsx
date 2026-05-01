import { useMemo } from 'react'
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'
import { useFitness } from '../context/FitnessContext'

export default function WeeklySummary() {
  const { logs } = useFitness()

  const { thisWeek, lastWeek } = useMemo(() => {
    const now = new Date()

    const thisWeekInterval = {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    }

    const lastWeekStart = subDays(thisWeekInterval.start, 7)
    const lastWeekInterval = {
      start: lastWeekStart,
      end: subDays(thisWeekInterval.start, 1),
    }

    const filterLogs = (interval) =>
      logs.filter(l => {
        try { return isWithinInterval(parseISO(l.date), interval) }
        catch { return false }
      })

    const thisWeekLogs = filterLogs(thisWeekInterval)
    const lastWeekLogs = filterLogs(lastWeekInterval)

    const summarise = (l) => ({
      workouts: l.length,
      minutes: l.reduce((s, x) => s + (x.duration || 0), 0),
      calories: l.reduce((s, x) => s + (x.calories || 0), 0),
      activeDays: new Set(l.map(x => x.date)).size,
    })

    return {
      thisWeek: summarise(thisWeekLogs),
      lastWeek: summarise(lastWeekLogs),
    }
  }, [logs])

  const getDiff = (current, previous) => {
    if (previous === 0) return null
    const diff = Math.round(((current - previous) / previous) * 100)
    return diff
  }

  const metrics = [
    {
      label: 'Workouts',
      current: thisWeek.workouts,
      previous: lastWeek.workouts,
      unit: '',
      color: 'text-green-400',
      icon: '🏋️',
    },
    {
      label: 'Minutes',
      current: thisWeek.minutes,
      previous: lastWeek.minutes,
      unit: 'min',
      color: 'text-blue-400',
      icon: '⏱',
    },
    {
      label: 'Calories',
      current: thisWeek.calories,
      previous: lastWeek.calories,
      unit: 'kcal',
      color: 'text-orange-400',
      icon: '🔥',
    },
    {
      label: 'Active Days',
      current: thisWeek.activeDays,
      previous: lastWeek.activeDays,
      unit: 'days',
      color: 'text-purple-400',
      icon: '📅',
    },
  ]

  const overallChange = getDiff(thisWeek.workouts, lastWeek.workouts)

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Weekly Summary
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            This week vs last week
          </p>
        </div>
        {overallChange !== null && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
            ${overallChange >= 0
              ? 'bg-green-400/10 text-green-400'
              : 'bg-red-400/10 text-red-400'
            }`}>
            {overallChange >= 0 ? '▲' : '▼'} {Math.abs(overallChange)}%
          </span>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => {
          const diff = getDiff(m.current, m.previous)
          const improved = diff !== null && diff >= 0

          return (
            <div key={i} className="bg-gray-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{m.icon}</span>
                <span className="text-xs text-gray-400">{m.label}</span>
              </div>
              <p className={`text-xl font-bold ${m.color}`}>
                {m.current}
                <span className="text-xs font-normal text-gray-400 ml-1">{m.unit}</span>
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Last: {m.previous} {m.unit}
                </p>
                {diff !== null && (
                  <span className={`text-xs font-medium ${improved ? 'text-green-400' : 'text-red-400'}`}>
                    {improved ? '▲' : '▼'} {Math.abs(diff)}%
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Motivational Message */}
      <div className="mt-4 pt-4 border-t border-white/5">
        {thisWeek.workouts === 0 ? (
          <p className="text-xs text-gray-400 text-center">
            No workouts logged this week yet. Let's get moving! 💪
          </p>
        ) : overallChange === null ? (
          <p className="text-xs text-gray-400 text-center">
            Great start! Keep building your momentum 🚀
          </p>
        ) : overallChange >= 0 ? (
          <p className="text-xs text-green-400 text-center">
            You're doing better than last week. Keep it up! 🔥
          </p>
        ) : (
          <p className="text-xs text-orange-400 text-center">
            Slightly behind last week. You've got this! ⚡
          </p>
        )}
      </div>

    </div>
  )
}