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
      className={`relative flex flex-col bg-brand-bg/70 backdrop-blur-2xl border-r border-white/[0.06] transition-all duration-300 ${
        collapsed ? 'w-[76px]' : 'w-60'
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
        <img
          src="/FlatamLogo.png"
          alt="Freelance Latam Logo"
          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/20 shadow-[0_0_12px_rgba(71,207,255,0.35)]"
        />
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight text-white truncate">
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-accent text-white shadow-[0_0_18px_rgba(71,207,255,0.45)] ring-1 ring-white/20'
                  : 'text-brand-muted hover:bg-white/[0.06] hover:text-white'
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
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-brand-bg border border-white/15 flex items-center justify-center text-brand-muted hover:text-white transition-colors cursor-pointer shadow-lg"
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  )
}