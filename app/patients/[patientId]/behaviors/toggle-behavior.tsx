'use client'

import { updateBehavior } from '@/app/src/actions/behavior-actions'
import { Button } from '@/components/ui/button'
import { ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'

export function ToggleBehavior({
  behaviorId,
  isActive,
}: {
  behaviorId: number
  isActive: boolean
}) {
  const icon = isActive ? (
    <ToggleRightIcon className="size-12" />
  ) : (
    <ToggleLeftIcon className="size-12" />
  )

  const buttonClassName = isActive
    ? 'text-primary hover:text-primary'
    : 'text-black hover:text-black'

  return (
    <Button
      size="default"
      variant="ghost"
      className={`absolute top-0 right-0 mx-2 p-0 hover:bg-transparent [&_svg]:size-6 ${buttonClassName}`}
      onClick={() => updateBehavior(behaviorId, { isActive: !isActive })}
    >
      {icon}
    </Button>
  )
}
