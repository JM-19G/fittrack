import { useState } from 'react'
import { useFitness } from '../context/FitnessContext'
import { useGoalProgress } from '../hooks/useGoalProgress'

const UNITS = ['workouts', 'minutes', 'calories']
const PERIODS = ['weekly', 'monthly']

export default function GoalsPage() {
  const { goals, logs, addGoal, deleteGoal } = useFitness()
  const goalProgress = useGoalProgress(goals, logs)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'weekly', target: '', unit: 'workouts'
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleAdd = (e) => {
    e.preventDefault()
    if (!form.name || !form.target) return
    addGoal({
      name: form.name,
      type: form.type,
      target: parseInt(form.target),
      unit: form.unit,
    })
    setForm({ name: '', type: 'weekly', target: '', unit: 'workouts' })
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-sm text-gray-400 mt-1">Track your targets</p>
        </div>
        <button
          onClick={() => setAdding(p => !p)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition
            ${adding
              ? 'bg-gray-700 text-gray-300'
              : 'bg-green-400 text-gray-950 hover:bg-green-300'
            }`}
        >
          {adding ? 'Cancel' : '+ New Goal'}
        </button>
      </div>

      {/* Add Goal Form */}
      {adding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-900 border border-green-400/30 rounded-2xl p-4 flex flex-col gap-3"
        >
          <p className="text-xs font-semibold text-green-400 uppercase tracking-widest">New Goal</p>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Goal Name</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. 4 workouts per week"
              required
              className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Period</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-400 transition"
              >
                {PERIODS.map(p => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Target</label>
              <input
                type="number" min="1"
                value={form.target}
                onChange={e => set('target', e.target.value)}
                placeholder="4" required
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Unit</label>
              <select
                value={form.unit}
                onChange={e => set('unit', e.target.value)}
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-400 transition"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-400 text-gray-950 font-bold rounded-xl py-3 text-sm hover:bg-green-300 transition"
          >
            Create Goal
          </button>
        </form>
      )}

      {/* Empty State */}
      {goalProgress.length === 0 && (
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="font-bold text-lg mb-1">No goals yet</p>
          <p className="text-sm text-gray-400">Set a goal to start tracking your progress</p>
        </div>
      )}

      {/* Goals List */}
      {goalProgress.map(g => {
        const isWeekly = g.type === 'weekly'
        const barColor = g.done ? 'bg-green-400' : isWeekly ? 'bg-blue-400' : 'bg-orange-400'
        const badgeColor = isWeekly
          ? 'bg-blue-400/10 text-blue-400'
          : 'bg-orange-400/10 text-orange-400'

        return (
          <div
            key={g.id}
            className="bg-gray-900 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-sm mb-1.5">{g.name}</p>
                <div className="flex gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                    {g.type}
                  </span>
                  {g.done && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-400/10 text-green-400">
                      ✓ Complete
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteGoal(g.id)}
                className="text-gray-500 hover:text-red-400 text-xl leading-none transition"
              >
                ×
              </button>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">
                {g.current} / {g.target} {g.unit}
              </span>
              <span className={`text-base font-bold ${g.done ? 'text-green-400' : 'text-white'}`}>
                {g.percentage}%
              </span>
            </div>

            <div className="h-2 bg-gray-700 rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${g.percentage}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              {g.done
                ? `🎉 Goal reached! ${g.current - g.target} ${g.unit} ahead`
                : `${g.target - g.current} more ${g.unit} needed this ${g.type === 'weekly' ? 'week' : 'month'}`
              }
            </p>
          </div>
        )
      })}

    </div>
  )
}