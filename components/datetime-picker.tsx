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
import { useCalendarDate, useTimeInput } from '@/hooks'
import {
  dateToTimeString,
  setTimeOnDate,
  TIME_FORMAT,
} from '@/utils/datetime-utils'
import { Clock2Icon } from 'lucide-react'

const DEFAULT_TIME_STRING = ''
const CALENDAR_CELL_SIZE = '2.5rem'
const TIME_INPUT_MIN_WIDTH = 'min-w-32'
const TIME_SUFFIX_CLASS =
  'text-muted-foreground flex items-center text-xs font-normal'

export interface DateTimePickerProps {
  startedAt?: Date
  endedAt?: Date
  onStartedAtChange: (date: Date | undefined) => void
  onEndedAtChange: (date: Date | undefined) => void
}

interface TimeInputFieldProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => void
}

function selectInputOnFocus(e: React.FocusEvent<HTMLInputElement>): void {
  e.target.select()
}

function TimeInputField({
  id,
  label,
  value,
  onChange,
  onFocus,
}: TimeInputFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label} <span className={TIME_SUFFIX_CLASS}>(24h)</span>
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={TIME_FORMAT.INPUT_MAX_LENGTH}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={TIME_FORMAT.PLACEHOLDER}
          className={`${TIME_INPUT_MIN_WIDTH} font-mono`}
        />
        <InputGroupAddon>
          <Clock2Icon className="text-muted-foreground mr-2" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

export function DateTimePicker({
  startedAt,
  endedAt,
  onStartedAtChange,
  onEndedAtChange,
}: DateTimePickerProps) {
  const calendarDate = useCalendarDate(startedAt)

  const startTime = useTimeInput(startedAt, calendarDate, onStartedAtChange)
  const endTime = useTimeInput(endedAt, calendarDate, onEndedAtChange)

  const handleDateSelect = React.useCallback(
    (date: Date | undefined) => {
      if (!date) return

      const startStr = startedAt
        ? dateToTimeString(startedAt)
        : DEFAULT_TIME_STRING
      const endStr = endedAt ? dateToTimeString(endedAt) : DEFAULT_TIME_STRING

      onStartedAtChange(setTimeOnDate(date, startStr))
      onEndedAtChange(setTimeOnDate(date, endStr))
    },
    [startedAt, endedAt, onStartedAtChange, onEndedAtChange]
  )

  return (
    <Card className="w-full min-w-0">
      <CardContent>
        <Calendar
          mode="single"
          selected={calendarDate}
          onSelect={handleDateSelect}
          className={`mt-2 p-0 [--cell-size:${CALENDAR_CELL_SIZE}]`}
        />
      </CardContent>
      <CardFooter className="bg-card flex flex-col gap-4 border-t p-4">
        <FieldGroup className="w-full">
          <TimeInputField
            id="time-from"
            label="Hora de início"
            value={startTime.inputValue}
            onChange={startTime.handleChange}
            onFocus={selectInputOnFocus}
          />
          <TimeInputField
            id="time-to"
            label="Hora de término"
            value={endTime.inputValue}
            onChange={endTime.handleChange}
            onFocus={selectInputOnFocus}
          />
        </FieldGroup>
      </CardFooter>
    </Card>
  )
}
