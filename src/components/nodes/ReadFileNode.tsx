import { Handle, Position, type NodeProps } from 'reactflow'
import { FileUp } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import NodeDataDisplay from './NodeDataDisplay'
import LoadingSpinner from '../LoadingSpinner'

interface ReadFileNodeData {
  label: string
  type: 'read-file'
  filePath?: string
  [key: string]: unknown
}

export default function ReadFileNode({ data, selected, id }: NodeProps<ReadFileNodeData>) {
  const { currentNodeId, nodeInputs, nodeOutputs, isRunning, nodeErrors } = useExecutionStore()
  const { getLatestNodeData } = useExecutionHistoryStore()
  const isCurrentlyRunning = currentNodeId === id && isRunning
  const hasError = nodeErrors[id] !== undefined
  
  const currentInput = nodeInputs[id]
  const currentOutput = nodeOutputs[id]
  const historyData = getLatestNodeData(id)
  
  const input = currentInput !== undefined ? currentInput : (historyData?.input !== undefined ? historyData.input : undefined)
  const output = currentOutput !== undefined ? currentOutput : (historyData?.output !== undefined ? historyData.output : undefined)

  return (
    <div
      className={`w-[200px] bg-white rounded-lg shadow-md border-2 ${
        hasError
          ? 'border-red-300 bg-red-50'
          : selected
            ? 'border-primary-500'
            : 'border-gray-200'
      } ${isCurrentlyRunning ? 'ring-2 ring-green-500 ring-offset-2' : ''} ${hasError ? 'ring-2 ring-red-300 ring-offset-1' : ''} transition-all`}
    >
      {/* Header */}
      <div className="bg-cyan-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileUp className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Read File</span>
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
        <div className="text-sm font-medium text-gray-900 truncate">{data.label || 'Read File'}</div>
        {data.filePath ? (
          <div className="text-xs text-gray-500 mt-1.5 truncate font-mono">{data.filePath}</div>
        ) : (
          <div className="text-xs text-gray-400 mt-1.5 italic">No file path configured</div>
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
