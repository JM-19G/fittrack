import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'fittrack_users'
const SESSION_KEY = 'fittrack_session'

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
}
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
  })

  const register = useCallback((name, email, password) => {
    const users = getUsers()
    if (users[email]) return { error: 'Email already registered' }
    const newUser = { id: crypto.randomUUID(), name, email, createdAt: new Date().toISOString() }
    users[email] = { ...newUser, password }
    saveUsers(users)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
    setUser(newUser)
    return { user: newUser }
  }, [])

  const login = useCallback((email, password) => {
    const users = getUsers()
    const found = users[email]
    if (!found || found.password !== password) return { error: 'Invalid email or password' }
    const { password: _, ...userData } = found
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
    return { user: userData }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }