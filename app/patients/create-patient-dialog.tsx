'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPatient } from '@/app/src/actions/patient-actions'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

export function CreatePatientDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const isValidName = name.trim().length >= 3 && name.trim().length <= 30

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidName) return
    setIsCreating(true)
    await createPatient(name.trim())
    setOpen(false)
    setName('')
    router.refresh()
    setIsCreating(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Adicionar
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Adicionar novo paciente</SheetTitle>
            <SheetDescription>
              Adicione um novo paciente para começar a rastrear sessões de
              terapia.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <label htmlFor="name" className="text-sm font-medium">
              Nome do paciente
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2"
              placeholder="Digite o nome do paciente"
              required
              autoFocus
            />
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
            <Button type="submit" disabled={isCreating || !isValidName}>
              {isCreating ? 'Criando...' : 'Adicionar paciente'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
