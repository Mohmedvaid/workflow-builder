import { Play, Power, Trash2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import { useEnvironmentStore } from '@/store/environmentStore'
import { executeSingleNode } from '@/utils/workflowExecutor'

interface NodeActionsProps {
  nodeId: string
  nodeType: string
  disabled?: boolean
  workflowId?: string | null
}

export default function NodeActions({ nodeId, nodeType, disabled = false, workflowId }: NodeActionsProps) {
  const { exportWorkflow, updateNode, deleteNode } = useWorkflowStore()
  const executionStore = useExecutionStore()
  const executionHistoryStore = useExecutionHistoryStore()
  const { getAllVariables } = useEnvironmentStore()

  const handleExecuteNode = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Don't execute if disabled
    if (disabled) return

    try {
      const workflow = exportWorkflow()
      
      // Get environment variables
      const envVars = workflowId ? getAllVariables(workflowId) : {}

      // Execute single node
      await executeSingleNode(nodeId, workflow, envVars, executionStore, {
        startExecution: (name: string) => executionHistoryStore.startExecution(name),
        saveNodeData: (nodeId: string, input?: unknown, output?: unknown) => {
          executionHistoryStore.saveNodeData(nodeId, input, output)
        },
        finishExecution: () => executionHistoryStore.finishExecution(),
      })
    } catch (error) {
      console.error('Error executing node:', error)
      executionStore.setNodeError(nodeId, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const handleToggleDisabled = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateNode(nodeId, { disabled: !disabled })
  }

  const handleDeleteNode = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNode(nodeId)
    }
  }

  // Don't show delete for trigger nodes (only one allowed)
  const showDelete = nodeType !== 'trigger'

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleExecuteNode}
        className="p-1 hover:bg-gray-100/80 rounded transition-colors"
        title="Execute this node"
        disabled={disabled}
      >
        <Play className="w-3 h-3 text-gray-400 hover:text-gray-600" />
      </button>
      <button
        onClick={handleToggleDisabled}
        className="p-1 hover:bg-gray-100/80 rounded transition-colors"
        title={disabled ? 'Enable node' : 'Disable node'}
      >
        <Power
          className={`w-3 h-3 ${disabled ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
        />
      </button>
      {showDelete && (
        <button
          onClick={handleDeleteNode}
          className="p-1 hover:bg-gray-100/80 rounded transition-colors"
          title="Delete node"
        >
          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
        </button>
      )}
    </div>
  )
}

