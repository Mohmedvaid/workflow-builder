import { Handle, Position, type NodeProps } from 'reactflow'
import { Bot } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import NodeDataDisplay from './NodeDataDisplay'
import LoadingSpinner from '../LoadingSpinner'

interface AIAgentNodeData {
  label: string
  type: 'ai-agent'
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  tools?: string
  [key: string]: unknown
}

export default function AIAgentNode({ data, selected, id }: NodeProps<AIAgentNodeData>) {
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
      <div className="bg-violet-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">AI Agent</span>
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
        <div className="text-sm font-medium text-gray-900 truncate">{data.label || 'AI Agent'}</div>
        {data.model && (
          <div className="text-xs text-gray-500 mt-1.5 truncate">
            Model: <span className="font-mono">{data.model}</span>
          </div>
        )}
        {data.systemPrompt && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2 break-words">
            {data.systemPrompt.substring(0, 40)}
            {data.systemPrompt.length > 40 ? '...' : ''}
          </div>
        )}
        {!data.model && !data.systemPrompt && (
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

