import { useState, useMemo, useEffect } from 'react'
import {
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  CalendarCheck,
  ChevronRight,
  Clock,
  Wallet,
} from 'lucide-react'
import { submitBooking } from '../services/api'
import type { MonthDataRow } from '../services/api'
import { getDayType, getAvailableSchedules } from '../utils/schedule'
import { translations, type Lang } from '../i18n'

interface ReservationFormProps {
  selectedDate: number | null
  selectedMonth: number | null
  selectedYear: number | null
  schedule: string
  onScheduleChange: (value: string) => void
  monthData: MonthDataRow[]
  currentMonthStr: string
  onRefresh?: () => void
  lang: Lang
}

const FEE = 60

const EXTRAS = ['parrillera', 'domino', 'pingpong'] as const

function formatDisplayDate(day: number, month: number, year: number, lang: Lang) {
  const date = new Date(year, month, day)
  return date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function useCountUp(target: number, active: boolean, duration = 800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) {
      setValue(0)
      return
    }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, active, duration])

  return value
}

const floatingInput =
  'peer w-full h-12 px-3.5 pt-4 pb-1 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder:text-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-glow/70 focus:border-transparent'

const floatingLabel =
  'absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/45 transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-cyan-glow peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-white/60'

export default function ReservationForm({
  selectedDate,
  selectedMonth,
  selectedYear,
  schedule,
  onScheduleChange,
  monthData,
  currentMonthStr,
  onRefresh,
  lang,
}: ReservationFormProps) {
  const t = translations[lang]
  const [fullName, setFullName] = useState('')
  const [contact, setContact] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const dayType = getDayType(selectedDate, selectedMonth, selectedYear)
  const isWeekdaySelected = dayType === 'weekday'
  const hasDate = selectedDate !== null
  const hasSchedule = schedule !== ''

  const safeData = Array.isArray(monthData) ? monthData : []

  const matchedRow = useMemo(() => {
    if (selectedDate === null) return null
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '')
    const found = safeData.find((row) => {
      if (!row.date || !row.schedule) return false

      let rowDay: number | null = null
      if (row.date.includes('/')) {
        const dateParts = row.date.split(' ')
        if (dateParts.length >= 2) {
          rowDay = parseInt(dateParts[1].split('/')[0], 10)
        }
      } else {
        rowDay = new Date(row.date).getDate()
      }

      return rowDay === selectedDate && normalize(row.schedule) === normalize(schedule)
    })
    return found ?? null
  }, [selectedDate, schedule, safeData])

  const canSubmit =
    hasDate &&
    hasSchedule &&
    !isWeekdaySelected &&
    matchedRow !== null &&
    fullName.trim() !== '' &&
    rulesAccepted

  const animatedTotal = useCountUp(FEE, hasDate && !isWeekdaySelected)

  const availableSchedules = getAvailableSchedules(dayType)
  const selectedHours = availableSchedules.find((s) => s.value === schedule)?.hours ?? ''

  const toggleExtra = (id: string) => {
    setExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !matchedRow) return

    setIsSubmitting(true)
    submitBooking({
      fullName: fullName.trim(),
      fee: FEE,
      row: matchedRow.rowIndex,
      mes: currentMonthStr,
      note: extras.join(', '),
    })
      .then(() => {
        setFullName('')
        setContact('')
        setExtras([])
        setRulesAccepted(false)
        onScheduleChange('')
        setStatus('success')
        if (onRefresh) onRefresh()
        setTimeout(() => setStatus('idle'), 6000)
      })
      .catch(() => {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 6000)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const displayDate =
    selectedDate !== null && selectedMonth !== null && selectedYear !== null
      ? formatDisplayDate(selectedDate, selectedMonth, selectedYear, lang)
      : null

  if (!hasDate || isWeekdaySelected) {
    return (
      <div className="rounded-[20px] bg-marine-2 border border-white/10 p-6 md:p-8 shadow-[0_20px_50px_-24px_rgba(2,8,20,0.9)] flex flex-col items-center justify-center text-center h-full min-h-[420px]">
        <div className="w-14 h-14 rounded-2xl bg-cyan-glow/10 flex items-center justify-center">
          <CalendarCheck className="w-7 h-7 text-cyan-glow" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">{t.booking.hintTitle}</h2>
        <p className="mt-2 text-sm text-white/60 max-w-xs">
          {isWeekdaySelected ? t.booking.hintWeekday : t.booking.hintSelect}
        </p>
      </div>
    )
  }

  return (
    <div className="h-full space-y-4 animate-fade-in-up">
      <div className="relative overflow-hidden rounded-2xl bg-[#0E253A] border border-[#20B1EE]/25 p-5 shadow-[0_20px_40px_-20px_rgba(8,19,34,0.7)]">
        <div className="absolute -top-16 -right-10 w-52 h-40 bg-white/15 rounded-full blur-[70px]" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/85">
              {t.booking.costLabel}
            </p>
            <p className="mt-1 text-3xl font-black text-white tabular-nums tracking-tight">
              ${animatedTotal.toFixed(2)}{' '}
              <span className="text-sm font-semibold text-white/85">USD</span>
            </p>
            <p className="mt-1 text-xs text-white/80 font-medium">{t.booking.feeNote}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <CalendarCheck className="w-3.5 h-3.5 text-cyan-glow" /> {t.booking.dateSelected}
          </p>
          <p className="mt-1.5 text-sm font-bold text-white capitalize">{displayDate ?? '—'}</p>
        </div>
        <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <Clock className="w-3.5 h-3.5 text-cyan-glow" /> {t.booking.scheduleSelected}
          </p>
          <p className="mt-1.5 text-sm font-bold text-white">
            {selectedHours ||
              (schedule
                ? schedule
                : <span className="text-white/40 font-medium">{t.booking.selectTurnHint}</span>)}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[20px] bg-marine-2 border border-white/10 p-6 md:p-7 shadow-[0_20px_50px_-24px_rgba(2,8,20,0.9)]"
      >
        {status === 'success' && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-400/15 border border-emerald-400/25 text-emerald-300 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {t.booking.success}
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-400/15 border border-red-400/25 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {t.booking.error}
          </div>
        )}

        <h2 className="text-lg font-bold text-white mb-5">{t.booking.formTitle}</h2>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="fullName"
              placeholder=" "
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={floatingInput}
            />
            <label htmlFor="fullName" className={floatingLabel}>
              {t.booking.fullName}
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="contact"
              placeholder=" "
              autoComplete="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={floatingInput}
            />
            <label htmlFor="contact" className={floatingLabel}>
              {t.booking.contact}
            </label>
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4">
            <p className="text-sm font-semibold text-white">{t.booking.extrasTitle}</p>
            <div className="mt-3 space-y-2">
              {EXTRAS.map((extra) => {
                const label =
                  extra === 'parrillera'
                    ? t.booking.extraParrillera
                    : extra === 'domino'
                      ? t.booking.extraDomino
                      : t.booking.extraPingpong
                const checked = extras.includes(extra)
                return (
                  <label
                    key={extra}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] border ${
                      checked
                        ? 'border-cyan-glow/50 bg-cyan-glow/10'
                        : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleExtra(extra)}
                      className="w-4 h-4 accent-[#20b1ee]"
                    />
                    <span className={`text-sm font-medium ${checked ? 'text-cyan-glow' : 'text-white/75'}`}>
                      {label}
                    </span>
                    {checked && <ChevronRight className="w-4 h-4 text-cyan-glow ml-auto" />}
                  </label>
                )
              })}
            </div>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-cyan-glow/10 border border-cyan-glow/25 cursor-pointer active:scale-[0.99] transition-transform">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="w-4 h-4 accent-[#20b1ee] mt-0.5"
            />
            <span className="text-xs text-white/75 leading-relaxed">
              <strong>{t.booking.rulesLabel}.</strong> {t.booking.rulesHint}
            </span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
              canSubmit
                ? 'bg-[#0E253A] border border-[#20B1EE] text-white hover:bg-[#12304f] active:scale-95 cursor-pointer'
                : 'bg-white/[0.06] text-white/30 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.booking.submitting}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t.booking.submit}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}