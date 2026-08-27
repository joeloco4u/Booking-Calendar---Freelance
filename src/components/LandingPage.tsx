import {
  Waves,
  Check,
  X,
  ArrowRight,
  ArrowDown,
  Menu,
  Clock,
  Droplets,
  Volume2,
  UserCheck,
  Footprints,
  Leaf,
  Ban,
  CalendarDays,
  Sun,
  Send,
  ChevronDown,
} from 'lucide-react'
import { translations, type Lang } from '../i18n'

interface LandingPageProps {
  lang: Lang
  onLangChange: (lang: Lang) => void
  onBookNow: () => void
}

const RULES_ICONS = [Clock, Droplets, Volume2, UserCheck, Footprints, Leaf, Ban]
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
              ? 'bg-cyan-glow text-marine shadow-[0_0_12px_rgba(32,177,238,0.6)]'
              : 'text-white/50 hover:text-white'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  )
}

function LandingHeader({ lang, onLangChange, onBookNow }: LandingPageProps) {
  const t = translations[lang]

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <a href={href} className="text-sm text-white/70 hover:text-white transition-colors">
      {label}
    </a>
  )

  return (
    <header className="bg-navy-deep sticky top-0 z-40 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-5 md:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
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

        <nav className="hidden lg:flex items-center gap-7">
          <NavLink href="#rules" label={t.landing.navRules} />
          <NavLink href="#included" label={t.landing.navIncluded} />
          <NavLink href="#how" label={t.landing.navHow} />
          <NavLink href="#faq" label={t.landing.navFaq} />
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle lang={lang} onLangChange={onLangChange} />
          <button
            onClick={onBookNow}
            className="hidden sm:inline-flex items-center gap-2 px-4 h-9 rounded-full bg-gradient-to-r from-cyan-cta to-cyan-glow text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_20px_-6px_rgba(24,149,199,0.7)] cursor-pointer"
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
    </header>
  )
}

