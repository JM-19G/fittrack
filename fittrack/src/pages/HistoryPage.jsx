import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { useFitness } from '../context/FitnessContext'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { exportLogsAsCSV } from '../utils/exportCSV'

const TYPES = ['All', 'Running', 'Cycling', 'Walking', 'Swimming', 'Strength Training', 'HIIT', 'Yoga', 'Other']

export default function HistoryPage() {
  const { logs, deleteLog } = useFitness()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = useMemo(() => {
    let l = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
    if (filter !== 'All') {
      l = l.filter(log =>
        log.type === filter ||
        (filter === 'Other' && !TYPES.slice(1, -1).includes(log.type))
      )
    }
    if (search) {
      l = l.filter(log =>
        log.type.toLowerCase().includes(search.toLowerCase()) ||
        log.notes?.toLowerCase().includes(search.toLowerCase())
      )
    }
    return l
  }, [logs, filter, search])

  const grouped = useMemo(() => {
    const groups = {}
    for (const log of filtered) {
      if (!groups[log.date]) groups[log.date] = []
      groups[log.date].push(log)
    }
    return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a))
  }, [filtered])

  const navigate = useNavigate()

  const { user } = useAuth()

  const { showToast } = useToast()

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-sm text-gray-400 mt-1">{logs.length} total entries</p>
        </div>
        <button
          onClick={() => {
            const success = exportLogsAsCSV(logs, user?.name || 'user')
            if (success) showToast('Workout history exported!', 'success')
            else showToast('No logs to export', 'warning')
          }}
         className="flex items-center gap-2 bg-gray-900 border border-white/10 text-gray-400 hover:text-green-400 hover:border-green-400/30 px-3 py-2 rounded-xl text-xs font-medium transition"
         >
          ⬇ Export CSV
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search workouts..."
        className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
      />

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs border transition
              ${filter === t
                ? 'bg-green-400 text-gray-950 border-green-400 font-semibold'
                : 'bg-gray-900 text-gray-400 border-white/10 hover:text-white'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {grouped.length === 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-10 text-center text-gray-400">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-sm">No workouts found</p>
        </div>
      )}

      {/* Grouped Logs */}
      {grouped.map(([date, dayLogs]) => (
        <div key={date}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            {format(parseISO(date), 'EEEE, MMM d yyyy')}
          </p>
          <div className="flex flex-col gap-2">
            {dayLogs.map(log => (
              <div
                key={log.id}
                className="bg-gray-900 border border-white/10 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-2">{log.type}</p>
                    <div className="flex flex-wrap gap-3">
                      {log.duration > 0 && (
                        <span className="text-xs text-blue-400">⏱ {log.duration} min</span>
                      )}
                      {log.calories > 0 && (
                        <span className="text-xs text-orange-400">🔥 {log.calories} kcal</span>
                      )}
                      {log.distance && (
                        <span className="text-xs text-green-400">📍 {log.distance} km</span>
                      )}
                      {log.pace && (
                        <span className="text-xs text-gray-400">🏃 {log.pace}/km</span>
                      )}
                      {log.sets && (
                        <span className="text-xs text-gray-400">
                          {log.sets}×{log.reps || '?'} sets
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-xs text-gray-400 mt-2 italic">"{log.notes}"</p>
                    )}
                  </div>

                  {/* Delete */}
                  {confirmDelete === log.id ? (
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => { deleteLog(log.id); setConfirmDelete(null) }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30"
                       >
                       Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 border border-white/10"
                       >
                       Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => navigate('/log', { state: { log } })}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-400/10 text-blue-400 border border-blue-400/20 hover:bg-blue-400/20 transition"
                       >
                       Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(log.id)}
                        className="text-gray-500 hover:text-red-400 text-xl leading-none transition"
                       >
                       ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

    </div>
  )
}