import { Handle, Position, type NodeProps } from 'reactflow'
import { Brain } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import NodeDataDisplay from './NodeDataDisplay'
import LoadingSpinner from '../LoadingSpinner'

interface AIModelNodeData {
  label: string
  type: 'ai-model'
  model?: string
  prompt?: string
  temperature?: number
  maxTokens?: number
  [key: string]: unknown
}

export default function AIModelNode({ data, selected, id }: NodeProps<AIModelNodeData>) {
  const { currentNodeId, nodeInputs, nodeOutputs, isRunning } = useExecutionStore()
  const { getLatestNodeData } = useExecutionHistoryStore()
  const isCurrentlyRunning = currentNodeId === id && isRunning
  
  const currentInput = nodeInputs[id]
  const currentOutput = nodeOutputs[id]
  const historyData = getLatestNodeData(id)
  
  const input = currentInput !== undefined ? currentInput : (historyData?.input !== undefined ? historyData.input : undefined)
  const output = currentOutput !== undefined ? currentOutput : (historyData?.output !== undefined ? historyData.output : undefined)

  return (
    <div
      className={`w-[200px] bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-primary-500' : 'border-gray-200'
      } ${isCurrentlyRunning ? 'ring-2 ring-green-500 ring-offset-2' : ''} transition-all`}
    >
      {/* Header */}
      <div className="bg-pink-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">AI Model</span>
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
        <div className="text-sm font-medium text-gray-900 truncate">{data.label || 'AI Model'}</div>
        {data.model && (
          <div className="text-xs text-gray-500 mt-1.5 truncate">
            Model: <span className="font-mono">{data.model}</span>
          </div>
        )}
        {data.prompt && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">
            {data.prompt.substring(0, 40)}
            {data.prompt.length > 40 ? '...' : ''}
          </div>
        )}
        {!data.model && !data.prompt && (
          <div className="text-xs text-gray-400 mt-1.5 italic">No configuration</div>
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
