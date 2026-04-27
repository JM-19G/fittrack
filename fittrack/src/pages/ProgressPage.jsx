import { useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format, subDays, subMonths, eachWeekOfInterval, endOfWeek, parseISO } from 'date-fns'
import { useFitness } from '../context/FitnessContext'
import { useStreak } from '../hooks/useStreak'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const { logs } = useFitness()
  const { current: streak, longest } = useStreak(logs)
  const [view, setView] = useState('30d')

  const daily30 = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
      const dayLogs = logs.filter(l => l.date === d)
      return {
        date: format(subDays(new Date(), 29 - i), 'MMM d'),
        workouts: dayLogs.length,
        minutes: dayLogs.reduce((s, l) => s + (l.duration || 0), 0),
        calories: dayLogs.reduce((s, l) => s + (l.calories || 0), 0),
      }
    })
  }, [logs])

  const weekly = useMemo(() => {
    const end = new Date()
    const start = subMonths(end, 3)
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      const weekLogs = logs.filter(l => {
        const d = parseISO(l.date)
        return d >= weekStart && d <= weekEnd
      })
      return {
        date: format(weekStart, 'MMM d'),
        workouts: weekLogs.length,
        minutes: weekLogs.reduce((s, l) => s + (l.duration || 0), 0),
        calories: weekLogs.reduce((s, l) => s + (l.calories || 0), 0),
      }
    })
  }, [logs])

  const data = view === '30d' ? daily30 : weekly

  const typeDist = useMemo(() => {
    const counts = {}
    const last30 = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    logs.filter(l => l.date >= last30).forEach(l => {
      counts[l.type] = (counts[l.type] || 0) + 1
    })
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 6)
  }, [logs])

  const totalMins = logs.reduce((s, l) => s + (l.duration || 0), 0)
  const totalCals = logs.reduce((s, l) => s + (l.calories || 0), 0)

  const typeColors = ['#4ade80', '#60a5fa', '#fb923c', '#f472b6', '#a78bfa', '#34d399']

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-sm text-gray-400 mt-1">Your fitness journey</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { val: `🔥 ${streak}`, label: 'day streak', color: 'text-green-400' },
          { val: longest, label: 'best streak', color: 'text-orange-400' },
          { val: `${Math.round(totalMins / 60)}h`, label: 'total time', color: 'text-blue-400' },
          { val: `${(totalCals / 1000).toFixed(1)}k`, label: 'kcal burned', color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        {[['30d', '30 Days'], ['weekly', '12 Weeks']].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`px-4 py-2 rounded-full text-sm border transition
              ${view === k
                ? 'bg-green-400 text-gray-950 border-green-400 font-semibold'
                : 'bg-gray-900 text-gray-400 border-white/10 hover:text-white'
              }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Activity Area Chart */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Workouts & Duration
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gMins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={view === '30d' ? 4 : 1}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#4ade80" strokeWidth={2} fill="url(#gMins)" />
            <Area type="monotone" dataKey="calories" name="Calories" stroke="#60a5fa" strokeWidth={2} fill="url(#gCals)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Frequency Bar Chart */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Workout Frequency
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={view === '30d' ? 4 : 1}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="workouts" name="Workouts" fill="#4ade80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Breakdown */}
      {typeDist.length > 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Top Exercises (Last 30 Days)
          </p>
          <div className="flex flex-col gap-3">
            {typeDist.map(([type, count], i) => {
              const max = typeDist[0][1]
              return (
                <div key={type}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium">{type}</span>
                    <span className="text-xs" style={{ color: typeColors[i] }}>
                      {count} sessions
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / max) * 100}%`,
                        background: typeColors[i]
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}