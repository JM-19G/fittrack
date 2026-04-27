import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { useFitness } from '../context/FitnessContext'
import { useStreak } from '../hooks/useStreak'
import { useGoalProgress } from '../hooks/useGoalProgress'

export default function Dashboard() {
  const { user } = useAuth()
  const { logs, goals } = useFitness()
  const { current: streak, longest } = useStreak(logs)
  const goalProgress = useGoalProgress(goals, logs)

  const today = format(new Date(), 'yyyy-MM-dd')

  const todayLogs = useMemo(() => logs.filter(l => l.date === today), [logs, today])
  const todayCalories = todayLogs.reduce((s, l) => s + (l.calories || 0), 0)
  const todayMinutes = todayLogs.reduce((s, l) => s + (l.duration || 0), 0)

  const weekLogs = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
      const dayLogs = logs.filter(l => l.date === d)
      return {
        date: d,
        day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][new Date(d).getDay() === 0 ? 6 : new Date(d).getDay() - 1],
        count: dayLogs.length,
        cals: dayLogs.reduce((s, l) => s + (l.calories || 0), 0),
      }
    })
  }, [logs])

  const maxCals = Math.max(...weekLogs.map(d => d.cals), 1)

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <p className="text-sm text-gray-400">{greet()}</p>
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.name?.split(' ')[0]} <span className="text-green-400">💪</span>
        </h1>
      </div>

      {/* Streak Banner */}
      {streak > 0 && (
        <div className="bg-green-400/10 border border-green-400/25 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">CURRENT STREAK</p>
            <p className="text-3xl font-bold text-green-400">🔥 {streak} {streak === 1 ? 'day' : 'days'}</p>
            <p className="text-xs text-gray-400 mt-1">Best: {longest} days</p>
          </div>
          <div className="text-right">
            {todayLogs.length > 0
              ? <span className="text-green-400 text-sm font-medium">✓ Logged today</span>
              : <Link to="/log" className="text-sm font-medium text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full">Log now →</Link>
            }
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: todayMinutes, label: 'mins today', color: 'text-blue-400' },
          { val: todayCalories, label: 'kcal today', color: 'text-orange-400' },
          { val: logs.length, label: 'total logs', color: 'text-white' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 7-Day Activity */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">7-Day Activity</p>
        <div className="flex items-end gap-2 h-16">
          {weekLogs.map((d, i) => {
            const isToday = d.date === today
            const h = d.cals ? Math.max(8, Math.round((d.cals / maxCals) * 56)) : 4
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  style={{ height: h }}
                  className={`w-full rounded-t transition-all ${isToday ? 'bg-green-400' : d.count ? 'bg-blue-400' : 'bg-gray-700'}`}
                />
                <span className={`text-xs ${isToday ? 'text-green-400' : 'text-gray-500'}`}>{d.day}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Goals Preview */}
      {goalProgress.length > 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Active Goals</p>
            <Link to="/goals" className="text-xs text-green-400 font-medium">See all →</Link>
          </div>
          <div className="flex flex-col gap-4">
            {goalProgress.slice(0, 2).map(g => (
              <div key={g.id}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium">{g.name}</span>
                  <span className={`text-xs ${g.done ? 'text-green-400' : 'text-gray-400'}`}>
                    {g.current}/{g.target} {g.unit}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all ${g.done ? 'bg-green-400' : 'bg-blue-400'}`}
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Workouts */}
      {todayLogs.length > 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Today's Activity</p>
          <div className="flex flex-col divide-y divide-white/5">
            {todayLogs.map(l => (
              <div key={l.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="text-sm font-medium">{l.type}</p>
                  {l.notes && <p className="text-xs text-gray-400 mt-0.5 italic">"{l.notes}"</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-400 font-medium">{l.duration} min</p>
                  {l.calories > 0 && <p className="text-xs text-gray-400">{l.calories} kcal</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {logs.length === 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">🏃</p>
          <p className="font-bold text-lg mb-1">Start your journey</p>
          <p className="text-sm text-gray-400 mb-5">Log your first workout to begin tracking progress</p>
          <Link
            to="/log"
            className="inline-block bg-green-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-green-300 transition"
          >
            Log Workout
          </Link>
        </div>
      )}

    </div>
  )
}