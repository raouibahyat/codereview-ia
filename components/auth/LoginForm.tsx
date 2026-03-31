'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function LoginForm() {
  const { login, loginWithGithub } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
    } catch (err: unknown) {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
              CR
            </div>
            <span className="text-white font-bold text-lg">CodeReview AI</span>
          </div>
          <p className="text-slate-400 text-sm">Connecte-toi à ton espace</p>
        </div>

        {/* Card */}
        <div className="bg-[#10141c] border border-[#1e2535] rounded-xl p-6">
          {/* GitHub OAuth */}
          <button
            onClick={loginWithGithub}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 
                       border border-[#1e2535] rounded-lg text-sm text-slate-300
                       hover:border-slate-500 hover:bg-[#161b26] transition-all mb-4"
          >
            <GitHubIcon />
            Continuer avec GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#1e2535]" />
            <span className="text-xs text-slate-600">ou</span>
            <div className="flex-1 h-px bg-[#1e2535]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 
                              rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="toi@example.com"
                className="bg-[#0a0c10] border border-[#1e2535] rounded-lg px-3 py-2.5
                           text-sm text-slate-200 placeholder-slate-600
                           focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-xs text-slate-400">Mot de passe</label>
                <a href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                  Oublié ?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-[#0a0c10] border border-[#1e2535] rounded-lg px-3 py-2.5
                           text-sm text-slate-200 placeholder-slate-600
                           focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                         text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-4">
            Pas de compte ?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300">
              S inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}