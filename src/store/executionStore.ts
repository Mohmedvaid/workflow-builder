import { create } from 'zustand'

interface ExecutionState {
  isRunning: boolean
  currentNodeId: string | null
  nodeInputs: Record<string, unknown>
  nodeOutputs: Record<string, unknown>
  nodeErrors: Record<string, string>
  startExecution: () => void
  stopExecution: () => void
  setCurrentNode: (nodeId: string | null) => void
  setNodeInput: (nodeId: string, input: unknown) => void
  setNodeOutput: (nodeId: string, output: unknown) => void
  setNodeError: (nodeId: string, error: string | null) => void
  clearExecution: () => void
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isRunning: false,
  currentNodeId: null,
  nodeInputs: {},
  nodeOutputs: {},
  nodeErrors: {},
  startExecution: () => set({ isRunning: true, currentNodeId: null, nodeInputs: {}, nodeOutputs: {}, nodeErrors: {} }),
  stopExecution: () => set({ isRunning: false, currentNodeId: null }),
  setCurrentNode: (nodeId) => set({ currentNodeId: nodeId }),
  setNodeInput: (nodeId, input) =>
    set((state) => ({
      nodeInputs: { ...state.nodeInputs, [nodeId]: input },
    })),
  setNodeOutput: (nodeId, output) =>
    set((state) => ({
      nodeOutputs: { ...state.nodeOutputs, [nodeId]: output },
    })),
  setNodeError: (nodeId, error) =>
    set((state) => {
      if (error === null) {
        const { [nodeId]: _, ...rest } = state.nodeErrors
        return { nodeErrors: rest }
      }
      return {
        nodeErrors: { ...state.nodeErrors, [nodeId]: error },
      }
    }),
  clearExecution: () =>
    set({
      isRunning: false,
      currentNodeId: null,
      nodeInputs: {},
      nodeOutputs: {},
      nodeErrors: {},
    }),
}))
