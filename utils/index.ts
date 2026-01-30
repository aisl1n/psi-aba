export const formatDate = (date: string | Date) => {
  return new Date(date as string).toLocaleDateString('pt-BR')
}

export const createdAtText = (date: Date) => {
  return `Adicionado em ${formatDate(date)}`
}

/**
 * Formats seconds into MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "5:03", "12:45")
 */
export const formatTimeMMSS = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formats seconds into a human-readable duration
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "2h 30m 15s" or "5m 30s")
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`
  }
  return `${mins}m ${secs}s`
}

/**
 * Calculates duration between two dates in seconds
 * @param startDate - Start date
 * @param endDate - End date (defaults to now)
 * @returns Duration in seconds
 */
export const calculateDurationInSeconds = (
  startDate: Date,
  endDate: Date = new Date()
): number => {
  return Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
}
