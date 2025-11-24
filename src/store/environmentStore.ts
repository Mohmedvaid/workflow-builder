import { create } from 'zustand'

interface EnvironmentVariables {
  [key: string]: string
}

interface EnvironmentState {
  // Store env vars per workflow ID
  workflows: Record<string, EnvironmentVariables>
  
  // Actions
  setVariable: (workflowId: string, key: string, value: string) => void
  getVariable: (workflowId: string, key: string) => string | undefined
  getAllVariables: (workflowId: string) => EnvironmentVariables
  deleteVariable: (workflowId: string, key: string) => void
  clearWorkflow: (workflowId: string) => void
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  workflows: {},

  setVariable: (workflowId, key, value) => {
    set((state) => ({
      workflows: {
        ...state.workflows,
        [workflowId]: {
          ...(state.workflows[workflowId] || {}),
          [key]: value,
        },
      },
    }))
  },

  getVariable: (workflowId, key) => {
    const state = get()
    return state.workflows[workflowId]?.[key]
  },

  getAllVariables: (workflowId) => {
    const state = get()
    return state.workflows[workflowId] || {}
  },

  deleteVariable: (workflowId, key) => {
    set((state) => {
      const workflowVars = { ...(state.workflows[workflowId] || {}) }
      delete workflowVars[key]
      return {
        workflows: {
          ...state.workflows,
          [workflowId]: workflowVars,
        },
      }
    })
  },

  clearWorkflow: (workflowId) => {
    set((state) => {
      const newWorkflows = { ...state.workflows }
      delete newWorkflows[workflowId]
      return { workflows: newWorkflows }
    })
  },
}))

