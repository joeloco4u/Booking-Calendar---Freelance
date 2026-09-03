import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MonthDataRow } from '../services/api'
import { extractDay } from '../utils/date'
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
  lang: Lang
  admin?: boolean
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
  lang,
  admin = false,
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

    const statuses = new Map<
      number,
      'occupied' | 'partial' | 'available' | 'locked'
    >()
    for (const [day, rows] of byDay) {
      if (rows.length === 0) continue
      const allAvailable = rows.every((r) => r.status === 'Available')
      const allMaintenance = rows.every((r) => r.status === 'Maintenance')
      const noneAvailable = rows.every((r) => r.status !== 'Available')
      if (allMaintenance) {
        statuses.set(day, 'locked')
      } else if (allAvailable) {
        statuses.set(day, 'available')
      } else if (noneAvailable) {
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
    if (admin) return false
    if (isWeekday(day) || isPast(day)) return true
    const status = dayStatuses.get(day)
    return status === 'occupied' || status === 'locked'
  }

  const dayClass = (day: number, status: 'occupied' | 'partial' | 'available' | 'locked' | null) => {
    if (admin) {
      if (isSelected(day)) {
        return 'bg-[#20B1EE] text-white font-bold ring-1 ring-[#20B1EE]/40 shadow-[0_10px_24px_-12px_rgba(32,177,238,0.55)]'
      }
      return 'text-white font-semibold hover:scale-110 hover:ring-2 hover:ring-white/50 hover:bg-white/[0.1] transition-all duration-200 cursor-pointer'
    }
    if (isSelected(day)) {
      return 'bg-white text-[#1895C7] font-bold ring-1 ring-white/60 shadow-[0_10px_24px_-12px_rgba(255,255,255,0.4)]'
    }
    if (isToday(day)) {
      return 'text-[#7CD0F4] ring-1 ring-white/40 font-bold'
    }
    if (isPast(day)) {
      return 'text-white/[0.4] cursor-not-allowed'
    }
    if (isWeekday(day)) {
      return 'text-white/[0.4] line-through cursor-not-allowed'
    }
    if (status === 'occupied') {
      return 'text-white/45 font-medium'
    }
    return 'text-white font-semibold hover:scale-110 hover:ring-2 hover:ring-white/50 hover:bg-white/[0.1] transition-all duration-200'
  }

  const dotClass = (status: 'occupied' | 'partial' | 'available' | 'locked' | null) => {
    if (status === 'available') return 'bg-[#10B981]'
    if (status === 'occupied') return 'bg-red-400'
    if (status === 'partial') return 'bg-amber-400'
    if (status === 'locked') return 'bg-amber-400'
    return ''
  }

  return (
    <div className="flex h-full flex-col rounded-[20px] bg-white/[0.05] border border-white/[0.18] p-5 md:p-6 backdrop-blur-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
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
            className="text-center text-[11px] font-bold uppercase tracking-wider text-white/80 py-2"
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
          else if (status === 'locked') title = t.calendar.titleMaintenance
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

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/70">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" /> {t.calendar.legendAvailable}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/70">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> {t.calendar.legendPartial}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-amber-400/25 text-xs text-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> {t.calendar.legendMaintenance}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/70">
          <span className="w-2 h-2 rounded-full bg-red-400" /> {t.calendar.legendOccupied}
        </span>
      </div>
    </div>
  )
}