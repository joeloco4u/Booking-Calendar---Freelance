import { useState, useMemo, useEffect } from 'react'
import { Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import { approveBooking, rejectBooking } from '../services/api'
import type { MonthDataRow } from '../services/api'
import { formatDisplayDate } from '../utils/date'

interface AdminDashboardProps {
  monthData: MonthDataRow[]
  onMonthDataChange: React.Dispatch<React.SetStateAction<MonthDataRow[]>>
  currentMonthStr: string
  onRefresh: () => void
}

export default function AdminDashboard({ monthData, onMonthDataChange, currentMonthStr, onRefresh }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending')
  const [rejectTarget, setRejectTarget] = useState<MonthDataRow | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const pendingRequests = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'pending'),
    [monthData]
  )

  const approvedRequests = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'approved'),
    [monthData]
  )

  const rejectedCount = useMemo(
    () => monthData.filter((r) => r.status?.toLowerCase() === 'rejected').length,
    [monthData]
  )

  useEffect(() => {
    if (isAuthenticated && onRefresh) {
      onRefresh()
    }
  }, [isAuthenticated, onRefresh])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === '1234') {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect PIN')
      setPin('')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4 border border-slate-700 w-80">
          <h2 className="text-xl font-bold text-slate-200">Admin Access</h2>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-center text-white focus:outline-none focus:border-blue-500 tracking-widest"
            autoFocus
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-colors">
            Unlock
          </button>
        </form>
      </div>
    )
  }

  const approvedCount = approvedRequests.length

  const displayData = activeTab === 'pending' ? pendingRequests : approvedRequests

  const summaryCards = [
    { label: 'Pending Requests', value: String(pendingRequests.length), icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Revenue', value: `$${approvedCount * 60}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Approved This Month', value: String(approvedCount), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Rejected This Month', value: String(rejectedCount), icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ]

  const handleApprove = async (row: MonthDataRow) => {
    setActionLoading(row.rowIndex)
    onMonthDataChange((prev) => prev.map((r) => r.rowIndex === row.rowIndex ? { ...r, status: 'Approved' as const } : r))
    try {
      await approveBooking(row.rowIndex, currentMonthStr)
      onRefresh()
    } catch {
      onRefresh()
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = (row: MonthDataRow) => {
    setRejectTarget(row)
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.rowIndex)
    onMonthDataChange((prev) => prev.filter((r) => r.rowIndex !== rejectTarget.rowIndex))
    try {
      await rejectBooking(rejectTarget.rowIndex, currentMonthStr)
      onRefresh()
    } catch {
      onRefresh()
    } finally {
      setActionLoading(null)
      setRejectTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-100">{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="flex space-x-4 mb-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`font-medium text-sm pb-2 border-b-2 transition-colors ${activeTab === 'pending' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`font-medium text-sm pb-2 border-b-2 transition-colors ${activeTab === 'approved' ? 'border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Approved Bookings ({approvedRequests.length})
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Booking Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">Review and manage pool booking requests</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Freelancer Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Schedule</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Fee</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Note</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                    No {activeTab} requests at the moment.
                  </td>
                </tr>
              ) : (
                displayData.map((row) => (
                  <tr key={row.rowIndex} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                          {row.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-sm text-slate-200 font-medium">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{formatDisplayDate(row.date)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400">{row.schedule}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-300 font-medium">${row.fee}.00</td>
                    <td className="px-5 py-3.5 text-sm text-slate-400 max-w-[220px] truncate" title={row.note || ''}>{row.note || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      {activeTab === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(row)}
                            disabled={actionLoading === row.rowIndex}
                            className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === row.rowIndex ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(row)}
                            disabled={actionLoading === row.rowIndex}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                          Approved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setRejectTarget(null)}
          />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-base font-semibold text-slate-100 mb-2">Reject Booking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to reject this booking for{' '}
              <span className="text-slate-200 font-medium">{rejectTarget.name}</span>{' '}
              on{' '}
              <span className="text-slate-200 font-medium">{formatDisplayDate(rejectTarget.date)}</span>?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoading !== null}
                className="px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading !== null ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
