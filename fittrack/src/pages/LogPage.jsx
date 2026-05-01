import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { useFitness } from '../context/FitnessContext'
import { useToast } from '../components/Toast'

const EXERCISE_TYPES = [
  'Running', 'Cycling', 'Walking', 'Swimming', 'Strength Training',
  'HIIT', 'Yoga', 'Pilates', 'Boxing', 'Dance', 'Basketball', 'Football',
  'Tennis', 'Jump Rope', 'Rowing', 'Hiking', 'CrossFit', 'Other',
]

export default function LogPage() {
  const { addLog, updateLog } = useFitness()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const editingLog = location.state?.log || null
  const isEditing = !!editingLog

  const [form, setForm] = useState({
    type: '',
    customType: '',
    duration: '',
    calories: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    sets: '',
    reps: '',
    distance: '',
    pace: '',
  })

  const [notifSet, setNotifSet] = useState(false)
  const [reminderTime, setReminderTime] = useState('20:00')

  useEffect(() => {
    if (editingLog) {
      const isKnownType = EXERCISE_TYPES.includes(editingLog.type)
      setForm({
        type: isKnownType ? editingLog.type : 'Other',
        customType: isKnownType ? '' : editingLog.type,
        duration: editingLog.duration || '',
        calories: editingLog.calories || '',
        notes: editingLog.notes || '',
        date: editingLog.date || format(new Date(), 'yyyy-MM-dd'),
        sets: editingLog.sets || '',
        reps: editingLog.reps || '',
        distance: editingLog.distance || '',
        pace: editingLog.pace || '',
      })
    }
  }, [editingLog])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.type && !form.customType) return

    const entry = {
      type: form.customType || form.type,
      duration: parseInt(form.duration) || 0,
      calories: parseInt(form.calories) || 0,
      notes: form.notes,
      date: form.date,
      sets: form.sets ? parseInt(form.sets) : undefined,
      reps: form.reps ? parseInt(form.reps) : undefined,
      distance: form.distance ? parseFloat(form.distance) : undefined,
      pace: form.pace || undefined,
    }

    if (isEditing) {
      updateLog({ ...editingLog, ...entry })
      showToast('Workout updated successfully!', 'success')
    } else {
      addLog(entry)
      showToast('Workout logged successfully!', 'success')
    }

    navigate('/history')
  }

  const requestReminder = async () => {
    if (!('Notification' in window)) {
      showToast('Notifications not supported in this browser', 'error')
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
      showToast(`Reminder set for ${reminderTime}`, 'info')
    } else {
      showToast('Notification permission denied', 'warning')
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? 'Edit Workout' : 'Log Workout'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEditing ? 'Update your workout entry' : 'Record your activity'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Exercise Type */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Exercise Type
          </p>
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
            {[
              { key: 'duration', label: 'Duration (min) *', placeholder: '30', type: 'number', required: true },
              { key: 'calories', label: 'Calories (kcal)', placeholder: '250', type: 'number' },
              { key: 'distance', label: 'Distance (km)', placeholder: '5.0', type: 'number', step: '0.1' },
              { key: 'pace', label: 'Pace (min/km)', placeholder: '5:30', type: 'text' },
              { key: 'sets', label: 'Sets', placeholder: '3', type: 'number' },
              { key: 'reps', label: 'Reps', placeholder: '12', type: 'number' },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">{f.label}</label>
                <input
                  type={f.type}
                  step={f.step}
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
                />
              </div>
            ))}
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

        {/* Reminder — only show when logging new workout */}
        {!isEditing && (
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              🔔 Daily Reminder
            </p>
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
            <p className="text-xs text-gray-500 mt-2">
              Get notified if you haven't logged by this time
            </p>
          </div>
        )}

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
          {isEditing ? 'Update Workout' : 'Save Workout'}
        </button>

      </form>
    </div>
  )
}