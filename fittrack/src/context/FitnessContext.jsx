import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { useAuth } from './AuthContext'

const FitnessContext = createContext(null)

function getKey(userId, type) { return `fittrack_${type}_${userId}` }

function loadData(userId, type, fallback) {
  try { return JSON.parse(localStorage.getItem(getKey(userId, type)) || 'null') ?? fallback }
  catch { return fallback }
}
function saveData(userId, type, data) {
  localStorage.setItem(getKey(userId, type), JSON.stringify(data))
}

function logsReducer(state, action) {
  switch (action.type) {
    case 'SET': return action.payload
    case 'ADD': return [action.payload, ...state]
    case 'DELETE': return state.filter(l => l.id !== action.id)
    case 'UPDATE': return state.map(l => l.id === action.payload.id ? action.payload : l)
    default: return state
  }
}

function goalsReducer(state, action) {
  switch (action.type) {
    case 'SET': return action.payload
    case 'ADD': return [...state, action.payload]
    case 'DELETE': return state.filter(g => g.id !== action.id)
    case 'UPDATE': return state.map(g => g.id === action.payload.id ? action.payload : g)
    default: return state
  }
}

export function FitnessProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.id

  const [logs, dispatchLogs] = useReducer(logsReducer, [])
  const [goals, dispatchGoals] = useReducer(goalsReducer, [])
  const [profile, setProfileState] = useState({})

  useEffect(() => {
    if (!uid) {
      dispatchLogs({ type: 'SET', payload: [] })
      dispatchGoals({ type: 'SET', payload: [] })
      return
    }
    const savedLogs = loadData(uid, 'logs', [])
    dispatchLogs({ type: 'SET', payload: savedLogs })

    const savedGoals = loadData(uid, 'goals', [])
    const defaultGoals = savedGoals.length ? savedGoals : [
      { id: crypto.randomUUID(), userId: uid, name: 'Weekly Workouts', type: 'weekly', target: 4, unit: 'workouts', createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), userId: uid, name: 'Monthly Activity', type: 'monthly', target: 16, unit: 'workouts', createdAt: new Date().toISOString() },
    ]
    if (!savedGoals.length) saveData(uid, 'goals', defaultGoals)
    dispatchGoals({ type: 'SET', payload: defaultGoals })

    setProfileState(loadData(uid, 'profile', { weight: '', height: '', hydrationGoal: 2000 }))
  }, [uid])

  useEffect(() => { if (uid) saveData(uid, 'logs', logs) }, [uid, logs])
  useEffect(() => { if (uid) saveData(uid, 'goals', goals) }, [uid, goals])

  const addLog = useCallback((entry) => {
    const log = { ...entry, id: crypto.randomUUID(), userId: uid, createdAt: new Date().toISOString() }
    dispatchLogs({ type: 'ADD', payload: log })
    return log
  }, [uid])

  const deleteLog = useCallback((id) => dispatchLogs({ type: 'DELETE', id }), [])
  const updateLog = useCallback((log) => dispatchLogs({ type: 'UPDATE', payload: log }), [])

  const addGoal = useCallback((entry) => {
    const goal = { ...entry, id: crypto.randomUUID(), userId: uid, createdAt: new Date().toISOString() }
    dispatchGoals({ type: 'ADD', payload: goal })
  }, [uid])

  const deleteGoal = useCallback((id) => dispatchGoals({ type: 'DELETE', id }), [])

  const updateProfile = useCallback((data) => {
    setProfileState(prev => {
      const next = { ...prev, ...data }
      saveData(uid, 'profile', next)
      return next
    })
  }, [uid])

  return (
    <FitnessContext.Provider value={{ logs, goals, profile, addLog, deleteLog, updateLog, addGoal, deleteGoal, updateProfile }}>
      {children}
    </FitnessContext.Provider>
  )
}

export function useFitness() { return useContext(FitnessContext) }