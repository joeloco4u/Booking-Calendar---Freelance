import { useState } from 'react'
import { Clock, DollarSign, CalendarCheck, ChevronLeft, ChevronRight, Lock, Loader2 } from 'lucide-react'
import type { MonthDataRow } from '../services/api'
import { verifyAdminPassword } from '../services/api'
import { translations, type Lang } from '../i18n'
import AdminBookings from './AdminBookings'

interface AdminDashboardProps {
  monthData: MonthDataRow[]
  onMonthDataChange: React.Dispatch<React.SetStateAction<MonthDataRow[]>>
  currentMonthStr: string
  onRefresh: () => void
  lang: Lang
  viewDate: Date
  setViewDate: React.Dispatch<React.SetStateAction<Date>>
  authed: boolean
  onAuthed: () => void
  fee: number
  rules: string[]
  isLoading?: boolean
}

export default function AdminDashboard({
  monthData,
  onMonthDataChange,
  currentMonthStr,
  onRefresh,
  lang,
  viewDate,
  setViewDate,
  authed,
  onAuthed,
  fee,
  rules,
  isLoading = false,
}: AdminDashboardProps) {
  const t = translations[lang]
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || authLoading) return
    setAuthLoading(true)
    setError('')
    try {
      const res = await verifyAdminPassword(password)
      if (res.success) {
        setPassword('')
        onAuthed()
      } else {
        setError(lang === 'en' ? 'Incorrect password' : 'Contraseña incorrecta')
        setPassword('')
      }
    } catch {
      setError(t.admin.pinError)
    } finally {
      setAuthLoading(false)
    }
  }

  if (!authed) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full animate-fade-in-up">
        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-marine/95 border border-white/10 p-8 shadow-[0_30px_60px_-24px_rgba(11,25,44,0.9)] flex flex-col items-center space-y-4 w-80 animate-fade-in-up"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-glow/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-cyan-glow" />
          </div>
          <h2 className="text-lg font-bold text-white">{t.admin.loginTitle}</h2>
          <input
            type="password"
            placeholder={t.admin.loginPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-center text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-glow/60 tracking-widest transition-all"
            autoFocus
          />
          {error && <p className="text-sm text-red-400 font-medium self-start">{error}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#1895C7] hover:bg-[#1279AE] active:scale-95 text-white py-2.5 rounded-xl font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.admin.unlock}
              </>
            ) : (
              t.admin.unlock
            )}
          </button>
        </form>
      </div>
    )
  }

  const pendingCount = monthData.filter((r) => r.status?.toLowerCase() === 'pending').length
  const approvedCount = monthData.filter((r) => r.status?.toLowerCase() === 'approved').length
  const projectedRevenue = (approvedCount + pendingCount) * fee

  const kpiCards = [
    {
      label: t.admin.kpiPending,
      badge: t.admin.kpiPendingBadge,
      value: String(pendingCount),
      icon: Clock,
      accent: 'text-[#FACC15]',
      iconWrap: 'bg-[#FACC15]/10',
      badgeWrap: 'border-[#FACC15]/20 text-[#FACC15]',
      dot: 'bg-[#FACC15]',
    },
    {
      label: t.admin.kpiRevenue,
      badge: t.admin.kpiRevenueBadge,
      value: `$${projectedRevenue}`,
      icon: DollarSign,
      accent: 'text-[#20B1EE]',
      iconWrap: 'bg-[#20B1EE]/10',
      badgeWrap: 'border-[#20B1EE]/20 text-[#20B1EE]',
      dot: 'bg-[#20B1EE]',
    },
    {
      label: t.admin.kpiApproved,
      badge: t.admin.kpiApprovedBadge,
      value: String(approvedCount),
      icon: CalendarCheck,
      accent: 'text-emerald-400',
      iconWrap: 'bg-emerald-400/10',
      badgeWrap: 'border-emerald-400/20 text-emerald-400',
      dot: 'bg-emerald-400',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] py-2 animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-[#94A3B8]">{t.admin.dashboardSubtitle}</p>
        </div>
        <div className="inline-flex items-center justify-center gap-1 rounded-2xl bg-[#0B1F35] border border-white/[0.08] p-1.5 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.9)]">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span
            key={currentMonthStr}
            className="min-w-[150px] px-2 text-center text-sm font-semibold text-white animate-fade-in-up tabular-nums"
          >
            {currentMonthStr}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden sm:block" />
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="rounded-[20px] bg-[#0B1F35]/80 border border-white/[0.08] p-6 hover:border-[#20B1EE]/30 hover:-translate-y-0.5 transition-all duration-300 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[0.8rem] font-medium text-[#94A3B8]">{card.label}</p>
                  {isLoading ? (
                    <div className="mt-2 h-8 w-16 animate-pulse rounded-md bg-white/10" />
                  ) : (
                    <p className="mt-2 text-[1.8rem] font-bold text-white tabular-nums leading-none">
                      {card.value}
                    </p>
                  )}
                </div>
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${card.iconWrap}`}
                >
                  <Icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
              <span
                className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${card.badgeWrap}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
                {currentMonthStr}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <AdminBookings
          monthData={monthData}
          onMonthDataChange={onMonthDataChange}
          currentMonthStr={currentMonthStr}
          onRefresh={onRefresh}
          lang={lang}
          rules={rules}
          fee={fee}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}