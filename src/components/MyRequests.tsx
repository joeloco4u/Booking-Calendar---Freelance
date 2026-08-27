import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import type { MonthDataRow } from '../services/api'
import { formatDisplayDate } from '../utils/date'

interface MyRequestsProps {
  monthData: MonthDataRow[]
}

export default function MyRequests({ monthData }: MyRequestsProps) {
  const requests = useMemo(
    () => monthData.filter((r) => r.status === 'Pending' || r.status === 'Approved'),
    [monthData]
  )

  if (requests.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <CalendarDays className="w-7 h-7 text-slate-600" />
        </div>
        <p className="text-sm font-medium text-slate-300 mb-1">No booking requests yet</p>
        <p className="text-xs text-slate-500 max-w-xs">
          Your submitted booking requests will appear here once you make a reservation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-500">Total Requests</span>
          <p className="text-2xl font-bold text-slate-100 mt-1">{requests.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-500">Pending</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {requests.filter((r) => r.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-medium text-slate-500">Approved</span>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {requests.filter((r) => r.status === 'Approved').length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {requests.map((row) => (
          <div
            key={row.rowIndex}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                {row.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{row.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Date</span>
                <span className="text-slate-300">{formatDisplayDate(row.date)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Schedule</span>
                <span className="text-slate-300">{row.schedule}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Fee</span>
                <span className="text-slate-300 font-medium">${row.fee}.00</span>
              </div>
            </div>

            <div className="sm:ml-auto shrink-0">
              {row.status === 'Approved' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
