'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBehavior } from '@/app/src/actions/behavior-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

interface CreateBehaviorDialogProps {
  patientId: number
}

export function CreateBehaviorDialog({ patientId }: CreateBehaviorDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [tracksFrequency, setTracksFrequency] = useState(true)
  const [tracksDuration, setTracksDuration] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!tracksFrequency && !tracksDuration) {
      alert('Please select at least one tracking type (Frequency or Duration)')
      return
    }

    setIsCreating(true)
    const result = await createBehavior(
      patientId,
      name.trim(),
      tracksFrequency,
      tracksDuration
    )

    if (result.success) {
      setOpen(false)
      setName('')
      setTracksFrequency(true)
      setTracksDuration(true)
      router.refresh()
    } else {
      alert(`Failed to create behavior: ${result.error}`)
    }

    setIsCreating(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Behavior
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Behavior</DialogTitle>
            <DialogDescription>
              Add a behavior to track during therapy sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Behavior Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
                placeholder="e.g., Hand flapping, Eye contact"
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tracking Types</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tracksFrequency}
                    onChange={(e) => setTracksFrequency(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Track Frequency (Count)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={tracksDuration}
                    onChange={(e) => setTracksDuration(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Track Duration (Timer)</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating ||
                !name.trim() ||
                (!tracksFrequency && !tracksDuration)
              }
            >
              {isCreating ? 'Creating...' : 'Create Behavior'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
