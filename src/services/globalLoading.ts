let activeLoads = 0

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function beginGlobalLoading(): () => void {
  activeLoads += 1
  notify()

  let finished = false

  return () => {
    if (finished) return
    finished = true

    activeLoads = Math.max(0, activeLoads - 1)
    notify()
  }
}

export async function withGlobalLoading<T>(
  operation: () => Promise<T>,
): Promise<T> {
  const finish = beginGlobalLoading()

  try {
    return await operation()
  } finally {
    finish()
  }
}

export function subscribeGlobalLoading(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getGlobalLoadingSnapshot() {
  return activeLoads > 0
}
