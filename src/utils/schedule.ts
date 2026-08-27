export type DayType = 'friday' | 'saturday' | 'sunday' | 'weekday' | null

export const SCHEDULE_OPTIONS = [
  { value: '9 am a 6 pm', hours: '9:00 AM – 5:30 PM', dot: 'bg-amber-400' },
  { value: '7 pm a 3 am', hours: '7:00 PM – 3:00 AM', dot: 'bg-indigo-400' },
]

export function getDayType(day: number | null, month: number | null, year: number | null): DayType {
  if (day === null || month === null || year === null) return null
  const dow = new Date(year, month, day).getDay()
  if (dow === 5) return 'friday'
  if (dow === 6) return 'saturday'
  if (dow === 0) return 'sunday'
  return 'weekday'
}

export function getAvailableSchedules(dayType: DayType) {
  switch (dayType) {
    case 'friday':
      return SCHEDULE_OPTIONS.filter((s) => s.value === '7 pm a 3 am')
    case 'saturday':
      return SCHEDULE_OPTIONS
    case 'sunday':
      return SCHEDULE_OPTIONS.filter((s) => s.value === '9 am a 6 pm')
    default:
      return []
  }
}