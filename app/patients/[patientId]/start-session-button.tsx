'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startSessionAction } from '@/app/src/actions/session-actions'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

interface StartSessionButtonProps {
  patientId: number
}

export function StartSessionButton({ patientId }: StartSessionButtonProps) {
  const router = useRouter()
  const [isStarting, setIsStarting] = useState(false)

  const handleStartSession = async () => {
    setIsStarting(true)
    const result = await startSessionAction(patientId)

    if (result.success && result.sessionId) {
      router.push(`/session/${result.sessionId}`)
    } else {
      alert(`Falha ao iniciar sessão: ${result.error || 'Erro desconhecido'}`)
      setIsStarting(false)
    }
  }

  return (
    <Button onClick={handleStartSession} disabled={isStarting} size="sm">
      <Play className="size-4" />
      {isStarting ? 'Iniciando...' : 'Iniciar sessão'}
    </Button>
  )
}
