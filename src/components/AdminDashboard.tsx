import { useState, useMemo, useEffect } from 'react'
import { Clock, DollarSign, CalendarCheck, Check, X, ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { approveBooking, rejectBooking } from '../services/api'
import type { MonthDataRow } from '../services/api'
import { formatDisplayDate } from '../utils/date'
import { translations, type Lang } from '../i18n'

interface AdminDashboardProps {
  monthData: MonthDataRow[]
  onMonthDataChange: React.Dispatch<React.SetStateAction<MonthDataRow[]>>
  currentMonthStr: string
  onRefresh: () => void
  lang: Lang
  viewDate: Date
  setViewDate: React.Dispatch<React.SetStateAction<Date>>
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-cyan-glow/15 text-cyan-glow border-cyan-glow/20',
  approved: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
  rejected: 'bg-red-400/15 text-red-300 border-red-400/20',
  available: 'bg-slate-400/15 text-slate-300 border-slate-400/20',
}

const ACCEPTED_RULES = [
  'Ducharse antes de ingresar a la piscina / Shower before entering the pool',
  'Respetar horarios y volumen de música adecuado / Respect schedules and music volume',
  'No montarse ni colocar los pies sobre las barandas blancas / No feet on the white railings',
  'Cuidado de áreas verdes: no echar líquidos ni desechos en jardineras / No waste in planters',
  'Prohibido papelillo / No confetti allowed',
]

export default function AdminDashboard({
  monthData,
  onMonthDataChange,
  currentMonthStr,
  onRefresh,
  lang,
  viewDate,
  setViewDate,
}: AdminDashboardProps) {
  const t = translations[lang]
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  const [detailTarget, setDetailTarget] = useState<MonthDataRow | null>(null)
  const [rejectTarget, setRejectTarget] = useState<MonthDataRow | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const pendingRequests = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'pending'),
    [monthData],
  )

  const approvedRequests = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'approved'),
    [monthData],
  )

  const rejectedCount = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'rejected').length,
    [monthData],
  )

  useEffect(() => {
    if (isAuthenticated && onRefresh) {
      onRefresh()
    }
  }, [isAuthenticated, onRefresh])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === '1234') {
      setIsAuthenticated(true)
    } else {
      alert(t.admin.pinError)
      setPin('')
    }
  }

  const handleApprove = async (row: MonthDataRow) => {
    setActionLoading(row.rowIndex)
    onMonthDataChange((prev) =>
      prev.map((r) => (r.rowIndex === row.rowIndex ? { ...r, status: 'Approved' as const } : r)),
    )
    try {
      await approveBooking(row.rowIndex, currentMonthStr)
      onRefresh()
    } catch {
      onRefresh()
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = (row: MonthDataRow) => {
    setRejectTarget(row)
    setDetailTarget(null)
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.rowIndex)
    onMonthDataChange((prev) =>
      prev.filter((r) => r.rowIndex !== rejectTarget.rowIndex),
    )
    try {
      await rejectBooking(rejectTarget.rowIndex, currentMonthStr)
      onRefresh()
    } catch {
      onRefresh()
    } finally {
      setActionLoading(null)
      setRejectTarget(null)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full">
        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-marine border border-white/10 p-8 shadow-[0_30px_60px_-24px_rgba(11,25,44,0.9)] flex flex-col items-center space-y-4 w-80 animate-fade-in-up"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-glow/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-cyan-glow" />
          </div>
          <h2 className="text-lg font-bold text-white">{t.admin.loginTitle}</h2>
          <input
            type="password"
            placeholder={t.admin.loginPlaceholder}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-center text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-glow/60 tracking-widest transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-[#1895C7] hover:bg-[#1279AE] active:scale-95 text-white py-2.5 rounded-xl font-bold transition-all cursor-pointer"
          >
            {t.admin.unlock}
          </button>
        </form>
      </div>
    )
  }

  const approvedCount = approvedRequests.length
  const projectedRevenue = (approvedCount + pendingRequests.length) * 60

  const kpiCards = [
    {
      label: t.admin.kpiPending,
      value: String(pendingRequests.length),
      icon: Clock,
      iconColor: 'text-cyan-glow',
      iconBg: 'bg-cyan-glow/10',
    },
    {
      label: t.admin.kpiRevenue,
      value: `$${projectedRevenue}`,
      icon: DollarSign,
      iconColor: 'text-emerald-300',
      iconBg: 'bg-emerald-400/10',
    },
    {
      label: t.admin.kpiApproved,
      value: String(approvedCount),
      icon: CalendarCheck,
      iconColor: 'text-cyan-glow',
      iconBg: 'bg-cyan-glow/10',
    },
  ]

  const statusLabel = (status: string) =>
    status === 'pending'
      ? t.admin.pending
      : status === 'approved'
        ? t.admin.approved
        : status === 'rejected'
          ? t.admin.rejected
          : status

  const displayData = activeTab === 'pending' ? pendingRequests : approvedRequests

  const gridCols = 'grid grid-cols-[1.2fr_1.5fr_1.2fr_1.4fr_0.7fr_1fr_1.9fr] gap-3 items-center'

  return (
    <div className="rounded-3xl bg-marine/95 backdrop-blur-xl border border-white/10 p-5 md:p-7 shadow-[0_30px_60px_-24px_rgba(11,25,44,0.9)] animate-fade-in-up">
      <div className="flex items-center justify-between gap-4 bg-white/[0.04] p-4 rounded-xl border border-white/10 mb-6">
        <h2 className="text-lg font-semibold text-slate-200">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-medium min-w-[130px] text-center">{currentMonthStr}</span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white/[0.05] border border-white/10 p-5 hover:scale-[1.02] hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/50">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="mt-2 text-3xl font-bold text-white tabular-nums">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-7 flex items-center gap-2 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-cyan-glow/15 text-cyan-glow border border-cyan-glow/30'
              : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {t.admin.tabPending} ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
              : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
          }`}
        >
          {t.admin.tabApproved} ({approvedCount})
        </button>
        {rejectedCount > 0 && (
          <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white/40 border border-white/10">
            {t.admin.rejectedCount}: {rejectedCount}
          </span>
        )}
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[920px] space-y-2 py-2">
          <div
            className={`${gridCols} px-4 pb-2 text-[11px] font-bold uppercase tracking-widest text-white/35`}
          >
            <span>{t.admin.colClient}</span>
            <span>{t.admin.colDate}</span>
            <span>{t.admin.colSchedule}</span>
            <span>{t.admin.colExtras}</span>
            <span>{t.admin.colAmount}</span>
            <span>{t.admin.colStatus}</span>
            <span className="text-right">{t.admin.colActions}</span>
          </div>

          {displayData.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-white/40">
              {activeTab === 'pending' ? t.admin.emptyPending : t.admin.emptyApproved}
            </div>
          ) : (
            displayData.map((row) => {
              const status = row.status?.toLowerCase() ?? 'available'
              const badge = STATUS_BADGE[status] ?? STATUS_BADGE.available
              return (
                <div
                  key={row.rowIndex}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailTarget(row)}
                  onKeyDown={(e) => e.key === 'Enter' && setDetailTarget(row)}
                  className={`${gridCols} group px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-cyan-glow/40 hover:bg-white/[0.07] hover:scale-[1.005] transition-all duration-200 cursor-pointer`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#0E2138] border border-[#1895C7]/40 flex items-center justify-center text-xs font-bold text-cyan-glow shrink-0">
                      {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold text-white truncate">{row.name}</span>
                  </div>
                  <span className="text-sm text-white/60">{formatDisplayDate(row.date)}</span>
                  <span className="text-sm text-white/60">{row.schedule}</span>
                  <span className="text-sm text-white/60 truncate" title={row.note || ''}>
                    {row.note || '—'}
                  </span>
                  <span className="text-sm font-bold text-white tabular-nums">${row.fee}.00</span>
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border w-fit ${badge}`}
                  >
                    {statusLabel(status)}
                  </span>
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(row)}
                          disabled={actionLoading === row.rowIndex}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-xs font-bold hover:bg-emerald-400/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === row.rowIndex ? (
                            '...'
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              {t.admin.actionApprove}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(row)}
                          disabled={actionLoading === row.rowIndex}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-400/15 border border-red-400/25 text-red-300 text-xs font-bold hover:bg-red-400/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t.admin.actionReject}
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 group-hover:text-white transition-colors">
                        {t.admin.viewDetail} <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDetailTarget(null)}
          />
          <div className="relative rounded-3xl bg-marine border border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] w-full max-w-lg overflow-hidden animate-slide-in">
            <div className="px-6 py-5 bg-white/[0.05] border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{t.admin.detailTitle}</h3>
              <button
                onClick={() => setDetailTarget(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/60 hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0E2138] border border-[#1895C7]/40 flex items-center justify-center text-sm font-bold text-cyan-glow">
                  {detailTarget.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{detailTarget.name}</p>
                  <p className="text-xs text-white/50">
                    {formatDisplayDate(detailTarget.date)} · {detailTarget.schedule}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/40 font-bold">
                    {t.admin.detailAmount}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    ${detailTarget.fee}.00 USD
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/40 font-bold">
                    {t.admin.detailExtras}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {detailTarget.note || '—'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-4">
                <p className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold mb-2">
                  {t.admin.detailRules}
                </p>
                <ul className="space-y-1.5">
                  {ACCEPTED_RULES.map((rule) => (
                    <li key={rule} className="flex items-start gap-2 text-xs text-white/70">
                      <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setDetailTarget(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-semibold text-white/70 hover:text-white active:scale-95 transition-all cursor-pointer"
                >
                  {t.admin.close}
                </button>
                {detailTarget.status?.toLowerCase() === 'pending' && (
                  <button
                    onClick={() => handleApprove(detailTarget)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-sm font-bold hover:bg-emerald-400/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    {t.admin.approveBooking}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setRejectTarget(null)}
          />
          <div className="relative rounded-3xl bg-marine border border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] w-full max-w-md p-6 animate-slide-in">
            <h3 className="text-base font-bold text-white">{t.admin.rejectTitle}</h3>
            <p className="mt-2 text-sm text-white/60 leading-relaxed">
              {t.admin.rejectMessage}{' '}
              <span className="text-white font-semibold">{rejectTarget.name}</span> ·{' '}
              <span className="text-white font-semibold">
                {formatDisplayDate(rejectTarget.date)}
              </span>
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-sm font-semibold text-white/70 hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                {t.admin.rejectCancel}
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoading !== null}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-sm font-bold text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading !== null ? t.admin.rejectProcessing : t.admin.rejectConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}