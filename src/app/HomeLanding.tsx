'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export type FeaturedMaterial = {
  id: string
  name: string
  category: string
  era: string
  origin: string
  story: string
  image: string | null
}

export type ShowcaseItem = {
  id: string
  name: string
  category: string
  era: string
  image: string
}

export default function HomeLanding({
  count,
  featured,
  showcase,
}: {
  count: number
  featured: FeaturedMaterial | null
  showcase: ShowcaseItem[]
}) {
  const [phase, setPhase] = useState(0)
  const [hovered, setHovered] = useState<'explore' | 'register' | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 520),
      setTimeout(() => setPhase(3), 1000),
      setTimeout(() => setPhase(4), 1500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ホバーした側がゆるく広がる（両側とも常に読める範囲で）
  const panelFlex = (side: 'explore' | 'register'): React.CSSProperties =>
    isMobile
      ? { flex: '1 1 0%', minHeight: '50svh' }
      : {
          flex:
            hovered === side ? '0 0 56%' : hovered && hovered !== side ? '0 0 44%' : '1 1 0%',
          transition: 'flex 0.6s cubic-bezier(0.16,1,0.3,1)',
        }

  const rise = (p: number, delay = 0): React.CSSProperties => ({
    opacity: phase >= p ? 1 : 0,
    transform: phase >= p ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  return (
    <>
      <style>{`
        @keyframes hl-scroll-cue {
          0%,100%{opacity:.25;transform:translateY(0)} 50%{opacity:.7;transform:translateY(6px)}
        }

        /* === スクロール連動アニメーション（CSSネイティブ） === */
        @keyframes sd-rise {
          from { opacity: 0; transform: translateY(64px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sd-fade-up {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sd-zoom {
          from { transform: scale(1.0); }
          to   { transform: scale(1.16); }
        }

        /* 既定＝表示済み（scroll-timeline 非対応ブラウザのフォールバック） */
        .sd-rise, .sd-fade-up { opacity: 1; }

        @supports (animation-timeline: view()) {
          .sd-rise {
            opacity: 0;
            animation: sd-rise linear both;
            animation-timeline: view();
            animation-range: entry 6% cover 26%;
          }
          .sd-fade-up {
            opacity: 0;
            animation: sd-fade-up linear both;
            animation-timeline: view();
            animation-range: entry 0% entry 78%;
          }
          .sd-zoom {
            animation: sd-zoom linear both;
            animation-timeline: view();
            animation-range: cover 0% cover 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sd-rise, .sd-fade-up, .sd-zoom { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <main className="w-full overflow-x-hidden" style={{ backgroundColor: '#0a0807' }}>

      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: '100svh', backgroundColor: '#0a0807' }}
      >
        {/* 和紙ノイズ（全面） */}
        <div
          className="pointer-events-none absolute inset-[-20%] z-[40] opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px',
          }}
        />

        <div className="flex min-h-[100svh] flex-col md:flex-row">
          {/* ============ 左：探す（買い手） ============ */}
          <Link
            href="/materials"
            onMouseEnter={() => !isMobile && setHovered('explore')}
            onMouseLeave={() => !isMobile && setHovered(null)}
            className="group relative flex flex-col justify-center overflow-hidden"
            style={{ ...panelFlex('explore'), minWidth: 0 }}
          >
            {/* 藍の闇（探す）— 写真ではなく光の世界 */}
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{ background: 'linear-gradient(160deg, #0b0d15 0%, #090a11 58%, #070709 100%)' }}
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700"
              style={{
                background: 'radial-gradient(ellipse 78% 68% at 34% 42%, rgba(80,76,140,0.40) 0%, transparent 62%)',
                opacity: hovered === 'explore' ? 1 : 0.7,
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5"
              style={{ background: 'linear-gradient(to top, rgba(6,7,10,0.75) 0%, transparent 100%)' }}
            />

            <div
              className="relative z-10"
              style={{
                paddingLeft: 'clamp(28px,6vw,96px)',
                paddingRight: 'clamp(24px,4vw,64px)',
                paddingTop: isMobile ? '92px' : '0',
                paddingBottom: isMobile ? '44px' : '0',
                maxWidth: 600,
              }}
            >
              <p style={rise(1)} className="mb-5 flex items-center gap-3 font-serif">
                <span style={{ height: 1, width: 36, background: 'linear-gradient(to right, rgba(196,154,90,0.9), transparent)' }} />
                <span style={{ color: 'rgba(214,180,120,0.95)', fontSize: 12, letterSpacing: '0.42em' }}>素材を探す</span>
              </p>
              <h2
                className="font-serif font-medium text-white"
                style={{ ...rise(2), fontSize: 'clamp(30px,4.6vw,58px)', lineHeight: 1.26, letterSpacing: '0.02em', textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
              >
                受け継がれた布に、
                <br />
                出会う。
              </h2>
              <p
                className="mt-6 font-serif"
                style={{ ...rise(2, 120), color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(14px,1.5vw,17px)', lineHeight: 1.95, maxWidth: '24em', fontWeight: 300 }}
              >
                老舗の蔵に眠っていた着物・帯・反物。一点もの、来歴つき。つくる人のための素材。
              </p>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1" style={{ ...rise(3), color: 'rgba(214,180,120,0.85)', fontSize: 11, letterSpacing: '0.12em' }}>
                {['一点もの', '来歴つき', 'アップサイクル素材'].map((c, i) => (
                  <span key={i} className="flex items-center gap-4">{i > 0 && <span style={{ opacity: 0.4 }}>·</span>}{c}</span>
                ))}
              </div>
              <div
                className="mt-9 inline-flex items-center gap-3"
                style={{ ...rise(4), backgroundColor: 'rgba(196,154,90,0.95)', color: '#0a0807', padding: '15px 32px', borderRadius: 2, fontSize: 14.5, letterSpacing: '0.16em', fontWeight: 500, boxShadow: '0 8px 32px rgba(196,154,90,0.22)' }}
              >
                素材を見る
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
              {count > 0 && (
                <p className="mt-5 font-serif" style={{ ...rise(4, 120), color: 'rgba(255,255,255,0.6)', fontSize: 12.5, letterSpacing: '0.06em' }}>
                  現在 <span style={{ color: 'rgba(214,180,120,0.95)', fontSize: 16 }}>{count}</span> 点が、作り手を待っています
                </p>
              )}
            </div>
          </Link>

          {/* 中央の金ヘアライン（PCのみ） */}
          {!isMobile && (
            <div
              className="relative z-20"
              style={{ width: 1, background: 'linear-gradient(to bottom, transparent, rgba(196,154,90,0.5) 18%, rgba(196,154,90,0.5) 82%, transparent)' }}
            />
          )}

          {/* ============ 右：登録（提供元） ============ */}
          <a
            href="https://musubi-sozai.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => !isMobile && setHovered('register')}
            onMouseLeave={() => !isMobile && setHovered(null)}
            className="group relative flex flex-col justify-center overflow-hidden"
            style={{ ...panelFlex('register'), minWidth: 0, backgroundColor: '#0c0908' }}
          >
            {/* 蔵の暖かい闇（登録）— 写真ではなく光の世界 */}
            <div
              className="pointer-events-none absolute inset-0 z-0"
              style={{ background: 'linear-gradient(160deg, #130b08 0%, #0e0908 58%, #090605 100%)' }}
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700"
              style={{
                background: 'radial-gradient(ellipse 78% 68% at 66% 42%, rgba(182,100,58,0.40) 0%, transparent 62%)',
                opacity: hovered === 'register' ? 1 : 0.72,
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5"
              style={{ background: 'linear-gradient(to top, rgba(8,5,4,0.75) 0%, transparent 100%)' }}
            />
            {isMobile && (
              <div className="absolute inset-x-0 top-0 z-[2] h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(196,154,90,0.45), transparent)' }} />
            )}

            <div
              className="relative z-10"
              style={{
                paddingLeft: 'clamp(28px,6vw,96px)',
                paddingRight: 'clamp(24px,4vw,64px)',
                paddingTop: isMobile ? '44px' : '0',
                paddingBottom: isMobile ? '60px' : '0',
                maxWidth: 600,
              }}
            >
              <p style={rise(1)} className="mb-5 flex items-center gap-3 font-serif">
                <span style={{ height: 1, width: 36, background: 'linear-gradient(to right, rgba(224,150,96,0.9), transparent)' }} />
                <span style={{ color: 'rgba(224,168,116,0.95)', fontSize: 12, letterSpacing: '0.42em' }}>素材を登録する</span>
              </p>
              <h2
                className="font-serif font-medium text-white"
                style={{ ...rise(2), fontSize: 'clamp(30px,4.6vw,58px)', lineHeight: 1.26, letterSpacing: '0.02em', textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
              >
                蔵に眠る一枚を、
                <br />
                託す。
              </h2>
              <p
                className="mt-6 font-serif"
                style={{ ...rise(2, 120), color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(14px,1.5vw,17px)', lineHeight: 1.95, maxWidth: '24em', fontWeight: 300 }}
              >
                使われずに眠る着物・帯・反物を、次の作り手へ。やり取りはすべて、遙が間に入って承ります。
              </p>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1" style={{ ...rise(3), color: 'rgba(224,168,116,0.85)', fontSize: 11, letterSpacing: '0.12em' }}>
                {['登録無料', '遙が仲介', '成約時のみ10%'].map((c, i) => (
                  <span key={i} className="flex items-center gap-4">{i > 0 && <span style={{ opacity: 0.4 }}>·</span>}{c}</span>
                ))}
              </div>
              <div
                className="mt-9 inline-flex items-center gap-3"
                style={{ ...rise(4), backgroundColor: 'rgba(214,150,96,0.96)', color: '#0a0807', padding: '15px 32px', borderRadius: 2, fontSize: 14.5, letterSpacing: '0.16em', fontWeight: 600, boxShadow: '0 8px 32px rgba(176,96,56,0.26)' }}
              >
                素材を登録する
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
              <p className="mt-5 font-serif" style={{ ...rise(4, 120), color: 'rgba(255,255,255,0.45)', fontSize: 11.5, letterSpacing: '0.04em' }}>
                提供元の公式登録ページ（musubi-sozai）へ。ご相談だけでも歓迎です。
              </p>
            </div>
          </a>
        </div>

        {/* スクロール導線（下に物語・在庫・提供元詳細あり） */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-30 flex justify-center">
          <span
            className="font-serif"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, letterSpacing: '0.4em', animation: 'hl-scroll-cue 2.4s ease-in-out infinite' }}
          >
            SCROLL ↓
          </span>
        </div>
      </section>

      {/* === 物語を深める：一枚の布に寄る（スクロールでズーム） === */}
      {featured && featured.image && featured.story && (
        <section
          className="relative w-full overflow-hidden"
          style={{ minHeight: '108vh' }}
        >
          {/* 布のクローズアップ（スクロール連動で奥行きズーム） */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="sd-zoom absolute inset-0" style={{ willChange: 'transform' }}>
              <Image
                src={featured.image}
                alt={featured.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(100deg, rgba(10,8,7,0.92) 0%, rgba(10,8,7,0.7) 45%, rgba(10,8,7,0.4) 100%)',
            }}
          />

          {/* 来歴テキスト（スクロールで立ち上がる） */}
          <div
            className="relative z-10 flex min-h-[108vh] flex-col justify-center"
            style={{
              paddingLeft: 'clamp(28px, 8vw, 132px)',
              paddingRight: 'clamp(24px, 6vw, 80px)',
              paddingTop: 'clamp(80px,12vh,140px)',
              paddingBottom: 'clamp(80px,12vh,140px)',
              maxWidth: '1180px',
            }}
          >
            <p
              className="sd-fade-up mb-6 font-serif"
              style={{ color: 'rgba(214,180,120,0.92)', fontSize: 12, letterSpacing: '0.4em' }}
            >
              一枚の布の、来歴
            </p>
            <h2
              className="sd-fade-up font-serif font-medium text-white"
              style={{ fontSize: 'clamp(26px,4.4vw,52px)', lineHeight: 1.4, letterSpacing: '0.02em', maxWidth: '20em' }}
            >
              {featured.name}
            </h2>
            <p
              className="sd-fade-up mt-7 font-serif"
              style={{
                color: 'rgba(255,255,255,0.78)',
                fontSize: 'clamp(14px,1.7vw,18px)',
                lineHeight: 2.1,
                fontWeight: 300,
                maxWidth: '32em',
              }}
            >
              {featured.story}
            </p>
            <div
              className="sd-fade-up mt-7 flex flex-wrap items-center gap-x-3 gap-y-1"
              style={{ color: 'rgba(214,180,120,0.9)', fontSize: 11.5, letterSpacing: '0.14em' }}
            >
              {[featured.category, featured.era !== '不明' ? featured.era : '', featured.origin !== '日本' ? featured.origin : '']
                .filter(Boolean)
                .map((chip, i) => (
                  <span key={i} className="flex items-center gap-3">
                    {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                    {chip}
                  </span>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* === 実在庫が迫り上がる：いま出会える布 === */}
      {showcase.length > 0 && (
        <section
          className="relative w-full"
          style={{
            paddingTop: 'clamp(90px,14vh,160px)',
            paddingBottom: 'clamp(90px,14vh,160px)',
            paddingLeft: 'clamp(24px,6vw,96px)',
            paddingRight: 'clamp(24px,6vw,96px)',
          }}
        >
          <div className="mx-auto" style={{ maxWidth: 1280 }}>
            <p
              className="sd-fade-up mb-4 font-serif"
              style={{ color: 'rgba(214,180,120,0.92)', fontSize: 12, letterSpacing: '0.4em' }}
            >
              いま、出会える布
            </p>
            <h2
              className="sd-fade-up font-serif font-medium text-white"
              style={{ fontSize: 'clamp(24px,3.4vw,44px)', lineHeight: 1.3, letterSpacing: '0.02em', marginBottom: 'clamp(40px,6vh,72px)' }}
            >
              一点ずつ、次の作り手を待っている。
            </h2>

            <div
              className="grid gap-5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}
            >
              {showcase.map((m) => (
                <Link
                  key={m.id}
                  href={`/materials/${m.id}`}
                  className="sd-rise group relative block overflow-hidden"
                  style={{ borderRadius: 3, willChange: 'transform, opacity' }}
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: '3 / 4', borderRadius: 3 }}
                  >
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(10,8,7,0.82) 0%, rgba(10,8,7,0.05) 55%, transparent 100%)' }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p
                        className="font-serif text-white"
                        style={{ fontSize: 15, lineHeight: 1.4, letterSpacing: '0.02em' }}
                      >
                        {m.name}
                      </p>
                      <p
                        className="mt-1.5 font-serif"
                        style={{ color: 'rgba(214,180,120,0.92)', fontSize: 10.5, letterSpacing: '0.12em' }}
                      >
                        {[m.category, m.era].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="sd-fade-up mt-14 flex justify-center">
              <Link
                href="/materials"
                className="group inline-flex items-center gap-3"
                style={{
                  border: '1px solid rgba(196,154,90,0.7)',
                  color: 'rgba(224,196,140,0.98)',
                  padding: '16px 38px',
                  borderRadius: 2,
                  fontSize: 15,
                  letterSpacing: '0.16em',
                  fontWeight: 500,
                  backgroundColor: 'rgba(196,154,90,0.06)',
                }}
              >
                すべての素材を見る
                <span className="group-hover:translate-x-1" style={{ transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* === 提供元への訴求：素材をお持ちの方へ === */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          borderTop: '1px solid rgba(196,154,90,0.18)',
          paddingTop: 'clamp(96px,15vh,170px)',
          paddingBottom: 'clamp(96px,15vh,170px)',
          paddingLeft: 'clamp(24px,6vw,96px)',
          paddingRight: 'clamp(24px,6vw,96px)',
          backgroundColor: '#0c0908',
        }}
      >
        {/* 暖色の気配（提供元側＝蔵の温もり） */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse at 78% 30%, rgba(176,96,56,0.16) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 mx-auto" style={{ maxWidth: 1080 }}>
          <p
            className="sd-fade-up mb-6 font-serif"
            style={{ color: 'rgba(224,168,116,0.95)', fontSize: 12, letterSpacing: '0.4em' }}
          >
            素材をお持ちの方へ
          </p>
          <h2
            className="sd-fade-up font-serif font-medium text-white"
            style={{ fontSize: 'clamp(26px,4.4vw,54px)', lineHeight: 1.34, letterSpacing: '0.02em', maxWidth: '18em' }}
          >
            蔵に眠る一枚を、
            <br />
            次の作り手へ託しませんか。
          </h2>
          <p
            className="sd-fade-up mt-7 font-serif"
            style={{
              color: 'rgba(255,255,255,0.76)',
              fontSize: 'clamp(15px,1.7vw,18px)',
              lineHeight: 2.1,
              fontWeight: 300,
              maxWidth: '32em',
            }}
          >
            使われずに眠っている着物・帯・反物を、来歴とともに、
            <br className="hidden sm:block" />
            つくる人の手へ。やり取りはすべて、遙が間に入って承ります。
          </p>

          {/* 3つの価値（なぜ預けるか） */}
          <div
            className="mt-12 grid gap-px"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
              backgroundColor: 'rgba(196,154,90,0.16)',
              border: '1px solid rgba(196,154,90,0.16)',
            }}
          >
            {[
              {
                t: '眠った布に、役目を',
                d: '処分するには忍びない着物・帯・反物を、捨てずに、必要とする作り手の手へ繋ぎます。',
              },
              {
                t: 'すべて遙が仲介',
                d: '来歴の整理から、買い手とのやり取りまで。初めての方でも、丸ごとお任せいただけます。',
              },
              {
                t: '成約まで、費用ゼロ',
                d: 'ご登録・出品は無料。お手数料をいただくのは成約したときだけ（成約額の10%）です。',
              },
            ].map((v, i) => (
              <div
                key={i}
                className="sd-rise"
                style={{ backgroundColor: '#0c0908', padding: 'clamp(26px,3vw,38px)' }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="font-serif"
                    style={{ color: 'rgba(224,168,116,0.9)', fontSize: 12, letterSpacing: '0.2em' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ height: 1, width: 28, background: 'rgba(196,154,90,0.5)' }} />
                </div>
                <p
                  className="font-serif text-white"
                  style={{ fontSize: 'clamp(17px,1.9vw,21px)', lineHeight: 1.4, letterSpacing: '0.02em' }}
                >
                  {v.t}
                </p>
                <p
                  className="mt-3 font-serif"
                  style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13.5, lineHeight: 1.95, fontWeight: 300 }}
                >
                  {v.d}
                </p>
              </div>
            ))}
          </div>

          {/* 提供元CTA（このセクションは登録を強く後押し＝塗りボタン） */}
          <div className="sd-fade-up mt-12 flex flex-col items-start gap-3">
            <a
              href="https://musubi-sozai.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3"
              style={{
                backgroundColor: 'rgba(214,150,96,0.96)',
                color: '#0a0807',
                padding: '17px 38px',
                borderRadius: 2,
                fontSize: 15,
                letterSpacing: '0.16em',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(176,96,56,0.26)',
              }}
            >
              素材を登録する
              <span className="group-hover:translate-x-1" style={{ transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                →
              </span>
            </a>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, letterSpacing: '0.04em' }}>
              提供元の公式登録ページ（musubi-sozai）へ移動します。ご相談だけでも歓迎です。
            </p>
          </div>
        </div>
      </section>
      </main>
    </>
  )
}
