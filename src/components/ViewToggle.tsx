import { Globe, CalendarDays } from 'lucide-react'

interface ViewToggleProps {
  view: 'landing' | 'app'
  onChange: (view: 'landing' | 'app') => void
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 p-1 rounded-2xl bg-navy-deep/80 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_-12px_rgba(3,10,25,0.8)]">
      <button
        onClick={() => onChange('landing')}
        className={`flex items-center gap-2 px-3.5 h-9 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          view === 'landing'
            ? 'bg-[#0E2138] text-cyan-glow ring-1 ring-[#1895C7]/50'
            : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        <Globe className="w-4 h-4" />
        Landing
      </button>
      <button
        onClick={() => onChange('app')}
        className={`flex items-center gap-2 px-3.5 h-9 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          view === 'app'
            ? 'bg-[#0E2138] text-cyan-glow ring-1 ring-[#1895C7]/50'
            : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
        }`}
      >
        <CalendarDays className="w-4 h-4" />
        Booking App
      </button>
    </div>
  )
}