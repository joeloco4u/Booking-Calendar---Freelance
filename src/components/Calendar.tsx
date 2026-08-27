import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react'
import type { MonthDataRow } from '../services/api'
import { extractDay } from '../utils/date'
import { getDayType, getAvailableSchedules } from '../utils/schedule'
import { translations, type Lang } from '../i18n'

interface CalendarProps {
  viewDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  selectedDate: number | null
  selectedMonth: number | null
  selectedYear: number | null
  onSelectDate: (day: number, month: number, year: number) => void
  monthData: MonthDataRow[]
  isLoading?: boolean
  schedule: string
  onScheduleChange: (value: string) => void
  lang: Lang
}

export default function Calendar({
  viewDate,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  selectedMonth,
  selectedYear,
  onSelectDate,
  monthData,
  isLoading = false,
  schedule,
  onScheduleChange,
  lang,
}: CalendarProps) {
  const t = translations[lang]
  const today = new Date()
  const currentMonth = viewDate.getMonth()
  const currentYear = viewDate.getFullYear()

  const safeMonthData = Array.isArray(monthData) ? monthData : []

  const dayStatuses = useMemo(() => {
    const byDay = new Map<number, MonthDataRow[]>()
    for (const row of safeMonthData) {
      const day = extractDay(row.date)
      if (day === null) continue
      const list = byDay.get(day) ?? []
      list.push(row)
      byDay.set(day, list)
    }

    const statuses = new Map<number, 'occupied' | 'partial' | 'available'>()
    for (const [day, rows] of byDay) {
      if (rows.length === 0) continue
      const allAvailable = rows.every((r) => r.status === 'Available')
      const allOccupied = rows.every((r) => r.status === 'Approved' || r.status === 'Pending')
      if (allAvailable) {
        statuses.set(day, 'available')
      } else if (allOccupied) {
        statuses.set(day, 'occupied')
      } else {
        statuses.set(day, 'partial')
      }
    }
    return statuses
  }, [safeMonthData])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [currentMonth, currentYear])

  const isSelected = (day: number) => {
    return selectedDate === day && selectedMonth === currentMonth && selectedYear === currentYear
  }

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    )
  }

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day)
    d.setHours(0, 0, 0, 0)
    const t2 = new Date()
    t2.setHours(0, 0, 0, 0)
    return d < t2
  }

  const isWeekend = (day: number) => {
    const dow = new Date(currentYear, currentMonth, day).getDay()
    return dow === 0 || dow === 5 || dow === 6
  }

  const isWeekday = (day: number) => !isWeekend(day)

  const isDisabled = (day: number) => {
    if (isWeekday(day) || isPast(day)) return true
    const status = dayStatuses.get(day)
    return status === 'occupied'
  }

  const dayClass = (day: number, status: 'occupied' | 'partial' | 'available' | null) => {
    if (isSelected(day)) {
      return 'bg-gradient-to-r from-cyan-cta to-cyan-glow text-white shadow-[0_8px_20px_-6px_rgba(32,177,238,0.8)] ring-1 ring-white/30'
    }
    if (isToday(day)) {
      return 'text-cyan-glow ring-1 ring-cyan-glow/60 font-bold'
    }
    if (isPast(day)) {
      return 'text-white/[0.22] cursor-not-allowed'
    }
    if (isWeekday(day)) {
      return 'text-white/[0.28] line-through cursor-not-allowed'
    }
    if (status === 'occupied') {
      return 'text-white/45'
    }
    if (status === 'partial') {
      return 'text-cyan-glow/80'
    }
    return 'text-white hover:scale-110 hover:ring-2 hover:ring-cyan-glow hover:bg-cyan-glow/20 hover:shadow-[0_0_18px_rgba(32,177,238,0.6)] hover:text-white transition-all duration-200'
  }

  const dotClass = (status: 'occupied' | 'partial' | 'available' | null) => {
    if (status === 'available') return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
    if (status === 'occupied') return 'bg-red-400'
    if (status === 'partial') return 'bg-amber-400'
    return ''
  }

  const selectedInView =
    selectedDate !== null && selectedMonth === currentMonth && selectedYear === currentYear
  const selectedDayType = selectedInView ? getDayType(selectedDate, currentMonth, currentYear) : null
  const showSchedules =
    selectedDayType === 'friday' || selectedDayType === 'saturday' || selectedDayType === 'sunday'
  const availableSchedules = showSchedules ? getAvailableSchedules(selectedDayType) : []

  return (
    <div className="rounded-[20px] bg-marine-2 border border-white/10 p-5 md:p-6 shadow-[0_20px_50px_-24px_rgba(2,8,20,0.9)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-xl text-white/60 hover:bg-white/[0.08] hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-white tracking-tight">
          {t.calendar.months[currentMonth]}{' '}
          <span className="text-cyan-glow">{currentYear}</span>
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-xl text-white/60 hover:bg-white/[0.08] hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {t.calendar.weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-bold uppercase tracking-wider text-white/35 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 gap-1.5 transition-opacity duration-200 ${
          isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}
      >
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />
          }

          const disabled = isDisabled(day)
          const status = dayStatuses.get(day) ?? null
          const showDot = isWeekend(day) && !isPast(day) && !isLoading

          let title = ''
          if (isWeekday(day)) title = t.calendar.titleWeekday
          else if (status === 'occupied') title = t.calendar.titleOccupied
          else if (status === 'partial') title = t.calendar.titlePartial
          else if (status === 'available') title = t.calendar.titleAvailable
          else if (isPast(day)) title = t.calendar.titlePast

          return (
            <button
              key={day}
              onClick={() => !disabled && onSelectDate(day, currentMonth, currentYear)}
              disabled={disabled}
              className={`relative h-10 rounded-xl text-sm font-semibold ${
                disabled && !isSelected(day) ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${dayClass(day, status)}`}
              title={title}
            >
              {day}
              {dotClass(status) && showDot && (
                <span
                  className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dotClass(status)}`}
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/10 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> {t.calendar.legendAvailable}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> {t.calendar.legendPartial}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span className="w-2 h-2 rounded-full bg-red-400" /> {t.calendar.legendOccupied}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span className="w-2 h-2 rounded-full bg-cyan-glow shadow-[0_0_6px_rgba(32,177,238,0.8)]" />{' '}
          {t.calendar.legendSelected}
        </div>
      </div>

      {showSchedules && (
        <div className="mt-5 pt-4 border-t border-white/10 animate-slide-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-glow/10 flex items-center justify-center shrink-0">
              <CalendarClock className="w-4 h-4 text-cyan-glow" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{t.booking.schedulesLabel}</p>
              <p className="text-[11px] text-white/50">
                {selectedDayType === 'friday' && t.booking.dayHintFriday}
                {selectedDayType === 'saturday' && t.booking.dayHintSaturday}
                {selectedDayType === 'sunday' && t.booking.dayHintSunday}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableSchedules.map((opt) => {
              const active = schedule === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => onScheduleChange(opt.value)}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-cyan-cta to-cyan-glow border-transparent shadow-[0_10px_24px_-8px_rgba(32,177,238,0.8)]'
                      : 'bg-white/[0.05] border-white/10 hover:border-cyan-glow/60 hover:bg-cyan-glow/10 hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                  <span className="text-left">
                    <span
                      className={`block text-sm font-bold ${
                        active ? 'text-white' : 'text-white'
                      }`}
                    >
                      {opt.value === '9 am a 6 pm' ? t.booking.turnDay : t.booking.turnNight}
                    </span>
                    <span
                      className={`block text-xs ${
                        active ? 'text-white/85' : 'text-white/50'
                      }`}
                    >
                      {opt.hours}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}