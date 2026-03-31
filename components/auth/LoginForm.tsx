'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function LoginForm() {
  const { login, loginWithGithub } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 100, y: 100 })
  const tRef = useRef(0)
  const rafRef = useRef<number>(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
      setSuccess(true)
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) * (200 / rect.width),
      y: (e.clientY - rect.top) * (200 / rect.height),
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = 200, H = 200, CX = W / 2, CY = H / 2

    function hexShape(cx: number, cy: number, r: number) {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 6
        i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      }
      ctx.closePath()
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
    }

    function diamond(cx: number, cy: number, hw: number, hh: number) {
      ctx.beginPath()
      ctx.moveTo(cx, cy - hh); ctx.lineTo(cx + hw, cy)
      ctx.lineTo(cx, cy + hh); ctx.lineTo(cx - hw, cy)
      ctx.closePath()
    }

    function draw() {
      tRef.current += 0.018
      const t = tRef.current
      const { x: mx, y: my } = mouseRef.current
      ctx.clearRect(0, 0, W, H)

      const pulse = 0.5 + 0.5 * Math.sin(t * 1.4)
      const breathe = Math.sin(t * 0.7)

      // Background radial glow
      const bg = ctx.createRadialGradient(CX, CY, 10, CX, CY, 100)
      bg.addColorStop(0, `rgba(79,70,229,${0.08 + 0.04 * pulse})`)
      bg.addColorStop(1, 'rgba(8,11,18,0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Floating hex particles
      ctx.save()
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + t * 0.3
        const r = 78 + Math.sin(t + i) * 6
        const px = CX + Math.cos(angle) * r
        const py = CY + Math.sin(angle) * r
        const a = 0.08 + 0.06 * Math.sin(t * 2 + i)
        ctx.strokeStyle = `rgba(129,140,248,${a})`
        ctx.lineWidth = 0.8
        ctx.beginPath()
        for (let j = 0; j < 6; j++) {
          const ha = (j / 6) * Math.PI * 2
          const hx = px + Math.cos(ha) * 7
          const hy = py + Math.sin(ha) * 7
          j === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy)
        }
        ctx.closePath()
        ctx.stroke()
      }
      ctx.restore()

      // Body
      const bodyY = CY + 30 + breathe * 2
      ctx.save()
      ctx.strokeStyle = `rgba(99,102,241,${0.5 + 0.2 * pulse})`
      ctx.lineWidth = 1.2
      ctx.fillStyle = 'rgba(15,20,40,0.9)'
      roundRect(CX - 28, bodyY - 22, 56, 48, 8)
      ctx.fill(); ctx.stroke()
      ctx.strokeStyle = 'rgba(99,102,241,0.25)'; ctx.lineWidth = 0.7
      roundRect(CX - 22, bodyY - 16, 20, 16, 4); ctx.stroke()
      roundRect(CX + 2, bodyY - 16, 20, 16, 4); ctx.stroke()
      ctx.strokeStyle = 'rgba(99,102,241,0.1)'; ctx.lineWidth = 0.5
      for (let gy = bodyY - 16; gy < bodyY + 26; gy += 8) {
        ctx.beginPath(); ctx.moveTo(CX - 28, gy); ctx.lineTo(CX + 28, gy); ctx.stroke()
      }
      const gp = 0.6 + 0.4 * Math.sin(t * 2)
      ctx.fillStyle = `rgba(99,102,241,${gp})`
      diamond(CX, bodyY + 10, 10, 14); ctx.fill()
      ctx.strokeStyle = `rgba(199,210,254,${gp})`; ctx.lineWidth = 1
      diamond(CX, bodyY + 10, 10, 14); ctx.stroke()
      ctx.fillStyle = `rgba(255,255,255,${0.3 * gp})`
      diamond(CX, bodyY + 8, 5, 7); ctx.fill()
      ctx.restore()

      // Arms
      ctx.save()
      ctx.strokeStyle = 'rgba(79,70,229,0.6)'; ctx.lineWidth = 7; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(CX - 28, bodyY - 10)
      ctx.quadraticCurveTo(CX - 50, bodyY, CX - 46, bodyY + 22); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(CX + 28, bodyY - 10)
      ctx.quadraticCurveTo(CX + 50, bodyY, CX + 46, bodyY + 22); ctx.stroke()
      ctx.fillStyle = 'rgba(99,102,241,0.7)'
      ctx.beginPath(); ctx.arc(CX - 46, bodyY + 22, 5, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(CX + 46, bodyY + 22, 5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // Neck
      ctx.save()
      ctx.strokeStyle = 'rgba(79,70,229,0.5)'; ctx.lineWidth = 10; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(CX, bodyY - 22); ctx.lineTo(CX, bodyY - 36); ctx.stroke()
      ctx.strokeStyle = 'rgba(129,140,248,0.4)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(CX, bodyY - 30, 7, 0, Math.PI * 2); ctx.stroke()
      ctx.restore()

      // Head
      const headY = bodyY - 36
      ctx.save()
      ctx.fillStyle = '#0d1020'
      ctx.strokeStyle = `rgba(99,102,241,${0.55 + 0.2 * pulse})`; ctx.lineWidth = 1.5
      hexShape(CX, headY, 38); ctx.fill(); ctx.stroke()
      ctx.strokeStyle = 'rgba(99,102,241,0.15)'; ctx.lineWidth = 0.7
      hexShape(CX, headY, 30); ctx.stroke()
      ctx.restore()

      // Antennae
      ctx.save()
      ctx.strokeStyle = 'rgba(129,140,248,0.5)'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(CX - 12, headY - 28); ctx.lineTo(CX - 20, headY - 48); ctx.stroke()
      const la = 0.5 + 0.5 * Math.sin(t * 2.2)
      ctx.fillStyle = `rgba(129,140,248,${la})`
      ctx.beginPath(); ctx.arc(CX - 20, headY - 49, 4, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = `rgba(199,210,254,${la})`; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(CX - 20, headY - 49, 4, 0, Math.PI * 2); ctx.stroke()
      ctx.strokeStyle = 'rgba(129,140,248,0.5)'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(CX + 12, headY - 28); ctx.lineTo(CX + 20, headY - 50); ctx.stroke()
      const ra = 0.5 + 0.5 * Math.sin(t * 2.2 + 1.2)
      ctx.fillStyle = `rgba(52,211,153,${ra})`
      ctx.beginPath(); ctx.arc(CX + 20, headY - 51, 4, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      // Visor
      ctx.save()
      roundRect(CX - 26, headY - 12, 52, 22, 6)
      ctx.fillStyle = 'rgba(8,11,18,0.95)'; ctx.fill()
      ctx.strokeStyle = 'rgba(99,102,241,0.4)'; ctx.lineWidth = 0.8; ctx.stroke()
      ctx.restore()

      // Eyes that follow mouse
      const eyes = [{ x: CX - 12, y: headY - 2 }, { x: CX + 12, y: headY - 2 }]
      eyes.forEach((eye, i) => {
        const dx = mx - eye.x, dy = my - eye.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const px2 = (dx / dist) * Math.min(dist * 0.2, 4)
        const py2 = (dy / dist) * Math.min(dist * 0.2, 4)
        ctx.save()
        ctx.fillStyle = '#060810'; ctx.strokeStyle = 'rgba(99,102,241,0.5)'; ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.ellipse(eye.x, eye.y, 10, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
        ctx.fillStyle = i === 0 ? 'rgba(99,102,241,0.9)' : 'rgba(52,211,153,0.9)'
        ctx.beginPath(); ctx.arc(eye.x + px2, eye.y + py2, 5.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#020408'
        ctx.beginPath(); ctx.arc(eye.x + px2, eye.y + py2, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.beginPath(); ctx.arc(eye.x + px2 - 2, eye.y + py2 - 2, 1.5, 0, Math.PI * 2); ctx.fill()
        const scanR = 5.5 + 4 * Math.sin(t * 3 + i * Math.PI)
        ctx.strokeStyle = i === 0
          ? `rgba(99,102,241,${0.15 + 0.1 * Math.sin(t * 3 + i)})`
          : `rgba(52,211,153,${0.15 + 0.1 * Math.sin(t * 3 + i)})`
        ctx.lineWidth = 0.6
        ctx.beginPath(); ctx.arc(eye.x, eye.y, scanR, 0, Math.PI * 2); ctx.stroke()
        ctx.restore()
      })

      // Mouth wave bars
      ctx.save()
      roundRect(CX - 18, headY + 12, 36, 10, 4)
      ctx.fillStyle = 'rgba(8,11,18,0.9)'; ctx.fill()
      ctx.strokeStyle = 'rgba(99,102,241,0.3)'; ctx.lineWidth = 0.7; ctx.stroke()
      for (let b = 0; b < 7; b++) {
        const bx = CX - 14 + b * 4.5
        const bh = 2 + 5 * Math.abs(Math.sin(t * 4 + b * 0.8))
        ctx.fillStyle = `rgba(129,140,248,${0.4 + 0.4 * Math.abs(Math.sin(t * 4 + b * 0.8))})`
        ctx.fillRect(bx, headY + 17 - bh / 2, 3, bh)
      }
      ctx.restore()

      // Ear ports
      ctx.save()
      ;[-1, 1].forEach(side => {
        ctx.fillStyle = 'rgba(15,20,40,0.9)'
        ctx.strokeStyle = 'rgba(99,102,241,0.4)'; ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.ellipse(CX + side * 34, headY, 5, 9, 0, 0, Math.PI * 2)
        ctx.fill(); ctx.stroke()
        ctx.fillStyle = `rgba(99,102,241,${0.3 + 0.3 * pulse})`
        ctx.beginPath(); ctx.arc(CX + side * 34, headY, 2, 0, Math.PI * 2); ctx.fill()
      })
      ctx.restore()

      // Floating code
      ctx.save()
      const snippets = ['{fx}', '01', 'if', '{}', '();']
      snippets.forEach((s, i) => {
        const sa = (t * 0.8 + i * 0.6) % (Math.PI * 2)
        const sx = CX + 46 + Math.cos(sa) * 18
        const sy = bodyY + 22 + Math.sin(sa) * 10
        ctx.font = '7px monospace'
        ctx.fillStyle = `rgba(99,102,241,${0.12 + 0.08 * Math.sin(t + i)})`
        ctx.fillText(s, sx - 8, sy + 3)
      })
      ctx.restore()

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080b12]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          animation: 'gDrift 18s linear infinite',
        }}
      />

      <div className="relative z-10 flex items-center gap-8 max-w-4xl w-full px-6">

        {/* Avatar side */}
        <div className="hidden lg:flex flex-col items-center flex-1 gap-5">
          <div className="relative">
            {['-inset-4', '-inset-8', '-inset-14'].map((cls, idx) => (
              <div
                key={idx}
                className={`absolute ${cls} rounded-full border pointer-events-none`}
                style={{
                  borderColor: `rgba(99,102,241,${0.18 - idx * 0.05})`,
                  animation: `hPulse 3s ease-in-out ${idx * 0.6}s infinite`,
                }}
              />
            ))}

            <div
              onMouseMove={handleMouseMove}
              onClick={() => setZoomed(v => !v)}
              className="relative w-56 h-56 rounded-full border cursor-pointer overflow-hidden flex items-center justify-center"
              style={{
                background: '#0b0e1a',
                borderColor: zoomed ? 'rgba(99,102,241,0.9)' : 'rgba(99,102,241,0.4)',
                transform: zoomed ? 'scale(1.14)' : 'scale(1)',
                boxShadow: zoomed ? '0 0 50px rgba(99,102,241,0.3),0 0 100px rgba(99,102,241,0.1)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div
                className="absolute left-0 right-0 h-px pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.7),transparent)',
                  animation: 'scan 2.8s linear infinite',
                }}
              />
              <canvas ref={canvasRef} width={200} height={200} />
            </div>

            <div
              className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-36 h-10 rounded-b-full pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, rgba(99,102,241,0.14), transparent)',
                filter: 'blur(10px)',
                animation: 'mirRef 3s ease-in-out infinite',
              }}
            />
          </div>

          <div className="flex gap-4">
            {[
              { label: 'ONLINE', color: '#818cf8', delay: '0s' },
              { label: 'SCANNING', color: '#34d399', delay: '0.7s' },
            ].map(({ label, color, delay }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, animation: `sBlink 2s ${delay} ease-in-out infinite` }} />
                <span className="font-mono text-[9px] tracking-widest" style={{ color: `${color}b3` }}>{label}</span>
              </div>
            ))}
          </div>

          <p className="text-center font-mono text-[11px] italic" style={{ color: 'rgba(100,116,139,0.6)', lineHeight: 1.6, animation: 'fIn 0.8s ease 0.7s both' }}>
            <span style={{ color: 'rgba(99,102,241,0.6)' }}> </span>code_inspector v2.0<br />
            <span style={{ color: 'rgba(99,102,241,0.6)' }}>↑ </span>cliquez pour zoomer
          </p>
        </div>

        <div className="hidden lg:block w-px self-stretch" style={{ background: 'linear-gradient(to bottom,transparent,rgba(30,37,53,0.8),transparent)' }} />

        {/* Form side */}
        <div
          className="relative w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: 'rgba(11,14,26,0.96)', border: '1px solid rgba(30,37,53,0.9)', padding: '32px', animation: 'fReveal 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,transparent,#818cf8,transparent)' }} />

          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'sBlink 2s ease-in-out infinite' }} />
            <span className="font-mono text-[9px] tracking-widest text-emerald-400/70">SECURE</span>
          </div>

          <div className="flex items-center gap-3 mb-1.5" style={{ animation: 'fIn 0.5s ease 0.4s both' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-content-center font-bold text-[12px] text-white relative overflow-hidden flex items-center justify-center" style={{ background: '#4f46e5', fontFamily: 'Space Mono,monospace' }}>
              CR
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.18),transparent)' }} />
            </div>
            <span className="font-bold text-[15px] text-slate-200" style={{ fontFamily: 'Space Mono,monospace', letterSpacing: '-0.3px' }}>
              Code<span className="text-indigo-400">Review</span> AI
            </span>
          </div>

          <p className="text-[11px] text-slate-600 mb-6" style={{ fontFamily: 'Space Mono,monospace', animation: 'fIn 0.5s ease 0.5s both' }}>
          
          </p>

          <button
            onClick={loginWithGithub}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 text-xs text-slate-400 rounded-xl mb-4 transition-all duration-200 hover:-translate-y-px hover:text-indigo-300"
            style={{ background: 'transparent', border: '1px solid rgba(30,37,53,1)', fontFamily: 'Space Mono,monospace', animation: 'fIn 0.5s ease 0.6s both' }}
          >
            <GitHubIcon />
            Continuer avec GitHub
          </button>

          <div className="flex items-center gap-3 mb-4" style={{ animation: 'fIn 0.5s ease 0.65s both' }}>
            <div className="flex-1 h-px" style={{ background: 'rgba(30,37,53,0.9)' }} />
            <span className="text-[10px] text-slate-700" style={{ fontFamily: 'Space Mono,monospace' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(30,37,53,0.9)' }} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2" style={{ fontFamily: 'Space Mono,monospace' }}>
                <span className="text-red-500/60">/</span>{error}
              </div>
            )}

            <div style={{ animation: 'fIn 0.5s ease 0.7s both' }}>
              <label className="block text-[10px] text-slate-600 uppercase tracking-widest mb-1.5" style={{ fontFamily: 'Space Mono,monospace' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="toi@example.com"
                className="w-full rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/10"
                style={{ background: 'rgba(8,11,18,0.8)', border: '1px solid rgba(30,37,53,1)', fontFamily: 'Space Mono,monospace' }}
              />
            </div>

            <div style={{ animation: 'fIn 0.5s ease 0.75s both' }}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] text-slate-600 uppercase tracking-widest" style={{ fontFamily: 'Space Mono,monospace' }}>Mot de passe</label>
                <a href="/forgot-password" className="text-[10px] text-indigo-400/70 hover:text-indigo-400 transition-colors" style={{ fontFamily: 'Space Mono,monospace' }}>Oublié ?</a>
              </div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full rounded-lg px-3 py-2.5 text-xs text-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/10"
                style={{ background: 'rgba(8,11,18,0.8)', border: '1px solid rgba(30,37,53,1)', fontFamily: 'Space Mono,monospace' }}
              />
            </div>

            <button
              type="submit" disabled={loading || success}
              className="mt-1 w-full rounded-xl py-2.5 text-sm text-white transition-all duration-200 hover:-translate-y-px active:scale-95 disabled:opacity-50"
              style={{ background: success ? '#059669' : '#4f46e5', fontFamily: 'Space Mono,monospace', animation: 'fIn 0.5s ease 0.8s both' }}
            >
              {loading ? '// Connexion...' : success ? '✓ Connecté !' : 'Se connecter →'}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-700 mt-4" style={{ fontFamily: 'Space Mono,monospace', animation: 'fIn 0.5s ease 0.85s both' }}>
            Pas de compte ?{' '}
            <a href="/register" className="text-indigo-400/70 hover:text-indigo-400 transition-colors">S&apos;inscrire</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gDrift { from{background-position:0 0} to{background-position:0 36px} }
        @keyframes hPulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.03);opacity:1} }
        @keyframes scan { 0%{top:4%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:96%;opacity:0} }
        @keyframes mirRef { 0%,100%{opacity:.4;width:140px} 50%{opacity:.7;width:170px} }
        @keyframes fReveal { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sBlink { 0%,100%{opacity:1} 50%{opacity:.2} }
      `}</style>
    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}
