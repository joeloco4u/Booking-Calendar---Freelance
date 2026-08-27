import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MonthDataRow } from '../services/api'
import { extractDay } from '../utils/date'

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
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

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
}: CalendarProps) {
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
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return d < t
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-slate-100">
          {MONTH_NAMES_EN[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 gap-1 transition-opacity duration-200 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />
          }

          const disabled = isDisabled(day)
          const selected = isSelected(day)
          const todayMark = isToday(day)
          const weekday = isWeekday(day)
          const status = dayStatuses.get(day) ?? null

          let dotColor = ''
          if (isWeekend(day) && !isPast(day)) {
            if (status === 'available') dotColor = 'bg-green-500'
            else if (status === 'occupied') dotColor = 'bg-red-500'
            else if (status === 'partial') dotColor = 'bg-yellow-400'
          }

          let title = ''
          if (weekday) title = 'Weekday \u2014 not available'
          else if (status === 'occupied') title = 'Occupied'
          else if (status === 'partial') title = 'Partially Available'
          else if (status === 'available') title = 'Available'
          else if (isPast(day)) title = 'Past date'

          return (
            <button
              key={day}
              onClick={() => !disabled && onSelectDate(day, currentMonth, currentYear)}
              disabled={disabled}
              className={`
                relative h-10 rounded-lg text-sm font-medium transition-all
                ${disabled && !selected ? 'text-slate-700 cursor-not-allowed' : 'cursor-pointer'}
                ${weekday && !isPast(day) ? 'text-slate-600 line-through' : ''}
                ${status === 'occupied' && !isPast(day) ? 'text-red-400/60' : ''}
                ${status === 'partial' && !isPast(day) && !selected ? 'text-yellow-400/80' : ''}
                ${isPast(day) && !todayMark ? 'text-slate-700' : ''}
                ${todayMark && !selected && !disabled ? 'ring-1 ring-blue-500 text-blue-400 font-bold' : ''}
                ${selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : ''}
                ${!selected && !disabled && !todayMark ? 'text-slate-300 hover:bg-slate-800' : ''}
              `}
              title={title}
            >
              {day}
              {dotColor && !isPast(day) && !isLoading && (
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${dotColor}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Available
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-yellow-400" /> Partial
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Occupied
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Selected
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-slate-700" /> Unavailable
        </div>
      </div>
    </div>
  )
}
