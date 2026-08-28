import { useState, useMemo, useEffect } from 'react'
import {
  Send,
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
  CalendarCheck,
  ChevronRight,
  Clock,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import { submitBooking } from '../services/api'
import type { MonthDataRow } from '../services/api'
import { getDayType, getAvailableSchedules } from '../utils/schedule'
import { extractDay } from '../utils/date'
import { translations, type Lang } from '../i18n'
import poolThumb from '../images/IMG_5622-_1_.png'

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
  fee?: number
}

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

const floatingInput =
  'peer w-full h-12 px-3.5 pt-4 pb-1 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder:text-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#1895C7]/60 focus:border-transparent'

const floatingLabel =
  'absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/45 transition-all duration-200 pointer-events-none peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#1895C7] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:text-white/60'

function PreviewCard({ lang, weekday = false }: { lang: Lang; weekday?: boolean }) {
  const t = translations[lang]
  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-[20px] bg-white/[0.05] border border-white/[0.18] backdrop-blur-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-fade-in-up">
      <div className="relative h-44 shrink-0 overflow-hidden">
        <img
          src={poolThumb}
          alt="Pool"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/55 to-[#0F172A]/10" />
        <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-3 py-1 text-[11px] font-semibold text-white/90">
          <CalendarCheck className="w-3.5 h-3.5 text-[#60A5FA]" />
          {t.facility.heroBadge}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4 p-6">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white">
            {weekday ? t.booking.weekdayTitle : t.booking.emptyTitle}
          </h3>
          <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
            {weekday ? t.booking.weekdaySub : t.booking.emptySub}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {t.booking.equipBadges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/85"
            >
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  fee = 60,
}: ReservationFormProps) {
  const t = translations[lang]
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [step, setStep] = useState<'preview' | 'details'>('preview')
  const [phoneError, setPhoneError] = useState(false)
  const [emailError, setEmailError] = useState(false)

  const dayType = getDayType(selectedDate, selectedMonth, selectedYear)
  const isWeekdaySelected = dayType === 'weekday'
  const hasDate = selectedDate !== null
  const hasSchedule = schedule !== ''

  const safeData = Array.isArray(monthData) ? monthData : []

  const PHONE_MAX_LEN = 15

  const validatePhone = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return false
    const digits = (trimmed.match(/\d/g) || []).length
    const validChars = /^\+?[\d\s-]*$/.test(trimmed)
    return digits >= 7 && trimmed.length <= PHONE_MAX_LEN && validChars
  }

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  }

  const handlePhoneChange = (value: string) => {
    const sanitized = value.replace(/[^\d\s+-]/g, '').slice(0, PHONE_MAX_LEN)
    setPhone(sanitized)
    setPhoneError(sanitized !== '' && !validatePhone(sanitized))
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setEmailError(value !== '' && !validateEmail(value))
  }

  const matchedRow = useMemo(() => {
    if (selectedDate === null) return null
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '')
    const found = safeData.find((row) => {
      if (!row.date || !row.schedule) return false
      return extractDay(row.date) === selectedDate && normalize(row.schedule) === normalize(schedule)
    })
    return found ?? null
  }, [selectedDate, schedule, safeData])

  const canSubmit =
    hasDate &&
    hasSchedule &&
    !isWeekdaySelected &&
    matchedRow !== null &&
    fullName.trim() !== '' &&
    validatePhone(phone) &&
    validateEmail(email) &&
    rulesAccepted

  const availableSchedules = getAvailableSchedules(dayType)
  const selectedOpt = availableSchedules.find((s) => s.value === schedule) ?? null
  const dayHint =
    dayType === 'friday'
      ? t.booking.dayHintFriday
      : dayType === 'saturday'
        ? t.booking.dayHintSaturday
        : dayType === 'sunday'
          ? t.booking.dayHintSunday
          : ''

  const isSlotOccupied = (scheduleValue: string) => {
    if (selectedDate === null) return false
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '')
    const row = safeData.find(
      (r) =>
        r.schedule &&
        extractDay(r.date) === selectedDate &&
        normalize(r.schedule) === normalize(scheduleValue),
    )
    return row ? row.status !== 'Available' : false
  }

  useEffect(() => {
    if (schedule && selectedDate !== null) {
      const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '')
      const isOccupied = safeData.some(
        (r) =>
          r.schedule &&
          extractDay(r.date) === selectedDate &&
          normalize(r.schedule) === normalize(schedule) &&
          r.status !== 'Available',
      )
      if (isOccupied) {
        onScheduleChange('')
      }
    }
  }, [schedule, safeData, selectedDate, onScheduleChange])

  useEffect(() => {
    setStep('preview')
    setPolicyAccepted(false)
  }, [selectedDate, selectedMonth, selectedYear])

  const toggleExtra = (id: string) => {
    setExtras((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !matchedRow) return

    setIsSubmitting(true)
    submitBooking({
      name: fullName.trim(),
      fee: fee,
      row: matchedRow.rowIndex,
      mes: currentMonthStr,
      note: extras.join(', '),
    })
      .then(() => {
        setFullName('')
        setPhone('')
        setEmail('')
        setExtras([])
        setRulesAccepted(false)
        setPhoneError(false)
        setEmailError(false)
        onScheduleChange('')
        setStatus('success')
        setStep('preview')
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
  const displayTitle = displayDate
    ? displayDate.charAt(0).toUpperCase() + displayDate.slice(1)
    : ''

  if (!hasDate || isWeekdaySelected) {
    return <PreviewCard lang={lang} weekday={isWeekdaySelected} />
  }

  return (
    <div key={displayTitle} className="h-full animate-fade-in-up">
      {step === 'details' ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setStep('preview')}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white active:scale-95 transition-all w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.booking.backToPreview}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <CalendarCheck className="w-3.5 h-3.5 text-[#1895C7]" /> {t.booking.dateSelected}
              </p>
              <p className="mt-1.5 text-sm font-bold text-white">{displayTitle}</p>
            </div>
            <div className="rounded-xl bg-white/[0.05] border border-white/10 p-3.5">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <Clock className="w-3.5 h-3.5 text-[#1895C7]" /> {t.booking.scheduleSelected}
              </p>
              <p className="mt-1.5 text-sm font-bold text-white">
                {selectedOpt
                  ? `${selectedOpt.value === '9 am a 6 pm' ? t.booking.turnDay : t.booking.turnNight} · ${selectedOpt.hours}`
                  : schedule || (
                      <span className="text-white/40 font-medium">{t.booking.selectTurnHint}</span>
                    )}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[20px] bg-white/[0.05] border border-white/[0.18] p-6 md:p-7 backdrop-blur-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
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
                  type="tel"
                  id="phone"
                  placeholder=" "
                  autoComplete="tel"
                  value={phone}
                  maxLength={15}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`${floatingInput} ${phoneError ? 'border-red-400/70 focus:ring-red-400/60' : ''}`}
                />
                <label htmlFor="phone" className={floatingLabel}>
                  {t.booking.phoneLabel}
                </label>
                {phoneError && (
                  <p className="mt-1 text-xs text-red-400">{t.booking.phoneInvalid}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`${floatingInput} ${emailError ? 'border-red-400/70 focus:ring-red-400/60' : ''}`}
                />
                <label htmlFor="email" className={floatingLabel}>
                  {t.booking.emailLabel}
                </label>
                {emailError && (
                  <p className="mt-1 text-xs text-red-400">{t.booking.emailInvalid}</p>
                )}
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
                            ? 'border-[#20B1EE]/60 bg-[#1895C7]/15'
                            : 'border-white/20 bg-white/[0.08] hover:border-white/35'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExtra(extra)}
                          className="w-4 h-4 accent-[#1895C7]"
                        />
                        <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-white/75'}`}>
                          {label}
                        </span>
                        {checked && <ChevronRight className="w-4 h-4 text-[#1895C7] ml-auto" />}
                      </label>
                    )
                  })}
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.08] border border-white/20 cursor-pointer active:scale-[0.99] transition-transform">
                <input
                  type="checkbox"
                  checked={rulesAccepted}
                  onChange={(e) => setRulesAccepted(e.target.checked)}
                  className="w-4 h-4 accent-[#1895C7] mt-0.5"
                />
                <span className="text-xs text-white/80 leading-relaxed">
                  <strong>{t.booking.rulesLabel}.</strong> {t.booking.rulesHint}
                </span>
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                  canSubmit
                    ? 'bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white hover:from-[#1895C7] hover:to-[#1279AE] active:scale-[0.99] cursor-pointer shadow-[0_12px_28px_-12px_rgba(32,177,238,0.55)]'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
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
      ) : (
        <div className="flex h-full flex-col rounded-[20px] bg-white/[0.05] border border-white/[0.18] p-6 md:p-7 backdrop-blur-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
            {t.booking.dateSelected}
          </span>
          <h3 className="mt-1 text-xl md:text-2xl font-bold text-white">{displayTitle}</h3>
          <p className="mt-1 text-xs text-white/50">{dayHint}</p>

          <p className="mt-6 text-sm font-bold text-white">{t.booking.selectSlotTitle}</p>
          <div className="mt-3 grid grid-cols-1 gap-2.5">
            {availableSchedules.map((opt) => {
              const active = schedule === opt.value
              const occupied = isSlotOccupied(opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => !occupied && onScheduleChange(opt.value)}
                  disabled={occupied}
                  aria-disabled={occupied}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all duration-200 ${
                    occupied
                      ? 'opacity-50 cursor-not-allowed bg-white/[0.03] border-white/10'
                      : active
                        ? 'border-white bg-white/[0.95] ring-1 ring-[#20B1EE]/40 shadow-[0_16px_36px_-18px_rgba(0,0,0,0.6)] cursor-pointer'
                        : 'border-white/20 bg-white/[0.08] hover:border-white/40 hover:bg-white/[0.12] cursor-pointer'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.dot} shrink-0 ${occupied ? 'opacity-60' : ''}`} />
                  <span className="flex-1">
                    <span className={`block text-sm font-bold ${active ? 'text-[#0F172A]' : 'text-white'}`}>
                      {opt.value === '9 am a 6 pm' ? t.booking.turnDay : t.booking.turnNight}
                      {occupied && (
                        <span className="text-xs font-medium text-red-400/80 ml-1">(Ocupado)</span>
                      )}
                    </span>
                    <span className={`block text-xs ${active ? 'text-[#0F172A]/70' : 'text-white/75'}`}>
                      {opt.hours}
                    </span>
                  </span>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      occupied ? 'border-white/15' : active ? 'border-[#1895C7]' : 'border-white/40'
                    }`}
                  >
                    {active && !occupied && <span className="w-2.5 h-2.5 rounded-full bg-[#1895C7]" />}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-white/[0.12] border-l-4 border-l-[#20B1EE] bg-white/[0.06] px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#20B1EE]" />
            <div>
              <p className="text-[0.9rem] font-semibold text-white">{t.booking.policyTitle}</p>
              <p className="mt-1 text-[0.825rem] text-white/75 leading-relaxed">{t.booking.policyBody}</p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{t.booking.totalLabel}</span>
              <span className="text-3xl font-bold text-white tabular-nums">
                ${fee}.00 <span className="text-xs font-semibold text-white/60">USD</span>
              </span>
            </div>
            <label className="mt-4 flex items-start gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all duration-200 active:scale-[0.99] ${
              policyAccepted
                ? 'border-[#20B1EE]/60 bg-[#1895C7]/15'
                : 'border-white/20 bg-white/[0.08] hover:border-white/35'
            }">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`mt-0.5 w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                  policyAccepted
                    ? 'bg-[#1895C7] border-[#1895C7]'
                    : 'border-white/60 bg-transparent'
                }`}
              >
                {policyAccepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </span>
              <span className="text-[0.85rem] text-[#E2E8F0] leading-snug">
                {t.booking.policyConfirm}
              </span>
            </label>
            <button
              onClick={() => setStep('details')}
              disabled={!hasSchedule || !policyAccepted}
              className={`mt-4 w-full h-12 flex items-center justify-center gap-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
                hasSchedule && policyAccepted
                  ? 'bg-gradient-to-r from-[#20B1EE] to-[#1895C7] text-white hover:from-[#1895C7] hover:to-[#1279AE] active:scale-[0.99] cursor-pointer shadow-[0_12px_28px_-12px_rgba(32,177,238,0.55)]'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {t.booking.continueBooking}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}