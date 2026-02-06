import { format } from 'date-fns'
import { toast } from 'sonner'

/**
 * Interface que representa um resumo de comportamento
 */
export interface BehaviorSummary {
  name: string
  totalCount: number
  totalDuration: number
  events: number
  behaviorType: string
}

/**
 * Interface que representa um log de sessão
 */
export interface SessionLog {
  id: number
  sessionId: number
  behaviorId: number
  count: number
  duration: number
  timestamp: Date
}

/**
 * Interface que representa os dados do resumo da sessão
 */
export interface SessionSummaryData {
  summary: BehaviorSummary[]
  logs: SessionLog[]
}

/**
 * Calcula o total de comportamentos registrados a partir dos resumos
 * @param behaviorSummaries - Array de resumos de comportamentos
 * @returns O total de comportamentos contabilizados
 */
export const calculateTotalBehaviorCount = (
  behaviorSummaries: BehaviorSummary[]
): number => {
  return behaviorSummaries.reduce(
    (total, behavior) => total + behavior.totalCount,
    0
  )
}

/**
 * Exibe um toast de confirmação para finalizar a sessão
 * @param onConfirm - Função a ser executada quando o usuário confirmar
 */
export const showSessionEndConfirmationToast = (
  onConfirm: () => void
): void => {
  toast('Tem certeza que deseja finalizar a sessão?', {
    action: {
      label: 'Sim, finalizar',
      onClick: onConfirm,
    },
    cancel: {
      label: 'Cancelar',
      onClick: () => {},
    },
    duration: 10000,
  })
}

/**
 * Exibe um toast de confirmação para finalizar sessão ao sair
 * @param onConfirm - Função a ser executada quando o usuário confirmar
 */
export const showSessionExitWithoutTimersToast = (
  onConfirm: () => void
): void => {
  toast('Deseja finalizar a sessão?', {
    description: 'A sessão será encerrada e o relatório será gerado.',
    action: {
      label: 'Sim, finalizar',
      onClick: onConfirm,
    },
    cancel: {
      label: 'Cancelar',
      onClick: () => {},
    },
    duration: 10000,
  })
}

/**
 * Exibe um toast de sucesso ao finalizar sessão
 */
export const showSessionEndSuccessToast = (): void => {
  toast.success('Sessão finalizada com sucesso')
}

/**
 * Exibe um toast de erro ao finalizar sessão
 */
export const showSessionEndErrorToast = (): void => {
  toast.error('Erro ao finalizar sessão')
}

/**
 * Exibe um toast de erro inesperado ao finalizar sessão
 */
export const showSessionEndUnexpectedErrorToast = (): void => {
  toast.error('Erro inesperado ao finalizar sessão')
}

/**
 * Exibe um toast de erro ao finalizar sessão com mensagem personalizada
 * @param errorMessage - Mensagem de erro a ser exibida
 */
export const showSessionEndFailureToast = (errorMessage?: string): void => {
  toast.error('Falha ao finalizar sessão', {
    description: errorMessage || 'Erro desconhecido',
  })
}

/**
 * Exibe um toast de erro inesperado ao tentar ir para o resumo
 */
export const showSessionNavigationErrorToast = (): void => {
  toast.error('Erro inesperado ao finalizar sessão', {
    description: 'Não foi possível navegar para o resumo',
  })
}

/**
 * Previne a navegação do usuário adicionando um estado ao histórico
 * Deve ser chamado quando a página carregar para interceptar o botão voltar
 */
export const preventBrowserBackNavigation = (): void => {
  window.history.pushState(null, '', window.location.href)
}

/**
 * Verifica se há timers ativos
 * @param activeTimersCount - Número de timers ativos
 * @returns true se há timers ativos, false caso contrário
 */
export const hasActiveTimers = (activeTimersCount: number): boolean => {
  return activeTimersCount > 0
}

/**
 * Exibe um toast de sucesso ao criar sessão manual
 */
export const showManualSessionSuccessToast = (): void => {
  toast.success('Sessão adicionada com sucesso', {
    description: 'O registro manual foi salvo no histórico do paciente',
  })
}

/**
 * Exibe um toast de erro ao criar sessão manual
 * @param errorMessage - Mensagem de erro a ser exibida
 */
export const showManualSessionErrorToast = (errorMessage?: string): void => {
  toast.error('Erro ao adicionar sessão', {
    description: errorMessage || 'Não foi possível salvar o registro manual',
    position: 'top-left' as const,
  })
}

export const sessionStartTimeText = (startedAt: Date): string => {
  return format(startedAt, 'HH:mm')
}

export const sessionEndTimeText = (endedAt: Date): string => {
  return format(endedAt, 'HH:mm')
}
