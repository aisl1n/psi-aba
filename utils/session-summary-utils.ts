export const COMPANION_LABELS = {
  father: 'Pai',
  mother: 'Mãe',
} as const

export const BEHAVIOR_TYPE_LABELS = {
  adaptive: 'Adaptativo',
  maladaptive: 'Desadaptativo',
} as const

export const BEHAVIOR_TYPE_ADAPTIVE = 'adaptive'
export const BEHAVIOR_TYPE_MALADAPTIVE = 'maladaptive'

/**
 * Retorna o texto de exibição do acompanhante
 */
export const getCompanionDisplayText = (
  companion: string | null | undefined,
  other?: string | null
): string => {
  if (companion === 'father') return COMPANION_LABELS.father
  if (companion === 'mother') return COMPANION_LABELS.mother
  return other || 'Outro'
}

export interface BehaviorStatWithCount {
  totalCount: number
}

/**
 * Calcula o total de ocorrências a partir de stats de comportamento
 */
export const calculateTotalBehaviorCount = <T extends BehaviorStatWithCount>(
  behaviorStats: T[]
): number => {
  return behaviorStats.reduce((acc, stat) => acc + stat.totalCount, 0)
}
