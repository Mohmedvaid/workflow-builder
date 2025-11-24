import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import Layout from './components/Layout'
import { useWorkflowStore } from './store/workflowStore'
import { useWorkflowsStore } from './store/workflowsStore'
import { generateNodeId } from './utils/workflowUtils'
import type { NodeType } from '@/types'
import type { Node } from 'reactflow'

function App() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  const { addNode, nodes, exportWorkflow, importWorkflow, clearWorkflow, workflowName } =
    useWorkflowStore()
  const { createWorkflow, updateWorkflow, getWorkflow } = useWorkflowsStore()

  // Auto-save workflow every 2 seconds when workflow is open
  useEffect(() => {
    if (!currentWorkflowId) return

    const interval = setInterval(() => {
      const workflow = exportWorkflow()
      updateWorkflow(currentWorkflowId, workflow)
    }, 2000)

    return () => clearInterval(interval)
  }, [currentWorkflowId, nodes, workflowName, exportWorkflow, updateWorkflow])

  // Also save when workflow name changes
  useEffect(() => {
    if (!currentWorkflowId) return
    const workflow = exportWorkflow()
    updateWorkflow(currentWorkflowId, workflow)
  }, [workflowName, currentWorkflowId, updateWorkflow, exportWorkflow])

  const handleCreateNew = () => {
    clearWorkflow()
    // Create workflow immediately with default name
    const workflow = exportWorkflow()
    const id = createWorkflow('Untitled Workflow', workflow)
    if (id) {
      setCurrentWorkflowId(id)
    }
  }

  const handleOpenWorkflow = (id: string) => {
    const storedWorkflow = getWorkflow(id)
    if (storedWorkflow) {
      importWorkflow(storedWorkflow.workflow)
      setCurrentWorkflowId(id)
    }
  }

  const handleNodeTypeSelect = (type: NodeType) => {
    // Calculate position for new node (center of canvas with some offset based on existing nodes)
    const nodeCount = nodes.length
    const x = 250 + (nodeCount % 5) * 50
    const y = 100 + Math.floor(nodeCount / 5) * 100

    // Generate label based on node type
    const getLabel = (nodeType: NodeType): string => {
      const labels: Record<NodeType, string> = {
        trigger: 'Trigger',
        action: 'Action',
        condition: 'Condition',
        transform: 'Transform',
        'api-call': 'API Call',
        'run-js': 'Run JavaScript',
        'write-file': 'Write File',
        'read-file': 'Read File',
        'ai-model': 'AI Model',
      }
      return labels[nodeType] || 'Node'
    }

    const newNode: Node = {
      id: generateNodeId(type),
      type: type,
      position: { x, y },
      data: {
        type: type,
        label: getLabel(type),
      },
    }

    const added = addNode(newNode)
    if (!added) {
      // Node limit reached, don't proceed
      return
    }
  }

  const handleBackToHome = () => {
    if (currentWorkflowId) {
      // Save before leaving
      const workflow = exportWorkflow()
      updateWorkflow(currentWorkflowId, workflow)
    }
    setCurrentWorkflowId(null)
    clearWorkflow()
  }

  if (currentWorkflowId === null) {
    return <HomePage onCreateNew={handleCreateNew} onOpenWorkflow={handleOpenWorkflow} />
  }

  return (
    <Layout
      onNodeTypeSelect={handleNodeTypeSelect}
      onBackToHome={handleBackToHome}
      currentWorkflowId={currentWorkflowId}
    />
  )
}

export default App
