import { create } from 'zustand'
import { Node, Edge } from 'reactflow'
import type { Workflow, WorkflowNode, WorkflowEdge } from '@/types'

interface WorkflowState {
  nodes: Node[]
  edges: Edge[]
  workflowName: string
  
  // Actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  addNode: (node: Node) => void
  updateNode: (id: string, data: Partial<Node['data']>) => void
  deleteNode: (id: string) => void
  addEdge: (edge: Edge) => void
  deleteEdge: (id: string) => void
  setWorkflowName: (name: string) => void
  
  // JSON operations
  exportWorkflow: () => Workflow
  importWorkflow: (workflow: Workflow) => void
  clearWorkflow: () => void
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  workflowName: 'Untitled Workflow',
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  
  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),
  
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    })),
  
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  
  deleteEdge: (id) =>
    set((state) => ({ edges: state.edges.filter((edge) => edge.id !== id) })),
  
  setWorkflowName: (name) => set({ workflowName: name }),
  
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
      updatedAt: new Date().toISOString(),
    }
  },
  
  importWorkflow: (workflow) => {
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
    })
  },
  
  clearWorkflow: () =>
    set({
      nodes: initialNodes,
      edges: initialEdges,
      workflowName: 'Untitled Workflow',
    }),
}))
