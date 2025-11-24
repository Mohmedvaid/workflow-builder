import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface RunHistory {
  id: string
  workflowId: string
  workflowName: string
  timestamp: string
  status: 'success' | 'error' | 'running'
  executionTime?: number
  errors?: Array<{ nodeId: string; error: string }>
  nodeOutputs?: Record<string, unknown>
}

interface RunHistoryState {
  runs: RunHistory[]
  addRun: (run: RunHistory) => void
  getRunsByWorkflow: (workflowName: string) => RunHistory[]
  clearHistory: () => void
}

export const useRunHistoryStore = create<RunHistoryState>()(
  persist(
    (set, get) => ({
      runs: [],
      addRun: (run) => set((state) => ({ runs: [run, ...state.runs].slice(0, 100) })),
      getRunsByWorkflow: (workflowName) =>
        get().runs.filter((run) => run.workflowName === workflowName),
      clearHistory: () => set({ runs: [] }),
    }),
    {
      name: 'workflow-run-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
