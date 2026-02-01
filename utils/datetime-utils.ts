/**
 * Constantes para validação e formatação de tempo
 */
export const TIME_LIMITS = {
  HOURS_MAX: 23,
  MINUTES_MAX: 59,
  SECONDS_MAX: 59,
} as const

export const TIME_FORMAT = {
  /** Comprimento da string HH:MM:SS */
  LENGTH: 8,
  /** Placeholder exibido no input */
  PLACEHOLDER: '00:00:00',
  /** Comprimento máximo permitido no input (incluindo separadores) */
  INPUT_MAX_LENGTH: 8,
} as const

export const PAD_LENGTH = 2

/**
 * Converte um Date para string no formato HH:MM:SS
 */
export const dateToTimeString = (date: Date): string => {
  const h = date.getHours().toString().padStart(PAD_LENGTH, '0')
  const m = date.getMinutes().toString().padStart(PAD_LENGTH, '0')
  const s = date.getSeconds().toString().padStart(PAD_LENGTH, '0')
  return `${h}:${m}:${s}`
}

/**
 * Aplica um timeString (HH:MM:SS) em uma data base, retornando nova instância.
 * Se timeString estiver vazio, usa 00:00:00.
 */
export const setTimeOnDate = (baseDate: Date, timeString: string): Date => {
  if (!timeString.trim()) {
    const result = new Date(baseDate)
    result.setHours(0, 0, 0, 0)
    return result
  }
  const [h = 0, m = 0, s = 0] = timeString.split(':').map(Number)
  const result = new Date(baseDate)
  result.setHours(h, m, s, 0)
  return result
}

/**
 * Formata a entrada do usuário para o padrão HH:MM:SS progressivamente
 */
export const formatTimeInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 0) return ''

  if (numbers.length <= 2) {
    const h = Math.min(parseInt(numbers, 10) || 0, TIME_LIMITS.HOURS_MAX)
    return h.toString().padStart(numbers.length, '0')
  }

  if (numbers.length <= 4) {
    const h = Math.min(
      parseInt(numbers.slice(0, 2), 10) || 0,
      TIME_LIMITS.HOURS_MAX
    )
    const m = Math.min(
      parseInt(numbers.slice(2), 10) || 0,
      TIME_LIMITS.MINUTES_MAX
    )
    return `${h.toString().padStart(PAD_LENGTH, '0')}:${m.toString().padStart(numbers.length - 2, '0')}`
  }

  const h = Math.min(
    parseInt(numbers.slice(0, 2), 10) || 0,
    TIME_LIMITS.HOURS_MAX
  )
  const m = Math.min(
    parseInt(numbers.slice(2, 4), 10) || 0,
    TIME_LIMITS.MINUTES_MAX
  )
  const s = Math.min(
    parseInt(numbers.slice(4, 6), 10) || 0,
    TIME_LIMITS.SECONDS_MAX
  )
  const sStr =
    numbers.length === 5 ? s.toString() : s.toString().padStart(PAD_LENGTH, '0')

  return `${h.toString().padStart(PAD_LENGTH, '0')}:${m.toString().padStart(PAD_LENGTH, '0')}:${sStr}`
}

export interface ParsedTime {
  hours: number
  minutes: number
  seconds: number
}

/**
 * Parse de string HH:MM:SS para objeto { hours, minutes, seconds }
 * Retorna null se inválido
 */
export const parseTimeString = (value: string): ParsedTime | null => {
  const match = value.match(/^(\d{1,2}):?(\d{1,2})?:?(\d{1,2})?$/)
  if (!match) return null

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  const isValid =
    hours <= TIME_LIMITS.HOURS_MAX &&
    minutes <= TIME_LIMITS.MINUTES_MAX &&
    seconds <= TIME_LIMITS.SECONDS_MAX

  if (!isValid) return null

  return { hours, minutes, seconds }
}

/**
 * Verifica se o valor formatado representa um tempo completo e válido
 */
export const isValidCompleteTime = (formatted: string): boolean =>
  formatted.length === TIME_FORMAT.LENGTH && formatted.includes(':')

/**
 * Cria um Date com a hora a partir de um ParsedTime
 */
export const createDateWithTime = (
  baseDate: Date,
  parsed: ParsedTime
): Date => {
  const result = new Date(baseDate)
  result.setHours(parsed.hours, parsed.minutes, parsed.seconds, 0)
  return result
}
