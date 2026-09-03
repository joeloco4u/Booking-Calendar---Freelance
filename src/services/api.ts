const GAS_URL =
  import.meta.env.VITE_GAS_URL ??
  'https://script.google.com/macros/s/AKfycbyzh-viNlaMsSPhHhcZ7CVrMuSV5KrYJgV5B9M1V53AfzlHY_hs4aNDRPfUplmYjZanZg/exec'

export interface MonthDataRow {
  rowIndex: number
  name: string
  email?: string
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
  contact?: string
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
  mes: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'approve', row, mes }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function rejectBooking(
  row: number,
  mes: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'reject', row, mes }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function cancelBooking(
  row: number,
  mes: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'cancel', row, mes }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function lockDay(
  mes: string,
  date: string,
  force?: boolean,
  schedule?: string
): Promise<{
  success: boolean
  message: string
  conflicts?: boolean
  rows?: number[]
  error?: string
}> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'lock', mes, date, force: !!force, schedule }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}

export async function unlockDay(
  mes: string,
  date: string,
  schedule?: string
): Promise<{ success: boolean; message: string; rows?: number[]; error?: string }> {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'unlock', mes, date, schedule }),
  })
  if (!res.ok) throw new Error(`POST failed: ${res.status}`)
  return res.json()
}