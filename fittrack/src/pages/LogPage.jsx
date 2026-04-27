import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useFitness } from '../context/FitnessContext'

const EXERCISE_TYPES = [
  'Running', 'Cycling', 'Walking', 'Swimming', 'Strength Training',
  'HIIT', 'Yoga', 'Pilates', 'Boxing', 'Dance', 'Basketball', 'Football',
  'Tennis', 'Jump Rope', 'Rowing', 'Hiking', 'CrossFit', 'Other',
]

export default function LogPage() {
  const { addLog } = useFitness()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    type: '', customType: '', duration: '', calories: '',
    notes: '', date: format(new Date(), 'yyyy-MM-dd'),
    sets: '', reps: '', distance: '', pace: '',
  })
  const [success, setSuccess] = useState(false)
  const [notifSet, setNotifSet] = useState(false)
  const [reminderTime, setReminderTime] = useState('20:00')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.type && !form.customType) return
    addLog({
      type: form.customType || form.type,
      duration: parseInt(form.duration) || 0,
      calories: parseInt(form.calories) || 0,
      notes: form.notes,
      date: form.date,
      sets: form.sets ? parseInt(form.sets) : undefined,
      reps: form.reps ? parseInt(form.reps) : undefined,
      distance: form.distance ? parseFloat(form.distance) : undefined,
      pace: form.pace || undefined,
    })
    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  const requestReminder = async () => {
    if (!('Notification' in window)) {
      alert('Notifications not supported in this browser')
      return
    }
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      const [h, m] = reminderTime.split(':').map(Number)
      const target = new Date()
      target.setHours(h, m, 0, 0)
      if (target <= new Date()) target.setDate(target.getDate() + 1)
      const delay = target - new Date()
      setTimeout(() => {
        new Notification('FitTrack Reminder 🏋️', {
          body: "You haven't logged any activity today. Time to move!",
        })
      }, delay)
      setNotifSet(true)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-6xl">✅</p>
        <p className="text-2xl font-bold text-green-400">Workout Logged!</p>
        <p className="text-sm text-gray-400">Redirecting to dashboard…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Workout</h1>
        <p className="text-sm text-gray-400 mt-1">Record your activity</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Exercise Type */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Exercise Type</p>
          <div className="flex flex-wrap gap-2">
            {EXERCISE_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition
                  ${form.type === t
                    ? 'bg-green-400 text-gray-950 border-green-400 font-semibold'
                    : 'bg-gray-800 text-gray-400 border-white/10 hover:text-white'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
          {form.type === 'Other' && (
            <input
              value={form.customType}
              onChange={e => set('customType', e.target.value)}
              placeholder="Enter exercise name"
              className="mt-3 w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
            />
          )}
        </div>

        {/* Details */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Details</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Duration (min) *</label>
              <input
                type="number" min="1" max="600"
                value={form.duration}
                onChange={e => set('duration', e.target.value)}
                placeholder="30" required
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Calories (kcal)</label>
              <input
                type="number" min="0"
                value={form.calories}
                onChange={e => set('calories', e.target.value)}
                placeholder="250"
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Distance (km)</label>
              <input
                type="number" step="0.1"
                value={form.distance}
                onChange={e => set('distance', e.target.value)}
                placeholder="5.0"
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Pace (min/km)</label>
              <input
                type="text"
                value={form.pace}
                onChange={e => set('pace', e.target.value)}
                placeholder="5:30"
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Sets</label>
              <input
                type="number" min="1"
                value={form.sets}
                onChange={e => set('sets', e.target.value)}
                placeholder="3"
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Reps</label>
              <input
                type="number" min="1"
                value={form.reps}
                onChange={e => set('reps', e.target.value)}
                placeholder="12"
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-400 transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="How did it feel? Any PRs?"
              rows={2}
              className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition resize-none"
            />
          </div>
        </div>

        {/* Reminder */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">🔔 Daily Reminder</p>
          <div className="flex gap-3 items-center">
            <input
              type="time"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-400 transition"
            />
            <button
              type="button"
              onClick={requestReminder}
              className={`text-sm px-4 py-2.5 rounded-lg border transition whitespace-nowrap
                ${notifSet
                  ? 'bg-green-400/10 text-green-400 border-green-400/30'
                  : 'bg-gray-800 text-gray-400 border-white/10 hover:text-white'
                }`}
            >
              {notifSet ? '✓ Set!' : 'Set Reminder'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Get notified if you haven't logged by this time</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!form.type && !form.customType}
          className={`w-full py-4 rounded-2xl font-bold text-base transition
            ${(form.type || form.customType)
              ? 'bg-green-400 text-gray-950 hover:bg-green-300'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
        >
          Save Workout
        </button>

      </form>
    </div>
  )
}