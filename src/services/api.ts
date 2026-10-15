const GAS_URL =
  import.meta.env.VITE_GAS_URL ??
  'https://script.google.com/macros/s/AKfycbyAZGW0DqNo7IVl96ffKvQgBZ3M3Xs4-MYfNf0Q_SI_fyVEtEMGKA16L57iPXhV-xhJNg/exec'

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000
) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Por favor, intenta de nuevo.')
    }
    throw error
  }
}

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
  const response = await fetchWithTimeout(`${GAS_URL}?mes=${encodeURIComponent(mes)}`)
  const json = await response.json()
  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch month data')
  }
  if (!Array.isArray(json.data)) {
    throw new Error('Unexpected data format from server')
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
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'book', ...payload }),
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Backend operation failed')
  }
  return json
}

export async function verifyAdminPassword(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetchWithTimeout(GAS_URL, {
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
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'approve', row, mes, adminToken }),
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Backend operation failed')
  }
  return json
}

export async function rejectBooking(
  row: number,
  mes: string,
  adminToken: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'reject', row, mes, adminToken }),
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Backend operation failed')
  }
  return json
}

export async function cancelBooking(
  row: number,
  mes: string,
  adminToken: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'cancel', row, mes, adminToken }),
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Backend operation failed')
  }
  return json
}

export async function rescheduleBooking(
  oldMes: string,
  oldRow: number,
  newMes: string,
  newRow: number,
  adminToken: string,
  applyPenalty?: boolean
): Promise<{ success: boolean; error?: string }> {
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'reschedule', oldMes, oldRow, newMes, newRow, applyPenalty, adminToken }),
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Backend operation failed')
  }
  return json
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
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'lock', mes, date, force: !!force, schedule, reason, adminToken }),
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Backend operation failed')
  }
  return json
}

export async function unlockDay(
  mes: string,
  date: string,
  adminToken: string,
  schedule?: string
): Promise<{ success: boolean; message: string; rows?: number[]; error?: string }> {
  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'unlock', mes, date, schedule, adminToken }),
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Backend operation failed')
  }
  return json
}