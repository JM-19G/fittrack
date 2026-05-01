import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useFitness } from '../context/FitnessContext'
import { useToast } from '../components/Toast'

const QUICK_AMOUNTS = [150, 250, 350, 500]

export default function WaterTracker() {
  const { profile } = useFitness()
  const { showToast } = useToast()

  const goal = parseInt(profile.hydrationGoal) || 2000
  const today = format(new Date(), 'yyyy-MM-dd')
  const storageKey = `fittrack_water_${today}`

  const [intake, setIntake] = useState(() => {
    try { return parseInt(localStorage.getItem(storageKey)) || 0 } catch { return 0 }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, intake)
  }, [intake, storageKey])

  const addWater = (amount) => {
    setIntake(prev => {
      const next = prev + amount
      if (next >= goal && prev < goal) {
        showToast('💧 Daily water goal reached!', 'success')
      }
      return next
    })
  }

  const reset = () => {
    setIntake(0)
    showToast('Water intake reset', 'info')
  }

  const percentage = Math.min(100, Math.round((intake / goal) * 100))
  const remaining = Math.max(0, goal - intake)

  const getColor = () => {
    if (percentage >= 100) return 'bg-green-400'
    if (percentage >= 60) return 'bg-blue-400'
    if (percentage >= 30) return 'bg-blue-300'
    return 'bg-blue-200'
  }

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          💧 Hydration
        </p>
        <button
          onClick={reset}
          className="text-xs text-gray-500 hover:text-gray-300 transition"
        >
          Reset
        </button>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#1f2937" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke={percentage >= 100 ? '#4ade80' : '#60a5fa'}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - percentage / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-2xl font-bold text-blue-400">
            {intake} <span className="text-sm font-normal text-gray-400">ml</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {percentage >= 100
              ? '🎉 Goal reached!'
              : `${remaining} ml remaining`
            }
          </p>
          <div className="h-1.5 bg-gray-700 rounded-full mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map(amount => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            className="flex-1 bg-gray-800 hover:bg-blue-400/10 border border-white/10 hover:border-blue-400/30 text-gray-400 hover:text-blue-400 rounded-xl py-2 text-xs font-medium transition"
          >
            +{amount}ml
          </button>
        ))}
      </div>
    </div>
  )
}