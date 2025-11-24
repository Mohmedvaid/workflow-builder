import { useState, useEffect, useRef, useCallback } from 'react'
import HomePage from './components/HomePage'
import Layout from './components/Layout'
import UnsavedChangesDialog from './components/UnsavedChangesDialog'
import { useWorkflowStore } from './store/workflowStore'
import { useWorkflowsStore } from './store/workflowsStore'
import { useEnvironmentStore } from './store/environmentStore'
import { generateNodeId } from './utils/workflowUtils'
import type { NodeType } from '@/types'
import type { Node } from 'reactflow'

function App() {
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null)
  const lastSavedStateRef = useRef<string>('')
  const { addNode, nodes, exportWorkflow, importWorkflow, clearWorkflow, workflowName, edges } =
    useWorkflowStore()
  const { createWorkflow, updateWorkflow, getWorkflow } = useWorkflowsStore()
  const { clearWorkflow: clearEnvVars } = useEnvironmentStore()

  // Helper function to normalize workflow for comparison
  const normalizeWorkflowForComparison = useCallback((workflow: ReturnType<typeof exportWorkflow>) => {
    return JSON.stringify({
      name: workflow.name,
      nodes: [...(workflow.nodes || [])].sort((a, b) => a.id.localeCompare(b.id)),
      edges: [...(workflow.edges || [])].sort((a, b) => a.id.localeCompare(b.id)),
      timeout: workflow.timeout,
    })
  }, [])

  // Initialize saved state when workflow is loaded or changes
  useEffect(() => {
    if (!currentWorkflowId) {
      lastSavedStateRef.current = ''
      return
    }

    // Small delay to ensure workflow is fully loaded and nodes are set
    const timeoutId = setTimeout(() => {
      // Get the saved workflow from storage to set as baseline
      const storedWorkflow = getWorkflow(currentWorkflowId)
      if (storedWorkflow) {
        // Use the stored workflow as the baseline - normalize for consistent comparison
        lastSavedStateRef.current = normalizeWorkflowForComparison(storedWorkflow.workflow)
      } else {
        // New workflow, set current state as saved
        const workflow = exportWorkflow()
        lastSavedStateRef.current = normalizeWorkflowForComparison(workflow)
      }
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [currentWorkflowId, getWorkflow, exportWorkflow, normalizeWorkflowForComparison])

  // Auto-save workflow every 2 seconds when workflow is open
  useEffect(() => {
    if (!currentWorkflowId) return

    const interval = setInterval(() => {
      const workflow = exportWorkflow()
      updateWorkflow(currentWorkflowId, workflow)
      // Update saved state after auto-save - normalize for consistent comparison
      const normalized = normalizeWorkflowForComparison(workflow)
      lastSavedStateRef.current = normalized
    }, 2000)

    return () => clearInterval(interval)
  }, [currentWorkflowId, nodes, edges, workflowName, exportWorkflow, updateWorkflow])

  // Also save when workflow name changes
  useEffect(() => {
    if (!currentWorkflowId) return
    const workflow = exportWorkflow()
    updateWorkflow(currentWorkflowId, workflow)
    lastSavedStateRef.current = normalizeWorkflowForComparison(workflow)
  }, [workflowName, currentWorkflowId, updateWorkflow, exportWorkflow, normalizeWorkflowForComparison])

  // Check for unsaved changes - normalize JSON for comparison
  const hasUnsavedChanges = () => {
    if (!currentWorkflowId || !lastSavedStateRef.current) return false
    
    const currentWorkflow = exportWorkflow()
    const currentNormalized = normalizeWorkflowForComparison(currentWorkflow)
    const savedState = lastSavedStateRef.current
    
    return currentNormalized !== savedState
  }

  // Sync URL with workflow ID
  useEffect(() => {
    if (currentWorkflowId) {
      const url = new URL(window.location.href)
      url.searchParams.set('workflow', currentWorkflowId)
      window.history.replaceState({}, '', url.toString())
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('workflow')
      window.history.replaceState({}, '', url.toString())
    }
  }, [currentWorkflowId])

  // Clear all environment variables on page load (security - not persisted)
  useEffect(() => {
    // Environment variables are cleared on page reload for security
    // They are stored in memory only and not persisted
  }, [])

  // Load workflow from URL on mount - this must run first
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const workflowId = urlParams.get('workflow')
    
    if (workflowId) {
      const storedWorkflow = getWorkflow(workflowId)
      if (storedWorkflow && storedWorkflow.workflow) {
        // Import workflow first to set nodes and edges - this is synchronous
        importWorkflow(storedWorkflow.workflow)
        
        // Then set the workflow ID
        setCurrentWorkflowId(workflowId)
        // Set saved state to match what's in storage - normalize for consistent comparison
        lastSavedStateRef.current = normalizeWorkflowForComparison(storedWorkflow.workflow)
        
        // Give React Flow time to render with the new nodes
        const timeoutId = setTimeout(() => {
          setIsLoading(false)
        }, 150)
        
        return () => clearTimeout(timeoutId)
      } else {
        // Invalid workflow ID in URL, remove it
        const url = new URL(window.location.href)
        url.searchParams.delete('workflow')
        window.history.replaceState({}, '', url.toString())
        setCurrentWorkflowId(null)
        setIsLoading(false)
      }
    } else {
      // No workflow in URL, ensure we're on home
      setCurrentWorkflowId(null)
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Handle browser navigation (back/forward, refresh, close)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!currentWorkflowId || !lastSavedStateRef.current) return
      
      // Use the same comparison logic as hasUnsavedChanges
      const currentWorkflow = exportWorkflow()
      const currentNormalized = normalizeWorkflowForComparison(currentWorkflow)
      const savedState = lastSavedStateRef.current
      
      // Only show warning if there are actual unsaved changes
      if (currentNormalized !== savedState) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentWorkflowId, nodes, edges, workflowName, exportWorkflow])

  const handleCreateNew = () => {
    if (hasUnsavedChanges()) {
      setPendingNavigation(() => () => {
        clearWorkflow()
        const workflow = exportWorkflow()
        const id = createWorkflow('Untitled Workflow', workflow)
        if (id) {
          // Initialize default OPENAI_API_KEY for new workflow
          const envStore = useEnvironmentStore.getState()
          envStore.setVariable(id, 'OPENAI_API_KEY', 'change-me')
          setCurrentWorkflowId(id)
        }
        setShowUnsavedDialog(false)
        setPendingNavigation(null)
      })
      setShowUnsavedDialog(true)
      return
    }

    clearWorkflow()
    const workflow = exportWorkflow()
    const id = createWorkflow('Untitled Workflow', workflow)
    if (id) {
      // Initialize default OPENAI_API_KEY for new workflow
      const envStore = useEnvironmentStore.getState()
      envStore.setVariable(id, 'OPENAI_API_KEY', 'change-me')
      setCurrentWorkflowId(id)
    }
  }

  const handleOpenWorkflow = (id: string) => {
    // Initialize default OPENAI_API_KEY if it doesn't exist
    const envStore = useEnvironmentStore.getState()
    const existingVars = envStore.getAllVariables(id)
    if (!existingVars.OPENAI_API_KEY) {
      envStore.setVariable(id, 'OPENAI_API_KEY', 'change-me')
    }
    if (hasUnsavedChanges()) {
      setPendingNavigation(() => () => {
        const storedWorkflow = getWorkflow(id)
        if (storedWorkflow) {
          importWorkflow(storedWorkflow.workflow)
          // Initialize default OPENAI_API_KEY if it doesn't exist
          const envStore = useEnvironmentStore.getState()
          const existingVars = envStore.getAllVariables(id)
          if (!existingVars.OPENAI_API_KEY) {
            envStore.setVariable(id, 'OPENAI_API_KEY', 'change-me')
          }
          setCurrentWorkflowId(id)
        }
        setShowUnsavedDialog(false)
        setPendingNavigation(null)
      })
      setShowUnsavedDialog(true)
      return
    }

    const storedWorkflow = getWorkflow(id)
    if (storedWorkflow) {
      importWorkflow(storedWorkflow.workflow)
      // Initialize default OPENAI_API_KEY if it doesn't exist
      const envStore = useEnvironmentStore.getState()
      const existingVars = envStore.getAllVariables(id)
      if (!existingVars.OPENAI_API_KEY) {
        envStore.setVariable(id, 'OPENAI_API_KEY', 'change-me')
      }
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
        'ai-chat': 'AI Chat',
        'ai-asset': 'AI Asset',
        'ai-agent': 'AI Agent',
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
    if (hasUnsavedChanges()) {
      setPendingNavigation(() => () => {
        if (currentWorkflowId) {
          const workflow = exportWorkflow()
          updateWorkflow(currentWorkflowId, workflow)
          lastSavedStateRef.current = normalizeWorkflowForComparison(workflow)
        }
        setCurrentWorkflowId(null)
        clearWorkflow()
        setShowUnsavedDialog(false)
        setPendingNavigation(null)
      })
      setShowUnsavedDialog(true)
      return
    }

    if (currentWorkflowId) {
      const workflow = exportWorkflow()
      updateWorkflow(currentWorkflowId, workflow)
      lastSavedStateRef.current = normalizeWorkflowForComparison(workflow)
    }
    setCurrentWorkflowId(null)
    clearWorkflow()
  }

  const handleSaveAndNavigate = () => {
    if (currentWorkflowId && pendingNavigation) {
      const workflow = exportWorkflow()
      updateWorkflow(currentWorkflowId, workflow)
      lastSavedStateRef.current = normalizeWorkflowForComparison(workflow)
    }
    if (pendingNavigation) {
      pendingNavigation()
    }
  }

  const handleDiscardAndNavigate = () => {
    if (pendingNavigation) {
      pendingNavigation()
    }
  }

  const handleCancelNavigation = () => {
    setShowUnsavedDialog(false)
    setPendingNavigation(null)
  }

  // Callback to update saved state when manual save happens
  const handleWorkflowSaved = () => {
    if (currentWorkflowId) {
      const workflow = exportWorkflow()
      lastSavedStateRef.current = normalizeWorkflowForComparison(workflow)
    }
  }

  // Show loading state while checking URL
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentWorkflowId === null ? (
        <HomePage onCreateNew={handleCreateNew} onOpenWorkflow={handleOpenWorkflow} />
      ) : (
        <Layout
          onNodeTypeSelect={handleNodeTypeSelect}
          onBackToHome={handleBackToHome}
          currentWorkflowId={currentWorkflowId}
          onWorkflowSaved={handleWorkflowSaved}
        />
      )}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onSave={handleSaveAndNavigate}
        onDiscard={handleDiscardAndNavigate}
        onCancel={handleCancelNavigation}
        workflowName={workflowName}
      />
    </>
  )
}

export default App
