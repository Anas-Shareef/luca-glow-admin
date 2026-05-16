import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate  = useNavigate()
  const login     = useAuthStore((s) => s.login)
  const [email,   setEmail]   = useState('admin@lucaglow.com')
  const [password, setPass]   = useState('password')
  const [show,     setShow]   = useState(false)
  const [loading,  setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // Simulate API call — replace with: await api.post('/auth/login', { email, password })
    setTimeout(() => {
      login({ name: 'Luca Admin', email, role: 'super_admin' }, 'mock_sanctum_token_abc123')
      toast.success('Welcome back! ✨')
      navigate('/dashboard')
      setLoading(false)
    }, 900)
  }

  return (
    <div className="min-h-screen flex bg-brand-soft">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-16">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 40%, #FDBA74 100%)',
          }}
        />
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-glow-300/30" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-glow-400/20" />
        <div className="absolute top-1/3 right-8 w-32 h-32 rounded-full bg-white/20" />

        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-glow mb-8">
            <Sparkles className="text-brand-secondary" size={36} />
          </div>
          <h1 className="font-display text-5xl font-bold text-glow-800 mb-4 leading-tight">
            Luca Glow
          </h1>
          <p className="text-glow-700 text-lg font-medium mb-2">Admin Command Centre</p>
          <p className="text-glow-600 text-sm max-w-xs mx-auto">
            Manage your clean beauty empire — products, orders, customers, and growth analytics all in one place.
          </p>

          {/* Brand stats teaser */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { label: 'Products',  value: '11+' },
              { label: 'Customers', value: '642' },
              { label: 'Orders',    value: '1.2k' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/50 backdrop-blur rounded-2xl p-4">
                <div className="text-2xl font-bold text-glow-800">{value}</div>
                <div className="text-xs text-glow-600 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 flex items-center justify-center">
              <Sparkles className="text-brand-secondary" size={20} />
            </div>
            <span className="font-display text-2xl font-bold text-glow-800">Luca Glow</span>
          </div>

          <div className="card shadow-xl border-0">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the admin panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="admin@lucaglow.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPass(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-xs text-glow-600 hover:text-glow-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full justify-center py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Luca × Lykha Admin Panel · Since 2016 · Kerala, India
            </p>
          </div>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-glow-50 border border-glow-200 rounded-xl text-xs text-glow-700 text-center">
            <strong>Demo:</strong> admin@lucaglow.com / password
          </div>
        </div>
      </div>
    </div>
  )
}
