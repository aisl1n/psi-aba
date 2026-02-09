'use client'

import * as React from 'react'
import {
  dateToTimeStringForInput,
  formatTimeInput,
  isValidCompleteTime,
  parseTimeString,
  createDateWithTime,
} from '@/utils/datetime-utils'

const DEFAULT_TIME_STRING = ''

export function useTimeInput(
  dateValue: Date | undefined,
  baseDate: Date,
  onChange: (date: Date) => void
) {
  const displayValue = dateValue
    ? dateToTimeStringForInput(dateValue)
    : DEFAULT_TIME_STRING
  const [inputValue, setInputValue] = React.useState(displayValue)

  React.useEffect(() => {
    setInputValue(displayValue)
  }, [displayValue])

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTimeInput(e.target.value)
      setInputValue(formatted)

      if (isValidCompleteTime(formatted)) {
        const parsed = parseTimeString(formatted)
        if (parsed) {
          onChange(createDateWithTime(baseDate, parsed))
        }
      }
    },
    [baseDate, onChange]
  )

  return { inputValue, handleChange }
}
