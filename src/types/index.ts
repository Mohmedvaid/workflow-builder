// Core type definitions for the workflow builder

export type NodeType = 'trigger' | 'action' | 'condition' | 'transform'

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: {
    label: string
    [key: string]: unknown
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface Workflow {
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt?: string
  updatedAt?: string
}
