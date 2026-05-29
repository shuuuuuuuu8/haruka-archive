'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const TITLE_CHARS = ['素', '材', 'バ', 'ン', 'ク']

export default function Home() {
  const [phase, setPhase] = useState(0)
  const [hovered, setHovered] = useState<'register' | 'explore' | null>(null)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const [smoothMouse, setSmoothMouse] = useState({ x: 0.5, y: 0.5 })
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRafRef = useRef<number>(0)
  const particleRafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 650)
    const t3 = setTimeout(() => setPhase(3), 1350)

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
      const pts = Array.from({ length: 80 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.1 + 0.3,
        a: Math.random() * 0.22 + 0.04,
      }))
      const draw = () => {
        ctx.clearRect(0, 0, W, H)
        for (const p of pts) {
          p.x = (p.x + p.vx + W) % W
          p.y = (p.y + p.vy + H) % H
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${p.a})`
          ctx.fill()
        }
        particleRafRef.current = requestAnimationFrame(draw)
      }
      particleRafRef.current = requestAnimationFrame(draw)
    }

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      cancelAnimationFrame(mouseRafRef.current)
      cancelAnimationFrame(particleRafRef.current)
    }
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseRef.current = { x, y }
    setMouse({ x, y })
  }

  const tiltX = (smoothMouse.y - 0.5) * -4
  const tiltY = (smoothMouse.x - 0.5) * 4
  const pX = (smoothMouse.x - 0.5) * 20
  const pY = (smoothMouse.y - 0.5) * 20

  return (
    <>
      <style>{`
        @keyframes grain {
          0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(3%,2%)}
          30%{transform:translate(-1%,4%)} 40%{transform:translate(4%,-1%)} 50%{transform:translate(-3%,3%)}
          60%{transform:translate(2%,-4%)} 70%{transform:translate(-4%,1%)} 80%{transform:translate(1%,-2%)}
          90%{transform:translate(-2%,4%)}
        }
        @keyframes pulse-ring {
          0%  { transform:translate(-50%,-50%) scale(0.8); opacity:.55; }
          100%{ transform:translate(-50%,-50%) scale(3.2); opacity:0; }
        }
        @keyframes scanline {
          0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)}
        }
        @keyframes vline-in {
          from{ transform:scaleY(0); opacity:0; }
          to  { transform:scaleY(1); opacity:1; }
        }
        @keyframes float-slow {
          0%,100%{ transform:translateY(0px); }
          50%    { transform:translateY(-18px); }
        }
      `}</style>

      <div
        ref={containerRef}
        className="relative h-screen w-screen overflow-hidden"
        style={{ backgroundColor: '#060504', cursor: 'none' }}
        onMouseMove={handleMouseMove}
      >
        {/* Particles */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" />

        {/* Noise */}
        <div
          className="pointer-events-none absolute inset-[-20%] z-50 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
            animation: 'grain 0.4s steps(1) infinite',
          }}
        />

        {/* Scanline */}
        <div
          className="pointer-events-none absolute left-0 z-20 h-px w-full opacity-[0.04]"
          style={{
            background: 'linear-gradient(transparent,rgba(255,255,255,.85),transparent)',
            animation: 'scanline 10s linear infinite',
          }}
        />

        {/* Mouse spotlight */}
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: `${smoothMouse.x * 100}%`,
            top: `${smoothMouse.y * 100}%`,
            width: '900px', height: '900px',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(143,63,43,0.09) 0%, rgba(143,63,43,0.025) 45%, transparent 70%)',
          }}
        />

        {/* BG orb warm */}
        <div
          className="pointer-events-none absolute opacity-25"
          style={{
            left: '8%', top: '25%',
            width: '420px', height: '420px',
            background: 'radial-gradient(circle, rgba(143,63,43,0.3) 0%, transparent 70%)',
            animation: 'float-slow 9s ease-in-out infinite',
            transform: `translate(${pX * 0.4}px,${pY * 0.4}px)`,
            transition: 'transform 0.12s ease-out',
          }}
        />

        {/* BG orb cool */}
        <div
          className="pointer-events-none absolute opacity-20"
          style={{
            right: '10%', bottom: '20%',
            width: '340px', height: '340px',
            background: 'radial-gradient(circle, rgba(70,55,120,0.35) 0%, transparent 70%)',
            animation: 'float-slow 12s ease-in-out infinite reverse',
            transform: `translate(${-pX * 0.3}px,${-pY * 0.3}px)`,
            transition: 'transform 0.12s ease-out',
          }}
        />

        {/* Decorative 結 */}
        <div
          className="pointer-events-none absolute select-none font-serif"
          style={{
            fontSize: 'clamp(180px, 30vw, 420px)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.012)',
            top: '50%', left: '50%',
            transform: `translate(-50%,-50%) translate(${pX * 0.9}px,${pY * 0.9}px)`,
            transition: 'transform 0.12s ease-out',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          結
        </div>

        {/* Vertical accent line left */}
        <div
          className="absolute left-20 top-0 origin-top"
          style={{
            width: '1px', height: '100%',
            backgroundColor: 'rgba(255,255,255,0.025)',
            animation: phase >= 1 ? 'vline-in 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s both' : 'none',
          }}
        />

        {/* Vertical accent line right */}
        <div
          className="absolute right-20 top-0 origin-top"
          style={{
            width: '1px', height: '100%',
            backgroundColor: 'rgba(255,255,255,0.025)',
            animation: phase >= 1 ? 'vline-in 1.4s cubic-bezier(0.16,1,0.3,1) 0.35s both' : 'none',
          }}
        />

        {/* Vertical side text */}
        <div
          className="pointer-events-none absolute left-7 top-1/2 z-30 -translate-y-1/2"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 1s ease 1s',
          }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.1)' }}>
            未活用素材バンク
          </p>
        </div>
        <div
          className="pointer-events-none absolute right-7 top-1/2 z-30 -translate-y-1/2"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'opacity 1s ease 1.1s',
          }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.1)' }}>
            伝統工芸の素材を繋ぐ
          </p>
        </div>

        {/* Header */}
        <div
          className="absolute left-24 top-8 z-30"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.9s ease' }}
        >
          <p className="font-serif text-xl font-medium text-white" style={{ letterSpacing: '0.18em' }}>結</p>
          <p className="mt-0.5 text-[7px] tracking-[0.55em]" style={{ color: 'rgba(255,255,255,0.17)' }}>
            MUSUBI MATERIAL BANK
          </p>
        </div>
        <div
          className="absolute right-24 top-8 z-30 text-right"
          style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.9s ease 0.1s' }}
        >
          <p className="text-[7px] tracking-[0.45em]" style={{ color: 'rgba(255,255,255,0.11)' }}>
            KYOTO · ISHIKAWA · JAPAN
          </p>
          <p className="mt-1 text-[7px] tracking-[0.45em]" style={{ color: 'rgba(255,255,255,0.07)' }}>
            EST. 2026
          </p>
        </div>

        {/* Main content */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            transform: `perspective(1400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Eyebrow */}
          <p
            className="mb-8 text-[8px] tracking-[0.75em]"
            style={{
              color: 'rgba(255,255,255,0.16)',
              opacity: phase >= 2 ? 1 : 0,
              transform: phase >= 2 ? 'translateY(0)' : 'translateY(18px)',
              transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            — 伝統工芸の素材を、未来へ結ぶ —
          </p>

          {/* Title - per character */}
          <div className="flex items-end">
            {TITLE_CHARS.map((char, i) => (
              <span
                key={i}
                className="font-serif text-white inline-block"
                style={{
                  fontSize: 'clamp(60px, 10.5vw, 132px)',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                  opacity: phase >= 2 ? 1 : 0,
                  transform: phase >= 2 ? 'translateY(0) skewY(0deg)' : 'translateY(80px) skewY(7deg)',
                  filter: phase >= 2 ? 'blur(0px)' : 'blur(14px)',
                  transition: `
                    opacity 0.85s cubic-bezier(0.16,1,0.3,1) ${i * 0.085 + 0.05}s,
                    transform 0.85s cubic-bezier(0.16,1,0.3,1) ${i * 0.085 + 0.05}s,
                    filter 0.75s ease ${i * 0.085 + 0.05}s
                  `,
                }}
              >
                {char}
              </span>
            ))}
          </div>

          {/* Accent line */}
          <div
            className="my-9 h-px origin-center"
            style={{
              width: '56px',
              backgroundColor: 'rgba(143,63,43,0.65)',
              transform: phase >= 3 ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform 1.1s cubic-bezier(0.16,1,0.3,1)',
            }}
          />

          {/* Cards */}
          <div
            className="flex w-full max-w-2xl px-8 sm:px-0"
            style={{
              opacity: phase >= 3 ? 1 : 0,
              transform: phase >= 3 ? 'translateY(0)' : 'translateY(44px)',
              transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1) 0.1s',
            }}
          >
            {/* Register */}
            <a
              href="https://musubi-sozai-gott.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                cursor: 'none',
                flex: hovered === 'register' ? '0 0 62%' : hovered === 'explore' ? '0 0 38%' : '1 1 0%',
                transition: 'flex 0.65s cubic-bezier(0.16,1,0.3,1)',
                minWidth: 0,
              }}
              onMouseEnter={() => setHovered('register')}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="relative h-full overflow-hidden py-9"
                style={{
                  paddingLeft: 'clamp(18px, 4vw, 44px)',
                  paddingRight: 'clamp(18px, 4vw, 44px)',
                  borderTop: `1px solid ${hovered === 'register' ? 'rgba(180,85,45,0.55)' : 'rgba(255,255,255,0.07)'}`,
                  borderBottom: `1px solid ${hovered === 'register' ? 'rgba(180,85,45,0.55)' : 'rgba(255,255,255,0.07)'}`,
                  borderLeft: `1px solid ${hovered === 'register' ? 'rgba(180,85,45,0.55)' : 'rgba(255,255,255,0.07)'}`,
                  backgroundColor: hovered === 'register' ? 'rgba(143,63,43,0.07)' : 'transparent',
                  transition: 'border-color 0.4s ease, background-color 0.4s ease',
                }}
              >
                {hovered === 'register' && (
                  <>
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        left: '50%', top: '50%',
                        width: '96px', height: '96px',
                        border: '1px solid rgba(143,63,43,0.38)',
                        borderRadius: '50%',
                        animation: 'pulse-ring 1.7s ease-out infinite',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: 'radial-gradient(ellipse at 32% 50%, rgba(143,63,43,0.13) 0%, transparent 68%)' }}
                    />
                  </>
                )}
                <p
                  className="mb-2 text-[7px] tracking-[0.55em]"
                  style={{ color: hovered === 'register' ? 'rgba(215,105,65,0.9)' : 'rgba(255,255,255,0.14)' }}
                >
                  FOR SUPPLIERS
                </p>
                <p
                  className="font-serif font-medium text-white"
                  style={{ fontSize: 'clamp(17px, 2.6vw, 27px)', letterSpacing: '0.05em' }}
                >
                  素材を登録する
                </p>
                <div
                  style={{
                    maxHeight: hovered === 'register' ? '72px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1)',
                    marginTop: hovered === 'register' ? '12px' : '0',
                  }}
                >
                  <p className="text-xs leading-6" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    眠っている着物・帯・反物を<br />次の作り手の手へ届けましょう
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    style={{
                      height: '1px',
                      width: hovered === 'register' ? '46px' : '16px',
                      backgroundColor: hovered === 'register' ? 'rgba(215,105,65,0.7)' : 'rgba(255,255,255,0.12)',
                      transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1), background-color 0.4s',
                    }}
                  />
                  <span className="text-[7px] tracking-[0.45em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                    ENTER
                  </span>
                </div>
              </div>
            </a>

            {/* Divider */}
            <div style={{ width: '1px', flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.055)' }} />

            {/* Explore */}
            <Link
              href="/materials"
              style={{
                cursor: 'none',
                flex: hovered === 'explore' ? '0 0 62%' : hovered === 'register' ? '0 0 38%' : '1 1 0%',
                transition: 'flex 0.65s cubic-bezier(0.16,1,0.3,1)',
                minWidth: 0,
              }}
              onMouseEnter={() => setHovered('explore')}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="relative h-full overflow-hidden py-9"
                style={{
                  paddingLeft: 'clamp(18px, 4vw, 44px)',
                  paddingRight: 'clamp(18px, 4vw, 44px)',
                  borderTop: `1px solid ${hovered === 'explore' ? 'rgba(130,120,180,0.55)' : 'rgba(255,255,255,0.07)'}`,
                  borderBottom: `1px solid ${hovered === 'explore' ? 'rgba(130,120,180,0.55)' : 'rgba(255,255,255,0.07)'}`,
                  borderRight: `1px solid ${hovered === 'explore' ? 'rgba(130,120,180,0.55)' : 'rgba(255,255,255,0.07)'}`,
                  backgroundColor: hovered === 'explore' ? 'rgba(90,80,140,0.07)' : 'transparent',
                  transition: 'border-color 0.4s ease, background-color 0.4s ease',
                }}
              >
                {hovered === 'explore' && (
                  <>
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        left: '50%', top: '50%',
                        width: '96px', height: '96px',
                        border: '1px solid rgba(130,120,180,0.32)',
                        borderRadius: '50%',
                        animation: 'pulse-ring 1.7s ease-out infinite',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: 'radial-gradient(ellipse at 68% 50%, rgba(90,80,140,0.13) 0%, transparent 68%)' }}
                    />
                  </>
                )}
                <p
                  className="mb-2 text-[7px] tracking-[0.55em]"
                  style={{ color: hovered === 'explore' ? 'rgba(175,165,225,0.9)' : 'rgba(255,255,255,0.14)' }}
                >
                  FOR CREATORS
                </p>
                <p
                  className="font-serif font-medium text-white"
                  style={{ fontSize: 'clamp(17px, 2.6vw, 27px)', letterSpacing: '0.05em' }}
                >
                  素材を探す
                </p>
                <div
                  style={{
                    maxHeight: hovered === 'explore' ? '72px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1)',
                    marginTop: hovered === 'explore' ? '12px' : '0',
                  }}
                >
                  <p className="text-xs leading-6" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    反物・帯地・古布など<br />全国の素材バンクを検索する
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    style={{
                      height: '1px',
                      width: hovered === 'explore' ? '46px' : '16px',
                      backgroundColor: hovered === 'explore' ? 'rgba(175,165,225,0.65)' : 'rgba(255,255,255,0.12)',
                      transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1), background-color 0.4s',
                    }}
                  />
                  <span className="text-[7px] tracking-[0.45em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                    ENTER
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Custom cursor dot */}
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
        {/* Custom cursor ring */}
        <div
          className="pointer-events-none fixed z-[99] rounded-full border"
          style={{
            left: `${smoothMouse.x * 100}%`,
            top: `${smoothMouse.y * 100}%`,
            width: hovered ? '62px' : '26px',
            height: hovered ? '62px' : '26px',
            transform: 'translate(-50%,-50%)',
            borderColor:
              hovered === 'register'
                ? 'rgba(215,105,65,0.75)'
                : hovered === 'explore'
                  ? 'rgba(175,165,225,0.75)'
                  : 'rgba(255,255,255,0.2)',
            mixBlendMode: 'difference',
            transition:
              'width 0.42s cubic-bezier(0.16,1,0.3,1), height 0.42s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease',
          }}
        />

        {/* Footer */}
        <div
          className="absolute bottom-6 left-24 z-30"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: 'opacity 1s ease 0.9s' }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
            © 2026 MUSUBI MATERIAL BANK
          </p>
        </div>
        <div
          className="absolute bottom-6 right-24 z-30"
          style={{ opacity: phase >= 3 ? 1 : 0, transition: 'opacity 1s ease 1s' }}
        >
          <p className="text-[7px] tracking-[0.5em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
            MATERIAL ARCHIVE
          </p>
        </div>
      </div>
    </>
  )
}
