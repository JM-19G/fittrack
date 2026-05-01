import { useState, useMemo } from 'react'
import { useFitness } from '../context/FitnessContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

function BMIGauge({ bmi }) {
  const getCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' }
    if (bmi < 25) return { label: 'Normal', color: 'text-green-400' }
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-400' }
    return { label: 'Obese', color: 'text-red-400' }
  }

  const category = getCategory(bmi)
  const position = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100))

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        BMI Calculator
      </p>
      <div className="text-center mb-4">
        <p className={`text-4xl font-bold ${category.color}`}>{bmi}</p>
        <p className={`text-sm font-medium mt-1 ${category.color}`}>{category.label}</p>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden mb-2"
        style={{ background: 'linear-gradient(to right, #60a5fa, #4ade80, #fb923c, #f87171)' }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-gray-900 transition-all duration-500"
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { profile, updateProfile, logs } = useFitness()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    weight: profile.weight || '',
    height: profile.height || '',
    age: profile.age || '',
    gender: profile.gender || '',
    dailyCalorieGoal: profile.dailyCalorieGoal || '2000',
    hydrationGoal: profile.hydrationGoal || '2000',
    fitnessGoal: profile.fitnessGoal || '',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const bmi = useMemo(() => {
    if (!form.weight || !form.height) return null
    const h = parseFloat(form.height) / 100
    return (parseFloat(form.weight) / (h * h)).toFixed(1)
  }, [form.weight, form.height])

  const totalWorkouts = logs.length
  const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0)
  const totalCalories = logs.reduce((s, l) => s + (l.calories || 0), 0)

  const handleSave = () => {
    updateProfile(form)
    showToast('Profile updated successfully!', 'success')
  }

  const GOAL_LABELS = {
    lose_weight: '🔥 Lose Weight',
    build_muscle: '💪 Build Muscle',
    improve_endurance: '🏃 Improve Endurance',
    stay_active: '⚡ Stay Active',
    reduce_stress: '🧘 Reduce Stress',
    eat_better: '🥗 Eat Better',
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account and stats</p>
      </div>

      {/* Account Card */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-gray-950 font-bold text-xl flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-bold text-base">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          {form.fitnessGoal && (
            <p className="text-xs text-green-400 mt-1">{GOAL_LABELS[form.fitnessGoal]}</p>
          )}
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: totalWorkouts, label: 'Workouts', color: 'text-green-400' },
          { val: `${Math.round(totalMinutes / 60)}h`, label: 'Total Time', color: 'text-blue-400' },
          { val: `${(totalCalories / 1000).toFixed(1)}k`, label: 'Kcal Burned', color: 'text-orange-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-white/10 rounded-2xl p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* BMI */}
      {bmi && <BMIGauge bmi={bmi} />}

      {/* Body Stats */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Body Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'weight', label: 'Weight (kg)', placeholder: '70', type: 'number' },
            { key: 'height', label: 'Height (cm)', placeholder: '175', type: 'number' },
            { key: 'age', label: 'Age', placeholder: '25', type: 'number' },
          ].map(f => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Gender</label>
            <select
              value={form.gender}
              onChange={e => set('gender', e.target.value)}
              className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-400 transition"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daily Targets */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Daily Targets</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Calorie Goal (kcal)</label>
            <input
              type="number"
              value={form.dailyCalorieGoal}
              onChange={e => set('dailyCalorieGoal', e.target.value)}
              placeholder="2000"
              className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400">Water Goal (ml)</label>
            <input
              type="number"
              value={form.hydrationGoal}
              onChange={e => set('hydrationGoal', e.target.value)}
              placeholder="2000"
              className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-green-400 text-gray-950 font-bold rounded-2xl py-4 text-base hover:bg-green-300 transition"
      >
        Save Profile
      </button>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full bg-gray-900 border border-red-500/20 text-red-400 font-semibold rounded-2xl py-3 text-sm hover:bg-red-500/10 transition"
      >
        Logout
      </button>

    </div>
  )
}