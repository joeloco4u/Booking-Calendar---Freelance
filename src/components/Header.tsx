import { Shield, User } from 'lucide-react'
import { translations, type Lang } from '../i18n'

interface HeaderProps {
  title: string
  subtitle?: string
  role: 'freelancer' | 'admin'
  lang: Lang
  onLangChange: (lang: Lang) => void
  onRoleChange: (role: 'freelancer' | 'admin') => void
  onBookNow: () => void
}

export default function Header({
  title,
  subtitle,
  role,
  lang,
  onLangChange,
  onRoleChange,
  onBookNow,
}: HeaderProps) {
  const isAdmin = role === 'admin'
  const t = translations[lang]

  return (
    <header className="h-16 grid grid-cols-[1fr_auto] items-center px-4 md:px-6 bg-marine border-b border-white/10 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src="/FlatamLogo.png"
          alt="Freelance Latam Logo"
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-cyan-glow/40"
        />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight text-white leading-tight truncate">
            Freelance Latam
          </p>
          <p className="text-[11px] text-cyan-glow/80 leading-tight truncate">
            {isAdmin ? title : `${title} · ${subtitle ?? ''}`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-3">
        {!isAdmin && (
          <button
            onClick={onBookNow}
            className="hidden sm:inline-flex min-w-[140px] items-center justify-center gap-2 px-4 h-9 rounded-lg bg-[#1895C7] text-white text-sm font-bold hover:bg-[#1279AE] active:scale-95 transition-all cursor-pointer"
          >
            {t.header.bookNow}
          </button>
        )}

        <div className="flex items-center p-1 rounded-full bg-white/[0.08] border border-white/15">
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

        <button
          onClick={() => onRoleChange(isAdmin ? 'freelancer' : 'admin')}
          className="flex items-center gap-2 px-3 h-9 rounded-full bg-white/[0.08] border border-white/15 text-sm text-white/90 hover:bg-white/[0.12] hover:text-white active:scale-95 transition-all cursor-pointer"
          title="Cambiar rol (demo)"
        >
          {isAdmin ? <Shield className="w-4 h-4 text-cyan-glow" /> : <User className="w-4 h-4 text-white/60" />}
          <span className="hidden sm:inline">
            {isAdmin ? t.header.roleAdmin : t.header.roleFreelancer}
          </span>
        </button>

        <div className="w-8 h-8 rounded-full flex items-center justify-center text-cyan-glow text-xs font-bold shrink-0 bg-[#0E2138] border border-[#1895C7]/50">
          {isAdmin ? 'AD' : 'FL'}
        </div>
      </div>
    </header>
  )
}