'use client'

import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Clock2Icon } from 'lucide-react'

function dateToTimeString(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function setTimeOnDate(base: Date, timeString: string): Date {
  const [h = 0, m = 0, s = 0] = timeString.split(':').map(Number)
  const out = new Date(base)
  out.setHours(h, m, s, 0)
  return out
}

function formatTimeInput(value: string): string {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length === 0) return ''
  if (numbers.length <= 2) {
    const h = Math.min(parseInt(numbers, 10) || 0, 23)
    return h.toString().padStart(numbers.length, '0')
  }
  if (numbers.length <= 4) {
    const h = Math.min(parseInt(numbers.slice(0, 2), 10) || 0, 23)
    const m = Math.min(parseInt(numbers.slice(2), 10) || 0, 59)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(numbers.length - 2, '0')}`
  }
  const h = Math.min(parseInt(numbers.slice(0, 2), 10) || 0, 23)
  const m = Math.min(parseInt(numbers.slice(2, 4), 10) || 0, 59)
  const s = Math.min(parseInt(numbers.slice(4, 6), 10) || 0, 59)
  const sStr =
    numbers.length === 5 ? s.toString() : s.toString().padStart(2, '0')
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sStr}`
}

function parseTimeString(
  value: string
): { hours: number; minutes: number; seconds: number } | null {
  const match = value.match(/^(\d{1,2}):?(\d{1,2})?:?(\d{1,2})?$/)
  if (!match) return null

  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)

  if (hours > 23 || minutes > 59 || seconds > 59) return null

  return { hours, minutes, seconds }
}

const DEFAULT_START = ''
const DEFAULT_END = ''

export interface DateTimePickerProps {
  startedAt?: Date
  endedAt?: Date
  onStartedAtChange: (date: Date) => void
  onEndedAtChange: (date: Date) => void
}

export function DateTimePicker({
  startedAt,
  endedAt,
  onStartedAtChange,
  onEndedAtChange,
}: DateTimePickerProps) {
  const baseDate = React.useMemo(() => {
    if (startedAt)
      return new Date(
        startedAt.getFullYear(),
        startedAt.getMonth(),
        startedAt.getDate()
      )
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }, [startedAt])

  const calendarDate = baseDate

  const startTimeValue = startedAt ? dateToTimeString(startedAt) : DEFAULT_START
  const endTimeValue = endedAt ? dateToTimeString(endedAt) : DEFAULT_END

  const [startTimeInput, setStartTimeInput] = React.useState(startTimeValue)
  const [endTimeInput, setEndTimeInput] = React.useState(endTimeValue)

  React.useEffect(() => {
    setStartTimeInput(startTimeValue)
  }, [startTimeValue])

  React.useEffect(() => {
    setEndTimeInput(endTimeValue)
  }, [endTimeValue])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    const startStr = startedAt ? dateToTimeString(startedAt) : DEFAULT_START
    const endStr = endedAt ? dateToTimeString(endedAt) : DEFAULT_END
    onStartedAtChange(setTimeOnDate(date, startStr))
    onEndedAtChange(setTimeOnDate(date, endStr))
  }

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatTimeInput(input)

    setStartTimeInput(formatted)

    if (formatted.length === 8 && formatted.includes(':')) {
      const parsed = parseTimeString(formatted)
      if (parsed) {
        const next = new Date(calendarDate)
        next.setHours(parsed.hours, parsed.minutes, parsed.seconds, 0)
        onStartedAtChange(next)
      }
    } else {
      onStartedAtChange(undefined!)
    }
  }

  const handleStartTimeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = formatTimeInput(input)

    setEndTimeInput(formatted)

    if (formatted.length === 8 && formatted.includes(':')) {
      const parsed = parseTimeString(formatted)
      if (parsed) {
        const next = new Date(calendarDate)
        next.setHours(parsed.hours, parsed.minutes, parsed.seconds, 0)
        onEndedAtChange(next)
      }
    } else {
      onEndedAtChange(undefined!)
    }
  }

  const handleEndTimeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  return (
    <Card className="w-full min-w-0">
      <CardContent>
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={handleDateSelect}
          className="mt-2 p-0 [--cell-size:2.5rem]"
        />
      </CardContent>
      <CardFooter className="bg-card flex flex-col gap-4 border-t p-4">
        <FieldGroup className="w-full">
          <Field>
            <FieldLabel htmlFor="time-from">
              Hora de início{' '}
              <span className="text-muted-foreground flex items-center text-xs font-normal">
                (24h)
              </span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="time-from"
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={startTimeInput}
                onChange={handleStartTimeChange}
                onFocus={handleStartTimeFocus}
                placeholder="00:00:00"
                className="min-w-32 font-mono"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground mr-2" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="time-to">
              Hora de término{' '}
              <span className="text-muted-foreground flex items-center text-xs font-normal">
                (24h)
              </span>
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="time-to"
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={endTimeInput}
                onChange={handleEndTimeChange}
                onFocus={handleEndTimeFocus}
                placeholder="00:00:00"
                className="min-w-32 font-mono"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground mr-2" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  )
}
