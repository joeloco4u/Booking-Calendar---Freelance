import { useState } from 'react'
import { Check, X } from 'lucide-react'
import Calendar from './Calendar'
import { approveBooking, rejectBooking } from '../services/api'
import type { MonthDataRow } from '../services/api'
import { extractDay } from '../utils/date'
import { translations, type Lang } from '../i18n'

interface AdminCalendarProps {
  viewDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  monthData: MonthDataRow[]
  onMonthDataChange: React.Dispatch<React.SetStateAction<MonthDataRow[]>>
  currentMonthStr: string
  onRefresh: () => void
  lang: Lang
}

const STATUS_PILL: Record<string, { pill: string; dot: string }> = {
  pending: {
    pill: 'bg-[rgba(234,179,8,0.1)] text-[#FACC15] border-[rgba(234,179,8,0.2)]',
    dot: 'bg-[#FACC15]',
  },
  approved: {
    pill: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    dot: 'bg-emerald-400',
  },
  rejected: {
    pill: 'bg-red-400/10 text-red-300 border-red-400/25',
    dot: 'bg-red-400',
  },
  available: {
    pill: 'bg-white/[0.06] text-slate-300 border-white/10',
    dot: 'bg-slate-400',
  },
}

export default function AdminCalendar({
  viewDate,
  onPrevMonth,
  onNextMonth,
  monthData,
  onMonthDataChange,
  currentMonthStr,
  onRefresh,
  lang,
}: AdminCalendarProps) {
  const t = translations[lang]
  const [selected, setSelected] = useState<{ day: number; month: number; year: number } | null>(
    null,
  )
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const activeSelection =
    selected &&
    selected.year === viewDate.getFullYear() &&
    selected.month === viewDate.getMonth()
      ? selected
      : null

  const handleSelectDate = (day: number, month: number, year: number) => {
    setSelected({ day, month, year })
  }

  const dayRows = activeSelection
    ? monthData.filter((r) => extractDay(r.date) === activeSelection.day)
    : []

  const handleApprove = async (row: MonthDataRow) => {
    if (actionLoading !== null) return
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

  const handleReject = async (row: MonthDataRow) => {
    if (actionLoading !== null) return
    setActionLoading(row.rowIndex)
    onMonthDataChange((prev) => prev.filter((r) => r.rowIndex !== row.rowIndex))
    try {
      await rejectBooking(row.rowIndex, currentMonthStr)
      onRefresh()
    } catch {
      onRefresh()
    } finally {
      setActionLoading(null)
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t.admin.pending
      case 'approved':
        return t.admin.approved
      case 'rejected':
        return t.admin.rejected
      default:
        return status
    }
  }

  const selectedLabel = activeSelection
    ? new Date(activeSelection.year, activeSelection.month, activeSelection.day).toLocaleDateString(
        lang === 'es' ? 'es-ES' : 'en-US',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      )
    : ''

  return (
    <div className="mx-auto w-full max-w-[1400px] py-2 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.admin.pageCalendarTitle}
        </h1>
        <p className="mt-2 text-sm text-[#7A93B5]">{t.admin.pageCalendarSub}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
        <div className="rounded-[24px] bg-[#0B1F35]/80 border border-white/[0.06] p-5 md:p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
          <Calendar
            admin
            viewDate={viewDate}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            selectedDate={activeSelection?.day ?? null}
            selectedMonth={activeSelection?.month ?? null}
            selectedYear={activeSelection?.year ?? null}
            onSelectDate={handleSelectDate}
            monthData={monthData}
            lang={lang}
          />
        </div>

        <div className="rounded-[24px] bg-[#0B1F35]/80 border border-white/[0.06] p-5 md:p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
          <h2 className="text-lg font-bold text-white">
            {activeSelection ? `${t.admin.calendarDayLabel}: ${selectedLabel}` : t.admin.calendarSelectHint}
          </h2>

          <div className="mt-5 space-y-3">
            {activeSelection && dayRows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 text-center rounded-[20px] border border-dashed border-white/[0.1]">
                <div className="w-14 h-14 rounded-full bg-[#20B1EE]/10 flex items-center justify-center">
                  <CalendarDay className="w-6 h-6 text-[#20B1EE]" />
                </div>
                <p className="mt-4 text-sm text-[#7A93B5]">{t.admin.calendarDayEmpty}</p>
              </div>
            )}
            {activeSelection &&
              dayRows.map((row) => {
                const status = row.status?.toLowerCase() ?? 'available'
                const badge = STATUS_PILL[status] ?? STATUS_PILL.available
                return (
                  <div
                    key={row.rowIndex}
                    className="rounded-2xl bg-[#102A43]/60 border border-white/[0.06] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#20B1EE]/15 border border-[#20B1EE]/25 flex items-center justify-center text-xs font-bold text-[#20B1EE] shrink-0">
                        {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{row.name}</p>
                        <p className="text-xs text-[#64748B] truncate">{row.schedule}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {statusLabel(status)}
                      </span>
                    </div>
                    {row.email && (
                      <p className="mt-2 text-xs text-[#64748B]">{row.email}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-white tabular-nums">${row.fee}.00</p>
                      {status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(row)}
                            disabled={actionLoading === row.rowIndex}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white text-[0.8rem] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-transparent border border-red-400/30 text-red-400 text-[0.8rem] font-semibold hover:bg-red-400/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-3.5 h-3.5" />
                            {t.admin.actionReject}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            {!activeSelection && (
              <div className="flex flex-col items-center justify-center py-14 text-center rounded-[20px] border border-dashed border-white/[0.1]">
                <div className="w-14 h-14 rounded-full bg-[#20B1EE]/10 flex items-center justify-center">
                  <CalendarDay className="w-6 h-6 text-[#20B1EE]" />
                </div>
                <p className="mt-4 text-sm text-[#7A93B5]">{t.admin.calendarSelectHint}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CalendarDay({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}