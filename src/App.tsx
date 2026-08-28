import { useState, useEffect, useCallback, useRef } from 'react'
import Layout from './components/Layout'
import Calendar from './components/Calendar'
import ReservationForm from './components/ReservationForm'
import AdminDashboard from './components/AdminDashboard'
import FacilityLanding from './components/FacilityLanding'
import LandingPage from './components/LandingPage'
import ViewToggle from './components/ViewToggle'
import { fetchMonthData, type MonthDataRow } from './services/api'
import { translations, type Lang } from './i18n'

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function App() {
  const [siteView, setSiteView] = useState<'landing' | 'app'>('landing')
  const [role, setRole] = useState<'freelancer' | 'admin'>('freelancer')
  const [lang, setLang] = useState<Lang>('es')
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
  const t = translations[lang]
  const config = isAdmin
    ? { title: t.header.adminTitle, subtitle: t.header.adminSubtitle }
    : { title: t.header.userTitle, subtitle: t.header.userSubtitle }

  const bookingRef = useRef<HTMLElement | null>(null)
  const handleBookNow = useCallback(() => {
    if (siteView !== 'app') {
      setSiteView('app')
      setTimeout(() => {
        bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
      return
    }
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [siteView])

  const handleSelectDate = (day: number, month: number, year: number) => {
    setSelectedDate(day)
    setSelectedMonth(month)
    setSelectedYear(year)
    setSchedule('')
  }

  return (
    <>
      {siteView === 'landing' ? (
        <LandingPage lang={lang} onLangChange={setLang} onBookNow={handleBookNow} />
      ) : (
        <Layout
          headerTitle={config.title}
          headerSubtitle={config.subtitle}
          role={role}
          lang={lang}
          onLangChange={setLang}
          onRoleChange={setRole}
          onBookNow={handleBookNow}
        >
          {isAdmin ? (
            <AdminDashboard
              monthData={monthData}
              onMonthDataChange={setMonthData}
              currentMonthStr={currentMonthStr}
              onRefresh={refreshData}
              lang={lang}
              viewDate={viewDate}
              setViewDate={setViewDate}
            />
          ) : (
            <>
              <FacilityLanding lang={lang} />
              <section
                ref={bookingRef}
                id="booking"
                className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-6 scroll-mt-6"
              >
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
                  schedule={schedule}
                  onScheduleChange={setSchedule}
                  lang={lang}
                />
                <ReservationForm
                  selectedDate={selectedDate}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  schedule={schedule}
                  onScheduleChange={setSchedule}
                  monthData={monthData}
                  currentMonthStr={currentMonthStr}
                  onRefresh={refreshData}
                  lang={lang}
                />
              </section>
            </>
          )}
        </Layout>
      )}
      <ViewToggle view={siteView} onChange={setSiteView} />
    </>
  )
}
