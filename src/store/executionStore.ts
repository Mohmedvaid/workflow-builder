import { create } from 'zustand'

interface ExecutionState {
  isRunning: boolean
  currentNodeId: string | null
  nodeInputs: Record<string, unknown>
  nodeOutputs: Record<string, unknown>
  startExecution: () => void
  stopExecution: () => void
  setCurrentNode: (nodeId: string | null) => void
  setNodeInput: (nodeId: string, input: unknown) => void
  setNodeOutput: (nodeId: string, output: unknown) => void
  clearExecution: () => void
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isRunning: false,
  currentNodeId: null,
  nodeInputs: {},
  nodeOutputs: {},
  startExecution: () => set({ isRunning: true, currentNodeId: null, nodeInputs: {}, nodeOutputs: {} }),
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
  clearExecution: () =>
    set({
      isRunning: false,
      currentNodeId: null,
      nodeInputs: {},
      nodeOutputs: {},
    }),
}))
