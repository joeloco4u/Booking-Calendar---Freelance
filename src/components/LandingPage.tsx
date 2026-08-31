import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Waves,
  Check,
  ArrowRight,
  ArrowDown,
  Menu,
  CalendarDays,
  Sun,
  Send,
  ChevronDown,
} from 'lucide-react'
import { translations, type Lang } from '../i18n'
import poolA from '../images/IMG_5622-_1_.png'
import poolB from '../images/IMG_5617.png'
import poolC from '../images/IMG_5623.png'
import poolD from '../images/IMG_8073.png'
import poolE from '../images/d23868d7-a4d5-47c6-8e1e-3763c671d350.png'
import poolF from '../images/IMG_5623-_1_.png'

interface LandingPageProps {
  lang: Lang
  onLangChange: (lang: Lang) => void
  onBookNow: () => void
}

const INCLUDED_IMAGES = [poolA, poolB, poolC, poolD]
const STEP_ICONS = [CalendarDays, Sun, Send]

function LanguageToggle({ lang, onLangChange }: { lang: Lang; onLangChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10">
      {(['es', 'en'] as const).map((code) => (
        <button
          key={code}
          onClick={() => onLangChange(code)}
          className={`px-2.5 h-7 rounded-full text-xs font-bold uppercase transition-all active:scale-95 cursor-pointer ${
            lang === code
              ? 'bg-[#0E2138] text-cyan-glow border border-[#1895C7]/40'
              : 'text-white/50 hover:text-white'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

const NAV_SECTIONS = ['included', 'rules', 'how', 'faq'] as const

function LandingHeader({ lang, onLangChange, onBookNow }: LandingPageProps) {
  const t = translations[lang]

  const headerRef = useRef<HTMLElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const activeRef = useRef(0)
  const hoverRef = useRef<number | null>(null)

  const [activeIdx, setActiveIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const navItems = [
    { href: '#included', label: t.landing.navIncluded },
    { href: '#rules', label: t.landing.navRules },
    { href: '#how', label: t.landing.navHow },
    { href: '#faq', label: t.landing.navFaq },
  ]

  const moveIndicator = useCallback(() => {
    const headerRect = headerRef.current?.getBoundingClientRect()
    const link = linkRefs.current[hoverRef.current ?? activeRef.current]
    const indicator = indicatorRef.current
    if (!headerRect || !link || !indicator) return
    const linkRect = link.getBoundingClientRect()
    indicator.style.left = `${linkRect.left - headerRect.left}px`
    indicator.style.width = `${linkRect.width}px`
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const idx = NAV_SECTIONS.indexOf(entry.target.id as (typeof NAV_SECTIONS)[number])
          if (idx === -1) return
          activeRef.current = idx
          setActiveIdx(idx)
        })
      },
      { rootMargin: '-80px 0px -45% 0px', threshold: 0 },
    )
    NAV_SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    const onResize = () => moveIndicator()
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [moveIndicator])

  useEffect(() => {
    moveIndicator()
  }, [moveIndicator, activeIdx, hoverIdx, lang])

  const setHover = (idx: number) => {
    hoverRef.current = idx
    setHoverIdx(idx)
  }

  const clearHover = () => {
    hoverRef.current = null
    setHoverIdx(null)
  }

  const linkClass = (idx: number) => {
    const isOn = idx === (hoverIdx ?? activeIdx)
    return isOn
      ? 'text-sm text-white font-semibold transition-all cursor-pointer'
      : 'text-sm text-white/70 font-medium hover:text-white hover:font-semibold transition-all cursor-pointer'
  }

  return (
    <header
      ref={headerRef}
      className="bg-navy-deep sticky top-0 z-40 border-b border-white/[0.06] relative"
    >
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/FlatamLogo.png"
            alt="Freelance Latam Logo"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-glow/40"
          />
          <div className="leading-tight">
            <p className="text-white font-semibold tracking-tight text-sm">Freelance Latam</p>
            <p className="text-[11px] text-cyan-glow/80 font-medium hidden sm:block">Pool & Facilities</p>
          </div>
        </div>

        <nav
          className="hidden lg:flex items-center justify-self-center gap-7"
          onMouseLeave={clearHover}
        >
          {navItems.map((item, idx) => (
            <a
              key={item.href}
              ref={(el) => {
                linkRefs.current[idx] = el
              }}
              href={item.href}
              onMouseEnter={() => setHover(idx)}
              className={linkClass(idx)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <LanguageToggle lang={lang} onLangChange={onLangChange} />
          <button
            onClick={onBookNow}
            className="hidden sm:inline-flex min-w-[140px] items-center justify-center gap-2 px-4 h-9 rounded-lg bg-[#1895C7] text-white text-sm font-bold hover:bg-[#1279AE] active:scale-95 transition-all cursor-pointer"
          >
            {t.landing.heroCta}
          </button>
          <a
            href="#top"
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:bg-white/[0.08] transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </a>
        </div>
      </div>
      <span
        ref={indicatorRef}
        className="hidden lg:block pointer-events-none absolute bottom-0 h-[2px] rounded-t-[2px]"
        style={{
          background: '#1895C7',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: 0,
        }}
      />
    </header>
  )
}

function Hero({ lang, onBookNow }: { lang: Lang; onBookNow: () => void }) {
  const t = translations[lang]

  return (
    <section id="top" className="relative bg-[#0E2138] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={poolF}
          alt=""
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10, 25, 47, 0.85) 0%, rgba(13, 37, 63, 0.95) 100%)',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[620px] w-full max-w-5xl flex-col items-center justify-center px-6 py-24 text-center md:min-h-[700px]">
        <h1 className="mt-4 max-w-4xl text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.12] text-balance">
          {t.landing.heroTitle}{' '}
          <span className="bg-gradient-to-r from-cyan-glow to-cyan-cta bg-clip-text text-transparent">
            {t.landing.heroHighlight}
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/75 mx-auto">{t.landing.heroSub}</p>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 sm:grid-cols-3 gap-4 mx-auto">
          {t.landing.heroStats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur px-4 py-5 text-center"
            >
              <p className="text-2xl font-bold text-cyan-glow">{stat.value}</p>
              <p className="mt-1 text-xs text-white/60 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onBookNow}
            className="inline-flex items-center gap-2 px-8 h-13 py-3.5 rounded-full bg-[#0E2138] border border-[#1895C7] text-white text-base font-bold hover:bg-[#142A44] active:scale-95 transition-all cursor-pointer"
          >
            {t.landing.heroCta} <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#rules"
            className="inline-flex items-center gap-2 px-7 h-13 py-3.5 rounded-full bg-white/[0.07] border border-white/20 text-white text-base font-semibold hover:border-[#1895C7]/60 hover:bg-white/[0.12] transition-all"
          >
            {t.landing.heroSecondary} <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-navy tracking-tight text-balance">
        {title}
      </h2>
      <p className="mt-4 text-base text-slate-600">{subtitle}</p>
    </div>
  )
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function Rules({ lang }: { lang: Lang }) {
  const t = translations[lang]
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="rules" className="bg-mist py-24 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeading title={t.landing.rulesTitle} subtitle={t.landing.rulesSub} />

        <div className="mt-14 space-y-4">
          {t.facility.rules.map((rule, idx) => {
            const isOpen = open === idx
            return (
              <Reveal key={idx} delay={idx * 60}>
                <div
                  className={`group overflow-hidden rounded-[14px] transition-all duration-300 ${
                    isOpen
                      ? 'border-2 border-[#1895C7] bg-[#1895C7]/5 shadow-[0_10px_28px_-14px_rgba(10,25,47,0.45)] hover:-translate-y-0.5'
                      : 'border border-[#E2E8F0]/80 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]'
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : idx)}
                    className="flex w-full cursor-pointer items-center gap-4 md:gap-5 px-5 py-5 md:px-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`text-3xl md:text-4xl font-black tabular-nums leading-none transition-all duration-300 ${
                        isOpen ? 'text-[#1895C7]' : 'text-[#1895C7]'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-base md:text-lg font-bold text-[#0E2138] leading-snug">
                      {rule.title}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 border-[#1895C7] bg-[#1895C7] text-white'
                          : 'border-slate-200 bg-slate-100 text-[#1895C7]'
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 md:px-6 text-base font-medium text-[#334155] leading-relaxed md:pl-[4.75rem]">
                        {rule.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Included({ lang }: { lang: Lang }) {
  const t = translations[lang]

  return (
    <section id="included" className="bg-white py-24 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading title={t.landing.includedTitle} subtitle={t.landing.includedSub} />

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {t.landing.includedCards.map((card, idx) => (
            <Reveal key={idx} delay={idx * 90}>
              <article className="group relative aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-[16px] bg-marine-2 shadow-[0_24px_50px_-24px_rgba(10,37,64,0.45)]">
                <img
                  src={INCLUDED_IMAGES[idx]}
                  alt={`${card.title} ${card.highlight}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E2138]/90 via-[#0E2138]/35 to-[#1895C7]/10" />
                <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
                  <span className="inline-flex w-fit items-center rounded-full border border-cyan-glow/40 bg-[#0E2138]/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-glow backdrop-blur">
                    {card.tag}
                  </span>
                  <h3 className="mt-3 text-2xl md:text-3xl font-bold text-white leading-tight text-balance">
                    {card.title} <span className="text-cyan-glow">{card.highlight}</span>
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/75 leading-relaxed">{card.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          {t.landing.includedNotLabel}:{' '}
          <span className="font-semibold text-slate-700">
            {t.landing.notIncluded.map((n) => n.item).join(' · ')}
          </span>
        </p>
      </div>
    </section>
  )
}

function HowItWorks({ lang }: { lang: Lang }) {
  const t = translations[lang]

  return (
    <section id="how" className="bg-white py-24 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading title={t.landing.howTitle} subtitle={t.landing.howSub} />

        <div className="relative mt-14 rounded-[20px] border border-[#f0f0f0] bg-white px-6 py-12 md:px-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div
            className="pointer-events-none absolute inset-x-10 hidden md:block"
            style={{
              top: '31px',
              height: '2px',
              background: 'linear-gradient(90deg, #1895C7 0%, #1279AE 100%)',
            }}
          />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-y-14 md:gap-x-6">
            {t.landing.steps.map((step, idx) => {
              const Icon = STEP_ICONS[idx]
              return (
                <Reveal key={idx} delay={idx * 200} className="flex flex-col items-center">
                  <div className="group flex w-full max-w-[340px] flex-col items-stretch">
                    <div className="relative z-10 mx-auto -mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-glow/40 bg-white text-sm font-black tracking-wide text-[#1895C7] shadow-[0_8px_20px_rgba(10,25,47,0.12)]">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex min-h-[200px] flex-col items-center rounded-2xl border border-[#f0f0f0] bg-white px-6 pt-10 pb-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1895C7] hover:shadow-[0_18px_40px_-12px_rgba(10,25,47,0.2)]">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1895C7]/15 text-[#1895C7]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-navy">{step.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          <div className="relative overflow-hidden rounded-3xl lg:col-span-3 min-h-[260px] shadow-[0_24px_50px_-24px_rgba(10,37,64,0.4)]">
            <img
              src={poolE}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E2138]/85 via-[#0E2138]/20 to-transparent" />
            <div className="relative flex h-full items-end p-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-cyan-glow" />
                {t.facility.days}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-[#f8fafc] p-6 lg:col-span-2">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-navy">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-glow/10 text-cyan-cta">
                <CalendarDays className="h-5 w-5" />
              </span>
              {t.landing.scheduleTitle}
            </h3>
            <div className="mt-5 space-y-3">
              {t.landing.schedule.map((row, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-navy">{row.day}</p>
                    <span className="rounded-full bg-cyan-glow/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-cta">
                      {row.turns}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 tabular-nums">{row.hours}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing({ lang }: { lang: Lang }) {
  const t = translations[lang]

  return (
    <section className="bg-mist pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-[#0E2138] border border-[#1895C7]/20 p-8 md:p-12 shadow-[0_28px_60px_-28px_rgba(8,19,34,0.7)]">
          <div className="absolute -top-24 -right-20 w-96 h-72 bg-white/15 rounded-full blur-[100px]" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                {t.landing.priceTitle}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-6xl font-black text-white tracking-tight">
                  {t.landing.priceValue}
                </span>
                <span className="text-lg font-semibold text-white/90 pb-2">
                  {t.landing.pricePer}
                </span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-white/90 leading-relaxed">
                {t.landing.priceSub}
              </p>
            </div>
            <ul className="space-y-3">
              {t.landing.priceIncludes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white/10 border border-white/20 px-4 py-3 backdrop-blur"
                >
                  <span className="w-6 h-6 rounded-full bg-marine flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-cyan-glow" />
                  </span>
                  <span className="text-sm font-semibold text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq({ lang }: { lang: Lang }) {
  const t = translations[lang]

  return (
    <section id="faq" className="bg-mist pb-24 scroll-mt-16">
      <div className="max-w-3xl mx-auto px-6">
        <SectionHeading title={t.landing.faqTitle} subtitle={t.landing.faqSub} />
        <div className="mt-12 space-y-3">
          {t.landing.faq.map((entry, idx) => (
            <details
              key={idx}
              className="group rounded-2xl bg-white border border-slate-200 px-5 py-4 open:border-cyan-glow/50 open:shadow-[0_16px_32px_-18px_rgba(8,24,43,0.35)] transition-all"
            >
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="text-sm md:text-base font-bold text-navy">{entry.q}</span>
                <span className="w-7 h-7 rounded-full bg-mist flex items-center justify-center shrink-0 group-open:bg-cyan-glow/15">
                  <ChevronDown className="w-4 h-4 text-cyan-cta transition-transform duration-200 group-open:rotate-180" />
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-500 leading-relaxed pr-8">{entry.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBanner({ lang, onBookNow }: { lang: Lang; onBookNow: () => void }) {
  const t = translations[lang]

  return (
    <section className="bg-navy-deep relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-[#123049] to-navy-deep" />
      <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight text-balance">
          {t.landing.ctaTitle}
        </h2>
        <p className="mt-4 text-base text-white/70 mx-auto max-w-xl">{t.landing.ctaSub}</p>
        <button
          onClick={onBookNow}
          className="mt-9 inline-flex items-center gap-2 px-9 py-4 rounded-full bg-[#0E2138] border border-[#1895C7] text-white text-base font-bold hover:bg-[#142A44] active:scale-95 transition-all cursor-pointer"
        >
          <Waves className="w-5 h-5" />
          {t.landing.cta} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  )
}

function LandingFooter({ lang }: { lang: Lang }) {
  const t = translations[lang]

  return (
    <footer className="bg-navy-deep border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <img
            src="/FlatamLogo.png"
            alt="Freelance Latam Logo"
            className="w-7 h-7 rounded-full object-cover ring-1 ring-white/20"
          />
          <span className="text-white font-semibold tracking-tight">Freelance Latam</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-6">
          <a href="#included" className="text-sm text-white/60 hover:text-white transition-colors">
            {t.landing.navIncluded}
          </a>
          <a href="#rules" className="text-sm text-white/60 hover:text-white transition-colors">
            {t.landing.navRules}
          </a>
          <a href="#how" className="text-sm text-white/60 hover:text-white transition-colors">
            {t.landing.navHow}
          </a>
          <a href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">
            {t.landing.navFaq}
          </a>
        </nav>
        <p className="text-xs text-white/40">
          © 2026 Freelance Latam · {t.landing.heroHighlight}
        </p>
      </div>
    </footer>
  )
}

export default function LandingPage({ lang, onLangChange, onBookNow }: LandingPageProps) {
  const navigate = useNavigate()
  return (
    <div className="bg-white text-navy min-h-screen antialiased scroll-smooth">
      <LandingHeader
        lang={lang}
        onLangChange={onLangChange}
        onBookNow={() => navigate('/booking', { state: { scrollToBooking: true } })}
      />
      <main>
        <Hero lang={lang} onBookNow={onBookNow} />
        <Included lang={lang} />
        <Rules lang={lang} />
        <HowItWorks lang={lang} />
        <Pricing lang={lang} />
        <Faq lang={lang} />
        <CtaBanner lang={lang} onBookNow={onBookNow} />
      </main>
      <LandingFooter lang={lang} />
    </div>
  )
}