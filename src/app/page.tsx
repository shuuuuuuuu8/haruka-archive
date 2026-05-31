'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function Corner({ pos, color }: { pos: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '18px',
    height: '18px',
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 0,
    transition: 'opacity 0.4s ease',
  }
  if (pos === 'tl') { style.top = 16; style.left = 16; style.borderTopWidth = 1; style.borderLeftWidth = 1 }
  if (pos === 'tr') { style.top = 16; style.right = 16; style.borderTopWidth = 1; style.borderRightWidth = 1 }
  if (pos === 'bl') { style.bottom = 16; style.left = 16; style.borderBottomWidth = 1; style.borderLeftWidth = 1 }
  if (pos === 'br') { style.bottom = 16; style.right = 16; style.borderBottomWidth = 1; style.borderRightWidth = 1 }
  return <div style={style} />
}

export default function Home() {
  const [phase, setPhase] = useState(0)
  const [hovered, setHovered] = useState<'register' | 'explore' | null>(null)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const [smoothMouse, setSmoothMouse] = useState({ x: 0.5, y: 0.5 })
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRafRef = useRef<number>(0)
  const canvasRafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<Array<{ x: number; y: number; age: number }>>([])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 520)
    const t3 = setTimeout(() => setPhase(3), 1120)
    const t4 = setTimeout(() => setPhase(4), 1700)

    const animateMouse = () => {
      setSmoothMouse(prev => ({
        x: prev.x + (mouseRef.current.x - prev.x) * 0.055,
        y: prev.y + (mouseRef.current.y - prev.y) * 0.055,
      }))
      mouseRafRef.current = requestAnimationFrame(animateMouse)
    }
    mouseRafRef.current = requestAnimationFrame(animateMouse)

    const canvas = canvasRef.current
    if (canvas) {
      const W = window.innerWidth
      const H = window.innerHeight
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!
      const MAX_DIST = 125

      const pts = Array.from({ length: 88 }, () => {
        const x = Math.random() * W
        const faction = x < W * 0.42 ? 'warm' : x > W * 0.58 ? 'cool' : 'neutral'
        return {
          x, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          r: Math.random() * 1.1 + 0.3,
          a: Math.random() * 0.2 + 0.04,
          faction,
        }
      })

      const draw = () => {
        ctx.clearRect(0, 0, W, H)

        // Trail
        trailRef.current = trailRef.current
          .map(p => ({ ...p, age: p.age + 0.045 }))
          .filter(p => p.age < 1)
        for (const p of trailRef.current) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.6 * (1 - p.age * 0.6), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${(1 - p.age) * 0.16})`
          ctx.fill()
        }

        // Update particles
        for (const p of pts) {
          p.x = (p.x + p.vx + W) % W
          p.y = (p.y + p.vy + H) % H
        }

        // Constellation lines
        ctx.lineWidth = 0.4
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x
            const dy = pts[i].y - pts[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < MAX_DIST) {
              const a = (1 - dist / MAX_DIST) * 0.09
              const xi = pts[i].x / W
              const warmBias = xi < 0.4 ? 1 : xi > 0.6 ? 0 : (0.6 - xi) / 0.2
              const r = Math.round(255 * (0.7 + warmBias * 0.3))
              const b = Math.round(255 * (0.7 + (1 - warmBias) * 0.3))
              ctx.beginPath()
              ctx.moveTo(pts[i].x, pts[i].y)
              ctx.lineTo(pts[j].x, pts[j].y)
              ctx.strokeStyle = `rgba(${r},220,${b},${a})`
              ctx.stroke()
            }
          }
        }

        // Particles
        for (const p of pts) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          const t = p.x / W
          const warm = Math.max(0, 1 - t * 2.5)
          const cool = Math.max(0, t * 2.5 - 1.5)
          if (warm > 0.15) {
            ctx.fillStyle = `rgba(240,160,110,${p.a * (0.4 + warm * 0.6)})`
          } else if (cool > 0.15) {
            ctx.fillStyle = `rgba(155,145,255,${p.a * (0.4 + cool * 0.6)})`
          } else {
            ctx.fillStyle = `rgba(255,255,255,${p.a})`
          }
          ctx.fill()
        }

        canvasRafRef.current = requestAnimationFrame(draw)
      }
      canvasRafRef.current = requestAnimationFrame(draw)
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
      cancelAnimationFrame(mouseRafRef.current)
      cancelAnimationFrame(canvasRafRef.current)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseRef.current = { x, y }
    setMouse({ x, y })
    trailRef.current.push({ x: e.clientX, y: e.clientY, age: 0 })
    if (trailRef.current.length > 32) trailRef.current.shift()
  }

  const pX = (smoothMouse.x - 0.5) * 18
  const pY = (smoothMouse.y - 0.5) * 18

  const seamLeft = hovered === 'register' ? '64%' : hovered === 'explore' ? '36%' : '50%'
  const warmColor = 'rgba(215,105,60,0.8)'
  const coolColor = 'rgba(165,155,230,0.8)'

  return (
    <>
      <style>{`
        @keyframes grain {
          0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}20%{transform:translate(3%,2%)}
          30%{transform:translate(-1%,4%)}40%{transform:translate(4%,-1%)}50%{transform:translate(-3%,3%)}
          60%{transform:translate(2%,-4%)}70%{transform:translate(-4%,1%)}80%{transform:translate(1%,-2%)}
          90%{transform:translate(-2%,4%)}
        }
        @keyframes seam-glow {
          0%,100%{opacity:.1} 50%{opacity:.28}
        }
        @keyframes scanline {
          0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)}
        }
        @keyframes vline-drop {
          from{transform:scaleY(0);opacity:0} to{transform:scaleY(1);opacity:1}
        }
        @keyframes float-slow {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)}
        }
        @keyframes panel-overlay-in {
          from{opacity:0} to{opacity:1}
        }
      `}</style>

      <div
        ref={containerRef}
        className="relative h-screen w-screen overflow-hidden"
        style={{ backgroundColor: '#060504', cursor: 'none' }}
        onMouseMove={handleMouseMove}
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" />

        {/* Noise */}
        <div
          className="pointer-events-none absolute inset-[-20%] z-50 opacity-[0.028]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
            animation: 'grain 0.4s steps(1) infinite',
          }}
        />

        {/* Scanline */}
        <div
          className="pointer-events-none absolute left-0 h-px w-full opacity-[0.04]"
          style={{
            zIndex: 22,
            background: 'linear-gradient(transparent,rgba(255,255,255,.85),transparent)',
            animation: 'scanline 11s linear infinite',
          }}
        />

        {/* Left atmosphere */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[5]"
          style={{
            width: seamLeft,
            background: 'radial-gradient(ellipse at 28% 50%, rgba(143,63,43,0.18) 0%, transparent 65%)',
            transition: 'width 0.65s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* Right atmosphere */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[5]"
          style={{
            width: hovered === 'explore' ? '64%' : hovered === 'register' ? '36%' : '50%',
            background: 'radial-gradient(ellipse at 72% 50%, rgba(65,50,120,0.18) 0%, transparent 65%)',
            transition: 'width 0.65s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* Mouse spotlight */}
        <div
          className="pointer-events-none absolute z-[6]"
          style={{
            left: `${smoothMouse.x * 100}%`,
            top: `${smoothMouse.y * 100}%`,
            width: '900px', height: '900px',
            transform: 'translate(-50%,-50%)',
            background: hovered === 'register'
              ? 'radial-gradient(circle, rgba(143,63,43,0.13) 0%, transparent 65%)'
              : hovered === 'explore'
                ? 'radial-gradient(circle, rgba(65,50,120,0.13) 0%, transparent 65%)'
                : 'radial-gradient(circle, rgba(255,255,255,0.035) 0%, transparent 65%)',
          }}
        />

        {/* Seam line */}
        <div
          className="pointer-events-none absolute inset-y-0 z-[8]"
          style={{
            left: seamLeft,
            width: '1px',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 15%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.1) 85%, transparent 100%)',
            animation: 'seam-glow 5s ease-in-out infinite',
            transition: 'left 0.65s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        {/* Background 結 */}
        <div
          className="pointer-events-none absolute select-none font-serif"
          style={{
            fontSize: 'clamp(220px, 34vw, 500px)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.010)',
            top: '50%', left: '50%',
            transform: `translate(-50%,-50%) translate(${pX * 0.85}px,${pY * 0.85}px)`,
            transition: 'transform 0.12s ease-out',
            lineHeight: 1,
          }}
        >
          結
        </div>

        {/* Left vertical accent line */}
        <div
          className="pointer-events-none absolute left-[72px] top-0 h-full w-px origin-top z-[4]"
          style={{
            backgroundColor: 'rgba(255,255,255,0.022)',
            animation: phase >= 1 ? 'vline-drop 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s both' : 'none',
          }}
        />
        {/* Right vertical accent line */}
        <div
          className="pointer-events-none absolute right-[72px] top-0 h-full w-px origin-top z-[4]"
          style={{
            backgroundColor: 'rgba(255,255,255,0.022)',
            animation: phase >= 1 ? 'vline-drop 1.4s cubic-bezier(0.16,1,0.3,1) 0.35s both' : 'none',
          }}
        />

        {/* Header */}
        <div
          className="absolute left-24 top-7 z-40"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.9s ease' }}
        >
          <p className="font-serif text-xl font-medium text-white" style={{ letterSpacing: '0.2em' }}>結</p>
          <p className="mt-0.5 text-[7px] tracking-[0.55em]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            MUSUBI MATERIAL BANK
          </p>
        </div>
        <div
          className="absolute right-24 top-7 z-40 text-right"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.9s ease 0.1s' }}
        >
          <p className="text-[7px] tracking-[0.45em]" style={{ color: 'rgba(255,255,255,0.1)' }}>
            KYOTO · ISHIKAWA · JAPAN
          </p>
        </div>

        {/* Vertical side text */}
        <div
          className="pointer-events-none absolute left-7 top-1/2 z-40 -translate-y-1/2"
          style={{ writingMode: 'vertical-rl', opacity: phase >= 2 ? 1 : 0, transition: 'opacity 1.2s ease 1s' }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
            未活用素材バンク
          </p>
        </div>
        <div
          className="pointer-events-none absolute right-7 top-1/2 z-40 -translate-y-1/2"
          style={{ writingMode: 'vertical-rl', opacity: phase >= 2 ? 1 : 0, transition: 'opacity 1.2s ease 1.1s' }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
            伝統工芸の素材を繋ぐ
          </p>
        </div>

        {/* SPLIT PANELS */}
        <div className="absolute inset-0 flex z-20">

          {/* LEFT: Register */}
          <a
            href="https://musubi-sozai.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex flex-col items-start justify-center overflow-hidden"
            style={{
              cursor: 'none',
              flex: hovered === 'register' ? '0 0 64%' : hovered === 'explore' ? '0 0 36%' : '1 1 0%',
              transition: 'flex 0.65s cubic-bezier(0.16,1,0.3,1)',
              minWidth: 0,
              paddingLeft: 'clamp(28px, 7vw, 80px)',
              paddingRight: 'clamp(20px, 4vw, 52px)',
              paddingTop: '20px',
              paddingBottom: '20px',
            }}
            onMouseEnter={() => setHovered('register')}
            onMouseLeave={() => setHovered(null)}
          >
            {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
              <Corner
                key={pos}
                pos={pos}
                color={hovered === 'register' ? warmColor : 'rgba(255,255,255,0.14)'}
              />
            ))}

            <div
              style={{
                opacity: phase >= 3 ? 1 : 0,
                transform: phase >= 3 ? 'translateY(0)' : 'translateY(28px)',
                transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <p
                className="mb-3 text-[8px] tracking-[0.55em]"
                style={{ color: hovered === 'register' ? 'rgba(215,105,60,1)' : 'rgba(255,255,255,0.38)' }}
              >
                FOR SUPPLIERS
              </p>
              <p
                className="font-serif font-medium text-white"
                style={{ fontSize: 'clamp(24px, 3.8vw, 44px)', letterSpacing: '0.04em', lineHeight: 1.2 }}
              >
                素材を<br />登録する
              </p>
              <p
                className="mt-4 text-sm leading-7"
                style={{
                  color: hovered === 'register' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
                  maxWidth: '18em',
                  transition: 'color 0.4s ease',
                }}
              >
                眠っている着物・帯・反物を<br />次の作り手の手へ届けましょう
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  style={{
                    height: '1px',
                    width: hovered === 'register' ? '52px' : '20px',
                    backgroundColor: hovered === 'register' ? 'rgba(215,105,60,0.8)' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
                <span
                  className="text-[8px] tracking-[0.45em]"
                  style={{ color: hovered === 'register' ? 'rgba(215,105,60,0.9)' : 'rgba(255,255,255,0.3)' }}
                >
                  ENTER →
                </span>
              </div>
            </div>
          </a>

          {/* RIGHT: Explore */}
          <Link
            href="/materials"
            className="relative flex flex-col items-end justify-center overflow-hidden"
            style={{
              cursor: 'none',
              flex: hovered === 'explore' ? '0 0 64%' : hovered === 'register' ? '0 0 36%' : '1 1 0%',
              transition: 'flex 0.65s cubic-bezier(0.16,1,0.3,1)',
              minWidth: 0,
              paddingRight: 'clamp(28px, 7vw, 80px)',
              paddingLeft: 'clamp(20px, 4vw, 52px)',
              paddingTop: '20px',
              paddingBottom: '20px',
            }}
            onMouseEnter={() => setHovered('explore')}
            onMouseLeave={() => setHovered(null)}
          >
            {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
              <Corner
                key={pos}
                pos={pos}
                color={hovered === 'explore' ? coolColor : 'rgba(255,255,255,0.14)'}
              />
            ))}

            <div
              className="flex flex-col items-end text-right"
              style={{
                opacity: phase >= 3 ? 1 : 0,
                transform: phase >= 3 ? 'translateY(0)' : 'translateY(28px)',
                transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.12s',
              }}
            >
              <p
                className="mb-3 text-[8px] tracking-[0.55em]"
                style={{ color: hovered === 'explore' ? 'rgba(165,155,230,1)' : 'rgba(255,255,255,0.38)' }}
              >
                FOR CREATORS
              </p>
              <p
                className="font-serif font-medium text-white"
                style={{ fontSize: 'clamp(24px, 3.8vw, 44px)', letterSpacing: '0.04em', lineHeight: 1.2 }}
              >
                素材を<br />探す
              </p>
              <p
                className="mt-4 text-sm leading-7"
                style={{
                  color: hovered === 'explore' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.32)',
                  maxWidth: '18em',
                  transition: 'color 0.4s ease',
                }}
              >
                反物・帯地・古布など<br />全国の素材バンクを検索する
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <span
                  className="text-[8px] tracking-[0.45em]"
                  style={{ color: hovered === 'explore' ? 'rgba(165,155,230,0.9)' : 'rgba(255,255,255,0.3)' }}
                >
                  ← ENTER
                </span>
                <div
                  style={{
                    height: '1px',
                    width: hovered === 'explore' ? '52px' : '20px',
                    backgroundColor: hovered === 'explore' ? 'rgba(165,155,230,0.7)' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Custom cursor */}
        <div
          className="pointer-events-none fixed z-[100] rounded-full"
          style={{
            left: `${mouse.x * 100}%`,
            top: `${mouse.y * 100}%`,
            width: '4px', height: '4px',
            transform: 'translate(-50%,-50%)',
            backgroundColor: 'white',
          }}
        />
        <div
          className="pointer-events-none fixed z-[99] rounded-full border"
          style={{
            left: `${smoothMouse.x * 100}%`,
            top: `${smoothMouse.y * 100}%`,
            width: hovered ? '62px' : '26px',
            height: hovered ? '62px' : '26px',
            transform: 'translate(-50%,-50%)',
            borderColor:
              hovered === 'register' ? warmColor
                : hovered === 'explore' ? coolColor
                  : 'rgba(255,255,255,0.2)',
            mixBlendMode: 'difference',
            transition:
              'width 0.44s cubic-bezier(0.16,1,0.3,1), height 0.44s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease',
          }}
        />

        {/* Footer */}
        <div
          className="absolute bottom-5 left-24 z-40"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: 'opacity 1s ease' }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
            © 2026 MUSUBI MATERIAL BANK
          </p>
        </div>
        <div
          className="absolute bottom-5 right-24 z-40"
          style={{ opacity: phase >= 4 ? 1 : 0, transition: 'opacity 1s ease 0.1s' }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
            MATERIAL ARCHIVE
          </p>
        </div>
      </div>
    </>
  )
}
