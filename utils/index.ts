/**
 * Formata uma data para o formato brasileiro (dd/mm/aaaa)
 * @param date - Data a ser formatada (string ou objeto Date)
 * @returns String com a data formatada
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date as string).toLocaleDateString('pt-BR')
}

/**
 * Gera um texto indicando quando um item foi adicionado
 * @param date - Data de criação do item
 * @returns Texto formatado como "Adicionado em dd/mm/aaaa"
 */
export const createdAtText = (date: Date): string => {
  return `Adicionado em ${formatDate(date)}`
}

/**
 * Formata segundos no formato MM:SS
 * @param seconds - Tempo em segundos
 * @returns String formatada no padrão MM:SS (ex: "5:03", "12:45")
 */
export const formatTimeMMSS = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formata segundos em uma duração legível para humanos
 * @param seconds - Duração em segundos
 * @returns String formatada (ex: "2h 30m 15s" ou "5m 30s")
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`
  }
  if (mins > 0) {
    if (secs === 0) {
      return `${mins}m`
    }
    return `${mins}m ${secs}s`
  }

  return `${secs}s`
}

/**
 * Calcula a duração entre duas datas em segundos
 * @param startDate - Data de início
 * @param endDate - Data de fim (padrão: agora)
 * @returns Duração em segundos
 */
export const calculateDurationInSeconds = (
  startDate: Date,
  endDate: Date = new Date()
): number => {
  return Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
}

/**
 * Formata um Date para hora no padrão HH:mm:ss (pt-BR)
 */
export const formatTime = (date: string | Date): string => {
  return new Date(date as string).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
