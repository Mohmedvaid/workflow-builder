import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Workflow } from '@/types'

export interface StoredWorkflow {
  id: string
  name: string
  workflow: Workflow
  updatedAt: string
  createdAt: string
}

const MAX_WORKFLOWS = 5

interface WorkflowsState {
  workflows: StoredWorkflow[]
  createWorkflow: (name: string, workflow: Workflow) => string | null // Returns null if limit reached
  updateWorkflow: (id: string, workflow: Workflow) => void
  deleteWorkflow: (id: string) => void
  getWorkflow: (id: string) => StoredWorkflow | undefined
  clearAll: () => void
}

export const useWorkflowsStore = create<WorkflowsState>()(
  persist(
    (set, get) => ({
      workflows: [],

      createWorkflow: (name: string, workflow: Workflow) => {
        const state = get()
        if (state.workflows.length >= MAX_WORKFLOWS) {
          alert(`Maximum ${MAX_WORKFLOWS} workflows allowed. Please delete a workflow first.`)
          return null
        }
        const id = `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const now = new Date().toISOString()
        const newWorkflow: StoredWorkflow = {
          id,
          name,
          workflow,
          createdAt: now,
          updatedAt: now,
        }
        set({
          workflows: [...state.workflows, newWorkflow],
        })
        return id
      },

      updateWorkflow: (id: string, workflow: Workflow) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id
              ? { ...w, workflow, name: workflow.name, updatedAt: new Date().toISOString() }
              : w
          ),
        }))
      },

      deleteWorkflow: (id: string) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
        }))
      },

      getWorkflow: (id: string) => {
        return get().workflows.find((w) => w.id === id)
      },

      clearAll: () => set({ workflows: [] }),
    }),
    {
      name: 'workflow-builder-workflows',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
