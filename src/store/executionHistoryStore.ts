import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface NodeExecutionData {
  nodeId: string
  input?: unknown
  output?: unknown
  timestamp: string
}

export interface WorkflowExecution {
  id: string
  workflowName: string
  timestamp: string
  nodes: Record<string, NodeExecutionData>
}

interface ExecutionHistoryState {
  currentExecution: WorkflowExecution | null
  startExecution: (workflowName: string) => string
  saveNodeData: (nodeId: string, input?: unknown, output?: unknown) => void
  finishExecution: () => void
  getLatestNodeData: (nodeId: string) => { input?: unknown; output?: unknown } | null
  clearExecution: () => void
}

export const useExecutionHistoryStore = create<ExecutionHistoryState>()(
  persist(
    (set, get) => ({
      currentExecution: null,

      startExecution: (workflowName: string) => {
        const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const execution: WorkflowExecution = {
          id: executionId,
          workflowName,
          timestamp: new Date().toISOString(),
          nodes: {},
        }
        set({ currentExecution: execution })
        return executionId
      },

      saveNodeData: (nodeId: string, input?: unknown, output?: unknown) => {
        const state = get()
        if (state.currentExecution) {
          const updatedExecution = {
            ...state.currentExecution,
            nodes: {
              ...state.currentExecution.nodes,
              [nodeId]: {
                nodeId,
                input,
                output,
                timestamp: new Date().toISOString(),
              },
            },
          }
          set({ currentExecution: updatedExecution })
        }
      },

      finishExecution: () => {
        // Keep the execution in currentExecution (only 1 execution stored)
        // Don't clear it so data persists
      },

      getLatestNodeData: (nodeId: string) => {
        const state = get()
        // Check current execution (which persists after finish)
        if (state.currentExecution && state.currentExecution.nodes[nodeId]) {
          const nodeData = state.currentExecution.nodes[nodeId]
          return { input: nodeData.input, output: nodeData.output }
        }
        return null
      },

      clearExecution: () => set({ currentExecution: null }),
    }),
    {
      name: 'workflow-execution-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
