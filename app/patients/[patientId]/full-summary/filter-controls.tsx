'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { formatDate } from '@/utils'

interface FilterControlsProps {
  patientId: number
}

export function FilterControls({ patientId }: FilterControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPreset = searchParams.get('preset') || 'all'
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!)
      : undefined,
    to: searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined,
  })

  const handlePresetChange = (preset: string) => {
    router.push(`/patients/${patientId}/full-summary?preset=${preset}`)
  }

  const handleCustomDateApply = () => {
    if (dateRange.from && dateRange.to) {
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]
      router.push(
        `/patients/${patientId}/full-summary?startDate=${startDate}&endDate=${endDate}`
      )
    }
  }

  const isCustomDateRange = searchParams.get('startDate') && searchParams.get('endDate')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={currentPreset === '7d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePresetChange('7d')}
      >
        Últimos 7 dias
      </Button>
      <Button
        variant={currentPreset === '30d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePresetChange('30d')}
      >
        Últimos 30 dias
      </Button>
      <Button
        variant={currentPreset === '90d' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePresetChange('90d')}
      >
        Últimos 90 dias
      </Button>
      <Button
        variant={currentPreset === 'all' && !isCustomDateRange ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePresetChange('all')}
      >
        Todas
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={isCustomDateRange ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <CalendarIcon className="size-4" />
            {isCustomDateRange && dateRange.from && dateRange.to
              ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
              : 'Período personalizado'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Data inicial</label>
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) =>
                    setDateRange((prev) => ({ ...prev, from: date }))
                  }
                  className="rounded-md border"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Data final</label>
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) =>
                    setDateRange((prev) => ({ ...prev, to: date }))
                  }
                  disabled={(date) =>
                    dateRange.from ? date < dateRange.from : false
                  }
                  className="rounded-md border"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCustomDateApply}
                disabled={!dateRange.from || !dateRange.to}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
