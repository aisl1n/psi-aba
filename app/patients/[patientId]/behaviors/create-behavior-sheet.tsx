'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBehavior } from '@/app/src/actions/behavior-actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface CreateBehaviorSheetProps {
  patientId: number
}

export function CreateBehaviorSheet({ patientId }: CreateBehaviorSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [tracksFrequency, setTracksFrequency] = useState(true)
  const [tracksDuration, setTracksDuration] = useState(true)
  const [behaviorType, setBehaviorType] = useState<'adaptive' | 'maladaptive'>(
    'maladaptive'
  )
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!tracksFrequency && !tracksDuration) {
      alert('Please select at least one tracking type (Frequency or Duration)')
      return
    }

    setIsCreating(true)
    const result = await createBehavior(
      patientId,
      name.trim(),
      tracksFrequency,
      tracksDuration,
      behaviorType
    )

    if (result.success) {
      setOpen(false)
      setName('')
      setTracksFrequency(true)
      setTracksDuration(true)
      setBehaviorType('maladaptive')
      router.refresh()
    } else {
      alert(`Falha ao criar comportamento: ${result.error}`)
    }

    setIsCreating(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="w-fit">
          <Plus className="size-4" />
          Comportamento
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Adicionar novo comportamento</SheetTitle>
            <SheetDescription className="text-muted-foreground text-start text-xs">
              Adicione um comportamento para rastrear durante as sessões de
              terapia.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Nome do comportamento
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
                placeholder="e.g., Balanço de mão, Contato visual"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tipo de comportamento
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="behaviorType"
                    checked={behaviorType === 'adaptive'}
                    onChange={() => setBehaviorType('adaptive')}
                    className="size-4"
                  />
                  <span className="text-sm">Adaptativo</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="behaviorType"
                    checked={behaviorType === 'maladaptive'}
                    onChange={() => setBehaviorType('maladaptive')}
                    className="size-4"
                  />
                  <span className="text-sm">Desadaptativo</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tipos de rastreamento
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tracksFrequency}
                    onChange={(e) => setTracksFrequency(e.target.checked)}
                    className="size-4 rounded border-gray-300"
                  />
                  <span className="text-sm">
                    Rastrear frequência (Contagem)
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tracksDuration}
                    onChange={(e) => setTracksDuration(e.target.checked)}
                    className="size-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Rastrear duração (Cronômetro)</span>
                </label>
              </div>
            </div>
          </div>
          <SheetFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating ||
                !name.trim() ||
                (!tracksFrequency && !tracksDuration)
              }
            >
              {isCreating ? 'Criando...' : 'Criar comportamento'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
