const GAS_URL =
  import.meta.env.VITE_GAS_URL ??
  'https://script.google.com/macros/s/AKfycbynu9kMOM2DXqTmdvDq6tOKhAuvCIpVRAC_VUy0sWXoDxZSNTp8Yn8-Tn2oXHwvMpk7bQ/exec'

export interface MonthDataRow {
  rowIndex: number
  name: string
  email?: string
  phone?: string
  date: string
  schedule: string
  fee: number
  note: string
  status: 'Available' | 'Pending' | 'Approved' | 'Rejected' | 'Maintenance'
}

export async function fetchMonthData(mes: string): Promise<MonthDataRow[]> {
  const response = await fetch(`${GAS_URL}?mes=${encodeURIComponent(mes)}`)
  if (!response.ok) throw new Error(`GET failed: ${response.status}`)
  const json = await response.json()
  if (!Array.isArray(json.data)) {
    throw new Error('Unexpected response from server')
  }
  return json.data
}

export async function submitBooking(payload: {
  name: string
  fee: number
  row: number
  mes: string
  note: string
  phone?: string
  email?: string
  date?: string
  schedule?: string
}): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'book', ...payload }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function verifyAdminPassword(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'login', password }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function approveBooking(
  row: number,
  mes: string,
  adminToken: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'approve', row, mes, adminToken }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function rejectBooking(
  row: number,
  mes: string,
  adminToken: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'reject', row, mes, adminToken }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function cancelBooking(
  row: number,
  mes: string,
  adminToken: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'cancel', row, mes, adminToken }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function rescheduleBooking(
  oldMes: string,
  oldRow: number,
  newMes: string,
  newRow: number,
  adminToken: string,
  applyPenalty?: boolean
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'reschedule', oldMes, oldRow, newMes, newRow, applyPenalty, adminToken }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function lockDay(
  mes: string,
  date: string,
  adminToken: string,
  force?: boolean,
  schedule?: string,
  reason?: string
): Promise<{
  success: boolean
  message: string
  conflicts?: boolean
  rows?: number[]
  error?: string
}> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'lock', mes, date, force: !!force, schedule, reason, adminToken }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function unlockDay(
  mes: string,
  date: string,
  adminToken: string,
  schedule?: string
): Promise<{ success: boolean; message: string; rows?: number[]; error?: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'unlock', mes, date, schedule, adminToken }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}