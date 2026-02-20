const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type QueueEntry = {
  resolve: (value: Response | PromiseLike<Response>) => void
  reject: (reason: unknown) => void
  path: string
  init?: RequestInit
}

let isRefreshing = false
let pendingQueue: QueueEntry[] = []

function flushQueue(error: unknown): void {
  const queue = pendingQueue
  pendingQueue = []
  queue.forEach(({ resolve, reject, path, init }) => {
    if (error) {
      reject(error)
    } else {
      resolve(fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' }))
    }
  })
}

async function refreshTokens(): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Token refresh failed')
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
  })

  if (response.status !== 401) return response

  // Queue concurrent 401s while a refresh is in flight
  if (isRefreshing) {
    return new Promise<Response>((resolve, reject) => {
      pendingQueue.push({ resolve, reject, path, init })
    })
  }

  isRefreshing = true
  try {
    await refreshTokens()
    flushQueue(null)
    return fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' })
  } catch (err) {
    flushQueue(err)
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw err
  } finally {
    isRefreshing = false
  }
}
