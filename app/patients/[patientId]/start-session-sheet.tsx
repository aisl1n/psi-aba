'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startSessionAction } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Play } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ROUTES } from '@/constants/routes'

interface StartSessionSheetProps {
  patientId: number
  hasBehaviors: boolean
}

export function StartSessionSheet({
  patientId,
  hasBehaviors,
}: StartSessionSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [sleepHours, setSleepHours] = useState<number>(8)
  const [hasEaten, setHasEaten] = useState(true)
  const [hasTakenMedication, setHasTakenMedication] = useState(false)
  const [companion, setCompanion] = useState<'father' | 'mother' | 'other'>(
    'mother'
  )
  const [companionOther, setCompanionOther] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (companion === 'other' && !companionOther.trim()) {
      alert('Por favor, especifique quem está acompanhando')
      return
    }

    setIsStarting(true)

    const preSessionData = {
      sleepHours,
      hasEaten,
      hasTakenMedication,
      companion,
      companionOther: companion === 'other' ? companionOther : undefined,
    }

    const result = await startSessionAction(patientId, preSessionData)

    if (result.success && result.sessionId) {
      setOpen(false)
      router.push(
        ROUTES.SESSION.replace(':sessionId', result.sessionId.toString())
      )
    } else {
      alert(`Falha ao iniciar sessão: ${result.error || 'Erro desconhecido'}`)
      setIsStarting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" disabled={!hasBehaviors}>
          <Play className="size-4" />
          Iniciar sessão
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Checklist Pré-Sessão</SheetTitle>
            <SheetDescription className="text-muted-foreground text-start text-xs">
              Preencha as informações básicas antes de iniciar a sessão. Estes
              fatores podem influenciar o comportamento durante a terapia.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            {/* Sleep Hours */}
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

            {/* Has Eaten */}
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

            {/* Has Taken Medication */}
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

            {/* Companion */}
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
          <SheetFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isStarting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isStarting}>
              {isStarting ? 'Iniciando...' : 'Iniciar sessão'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
