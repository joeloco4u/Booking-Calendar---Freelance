import { useMemo, useState } from 'react'
import { Search, Users as UsersIcon } from 'lucide-react'
import type { MonthDataRow } from '../services/api'
import { translations, type Lang } from '../i18n'

interface AdminUsersProps {
  monthData: MonthDataRow[]
  lang: Lang
  fee: number
}

interface ClientAgg {
  name: string
  email: string
  pending: number
  approved: number
  rejected: number
  totalSync: number
}

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-[#FACC15]',
  approved: 'bg-emerald-400',
  rejected: 'bg-red-400',
}

export default function AdminUsers({ monthData, lang, fee }: AdminUsersProps) {
  const t = translations[lang]
  const [query, setQuery] = useState('')

  const clients = useMemo<ClientAgg[]>(() => {
    const map = new Map<string, ClientAgg>()
    for (const row of monthData) {
      const key = (row.email || row.name).trim().toLowerCase()
      const agg = map.get(key) ?? {
        name: row.name,
        email: row.email ?? '',
        pending: 0,
        approved: 0,
        rejected: 0,
        totalSync: 0,
      }
      const status = row.status?.toLowerCase()
      if (status === 'pending') agg.pending += 1
      else if (status === 'approved') {
        agg.approved += 1
        agg.totalSync += fee
      } else if (status === 'rejected') agg.rejected += 1
      map.set(key, agg)
    }
    return [...map.values()].sort((a, b) =>
      (b.pending + b.approved + b.rejected) - (a.pending + a.approved + a.rejected),
    )
  }, [monthData, fee])

  const totalClients = clients.length
  const totalBookings = monthData.length
  const approvedSpend = clients.reduce((sum, c) => sum + c.totalSync, 0)

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const summaryCards = [
    { label: t.admin.usersCount, value: String(totalClients), dot: 'bg-[#20B1EE]' },
    { label: t.admin.usersBookings, value: String(totalBookings), dot: 'bg-[#FACC15]' },
    { label: t.admin.usersSpend, value: `$${approvedSpend}`, dot: 'bg-emerald-400' },
  ]

  return (
    <div className="mx-auto w-full max-w-[1400px] py-2 animate-fade-in-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {t.admin.pageUsersTitle}
        </h1>
        <p className="mt-2 text-sm text-[#7A93B5]">{t.admin.pageUsersSub}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-[20px] bg-[#0B1F35]/80 border border-white/[0.08] p-6 hover:border-[#20B1EE]/30 hover:-translate-y-0.5 transition-all duration-300 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.9)]"
          >
            <p className="text-[0.8rem] font-medium text-[#7A93B5]">{card.label}</p>
            <p className="mt-2 text-[1.8rem] font-bold text-white tabular-nums leading-none">
              {card.value}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/60">
              <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
              {card.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[24px] bg-[#0B1F35]/80 border border-white/[0.06] p-5 md:p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {t.admin.pageUsersTitle}
            </h2>
            <p className="mt-1.5 text-sm text-[#7A93B5]">{t.admin.sectionSubtitle}</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A93B5]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.admin.usersSearch}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#1895C7]/60 transition-all"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-[20px] border border-dashed border-white/[0.1]">
            <div className="w-14 h-14 rounded-full bg-[#20B1EE]/10 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-[#20B1EE]" />
            </div>
            <p className="mt-4 text-base font-bold text-white">{t.admin.emptyCardTitle}</p>
            <p className="mt-1 max-w-xs text-sm text-[#7A93B5]">{t.admin.usersEmpty}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {filtered.map((client) => (
              <div
                key={client.email || client.name}
                className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-y-4 gap-x-6 px-5 py-4 rounded-2xl bg-[#102A43]/60 border border-white/[0.06] hover:border-[#20B1EE]/25 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#20B1EE]/15 border border-[#20B1EE]/25 flex items-center justify-center text-xs font-bold text-[#20B1EE] shrink-0">
                    {initials(client.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{client.name}</p>
                    {client.email && (
                      <p className="text-[0.75rem] text-[#64748B] truncate">{client.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { key: 'pending', count: client.pending },
                      { key: 'approved', count: client.approved },
                      { key: 'rejected', count: client.rejected },
                    ] as const
                  ).map((s) => (
                    <span
                      key={s.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold text-white/70"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s.key]}`} />
                      {t.admin[`users${s.key[0].toUpperCase()}${s.key.slice(1)}` as 'usersPending']}:{' '}
                      {s.count}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between md:justify-end gap-3">
                  <span className="md:hidden text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                    {t.admin.usersSpend}
                  </span>
                  <span className="text-lg font-bold text-white tabular-nums">
                    ${client.totalSync}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}