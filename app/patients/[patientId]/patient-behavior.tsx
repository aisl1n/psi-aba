'use client'

import { Behavior } from '@/app/types'
import { ROUTES } from '@/constants/routes'
import { useRouter } from 'next/navigation'

const MAX_SESSIONS_OR_BEHAVIORS_DISPLAY = 5

interface PatientBehaviorProps {
  behaviors: Behavior[]
  patientId: string
}

export default function PatientBehavior({ behaviors, patientId }: PatientBehaviorProps) {
  const router = useRouter()
  const behaviorsLength = behaviors.length
  const visibleBehaviors = behaviors
    .filter((behavior) => behavior.isActive === true)
    .slice(0, MAX_SESSIONS_OR_BEHAVIORS_DISPLAY)

  function handleBehaviorClick(behaviorId: number) {
    router.push(
      `${ROUTES.PATIENT_BEHAVIORS.replace(':patientId', patientId).replace(':behaviorId', behaviorId.toString())}`
    )
  }

  function renderBehaviors() {
    return (
      visibleBehaviors.map((behavior) => (
        <div
          key={behavior.id}
          className="flex items-center justify-between gap-6 rounded-md border p-2"
          onClick={() => {
            handleBehaviorClick(behavior.id)
          }}
        >
          <span
            className="line-clamp-1 block max-w-fit truncate text-sm font-medium"
            title={behavior.name}
          >
            {behavior.name}
          </span>
          <div className="text-muted-foreground flex gap-2 text-xs">
            {behavior.behaviorType === 'adaptive' && (
              <span>Adaptativo</span>
            )}
            {behavior.behaviorType === 'maladaptive' && (
              <span>Desadaptativo</span>
            )}
          </div>
        </div>
      ))
    )
  }


  function renderBehaviorsMore() {
    return (
      behaviorsLength > MAX_SESSIONS_OR_BEHAVIORS_DISPLAY && (
        <p className="text-muted-foreground text-xs">
          +{behaviorsLength - MAX_SESSIONS_OR_BEHAVIORS_DISPLAY} mais
        </p>
      )
    )
  }
  return (
    <div className="space-y-2">
      {renderBehaviors()}
      {renderBehaviorsMore()}
    </div>
  )
}