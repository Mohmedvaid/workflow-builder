import { create } from 'zustand'
import { Node, Edge } from 'reactflow'
import type { Workflow, WorkflowNode, WorkflowEdge } from '@/types'

interface WorkflowState {
  nodes: Node[]
  edges: Edge[]
  workflowName: string
  timeout: { hours: number; minutes: number }
  
  // Actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node) => boolean // Returns true if added, false if limit reached
  updateNode: (id: string, data: Partial<Node['data']>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: Edge) => void
  deleteEdge: (id: string) => void
  setWorkflowName: (name: string) => void
  setTimeout: (timeout: { hours: number; minutes: number }) => void
  
  // JSON operations
  exportWorkflow: () => Workflow
  importWorkflow: (workflow: Workflow) => void
  clearWorkflow: () => void
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

const MAX_NODES = 50

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  workflowName: 'Untitled Workflow',
  timeout: { hours: 0, minutes: 0 },
  
  setNodes: (nodes) => {
    if (nodes.length > MAX_NODES) {
      alert(`Maximum ${MAX_NODES} nodes allowed. Some nodes were not added.`)
      set({ nodes: nodes.slice(0, MAX_NODES) })
    } else {
      set({ nodes })
    }
  },
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => {
    const state = get()
    if (state.nodes.length >= MAX_NODES) {
      alert(`Maximum ${MAX_NODES} nodes allowed per workflow.`)
      return false
    }
    // Check if trying to add a trigger node when one already exists
    if (node.type === 'trigger') {
      const existingTrigger = state.nodes.find((n) => n.type === 'trigger')
      if (existingTrigger) {
        alert('Only one trigger node is allowed per workflow.')
        return false
      }
    }
    set((state) => ({ nodes: [...state.nodes, node] }))
    return true
  },
  
  updateNode: (id, data) => {
    const state = get()
    // Check if trying to change a node to trigger type when one already exists
    if (data.type === 'trigger') {
      const existingTrigger = state.nodes.find((n) => n.type === 'trigger' && n.id !== id)
      if (existingTrigger) {
        alert('Only one trigger node is allowed per workflow.')
        return
      }
    }
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }))
  },
  
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    })),
  
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  
  deleteEdge: (id) =>
    set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id) })),
  
  setWorkflowName: (name) => set({ workflowName: name }),
  setTimeout: (timeout) => set({ timeout }),
  
  exportWorkflow: () => {
    const state = get()
    return {
      name: state.workflowName,
      nodes: state.nodes.map((node) => ({
        id: node.id,
        type: (node.type || 'action') as WorkflowNode['type'],
        position: node.position,
        data: node.data,
      })),
      edges: state.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
      })),
      timeout: state.timeout.hours > 0 || state.timeout.minutes > 0 ? state.timeout : undefined,
      updatedAt: new Date().toISOString(),
    }
  },
  
  importWorkflow: (workflow) => {
    // Validate that only one trigger node exists
    const triggerNodes = workflow.nodes.filter((node) => node.type === 'trigger')
    if (triggerNodes.length > 1) {
      alert('Workflow contains multiple trigger nodes. Only the first trigger will be kept.')
      // Remove extra trigger nodes, keep only the first one
      const firstTriggerId = triggerNodes[0].id
      const filteredNodes = workflow.nodes.filter(
        (node) => node.type !== 'trigger' || node.id === firstTriggerId
      )
      workflow = { ...workflow, nodes: filteredNodes }
    }
    
    set({
      workflowName: workflow.name,
      nodes: workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: { ...node.data, type: node.type },
      })),
      edges: workflow.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      timeout: workflow.timeout || { hours: 0, minutes: 0 },
    })
  },
  
  clearWorkflow: () =>
    set({
      nodes: initialNodes,
      edges: initialEdges,
      workflowName: 'Untitled Workflow',
      timeout: { hours: 0, minutes: 0 },
    }),
}))
