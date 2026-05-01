import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { useFitness } from '../context/FitnessContext'

function RecordCard({ icon, label, value, unit, date, sub }) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center text-xl">
          {icon}
        </div>
        {date && (
          <span className="text-xs text-gray-500">
            {format(parseISO(date), 'MMM d, yyyy')}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">
        {value} <span className="text-sm font-normal text-gray-400">{unit}</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-xs text-green-400 mt-1">{sub}</p>}
    </div>
  )
}

function ActivityCard({ type, count, totalMinutes, totalCalories }) {
  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
      <p className="font-semibold text-sm mb-3">{type}</p>
      <div className="flex justify-between">
        <div className="text-center">
          <p className="text-lg font-bold text-green-400">{count}</p>
          <p className="text-xs text-gray-400">sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-400">{totalMinutes}</p>
          <p className="text-xs text-gray-400">minutes</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-orange-400">{totalCalories}</p>
          <p className="text-xs text-gray-400">kcal</p>
        </div>
      </div>
    </div>
  )
}

export default function RecordsPage() {
  const { logs } = useFitness()

  const records = useMemo(() => {
    if (!logs.length) return null

    const longestSession = logs.reduce((best, l) =>
      (l.duration || 0) > (best.duration || 0) ? l : best, logs[0])

    const mostCalories = logs.reduce((best, l) =>
      (l.calories || 0) > (best.calories || 0) ? l : best, logs[0])

    const longestRun = logs
      .filter(l => l.type === 'Running' && l.distance)
      .reduce((best, l) =>
        (l.distance || 0) > (best?.distance || 0) ? l : best, null)

    const fastestPace = logs
      .filter(l => l.type === 'Running' && l.pace)
      .reduce((best, l) => {
        if (!best) return l
        const toSecs = p => {
          const [m, s] = p.split(':').map(Number)
          return m * 60 + (s || 0)
        }
        return toSecs(l.pace) < toSecs(best.pace) ? l : best
      }, null)

    const mostSets = logs
      .filter(l => l.sets)
      .reduce((best, l) =>
        (l.sets || 0) > (best?.sets || 0) ? l : best, null)

    return { longestSession, mostCalories, longestRun, fastestPace, mostSets }
  }, [logs])

  const activityBreakdown = useMemo(() => {
    const map = {}
    logs.forEach(l => {
      if (!map[l.type]) map[l.type] = { count: 0, totalMinutes: 0, totalCalories: 0 }
      map[l.type].count++
      map[l.type].totalMinutes += l.duration || 0
      map[l.type].totalCalories += l.calories || 0
    })
    return Object.entries(map)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([type, stats]) => ({ type, ...stats }))
  }, [logs])

  const totalDays = useMemo(() => {
    return new Set(logs.map(l => l.date)).size
  }, [logs])

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Records</h1>
        <p className="text-sm text-gray-400 mt-1">Your personal bests</p>
      </div>

      {/* Empty State */}
      {logs.length === 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-bold text-lg mb-1">No records yet</p>
          <p className="text-sm text-gray-400">
            Start logging workouts to track your personal bests
          </p>
        </div>
      )}

      {/* Overall Stats */}
      {logs.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { val: logs.length, label: 'Total Workouts', color: 'text-green-400' },
              { val: totalDays, label: 'Active Days', color: 'text-blue-400' },
              {
                val: Math.round(logs.reduce((s, l) => s + (l.duration || 0), 0) / 60),
                label: 'Total Hours',
                color: 'text-orange-400'
              },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl p-3 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Personal Bests */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
            Personal Bests
          </p>

          <div className="grid grid-cols-2 gap-3">
            <RecordCard
              icon="⏱"
              label="Longest Session"
              value={records.longestSession.duration}
              unit="min"
              date={records.longestSession.date}
              sub={records.longestSession.type}
            />
            <RecordCard
              icon="🔥"
              label="Most Calories"
              value={records.mostCalories.calories}
              unit="kcal"
              date={records.mostCalories.date}
              sub={records.mostCalories.type}
            />
            {records.longestRun && (
              <RecordCard
                icon="📍"
                label="Longest Run"
                value={records.longestRun.distance}
                unit="km"
                date={records.longestRun.date}
              />
            )}
            {records.fastestPace && (
              <RecordCard
                icon="⚡"
                label="Fastest Pace"
                value={records.fastestPace.pace}
                unit="min/km"
                date={records.fastestPace.date}
              />
            )}
            {records.mostSets && (
              <RecordCard
                icon="💪"
                label="Most Sets"
                value={records.mostSets.sets}
                unit="sets"
                date={records.mostSets.date}
                sub={records.mostSets.type}
              />
            )}
          </div>

          {/* Activity Breakdown */}
          {activityBreakdown.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-2">
                Activity Breakdown
              </p>
              <div className="flex flex-col gap-3">
                {activityBreakdown.map(a => (
                  <ActivityCard key={a.type} {...a} />
                ))}
              </div>
            </>
          )}
        </>
      )}

    </div>
  )
}