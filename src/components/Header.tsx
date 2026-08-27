import { Shield, User } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  role: 'freelancer' | 'admin'
  onRoleChange: (role: 'freelancer' | 'admin') => void
}

export default function Header({ title, subtitle, role, onRoleChange }: HeaderProps) {
  const isAdmin = role === 'admin'

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
      <div>
        <h1 className="text-lg font-semibold text-slate-100 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onRoleChange(isAdmin ? 'freelancer' : 'admin')}
          className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors cursor-pointer"
          title="Switch role (mock)"
        >
          {isAdmin ? <Shield className="w-4 h-4 text-blue-400" /> : <User className="w-4 h-4 text-slate-400" />}
          <span className="hidden sm:inline">{isAdmin ? 'Admin' : 'Freelancer'}</span>
        </button>

        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isAdmin ? 'bg-blue-600' : 'bg-slate-700'}`}>
          {isAdmin ? 'AD' : 'FL'}
        </div>
      </div>
    </header>
  )
}
