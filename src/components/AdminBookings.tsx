import { useState, useMemo } from 'react'
import { Check, X, Trash2, Calendar } from 'lucide-react'
import { approveBooking, rejectBooking, cancelBooking } from '../services/api'
import type { MonthDataRow } from '../services/api'
import { formatDisplayDate } from '../utils/date'
import { translations, type Lang } from '../i18n'

interface AdminBookingsProps {
  monthData: MonthDataRow[]
  onMonthDataChange: React.Dispatch<React.SetStateAction<MonthDataRow[]>>
  currentMonthStr: string
  onRefresh: () => void
  lang: Lang
  rules: string[]
  fee?: number
}

const STATUS_BADGE: Record<string, { pill: string; dot: string }> = {
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

export default function AdminBookings({
  monthData,
  onMonthDataChange,
  currentMonthStr,
  onRefresh,
  lang,
  rules,
  fee = 60,
}: AdminBookingsProps) {
  const t = translations[lang]
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [detailTarget, setDetailTarget] = useState<MonthDataRow | null>(null)
  const [rejectTarget, setRejectTarget] = useState<MonthDataRow | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const pendingRequests = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'pending'),
    [monthData],
  )
  const approvedRequests = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'approved'),
    [monthData],
  )
  const rejectedRequests = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'rejected'),
    [monthData],
  )

  const approvedCount = approvedRequests.length
  const rejectedCount = rejectedRequests.length

  const handleApprove = async (row: MonthDataRow) => {
    if (actionLoading !== null) return
    setActionLoading(row.rowIndex)
    setDetailTarget(null)
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
    onMonthDataChange((prev) => prev.filter((r) => r.rowIndex !== rejectTarget.rowIndex))
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

  const handleCancel = (row: MonthDataRow) => {
    if (!window.confirm(t.admin.cancelConfirm)) return
    setDetailTarget(null)
    setActionLoading(row.rowIndex)
    onMonthDataChange((prev) => prev.filter((r) => r.rowIndex !== row.rowIndex))
    cancelBooking(row.rowIndex, currentMonthStr)
      .then(onRefresh)
      .catch(onRefresh)
      .finally(() => setActionLoading(null))
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

  const displayData =
    activeTab === 'pending'
      ? pendingRequests
      : activeTab === 'approved'
        ? approvedRequests
        : rejectedRequests

  const emptyMessage =
    activeTab === 'pending'
      ? t.admin.emptyPending
      : activeTab === 'approved'
        ? t.admin.emptyApproved
        : t.admin.emptyRejected

  const gridHead =
    'hidden lg:grid grid-cols-[1.8fr_1.1fr_1.1fr_1.2fr_0.6fr_0.9fr_0.9fr] gap-x-6 items-center'
  const gridCols = 'lg:grid-cols-[1.8fr_1.1fr_1.1fr_1.2fr_0.6fr_0.9fr_0.9fr]'
  const cellLabel = 'lg:hidden mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]'

  return (
    <div className="mx-auto w-full max-w-[1400px] py-2 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.admin.pageBookingsTitle}
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8]">{t.admin.pageBookingsSub}</p>
      </div>

      <div className="mt-6 flex items-center gap-1 border-b border-white/[0.1] overflow-x-auto no-scrollbar">
        {[
          { key: 'pending' as const, label: t.admin.tabPending, count: pendingRequests.length },
          { key: 'approved' as const, label: t.admin.tabApproved, count: approvedCount },
          { key: 'rejected' as const, label: t.admin.tabRejected, count: rejectedCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 pt-1 pb-3.5 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.key ? 'text-white' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
            {activeTab === tab.key && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#20B1EE]" />
            )}
          </button>
        ))}
      </div>

      <div
        className={`${gridHead} px-4 sm:px-5 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B]`}
      >
        <span>{t.admin.colClient}</span>
        <span>{t.admin.colDate}</span>
        <span>{t.admin.colSchedule}</span>
        <span>{t.admin.colExtras}</span>
        <span>{t.admin.colAmount}</span>
        <span>{t.admin.colStatus}</span>
        <span className="text-right">{t.admin.colActions}</span>
      </div>

      <div className="mt-2 space-y-2">
        {displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-white/[0.1]">
            <div className="w-14 h-14 rounded-full bg-[#20B1EE]/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#20B1EE]" />
            </div>
            <p className="mt-4 text-base font-bold text-white">{t.admin.emptyCardTitle}</p>
            <p className="mt-1 max-w-xs text-sm text-[#94A3B8]">{emptyMessage}</p>
          </div>
        ) : (
          displayData.map((row) => {
            const status = row.status?.toLowerCase() ?? 'available'
            const badge = STATUS_BADGE[status] ?? STATUS_BADGE.available
            const initials = row.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()
            return (
              <div
                key={row.rowIndex}
                role="button"
                tabIndex={0}
                onClick={() => setDetailTarget(row)}
                onKeyDown={(e) => e.key === 'Enter' && setDetailTarget(row)}
                className={`grid grid-cols-1 gap-y-2 gap-x-6 px-4 sm:px-5 py-4 lg:items-center lg:py-2 min-h-16 rounded-lg bg-white/[0.02] border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer group ${gridCols}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-[#20B1EE]/15 border border-[#20B1EE]/25 flex items-center justify-center text-xs font-bold text-[#20B1EE]">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white capitalize leading-tight truncate">
                      {row.name}
                    </p>
                    {row.email && (
                      <p className="text-xs text-[#94A3B8] truncate">{row.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className={cellLabel}>{t.admin.colDate}</p>
                  <p className="text-sm font-medium text-[#E2E8F0] leading-tight">
                    {formatDisplayDate(row.date)}
                  </p>
                </div>

                <div>
                  <p className={cellLabel}>{t.admin.colSchedule}</p>
                  <p className="text-sm font-medium text-[#E2E8F0] leading-tight">
                    {row.schedule}
                  </p>
                </div>

                <div>
                  <p className={cellLabel}>{t.admin.colExtras}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {row.note ? (
                      row.note
                        .split(',')
                        .map((e) => e.trim())
                        .filter(Boolean)
                        .map((extra, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-[#E2E8F0] whitespace-nowrap"
                          >
                            {extra}
                          </span>
                        ))
                    ) : (
                      <span className="text-sm text-[#64748B]">—</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className={cellLabel}>{t.admin.colAmount}</p>
                  <p className="text-sm font-semibold text-white tabular-nums leading-tight">
                    ${row.fee > 0 ? row.fee : fee}.00
                  </p>
                </div>

                <div>
                  <p className={cellLabel}>{t.admin.colStatus}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.pill}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {statusLabel(status)}
                  </span>
                </div>

                <div className="lg:text-right">
                  <p className={cellLabel}>{t.admin.colActions}</p>
                  <div
                    className="flex items-center justify-start lg:justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(row)}
                          disabled={actionLoading === row.rowIndex}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#10B981] text-white text-xs font-semibold whitespace-nowrap hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[rgba(239,68,68,0.1)] text-[#FCA5A5] border border-[rgba(239,68,68,0.2)] text-xs font-semibold whitespace-nowrap hover:bg-[rgba(239,68,68,0.18)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t.admin.actionReject}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCancel(row)}
                        disabled={actionLoading === row.rowIndex}
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[rgba(239,68,68,0.1)] text-[#FCA5A5] border border-[rgba(239,68,68,0.2)] text-xs font-semibold whitespace-nowrap hover:bg-[rgba(239,68,68,0.18)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === row.rowIndex ? (
                          '...'
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            {t.admin.actionCancel}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div
            className="absolute inset-0 bg-[#020A14]/80 backdrop-blur-sm"
            onClick={() => setDetailTarget(null)}
          />
          <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#0B1F35] border border-white/[0.08] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[#102A43]/60 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">{t.admin.detailTitle}</h3>
              <button
                onClick={() => setDetailTarget(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#20B1EE]/15 border border-[#20B1EE]/25 flex items-center justify-center text-xs font-bold text-[#20B1EE] shrink-0">
                  {detailTarget.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white capitalize">{detailTarget.name}</p>
                  <p className="text-xs text-[#7A93B5]">
                    {formatDisplayDate(detailTarget.date)} · {detailTarget.schedule}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#102A43]/60 border border-white/[0.06] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    {t.admin.colAmount}
                  </p>
                  <p className="mt-1 text-lg font-bold text-white tabular-nums">
                    ${detailTarget.fee > 0 ? detailTarget.fee : fee}.00
                  </p>
                </div>
                <div className="rounded-2xl bg-[#102A43]/60 border border-white/[0.06] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    {t.admin.colExtras}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {detailTarget.note ? (
                      detailTarget.note
                        .split(',')
                        .map((e) => e.trim())
                        .filter(Boolean)
                        .map((extra, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-white/[0.06] px-2 py-1 text-xs text-[#E2E8F0]"
                          >
                            {extra}
                          </span>
                        ))
                    ) : (
                      <span className="text-sm text-white/40">—</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-[#102A43]/60 border border-white/[0.06] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  {t.admin.colStatus}
                </p>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                    STATUS_BADGE[detailTarget.status.toLowerCase()]?.pill ?? STATUS_BADGE.available.pill
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      STATUS_BADGE[detailTarget.status.toLowerCase()]?.dot ?? STATUS_BADGE.available.dot
                    }`}
                  />
                  {statusLabel(detailTarget.status.toLowerCase())}
                </span>
              </div>
              <div className="rounded-2xl bg-[#102A43]/60 border border-white/[0.06] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  {t.admin.detailRules}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#A7BEDA]">
                      <Check className="w-3.5 h-3.5 text-[#20B1EE] shrink-0 mt-0.5" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              {detailTarget.status.toLowerCase() === 'pending' && (
                <button
                  onClick={() => handleApprove(detailTarget)}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  {t.admin.approveBooking}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div
            className="absolute inset-0 bg-[#020A14]/80 backdrop-blur-sm"
            onClick={() => setRejectTarget(null)}
          />
          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0B1F35] border border-white/[0.08] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between gap-3 px-6 py-4 bg-[#102A43]/60 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white">{t.admin.rejectTitle}</h3>
              <button
                onClick={() => setRejectTarget(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#A7BEDA] leading-relaxed">
                {t.admin.rejectMessage} <strong className="text-white">{rejectTarget.name}</strong> ·{' '}
                <strong className="text-white">{formatDisplayDate(rejectTarget.date)}</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="flex-1 h-11 rounded-xl bg-white/[0.06] border border-white/15 text-white/70 font-semibold hover:text-white hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer"
                >
                  {t.admin.rejectCancel}
                </button>
                <button
                  onClick={confirmReject}
                  disabled={actionLoading !== null}
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading !== null ? t.admin.rejectProcessing : t.admin.rejectConfirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}