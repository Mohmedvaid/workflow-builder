import { Upload, FileText, Play } from 'lucide-react'
import { useState, useRef } from 'react'
import { useWorkflowStore } from '@/store/workflowStore'
import { useExecutionStore } from '@/store/executionStore'
import { useRunHistoryStore } from '@/store/runHistoryStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import { readWorkflowFile } from '@/utils/workflowUtils'
import { executeWorkflow } from '@/utils/workflowExecutor'
import ErrorDialog from './ErrorDialog'

interface HeaderProps {
  workflowId?: string | null
}

export default function Header({ workflowId }: HeaderProps) {
  const { exportWorkflow, importWorkflow, workflowName, setWorkflowName, nodes } =
    useWorkflowStore()
  const { isRunning, clearExecution, setNodeError } = useExecutionStore()
  const { addRun } = useRunHistoryStore()
  const executionHistoryStore = useExecutionHistoryStore()
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [executionErrors, setExecutionErrors] = useState<Array<{ nodeId: string; error: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nodeCount = nodes.length
  const maxNodes = 50

  // Create node labels map for error dialog
  const nodeLabels = nodes.reduce((acc, node) => {
    acc[node.id] = node.data.label || node.id
    return acc
  }, {} as Record<string, string>)

  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const workflow = await readWorkflowFile(file)
        importWorkflow(workflow)
      } catch (error) {
        alert('Failed to load workflow: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }


  const handleRun = async () => {
    const startTime = Date.now()
    // Clear any previous errors
    setShowErrorDialog(false)
    setExecutionErrors([])
    try {
      const workflow = exportWorkflow()
      const executionStore = useExecutionStore.getState()
      
      // Start execution in history store
      executionHistoryStore.startExecution(workflow.name)
      
      // Track current execution data for preserving input/output
      let currentExecutionData: Record<string, { input?: unknown; output?: unknown }> = {}
      
      const result = await executeWorkflow(
        workflow,
        {
          startExecution: executionStore.startExecution,
          stopExecution: executionStore.stopExecution,
          setCurrentNode: executionStore.setCurrentNode,
          setNodeInput: (nodeId: string, input: unknown) => {
            executionStore.setNodeInput(nodeId, input)
            // Get existing output from current execution if any
            const existingOutput = currentExecutionData[nodeId]?.output
            executionHistoryStore.saveNodeData(nodeId, input, existingOutput)
            // Update tracking
            currentExecutionData[nodeId] = { ...currentExecutionData[nodeId], input }
          },
          setNodeOutput: (nodeId: string, output: unknown) => {
            executionStore.setNodeOutput(nodeId, output)
            // Get existing input from current execution if any
            const existingInput = currentExecutionData[nodeId]?.input
            executionHistoryStore.saveNodeData(nodeId, existingInput, output)
            // Update tracking
            currentExecutionData[nodeId] = { ...currentExecutionData[nodeId], output }
          },
          setNodeError: (nodeId: string, error: string | null) => {
            setNodeError(nodeId, error)
          },
        },
        workflowId
      )
      const executionTime = Date.now() - startTime
      
      // Finish execution in history store
      executionHistoryStore.finishExecution()

      // Save to run history
      addRun({
        id: `run-${Date.now()}`,
        workflowId: workflow.name,
        workflowName: workflow.name,
        timestamp: new Date().toISOString(),
        status: result.errors.length > 0 ? 'error' : 'success',
        executionTime,
        errors: result.errors.length > 0 ? result.errors : undefined,
        nodeOutputs: Object.fromEntries(result.nodeOutputs),
      })

      if (result.errors.length > 0) {
        setExecutionErrors(result.errors)
        setShowErrorDialog(true)
      }

      console.log('Execution result:', result)
    } catch (error) {
      const executionTime = Date.now() - startTime
      const workflow = exportWorkflow()
      addRun({
        id: `run-${Date.now()}`,
        workflowId: workflow.name,
        workflowName: workflow.name,
        timestamp: new Date().toISOString(),
        status: 'error',
        executionTime,
        errors: [{ nodeId: '', error: error instanceof Error ? error.message : 'Unknown error' }],
      })
      setExecutionErrors([{ nodeId: '', error: error instanceof Error ? error.message : 'Unknown error' }])
      setShowErrorDialog(true)
    } finally {
      clearExecution()
    }
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">Workflow Builder</h1>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Workflow name"
        />
        <div className="h-6 w-px bg-gray-300" />
        <div
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            nodeCount >= maxNodes
              ? 'bg-red-100 text-red-700'
              : nodeCount >= maxNodes * 0.8
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
          }`}
        >
          {nodeCount}/{maxNodes} nodes
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Running...' : 'Run'}
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <button
          onClick={handleLoad}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Load
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      {showErrorDialog && (
        <ErrorDialog
          errors={executionErrors}
          onClose={() => {
            setShowErrorDialog(false)
            setExecutionErrors([])
          }}
          nodeLabels={nodeLabels}
        />
      )}
    </header>
  )
}
