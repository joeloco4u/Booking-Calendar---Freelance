import { useState, useMemo } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { submitBooking } from '../services/api'
import type { MonthDataRow } from '../services/api'

interface ReservationFormProps {
  selectedDate: number | null
  selectedMonth: number | null
  selectedYear: number | null
  schedule: string
  onScheduleChange: (value: string) => void
  monthData: MonthDataRow[]
  currentMonthStr: string
  onRefresh?: () => void
}

const ALL_SCHEDULES = [
  { value: '9 am a 6 pm', label: '9 AM to 6 PM' },
  { value: '7 pm a 3 am', label: '7 PM to 3 AM' },
]

type DayType = 'friday' | 'saturday' | 'sunday' | 'weekday' | null

function getDayType(day: number | null, month: number | null, year: number | null): DayType {
  if (day === null || month === null || year === null) return null
  const dow = new Date(year, month, day).getDay()
  if (dow === 5) return 'friday'
  if (dow === 6) return 'saturday'
  if (dow === 0) return 'sunday'
  return 'weekday'
}

function getAvailableSchedules(dayType: DayType) {
  switch (dayType) {
    case 'friday':
      return ALL_SCHEDULES.filter((s) => s.value === '7 pm a 3 am')
    case 'saturday':
      return ALL_SCHEDULES
    case 'sunday':
      return ALL_SCHEDULES.filter((s) => s.value === '9 am a 6 pm')
    default:
      return []
  }
}

function formatDisplayDate(day: number, month: number, year: number) {
  const date = new Date(year, month, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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
}: ReservationFormProps) {
  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const dayType = getDayType(selectedDate, selectedMonth, selectedYear)
  const availableSchedules = getAvailableSchedules(dayType)
  const isWeekdaySelected = dayType === 'weekday'

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
    selectedDate !== null &&
    selectedMonth !== null &&
    selectedYear !== null &&
    schedule !== '' &&
    !isWeekdaySelected &&
    matchedRow !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !matchedRow) return
    if (!fullName.trim()) {
      alert('Please enter your full name.')
      return
    }

    setIsSubmitting(true)

    submitBooking({
      fullName: fullName.trim(),
      fee: 60,
      row: matchedRow.rowIndex,
      mes: currentMonthStr,
      note: '',
    })
      .then(() => {
        setFullName('')
        onScheduleChange('')
        alert('Booking request sent successfully!')
        if (onRefresh) onRefresh()
      })
      .catch(() => {
        setStatus('error')
        alert('Error sending request')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const displayDate =
    selectedDate !== null && selectedMonth !== null && selectedYear !== null
      ? formatDisplayDate(selectedDate, selectedMonth, selectedYear)
      : null

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-base font-semibold text-slate-100 mb-5">Booking Request</h2>

      {status === 'success' && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Booking request submitted successfully.
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Something went wrong. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Selected Date</label>
          <input
            type="text"
            value={displayDate ?? 'Select a date from the calendar'}
            readOnly
            className={`w-full h-10 px-3 rounded-lg border text-sm ${
              displayDate
                ? isWeekdaySelected
                  ? 'bg-slate-800 border-red-500/40 text-red-400'
                  : 'bg-slate-800 border-blue-500/40 text-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          />
          {isWeekdaySelected && (
            <span className="text-[11px] text-red-400 mt-1 block">
              Pool is only available on weekends (Fri–Sun)
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Time Schedule</label>
          <select
            value={schedule}
            onChange={(e) => onScheduleChange(e.target.value)}
            disabled={!selectedDate || isWeekdaySelected}
            className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none ${
              !selectedDate || isWeekdaySelected
                ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2364748b' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
          >
            <option value="">
              {!selectedDate
                ? 'Select a date first...'
                : isWeekdaySelected
                  ? 'No schedules on weekdays'
                  : 'Select schedule...'}
            </option>
            {availableSchedules.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {dayType === 'friday' && (
            <span className="text-[11px] text-slate-500 mt-1 block">Friday: evening only (7 PM – 3 AM)</span>
          )}
          {dayType === 'saturday' && (
            <span className="text-[11px] text-slate-500 mt-1 block">Saturday: both schedules available</span>
          )}
          {dayType === 'sunday' && (
            <span className="text-[11px] text-slate-500 mt-1 block">Sunday: daytime only (9 AM – 6 PM)</span>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Fee / Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
            <input
              type="text"
              value="60.00"
              disabled
              className="w-full h-10 pl-7 pr-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-400 cursor-not-allowed"
            />
          </div>
          <span className="text-[11px] text-slate-600 mt-1 block">Standard rate per session</span>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={`w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all ${
            canSubmit && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
            <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending Request...' : 'Request Booking'}
        </button>
      </form>
    </div>
  )
}
