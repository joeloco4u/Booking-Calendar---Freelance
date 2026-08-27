import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
  activeView: string
  onNavigate: (view: string) => void
  headerTitle: string
  headerSubtitle?: string
  role: 'freelancer' | 'admin'
  onRoleChange: (role: 'freelancer' | 'admin') => void
}

export default function Layout({ children, activeView, onNavigate, headerTitle, headerSubtitle, role, onRoleChange }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar activeView={activeView} onNavigate={onNavigate} role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={headerTitle} subtitle={headerSubtitle} role={role} onRoleChange={onRoleChange} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
