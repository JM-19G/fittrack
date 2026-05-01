import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFitness } from '../context/FitnessContext'

const STEPS = ['Welcome', 'Body Stats', 'Your Goal', 'Reminder']

const GOAL_OPTIONS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: '🔥' },
  { id: 'build_muscle', label: 'Build Muscle', icon: '💪' },
  { id: 'improve_endurance', label: 'Improve Endurance', icon: '🏃' },
  { id: 'stay_active', label: 'Stay Active', icon: '⚡' },
  { id: 'reduce_stress', label: 'Reduce Stress', icon: '🧘' },
  { id: 'eat_better', label: 'Eat Better', icon: '🥗' },
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const { updateProfile } = useFitness()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    fitnessGoal: '',
    weeklyTarget: '4',
    reminderTime: '07:00',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleFinish = () => {
    updateProfile({ ...form, onboarded: true })
    navigate('/dashboard')
  }

  const next = () => setStep(p => p + 1)
  const back = () => setStep(p => p - 1)

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{STEPS[step]}</span>
            <span>{step + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">

          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="flex flex-col gap-5 text-center">
              <p className="text-5xl">👋</p>
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome, {user?.name?.split(' ')[0]}!
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  Let's set up your profile so FitTrack can personalise your experience. It only takes a minute.
                </p>
              </div>
              <button
                onClick={next}
                className="w-full bg-green-400 text-gray-950 font-bold rounded-xl py-3 hover:bg-green-300 transition"
              >
                Let's Go →
              </button>
              <button
                onClick={handleFinish}
                className="text-xs text-gray-500 hover:text-gray-300 transition"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 1 — Body Stats */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold">Body Stats</h2>
                <p className="text-sm text-gray-400 mt-1">Used to calculate your BMI and calories</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Weight (kg)</label>
                  <input
                    type="number" min="30" max="250"
                    value={form.weight}
                    onChange={e => set('weight', e.target.value)}
                    placeholder="70"
                    className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Height (cm)</label>
                  <input
                    type="number" min="100" max="250"
                    value={form.height}
                    onChange={e => set('height', e.target.value)}
                    placeholder="175"
                    className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Age</label>
                  <input
                    type="number" min="10" max="100"
                    value={form.age}
                    onChange={e => set('age', e.target.value)}
                    placeholder="25"
                    className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
                  />
                </div>
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

              <div className="flex gap-3 mt-2">
                <button
                  onClick={back}
                  className="flex-1 bg-gray-800 text-gray-300 font-semibold rounded-xl py-3 hover:bg-gray-700 transition"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-green-400 text-gray-950 font-bold rounded-xl py-3 hover:bg-green-300 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Fitness Goal */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold">Your Goal</h2>
                <p className="text-sm text-gray-400 mt-1">What are you primarily training for?</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => set('fitnessGoal', g.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition
                      ${form.fitnessGoal === g.id
                        ? 'bg-green-400/10 border-green-400/50 text-green-400'
                        : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white'
                      }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-xs font-medium text-center">{g.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Weekly workout target</label>
                <select
                  value={form.weeklyTarget}
                  onChange={e => set('weeklyTarget', e.target.value)}
                  className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-400 transition"
                >
                  {[2, 3, 4, 5, 6, 7].map(n => (
                    <option key={n} value={n}>{n} workouts per week</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={back}
                  className="flex-1 bg-gray-800 text-gray-300 font-semibold rounded-xl py-3 hover:bg-gray-700 transition"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  className="flex-1 bg-green-400 text-gray-950 font-bold rounded-xl py-3 hover:bg-green-300 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Reminder */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold">Daily Reminder</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Set a time to be reminded to log your activity
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Reminder Time</label>
                <input
                  type="time"
                  value={form.reminderTime}
                  onChange={e => set('reminderTime', e.target.value)}
                  className="bg-gray-800 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-green-400 transition"
                />
              </div>

              <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4">
                <p className="text-sm text-green-400 font-medium mb-1">🎉 You're all set!</p>
                <p className="text-xs text-gray-400">
                  Your profile is ready. You can always update these details on your Profile page.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={back}
                  className="flex-1 bg-gray-800 text-gray-300 font-semibold rounded-xl py-3 hover:bg-gray-700 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 bg-green-400 text-gray-950 font-bold rounded-xl py-3 hover:bg-green-300 transition"
                >
                  Finish Setup 🚀
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}