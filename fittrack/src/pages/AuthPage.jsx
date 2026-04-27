import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoginForm({ onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = login(email, password)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold text-green-400 tracking-tight">FitTrack</h1>
        <p className="text-sm text-gray-400 mt-1">Sign in to your fitness journal</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-400 text-gray-950 font-bold rounded-lg py-3 text-sm hover:bg-green-300 transition disabled:opacity-60"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-gray-400">
        No account?{' '}
        <span
          onClick={onSwitch}
          className="text-green-400 font-medium cursor-pointer hover:underline"
        >
          Create one
        </span>
      </p>
    </form>
  )
}

function RegisterForm({ onSwitch }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    const res = register(name, email, password)
    if (res.error) setError(res.error)
    else navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold text-green-400 tracking-tight">FitTrack</h1>
        <p className="text-sm text-gray-400 mt-1">Create your free account</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Adewale"
          required
          className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
          className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          required
          className="bg-gray-800 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
        />
      </div>

      <button
        type="submit"
        className="bg-green-400 text-gray-950 font-bold rounded-lg py-3 text-sm hover:bg-green-300 transition"
      >
        Create Account
      </button>

      <p className="text-center text-sm text-gray-400">
        Have an account?{' '}
        <span
          onClick={onSwitch}
          className="text-green-400 font-medium cursor-pointer hover:underline"
        >
          Sign in
        </span>
      </p>
    </form>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState('login')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-2xl p-8 shadow-xl">
        {mode === 'login'
          ? <LoginForm onSwitch={() => setMode('register')} />
          : <RegisterForm onSwitch={() => setMode('login')} />
        }
      </div>
    </div>
  )
}