import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Shield,
  User,
  LayoutDashboard,
  BookCheck,
  CalendarDays,
  Users,
  Settings,
  Menu,
  X,
  Home,
  Waves,
  ClipboardList,
  ScrollText,
  HelpCircle,
} from 'lucide-react'
import { translations, type Lang } from '../i18n'

export type AdminSection = 'dashboard' | 'bookings' | 'calendar' | 'users' | 'settings'

interface HeaderProps {
  title: string
  subtitle?: string
  role: 'freelancer' | 'admin'
  lang: Lang
  activeSection: AdminSection | null
  onNavigate: (section: AdminSection) => void
  onLangChange: (lang: Lang) => void
}

type NavKey = 'navDashboard' | 'navBookings' | 'navCalendar' | 'navUsers' | 'navSettings'

const ADMIN_NAV: { section: AdminSection; key: NavKey; icon: typeof LayoutDashboard }[] = [
  { section: 'dashboard', key: 'navDashboard', icon: LayoutDashboard },
  { section: 'bookings', key: 'navBookings', icon: BookCheck },
  { section: 'calendar', key: 'navCalendar', icon: CalendarDays },
  { section: 'users', key: 'navUsers', icon: Users },
  { section: 'settings', key: 'navSettings', icon: Settings },
]

type FreelancerNavKey = 'mobileNavHome' | 'mobileNavFacilities' | 'mobileNavBook' | 'mobileNavRules' | 'mobileNavFaq'
const FREELANCER_NAV: { id: string; key: FreelancerNavKey; icon: typeof Home; href: string }[] = [
  { id: 'home', key: 'mobileNavHome', icon: Home, href: '/' },
  { id: 'facilities', key: 'mobileNavFacilities', icon: Waves, href: '/#facility' },
  { id: 'book', key: 'mobileNavBook', icon: ClipboardList, href: '/booking' },
  { id: 'rules', key: 'mobileNavRules', icon: ScrollText, href: '/#rules' },
  { id: 'faq', key: 'mobileNavFaq', icon: HelpCircle, href: '/#faq' },
]

export default function Header({
  title,
  subtitle,
  role,
  lang,
  activeSection,
  onNavigate,
  onLangChange,
}: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = role === 'admin'
  const t = translations[lang]
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const go = (section: AdminSection) => {
    onNavigate(section)
    setMenuOpen(false)
  }

  const handleRoleChange = () => {
    navigate(isAdmin ? '/booking' : '/admin')
    setMenuOpen(false)
  }

  const handleFreelancerNav = (href: string) => {
    setMenuOpen(false)
    if (href.startsWith('/#')) {
      const id = href.slice(2)
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(href)
    }
  }

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-[#0B1F35]/85 backdrop-blur-xl border-b border-white/[0.07]">
      <div className="h-16 px-4 md:px-6 mx-auto w-full max-w-[1400px] flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 md:gap-x-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src="/FlatamLogo.png"
            alt="Freelance Latam Logo"
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[#20B1EE]/40"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-bold tracking-tight text-white leading-tight truncate">
              Freelance Latam
            </p>
            <p className="text-[11px] text-[#7A93B5] leading-tight truncate">
              {isAdmin ? 'Pool & Facilities' : `${title} · ${subtitle ?? ''}`}
            </p>
          </div>
        </Link>

        {isAdmin && (
          <nav className="hidden lg:flex items-center gap-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon
              const active = activeSection === item.section
              return (
                <button
                  key={item.section}
                  onClick={() => go(item.section)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active ? 'text-white' : 'text-[#7A93B5] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#20B1EE]' : ''}`} />
                  {t.header[item.key]}
                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#20B1EE]" />
                  )}
                </button>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {location.pathname === '/booking' ? (
            <Link
              to="/"
              className="hidden sm:inline-flex min-w-[140px] items-center justify-center gap-2 px-4 h-9 rounded-xl bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {t.header.bookHome}
            </Link>
          ) : location.pathname === '/' ? (
            <Link
              to="/booking"
              state={{ scrollToBooking: true }}
              className="hidden sm:inline-flex min-w-[140px] items-center justify-center gap-2 px-4 h-9 rounded-xl bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {t.header.bookNow}
            </Link>
          ) : null}

          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center p-1 rounded-full bg-white/[0.06] border border-white/15">
              {(['es', 'en'] as const).map((code) => (
                <button
                  key={code}
                  onClick={() => onLangChange(code)}
                  className={`px-2.5 h-7 rounded-full text-xs font-bold uppercase transition-all active:scale-95 cursor-pointer ${
                    lang === code
                      ? 'bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.12] active:scale-95 transition-all cursor-pointer"
              aria-label={t.header.mobileCloseMenu}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-[#020A14]/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={drawerRef}
            className="relative w-[min(85vw,360px)] h-full bg-[#0a192f] border-l border-white/[0.08] shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.8)] flex flex-col animate-slide-in-right"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.08] shrink-0">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src="/FlatamLogo.png"
                  alt="Logo"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#20B1EE]/40"
                />
                <span className="text-sm font-bold text-white tracking-tight truncate">
                  Freelance Latam
                </span>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white/60 hover:text-white transition-all cursor-pointer"
                aria-label={t.header.mobileCloseMenu}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {isAdmin
                ? ADMIN_NAV.map((item) => {
                    const Icon = item.icon
                    const active = activeSection === item.section
                    return (
                      <button
                        key={item.section}
                        onClick={() => go(item.section)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#20B1EE]/12 text-white ring-1 ring-[#20B1EE]/25'
                            : 'text-[#7A93B5] hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[#20B1EE]' : ''}`} />
                        {t.header[item.key]}
                      </button>
                    )
                  })
                : FREELANCER_NAV.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleFreelancerNav(item.href)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#7A93B5] hover:bg-white/[0.06] hover:text-white transition-all cursor-pointer"
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {t.header[item.key]}
                      </button>
                    )
                  })}
            </nav>

            <div className="border-t border-white/[0.08] p-4 space-y-3 shrink-0">
              <button
                onClick={handleRoleChange}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-sm font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
              >
                {isAdmin ? (
                  <User className="w-[18px] h-[18px] shrink-0 text-white/50" />
                ) : (
                  <Shield className="w-[18px] h-[18px] shrink-0 text-[#20B1EE]" />
                )}
                {isAdmin ? t.header.mobileSwitchToUser : t.header.mobileSwitchToAdmin}
              </button>

              <div className="flex items-center gap-2">
                {(['es', 'en'] as const).map((code) => (
                  <button
                    key={code}
                    onClick={() => onLangChange(code)}
                    className={`flex-1 h-9 rounded-xl text-sm font-bold uppercase transition-all active:scale-[0.97] cursor-pointer ${
                      lang === code
                        ? 'bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white'
                        : 'bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1]'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
