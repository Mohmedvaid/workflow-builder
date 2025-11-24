import { create } from 'zustand'

interface ExecutionState {
  isRunning: boolean
  currentNodeId: string | null
  nodeInputs: Map<string, unknown>
  nodeOutputs: Map<string, unknown>
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
  nodeInputs: new Map(),
  nodeOutputs: new Map(),
  startExecution: () => set({ isRunning: true, currentNodeId: null, nodeInputs: new Map(), nodeOutputs: new Map() }),
  stopExecution: () => set({ isRunning: false, currentNodeId: null }),
  setCurrentNode: (nodeId) => set({ currentNodeId: nodeId }),
  setNodeInput: (nodeId, input) =>
    set((state) => {
      const newInputs = new Map(state.nodeInputs)
      newInputs.set(nodeId, input)
      return { nodeInputs: newInputs }
    }),
  setNodeOutput: (nodeId, output) =>
    set((state) => {
      const newOutputs = new Map(state.nodeOutputs)
      newOutputs.set(nodeId, output)
      return { nodeOutputs: newOutputs }
    }),
  clearExecution: () =>
    set({
      isRunning: false,
      currentNodeId: null,
      nodeInputs: new Map(),
      nodeOutputs: new Map(),
    }),
}))