function Hero({ lang, onBookNow }: { lang: Lang; onBookNow: () => void }) {
  const t = translations[lang]

  return (
    <section id="top" className="relative bg-navy-deep overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-[#0e2a4d] to-navy-deep" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[480px] bg-cyan-bright/15 rounded-full blur-[120px]" />
      <div className="absolute -bottom-24 right-[-120px] w-[520px] h-[420px] bg-cyan-glow/20 rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
        <h1 className="mt-6 text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.08] text-balance">
          {t.landing.heroTitle}{' '}
          <span className="bg-gradient-to-r from-cyan-glow to-cyan-cta bg-clip-text text-transparent">
            {t.landing.heroHighlight}
          </span>
        </h1>
        <p className="mt-6 text-lg text-white/75 mx-auto max-w-2xl">{t.landing.heroSub}</p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {t.landing.heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur px-4 py-5"
            >
              <p className="text-2xl font-bold text-cyan-glow">{stat.value}</p>
              <p className="mt-1 text-xs text-white/60 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onBookNow}
            className="inline-flex items-center gap-2 px-8 h-13 py-3.5 rounded-full bg-gradient-to-r from-cyan-cta to-cyan-glow text-white text-base font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_12px_28px_-10px_rgba(60,200,255,0.7)] cursor-pointer"
          >
            {t.landing.heroCta} <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="#rules"
            className="inline-flex items-center gap-2 px-7 h-13 py-3.5 rounded-full bg-white/[0.07] border border-white/15 text-white text-base font-semibold hover:bg-white/[0.12] transition-all"
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

function Rules({ lang }: { lang: Lang }) {
  const t = translations[lang]

  return (
    <section id="rules" className="bg-white py-24 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading title={t.landing.rulesTitle} subtitle={t.landing.rulesSub} />
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.facility.rules.map((rule, idx) => {
            const Icon = RULES_ICONS[idx]
            return (
              <div
                key={rule.title}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_10px_30px_-14px_rgba(10,37,64,0.15)] hover:shadow-[0_16px_40px_-14px_rgba(24,149,199,0.35)] hover:-translate-y-1 transition-all duration-200"
              >
                <span className="absolute top-5 right-5 text-3xl font-black text-slate-100 group-hover:text-cyan-glow/20 transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-marine text-cyan-glow flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-navy leading-snug">{rule.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{rule.desc}</p>
              </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-7 shadow-[0_16px_40px_-22px_rgba(10,37,64,0.18)]">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-emerald-400/15 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-navy">{t.landing.includedTitle}</h3>
            </div>
            <div className="mt-5 space-y-2.5">
              {t.facility.included.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 border border-slate-100"
                >
                  <span className="w-7 h-7 rounded-full bg-cyan-glow/15 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#20B1EE]" />
                  </span>
                  <span className="text-sm font-semibold text-navy">{item.label}</span>
                  {item.note && (
                    <span className="ml-auto text-[11px] font-semibold text-cyan-cta">
                      {item.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-7 shadow-[0_16px_40px_-22px_rgba(10,37,64,0.18)]">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <X className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-navy">{t.landing.notIncludedTitle}</h3>
            </div>
            <div className="mt-5 space-y-2.5">
              {t.landing.notIncluded.map((item) => (
                <div
                  key={item.item}
                  className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 border border-slate-100"
                >
                  <span className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </span>
                  <span className="text-sm font-semibold text-navy">{item.item}</span>
                </div>
              ))}
              <p className="pt-2 text-xs text-slate-400">{t.landing.notIncludedNote}</p>
            </div>
          </div>
        </div>
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

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.landing.steps.map((step, idx) => {
            const Icon = STEP_ICONS[idx]
            return (
              <div key={step.title} className="relative rounded-2xl bg-mist border border-slate-200 p-7">
                <span className="absolute -top-4 left-7 text-3xl font-black text-cyan-glow/30">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-marine text-cyan-glow flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 rounded-3xl bg-marine border border-white/10 p-6 md:p-8">
          <h3 className="text-lg font-bold text-white">{t.landing.scheduleTitle}</h3>
          <div className="mt-5 space-y-3">
            {t.landing.schedule.map((row) => (
              <div
                key={row.day}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-white/[0.05] border border-white/10 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-bold text-white">{row.day}</p>
                  <p className="text-xs text-cyan-glow font-medium">{row.turns}</p>
                </div>
                <p className="text-sm text-white/60 font-medium tabular-nums">{row.hours}</p>
              </div>
            ))}
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-cta to-cyan-glow p-8 md:p-12 shadow-[0_24px_60px_-20px_rgba(24,149,199,0.8)]">
          <div className="absolute -top-24 -right-20 w-96 h-72 bg-white/15 rounded-full blur-[100px]" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                {t.landing.priceTitle}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-6xl font-black text-marine tracking-tight">
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
          {t.landing.faq.map((entry) => (
            <details
              key={entry.q}
              className="group rounded-2xl bg-white border border-slate-200 px-5 py-4 open:border-cyan-glow/50 open:shadow-[0_12px_28px_-14px_rgba(24,149,199,0.4)] transition-all"
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
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-[#0e2a4d] to-navy-deep" />
      <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight text-balance">
          {t.landing.ctaTitle}
        </h2>
        <p className="mt-4 text-base text-white/70 mx-auto max-w-xl">{t.landing.ctaSub}</p>
        <button
          onClick={onBookNow}
          className="mt-9 inline-flex items-center gap-2 px-9 py-4 rounded-full bg-gradient-to-r from-cyan-cta to-cyan-glow text-white text-base font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_12px_32px_-10px_rgba(60,200,255,0.8)] cursor-pointer animate-pulse-glow"
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
          <a href="#rules" className="text-sm text-white/60 hover:text-white transition-colors">
            {t.landing.navRules}
          </a>
          <a href="#included" className="text-sm text-white/60 hover:text-white transition-colors">
            {t.landing.navIncluded}
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
  return (
    <div className="bg-white text-navy min-h-screen antialiased scroll-smooth">
      <LandingHeader lang={lang} onLangChange={onLangChange} onBookNow={onBookNow} />
      <main>
        <Hero lang={lang} onBookNow={onBookNow} />
        <Rules lang={lang} />
        <Included lang={lang} />
        <HowItWorks lang={lang} />
        <Pricing lang={lang} />
        <Faq lang={lang} />
        <CtaBanner lang={lang} onBookNow={onBookNow} />
      </main>
      <LandingFooter lang={lang} />
    </div>
  )
}