import { create } from 'zustand'

interface TimerState {
  startTime: number
  isRunning: boolean
}

interface TimerStore {
  activeTimers: Map<number, TimerState>
  startTimer: (behaviorId: number) => void
  stopTimer: (behaviorId: number) => number | null
  getElapsedTime: (behaviorId: number) => number
  isTimerRunning: (behaviorId: number) => boolean
  clearTimer: (behaviorId: number) => void
  clearAllTimers: () => void
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  activeTimers: new Map(),

  startTimer: (behaviorId: number) => {
    const state = get()
    const timer = state.activeTimers.get(behaviorId)

    if (timer?.isRunning) {
      get().stopTimer(behaviorId)
    } else {
      const newTimers = new Map(state.activeTimers)
      newTimers.set(behaviorId, {
        startTime: Date.now(),
        isRunning: true,
      })
      set({ activeTimers: newTimers })
    }
  },

  stopTimer: (behaviorId: number) => {
    const state = get()
    const timer = state.activeTimers.get(behaviorId)

    if (!timer || !timer.isRunning) {
      return null
    }

    const duration = Math.floor((Date.now() - timer.startTime) / 1000)

    const newTimers = new Map(state.activeTimers)
    newTimers.delete(behaviorId)

    set({ activeTimers: newTimers })

    return duration
  },

  getElapsedTime: (behaviorId: number) => {
    const state = get()
    const timer = state.activeTimers.get(behaviorId)

    if (!timer || !timer.isRunning) {
      return 0
    }

    return Math.floor((Date.now() - timer.startTime) / 1000)
  },

  isTimerRunning: (behaviorId: number) => {
    const state = get()
    const timer = state.activeTimers.get(behaviorId)
    return timer?.isRunning ?? false
  },

  clearTimer: (behaviorId: number) => {
    const state = get()
    const newTimers = new Map(state.activeTimers)
    newTimers.delete(behaviorId)
    set({ activeTimers: newTimers })
  },

  clearAllTimers: () => {
    set({ activeTimers: new Map() })
  },
}))
