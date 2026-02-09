/**
 * Constantes para validação e formatação de tempo.
 * Na UI o usuário vê e digita apenas HH:MM; internamente/API usa HH:MM:00.
 */
export const TIME_LIMITS = {
  HOURS_MAX: 23,
  MINUTES_MAX: 59,
  SECONDS_MAX: 59,
} as const

/** Regex para tempo completo no input: HH:MM (2 dígitos, dois pontos) */
const TIME_INPUT_COMPLETE_REGEX = /^\d{2}:\d{2}$/

export const TIME_FORMAT = {
  /** Comprimento da string exibida no input (HH:MM) */
  LENGTH: 5,
  /** Comprimento da string para API (HH:MM:SS) */
  API_LENGTH: 8,
  /** Placeholder exibido no input */
  PLACEHOLDER: '00:00',
  /** Comprimento máximo permitido no input */
  INPUT_MAX_LENGTH: 5,
} as const

export const PAD_LENGTH = 2

/**
 * Converte um Date para string no formato HH:MM:SS (uso interno/API).
 */
export const dateToTimeString = (date: Date): string => {
  const h = date.getHours().toString().padStart(PAD_LENGTH, '0')
  const m = date.getMinutes().toString().padStart(PAD_LENGTH, '0')
  const s = date.getSeconds().toString().padStart(PAD_LENGTH, '0')
  return `${h}:${m}:${s}`
}

/**
 * Converte um Date para string exibida no input: HH:MM (sem segundos).
 */
export const dateToTimeStringForInput = (date: Date): string =>
  dateToTimeString(date).slice(0, TIME_FORMAT.LENGTH)

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
 * Formata a entrada do usuário para HH:MM progressivamente (apenas hora e minuto).
 * Extrai dígitos com regex; segundos são sempre 00 ao criar o Date.
 */
export const formatTimeInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 0) return ''

  if (numbers.length <= 2) {
    const h = Math.min(parseInt(numbers, 10) || 0, TIME_LIMITS.HOURS_MAX)
    return h.toString().padStart(numbers.length, '0')
  }

  const h = Math.min(
    parseInt(numbers.slice(0, 2), 10) || 0,
    TIME_LIMITS.HOURS_MAX
  )
  const m = Math.min(
    parseInt(numbers.slice(2, 4), 10) || 0,
    TIME_LIMITS.MINUTES_MAX
  )
  return `${h.toString().padStart(PAD_LENGTH, '0')}:${m.toString().padStart(numbers.length - 2, '0')}`
}

export interface ParsedTime {
  hours: number
  minutes: number
  seconds: number
}

/**
 * Parse de string HH:MM ou HH:MM:SS para objeto { hours, minutes, seconds }.
 * Para HH:MM, segundos são 0. Retorna null se inválido.
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
 * Verifica se o valor formatado representa um tempo completo e válido (HH:MM).
 */
export const isValidCompleteTime = (formatted: string): boolean =>
  TIME_INPUT_COMPLETE_REGEX.test(formatted)

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
