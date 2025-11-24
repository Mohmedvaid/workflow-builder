import { Handle, Position, type NodeProps } from 'reactflow'
import { FileText, FileDown, FileUp } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import NodeDataDisplay from './NodeDataDisplay'
import LoadingSpinner from '../LoadingSpinner'
import NodeActions from './NodeActions'

interface FileNodeData {
  label: string
  type: 'file'
  operation?: 'read' | 'write'
  filePath?: string
  extension?: string
  [key: string]: unknown
}

export default function FileNode({ data, selected, id }: NodeProps<FileNodeData>) {
  const { currentNodeId, nodeInputs, nodeOutputs, isRunning, nodeErrors } = useExecutionStore()
  const { getLatestNodeData } = useExecutionHistoryStore()
  const isCurrentlyRunning = currentNodeId === id && isRunning
  const hasError = nodeErrors[id] !== undefined
  const disabled = data.disabled === true
  const workflowId = new URLSearchParams(window.location.search).get('workflowId')
  
  const currentInput = nodeInputs[id]
  const currentOutput = nodeOutputs[id]
  const historyData = getLatestNodeData(id)
  
  const input = currentInput !== undefined ? currentInput : (historyData?.input !== undefined ? historyData.input : undefined)
  const output = currentOutput !== undefined ? currentOutput : (historyData?.output !== undefined ? historyData.output : undefined)

  const operation = (data.operation as 'read' | 'write') || 'read'
  const Icon = operation === 'read' ? FileUp : FileDown
  const operationLabel = operation === 'read' ? 'Read' : 'Write'
  const colorClass = operation === 'read' ? 'bg-cyan-500' : 'bg-teal-500'

  return (
    <div
      className={`w-[200px] bg-white rounded-lg shadow-md border-2 relative ${
        hasError
          ? 'border-red-300 bg-red-50'
          : disabled
            ? 'border-gray-300 bg-gray-50 opacity-60'
            : selected
              ? 'border-primary-500'
              : 'border-gray-200'
      } ${isCurrentlyRunning ? 'ring-2 ring-green-500 ring-offset-2' : ''} ${hasError ? 'ring-2 ring-red-300 ring-offset-1' : ''} transition-all`}
    >
      {/* Floating Action Icons */}
      <div className="absolute -top-5 -right-1 z-10">
        <NodeActions nodeId={id} nodeType="file" disabled={disabled} workflowId={workflowId} />
      </div>

      {/* Header */}
      <div className={`${colorClass} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{operationLabel} File</span>
        </div>
        <div className="flex items-center gap-2">
          {isCurrentlyRunning && <LoadingSpinner size="sm" />}
          {(input !== undefined || output !== undefined) && !isCurrentlyRunning && (
            <div className="w-2 h-2 bg-white rounded-full" title="Has execution data - Double-click to view" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900 truncate">{data.label || `${operationLabel} File`}</div>
        {data.filePath ? (
          <div className="text-xs text-gray-500 mt-1.5 truncate font-mono">{data.filePath}</div>
        ) : (
          <div className="text-xs text-gray-400 mt-1.5 italic">No file path configured</div>
        )}
        {data.extension && (
          <div className="text-xs text-gray-500 mt-1 truncate">
            Extension: <span className="font-mono">{data.extension}</span>
          </div>
        )}
        {(input !== undefined || output !== undefined || isCurrentlyRunning) && (
          <NodeDataDisplay input={input} output={output} isRunning={isCurrentlyRunning} />
        )}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400" />
    </div>
  )
}

