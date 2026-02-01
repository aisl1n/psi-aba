'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createManualSessionAction } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Behavior, BehaviorLogInput } from '@/app/types'
import {
  showManualSessionSuccessToast,
  showManualSessionErrorToast,
} from '@/utils/session-utils'
import { DateTimePicker } from '@/components/datetime-picker'

interface AddManualSessionSheetProps {
  patientId: number
  behaviors: Behavior[]
}

interface BehaviorLogState extends BehaviorLogInput {
  id: string
}

export function AddManualSessionSheet({
  patientId,
  behaviors,
}: AddManualSessionSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [startedAt, setStartedAt] = useState<Date | undefined>(undefined)
  const [endedAt, setEndedAt] = useState<Date | undefined>(undefined)
  const [sleepHours, setSleepHours] = useState<number>(8)
  const [hasEaten, setHasEaten] = useState(true)
  const [hasTakenMedication, setHasTakenMedication] = useState(false)
  const [companion, setCompanion] = useState<'father' | 'mother' | 'other'>(
    'mother'
  )
  const [companionOther, setCompanionOther] = useState('')
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLogState[]>([])

  const hasBehaviors = behaviors.length > 0

  const resetForm = () => {
    setStep(1)
    setStartedAt(undefined)
    setEndedAt(undefined)
    setSleepHours(8)
    setHasEaten(true)
    setHasTakenMedication(false)
    setCompanion('mother')
    setCompanionOther('')
    setBehaviorLogs([])
  }

  const handleAddBehaviorLog = (behaviorId: number) => {
    const behavior = behaviors.find((b) => b.id === behaviorId)
    if (!behavior) return

    const newLog: BehaviorLogState = {
      id: `${Date.now()}-${Math.random()}`,
      behaviorId,
      count: behavior.tracksFrequency ? 1 : 0,
      duration: behavior.tracksDuration ? 60 : 0,
    }

    setBehaviorLogs([...behaviorLogs, newLog])
  }

  const handleRemoveBehaviorLog = (logId: string) => {
    setBehaviorLogs(behaviorLogs.filter((log) => log.id !== logId))
  }

  const handleUpdateBehaviorLog = (
    logId: string,
    field: 'count' | 'duration',
    value: number
  ) => {
    setBehaviorLogs(
      behaviorLogs.map((log) =>
        log.id === logId ? { ...log, [field]: value } : log
      )
    )
  }

  const validateStep1 = (): boolean => {
    if (!startedAt || !endedAt) {
      showManualSessionErrorToast(
        'Preencha a hora de início e término da sessão corretamente.'
      )
      return false
    }

    if (endedAt <= startedAt) {
      showManualSessionErrorToast(
        'A hora de término deve ser posterior à hora de início.'
      )
      return false
    }

    return true
  }

  const validateStep2 = (): boolean => {
    if (companion === 'other' && !companionOther.trim()) {
      showManualSessionErrorToast('Especifique quem está acompanhando')
      return false
    }

    return true
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return

    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep1()) return

    setIsSubmitting(true)

    try {
      const sessionData = {
        startedAt: startedAt!,
        endedAt: endedAt!,
        sleepHours,
        hasEaten,
        hasTakenMedication,
        companion,
        companionOther: companion === 'other' ? companionOther : undefined,
      }

      const logsToSubmit: BehaviorLogInput[] = behaviorLogs.map((log) => ({
        behaviorId: log.behaviorId,
        count: log.count,
        duration: log.duration,
        timestamp: log.timestamp,
      }))

      const result = await createManualSessionAction(
        patientId,
        sessionData,
        logsToSubmit
      )

      if (result.success && result.sessionId) {
        showManualSessionSuccessToast()
        setOpen(false)
        resetForm()
        router.push(`/session/${result.sessionId}/summary`)
      } else {
        showManualSessionErrorToast(result.error)
      }
    } catch (error) {
      console.error('Erro ao criar sessão manual:', error)
      showManualSessionErrorToast('Erro inesperado ao salvar sessão')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getBehaviorLogsForBehavior = (behaviorId: number) => {
    return behaviorLogs.filter((log) => log.behaviorId === behaviorId)
  }

  const getTotalForBehavior = (
    behaviorId: number,
    field: 'count' | 'duration'
  ) => {
    return getBehaviorLogsForBehavior(behaviorId).reduce(
      (sum, log) => sum + log[field],
      0
    )
  }

  const renderStep1 = () => (
    <div className="space-y-4 py-4">
      <div>
        <p className="text-sm font-medium">
          Data e horário da sessão <span className="text-red-500">*</span>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Selecione a data no calendário e informe o horário de início e
          término.
        </p>
        <div className="mt-2">
          <DateTimePicker
            startedAt={startedAt}
            endedAt={endedAt}
            onStartedAtChange={setStartedAt}
            onEndedAtChange={setEndedAt}
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4 py-4">
      <div>
        <label htmlFor="sleepHours" className="text-sm font-medium">
          Horas de sono <span className="text-red-500">*</span>
        </label>
        <Input
          id="sleepHours"
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={sleepHours}
          onChange={(e) => setSleepHours(parseFloat(e.target.value))}
          className="mt-2"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Alimentação <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasEaten"
              checked={hasEaten === true}
              onChange={() => setHasEaten(true)}
              className="h-4 w-4"
            />
            <span className="text-sm">Sim, se alimentou</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasEaten"
              checked={hasEaten === false}
              onChange={() => setHasEaten(false)}
              className="h-4 w-4"
            />
            <span className="text-sm">Não se alimentou</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Medicação <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasTakenMedication"
              checked={hasTakenMedication === true}
              onChange={() => setHasTakenMedication(true)}
              className="h-4 w-4"
            />
            <span className="text-sm">Sim, tomou medicação</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="hasTakenMedication"
              checked={hasTakenMedication === false}
              onChange={() => setHasTakenMedication(false)}
              className="h-4 w-4"
            />
            <span className="text-sm">Não tomou medicação</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Acompanhante <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="companion"
              checked={companion === 'father'}
              onChange={() => setCompanion('father')}
              className="h-4 w-4"
            />
            <span className="text-sm">Pai</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="companion"
              checked={companion === 'mother'}
              onChange={() => setCompanion('mother')}
              className="h-4 w-4"
            />
            <span className="text-sm">Mãe</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="companion"
              checked={companion === 'other'}
              onChange={() => setCompanion('other')}
              className="h-4 w-4"
            />
            <span className="text-sm">Outro</span>
          </label>
        </div>
        {companion === 'other' && (
          <Input
            type="text"
            value={companionOther}
            onChange={(e) => setCompanionOther(e.target.value)}
            placeholder="Especifique quem está acompanhando"
            className="mt-2"
            required
          />
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4 py-4">
      <p className="text-muted-foreground text-sm">
        Adicione os registros de comportamentos observados durante a sessão.
      </p>

      {behaviors.map((behavior) => {
        const logs = getBehaviorLogsForBehavior(behavior.id)
        const totalCount = getTotalForBehavior(behavior.id, 'count')
        const totalDuration = getTotalForBehavior(behavior.id, 'duration')

        return (
          <div key={behavior.id} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-medium">{behavior.name}</h4>
                <p className="text-muted-foreground text-xs">
                  {behavior.behaviorType === 'adaptive'
                    ? 'Adaptativo'
                    : 'Desadaptativo'}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAddBehaviorLog(behavior.id)}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            </div>

            {logs.length > 0 && (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-muted/50 flex items-center gap-2 rounded-md border p-2"
                  >
                    {behavior.tracksFrequency && (
                      <div className="flex-1">
                        <label className="text-xs">Contagem</label>
                        <Input
                          type="number"
                          min="0"
                          value={log.count}
                          onChange={(e) =>
                            handleUpdateBehaviorLog(
                              log.id,
                              'count',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    )}
                    {behavior.tracksDuration && (
                      <div className="flex-1">
                        <label className="text-xs">Duração (seg)</label>
                        <Input
                          type="number"
                          min="0"
                          value={log.duration}
                          onChange={(e) =>
                            handleUpdateBehaviorLog(
                              log.id,
                              'duration',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveBehaviorLog(log.id)}
                      className="mt-5"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <div className="bg-primary/10 mt-2 rounded-md p-2">
                  <p className="text-sm font-medium">Totais:</p>
                  <div className="text-muted-foreground flex gap-4 text-sm">
                    {behavior.tracksFrequency && (
                      <span>Contagem: {totalCount}</span>
                    )}
                    {behavior.tracksDuration && (
                      <span>Duração: {totalDuration}s</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {behaviorLogs.length === 0 && (
        <p className="text-muted-foreground text-center text-sm">
          Nenhum registro adicionado ainda. Clique em &quot;Adicionar&quot;
          para&nbsp; começar.
        </p>
      )}
    </div>
  )

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Dados da Sessão'
      case 2:
        return 'Checklist Pré-Sessão'
      case 3:
        return 'Registros de Comportamentos'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Informe quando a sessão começou e terminou'
      case 2:
        return 'Preencha as informações básicas da sessão'
      case 3:
        return 'Adicione os comportamentos observados durante a sessão'
      default:
        return ''
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" disabled={!hasBehaviors}>
          <FileText className="size-4" />
          Adicionar registro manual
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col sm:max-w-lg"
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex h-full flex-col"
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {getStepTitle()} ({step}/3)
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-start text-xs">
              {getStepDescription()}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 [&::-webkit-scrollbar]:hidden">
            {renderStepContent()}
          </div>

          <SheetFooter className="flex shrink-0 justify-between gap-2 border-t pt-4">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Voltar
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  resetForm()
                }}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>

            {step < 3 ? (
              <Button type="button" onClick={handleNext}>
                Próximo
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar sessão'}
              </Button>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
