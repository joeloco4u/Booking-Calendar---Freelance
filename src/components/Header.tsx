import { useState } from 'react'
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

const NAV_ITEMS: { section: AdminSection; key: NavKey; icon: typeof LayoutDashboard }[] = [
  { section: 'dashboard', key: 'navDashboard', icon: LayoutDashboard },
  { section: 'bookings', key: 'navBookings', icon: BookCheck },
  { section: 'calendar', key: 'navCalendar', icon: CalendarDays },
  { section: 'users', key: 'navUsers', icon: Users },
  { section: 'settings', key: 'navSettings', icon: Settings },
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

  const go = (section: AdminSection) => {
    onNavigate(section)
    setMenuOpen(false)
  }

  const handleRoleChange = () => {
    navigate(isAdmin ? '/reservar' : '/admin')
  }

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
            {NAV_ITEMS.map((item) => {
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
          {location.pathname === '/reservar' ? (
            <Link
              to="/"
              className="hidden sm:inline-flex min-w-[140px] items-center justify-center gap-2 px-4 h-9 rounded-xl bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {t.header.bookHome}
            </Link>
          ) : location.pathname === '/' ? (
            <Link
              to="/reservar"
              state={{ scrollToBooking: true }}
              className="hidden sm:inline-flex min-w-[140px] items-center justify-center gap-2 px-4 h-9 rounded-xl bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {t.header.bookNow}
            </Link>
          ) : null}

          {isAdmin && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/15 text-white/80 hover:text-white active:scale-95 transition-all cursor-pointer"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

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
            onClick={handleRoleChange}
            className="flex items-center gap-2 px-3 h-9 rounded-full bg-white/[0.06] border border-white/15 text-sm text-white/80 hover:bg-white/[0.12] hover:text-white active:scale-95 transition-all cursor-pointer"
            title="Cambiar rol (demo)"
          >
            {isAdmin ? (
              <Shield className="w-4 h-4 text-[#20B1EE]" />
            ) : (
              <User className="w-4 h-4 text-white/60" />
            )}
            <span className="hidden sm:inline">
              {isAdmin ? t.header.roleAdmin : t.header.roleFreelancer}
            </span>
          </button>

          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-[#20B1EE] bg-[#20B1EE]/10 border border-[#20B1EE]/30">
            {isAdmin ? 'AD' : 'FL'}
          </div>
        </div>
      </div>

      {isAdmin && menuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#0B1F35]/95 backdrop-blur-xl">
          <nav className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = activeSection === item.section
              return (
                <button
                  key={item.section}
                  onClick={() => go(item.section)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#20B1EE]/10 text-white ring-1 ring-[#20B1EE]/25'
                      : 'text-[#7A93B5] hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#20B1EE]' : ''}`} />
                  {t.header[item.key]}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}