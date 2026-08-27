import { useState } from 'react'
import { CalendarDays, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  activeView: string
  onNavigate: (view: string) => void
  role: 'freelancer' | 'admin'
}

const freelancerNav = [
  { id: 'calendar', label: 'Booking Calendar', icon: CalendarDays },
]

const adminNav = [
  { id: 'dashboard', label: 'Admin Dashboard', icon: BarChart3 },
]

export default function Sidebar({ activeView, onNavigate, role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const isAdmin = role === 'admin'
  const navItems = isAdmin ? adminNav : freelancerNav

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-800">
        <img src="/FlatamLogo.png" alt="Freelance Latam Logo" className="w-8 h-8 rounded-full object-cover shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold text-slate-100 truncate">
            Freelance Latam
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  )
}
