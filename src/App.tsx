import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Layout, { type AdminSection } from './components/Layout'
import Calendar from './components/Calendar'
import ReservationForm from './components/ReservationForm'
import AdminDashboard from './components/AdminDashboard'
import AdminBookings from './components/AdminBookings'
import AdminCalendar from './components/AdminCalendar'
import AdminUsers from './components/AdminUsers'
import AdminSettings from './components/AdminSettings'
import FacilityLanding from './components/FacilityLanding'
import LandingPage from './components/LandingPage'
import ErrorBanner from './components/ErrorBanner'
import { fetchMonthData, type MonthDataRow } from './services/api'
import { translations, type Lang } from './i18n'

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DEFAULT_RULES = [
  'Respeta el horario de tu turno.',
  'Ducha previa obligatoria antes de ingresar a la piscina.',
  'Música a volumen adecuado que no moleste a vecinos.',
  'Sigue las instrucciones del encargado del área.',
  'Cancelaciones con menos de 1 semana de antelación aplican una penalización de $10 USD.',
]

function BookingView(props: {
  lang: Lang
  selectedDate: number | null
  selectedMonth: number | null
  selectedYear: number | null
  schedule: string
  onScheduleChange: (s: string) => void
  monthData: MonthDataRow[]
  currentMonthStr: string
  onRefresh: () => void
  fee: number
  viewDate: Date
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (day: number, month: number, year: number) => void
  isLoading: boolean
  error: boolean
}) {
  const location = useLocation()
  const bookingRef = useRef<HTMLElement | null>(null)

  const {
    lang, selectedDate, selectedMonth, selectedYear, schedule,
    onScheduleChange, monthData, currentMonthStr, onRefresh, fee,
    viewDate, onPrevMonth, onNextMonth, onSelectDate, isLoading, error,
  } = props

  useEffect(() => {
    if (location.state?.scrollToBooking) {
      window.history.replaceState({}, '')
      setTimeout(() => {
        bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [location.state])

  return (
    <>
      {error && (
        <ErrorBanner lang={lang} />
      )}
      <FacilityLanding lang={lang} />
      <section
        ref={bookingRef}
        id="booking"
        className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-6 scroll-mt-6"
      >
        <Calendar
          viewDate={viewDate}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onSelectDate={onSelectDate}
          monthData={monthData}
          isLoading={isLoading}
          lang={lang}
        />
        <ReservationForm
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          schedule={schedule}
          onScheduleChange={onScheduleChange}
          monthData={monthData}
          currentMonthStr={currentMonthStr}
          onRefresh={onRefresh}
          lang={lang}
          fee={fee}
        />
      </section>
    </>
  )
}

function RouteWatcher({ onLeaveAdmin }: { onLeaveAdmin: () => void }) {
  const location = useLocation()

  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      onLeaveAdmin()
    }
  }, [location.pathname, onLeaveAdmin])

  return null
}

function AppContent() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>('en')
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard')
  const [adminAuthed, setAdminAuthed] = useState(false)
  const [fee, setFee] = useState(60)
  const [rules, setRules] = useState<string[]>(DEFAULT_RULES)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [schedule, setSchedule] = useState('')
  const [viewDate, setViewDate] = useState(() => new Date())
  const [monthData, setMonthData] = useState<MonthDataRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const [cache, setCache] = useState<Record<string, MonthDataRow[]>>({})
  const cacheRef = useRef(cache)
  useEffect(() => {
    cacheRef.current = cache
  }, [cache])

  const currentMonthStr = `${MONTH_NAMES_ES[viewDate.getMonth()]} - ${viewDate.getFullYear()}`

  const refreshData = useCallback(() => {
    setIsLoading(true)
    setError(false)
    fetchMonthData(currentMonthStr)
      .then((data) => {
        setMonthData(data)
        setCache((prev) => ({ ...prev, [currentMonthStr]: data }))
      })
      .catch(() => {
        setMonthData([])
        setError(true)
      })
      .finally(() => setIsLoading(false))
  }, [currentMonthStr])

  useEffect(() => {
    let isMounted = true
    const cached = cacheRef.current[currentMonthStr]

    if (cached) {
      setMonthData(cached)
      setIsLoading(false)
      setError(false)
      return () => { isMounted = false }
    }

    setIsLoading(true)
    setError(false)
    setMonthData([])

    fetchMonthData(currentMonthStr)
      .then((data) => {
        if (isMounted) {
          setMonthData(data)
          setCache((prev) => ({ ...prev, [currentMonthStr]: data }))
        }
      })
      .catch(() => {
        if (isMounted) {
          setMonthData([])
          setError(true)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
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

  const t = translations[lang]

  const handleBookNow = () => {
    navigate('/booking', { state: { scrollToBooking: true } })
  }

  const handleSelectDate = (day: number, month: number, year: number) => {
    setSelectedDate(day)
    setSelectedMonth(month)
    setSelectedYear(year)
    setSchedule('')
  }

  return (
    <>
      <RouteWatcher onLeaveAdmin={() => setAdminAuthed(false)} />
      <Routes>
      <Route
        path="/"
        element={<LandingPage lang={lang} onLangChange={setLang} onBookNow={handleBookNow} />}
      />

      <Route
        path="/booking"
        element={
          <Layout
            headerTitle={t.header.userTitle}
            headerSubtitle={t.header.userSubtitle}
            role="freelancer"
            lang={lang}
            activeSection={null}
            onNavigate={setAdminSection}
            onLangChange={setLang}
          >
            <BookingView
              lang={lang}
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              schedule={schedule}
              onScheduleChange={setSchedule}
              monthData={monthData}
              currentMonthStr={currentMonthStr}
              onRefresh={refreshData}
              fee={fee}
              viewDate={viewDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onSelectDate={handleSelectDate}
              isLoading={isLoading}
              error={error}
            />
          </Layout>
        }
      />

      <Route
        path="/admin"
        element={
          <Layout
            headerTitle={t.header.adminTitle}
            headerSubtitle={t.header.adminSubtitle}
            role="admin"
            lang={lang}
            activeSection={adminSection}
            onNavigate={setAdminSection}
            onLangChange={setLang}
          >
            {error && <ErrorBanner lang={lang} onRetry={refreshData} />}
            {!adminAuthed ? (
              <AdminDashboard
                monthData={monthData}
                onMonthDataChange={setMonthData}
                currentMonthStr={currentMonthStr}
                onRefresh={refreshData}
                lang={lang}
                viewDate={viewDate}
                setViewDate={setViewDate}
                authed={false}
                onAuthed={() => setAdminAuthed(true)}
                fee={fee}
                rules={rules}
                isLoading={isLoading}
              />
            ) : adminSection === 'dashboard' ? (
              <AdminDashboard
                monthData={monthData}
                onMonthDataChange={setMonthData}
                currentMonthStr={currentMonthStr}
                onRefresh={refreshData}
                lang={lang}
                viewDate={viewDate}
                setViewDate={setViewDate}
                authed={true}
                onAuthed={() => setAdminAuthed(true)}
                fee={fee}
                rules={rules}
                isLoading={isLoading}
              />
            ) : adminSection === 'bookings' ? (
              <AdminBookings
                monthData={monthData}
                onMonthDataChange={setMonthData}
                currentMonthStr={currentMonthStr}
                onRefresh={refreshData}
                lang={lang}
                rules={rules}
                fee={fee}
                isLoading={isLoading}
              />
            ) : adminSection === 'calendar' ? (
              <AdminCalendar
                viewDate={viewDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                monthData={monthData}
                onMonthDataChange={setMonthData}
                currentMonthStr={currentMonthStr}
                onRefresh={refreshData}
                lang={lang}
                fee={fee}
                isLoading={isLoading}
              />
            ) : adminSection === 'users' ? (
              <AdminUsers monthData={monthData} lang={lang} fee={fee} isLoading={isLoading} />
            ) : (
              <AdminSettings
                fee={fee}
                onFeeChange={setFee}
                rules={rules}
                onRulesChange={setRules}
                lang={lang}
              />
            )}
          </Layout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
