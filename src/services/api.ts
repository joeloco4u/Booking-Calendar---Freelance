const GAS_URL =
  import.meta.env.VITE_GAS_URL ??
  'https://script.google.com/macros/s/AKfycby7UIi-i6zkSOS0MZaU_ME3cGKOBl3IVXKSB9GZJsm3M4JEBIIE_I7GO98Xt8oIMLQatw/exec'

export interface MonthDataRow {
  rowIndex: number
  name: string
  email?: string
  date: string
  schedule: string
  fee: number
  note: string
  status: 'Available' | 'Pending' | 'Approved' | 'Rejected'
}

export async function fetchMonthData(mes: string): Promise<MonthDataRow[]> {
  try {
    const response = await fetch(`${GAS_URL}?mes=${encodeURIComponent(mes)}`)
    const json = await response.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (error) {
    console.error('Fetch error:', error)
    return []
  }
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