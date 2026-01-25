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
      alert(`Failed to start session: ${result.error || 'Unknown error'}`)
      setIsStarting(false)
    }
  }

  return (
    <Button onClick={handleStartSession} disabled={isStarting} size="lg">
      <Play className="mr-2 h-4 w-4" />
      {isStarting ? 'Starting...' : 'Start Session'}
    </Button>
  )
}
