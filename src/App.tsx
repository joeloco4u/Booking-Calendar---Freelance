import { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import Calendar from './components/Calendar'
import ReservationForm from './components/ReservationForm'
import AdminDashboard from './components/AdminDashboard'
import { fetchMonthData, type MonthDataRow } from './services/api'

const VIEW_CONFIG: Record<string, { title: string; subtitle: string }> = {
  calendar: { title: 'Booking Calendar', subtitle: 'Select a date to request a booking' },
}

const ADMIN_VIEW_CONFIG: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Admin Dashboard', subtitle: 'Manage all pool booking requests' },
}

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function App() {
  const [activeView, setActiveView] = useState('calendar')
  const [role, setRole] = useState<'freelancer' | 'admin'>('freelancer')
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [schedule, setSchedule] = useState('')
  const [viewDate, setViewDate] = useState(() => new Date())
  const [monthData, setMonthData] = useState<MonthDataRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [cache, setCache] = useState<Record<string, MonthDataRow[]>>({})

  const currentMonthStr = `${MONTH_NAMES_ES[viewDate.getMonth()]} - ${viewDate.getFullYear()}`

  const refreshData = useCallback(() => {
    setIsLoading(true)
    fetchMonthData(currentMonthStr)
      .then((data) => {
        setMonthData(data)
        setCache((prev) => ({ ...prev, [currentMonthStr]: data }))
        setIsLoading(false)
      })
      .catch(() => {
        setMonthData([])
        setIsLoading(false)
      })
  }, [currentMonthStr])

  useEffect(() => {
    let isMounted = true

    if (cache[currentMonthStr]) {
      setMonthData(cache[currentMonthStr])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setMonthData([])

    fetchMonthData(currentMonthStr)
      .then((data) => {
        if (isMounted) {
          setMonthData(data)
          setCache((prev) => ({ ...prev, [currentMonthStr]: data }))
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setMonthData([])
          setIsLoading(false)
        }
      })

    return () => { isMounted = false }
  }, [currentMonthStr])

  const handlePrevMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
    setSelectedDate(null)
    setSelectedMonth(null)
    setSelectedYear(null)
    setSchedule('')
  }

  const handleNextMonth = () => {
    setViewDate((prev) => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
    setSelectedDate(null)
    setSelectedMonth(null)
    setSelectedYear(null)
    setSchedule('')
  }

  const isAdmin = role === 'admin'
  const config = isAdmin
    ? (ADMIN_VIEW_CONFIG[activeView] ?? ADMIN_VIEW_CONFIG.dashboard)
    : (VIEW_CONFIG[activeView] ?? VIEW_CONFIG.dashboard)

  const handleSelectDate = (day: number, month: number, year: number) => {
    setSelectedDate(day)
    setSelectedMonth(month)
    setSelectedYear(year)
    setSchedule('')
  }

  return (
    <Layout
      activeView={activeView}
      onNavigate={setActiveView}
      headerTitle={config.title}
      headerSubtitle={config.subtitle}
      role={role}
      onRoleChange={setRole}
    >
      {isAdmin ? (
        <AdminDashboard
          monthData={monthData}
          onMonthDataChange={setMonthData}
          currentMonthStr={currentMonthStr}
          onRefresh={refreshData}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Calendar
              viewDate={viewDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onSelectDate={handleSelectDate}
              monthData={monthData}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <ReservationForm
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              schedule={schedule}
              onScheduleChange={setSchedule}
              monthData={monthData}
              currentMonthStr={currentMonthStr}
              onRefresh={refreshData}
            />
          </div>
        </div>
      )}
    </Layout>
  )
}
