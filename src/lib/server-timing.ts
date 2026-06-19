const shouldLogPerformance =
  process.env.PERF_LOGS === '1' || process.env.PERF_LOGS === 'true'

export async function timeServerTask<T>(
  label: string,
  task: () => Promise<T>,
): Promise<T> {
  if (!shouldLogPerformance) {
    return task()
  }

  const startedAt = performance.now()

  try {
    return await task()
  } finally {
    const duration = Math.round(performance.now() - startedAt)
    console.info(`[perf] ${label}: ${duration}ms`)
  }
}
