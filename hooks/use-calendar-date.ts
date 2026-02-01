'use client'

import * as React from 'react'

/**
 * Retorna a data a ser exibida no calendário.
 * Usa a data de startedAt se existir, caso contrário retorna hoje.
 */
export function useCalendarDate(startedAt?: Date): Date {
  return React.useMemo(() => {
    if (startedAt) {
      return new Date(
        startedAt.getFullYear(),
        startedAt.getMonth(),
        startedAt.getDate()
      )
    }
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }, [startedAt])
}
