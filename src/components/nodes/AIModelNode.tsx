import { Handle, Position, type NodeProps } from 'reactflow'
import { Brain } from 'lucide-react'

interface AIModelNodeData {
  label: string
  type: 'ai-model'
  model?: string
  prompt?: string
  temperature?: number
  maxTokens?: number
  [key: string]: unknown
}

export default function AIModelNode({ data, selected }: NodeProps<AIModelNodeData>) {
  return (
    <div
      className={`min-w-[220px] bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-primary-500' : 'border-gray-200'
      } transition-all`}
    >
      {/* Header */}
      <div className="bg-pink-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Brain className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">AI Model</span>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{data.label || 'AI Model'}</div>
        {data.model && (
          <div className="text-xs text-gray-500 mt-1.5">
            Model: <span className="font-mono">{data.model}</span>
          </div>
        )}
        {data.prompt && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
            {data.prompt.substring(0, 40)}
            {data.prompt.length > 40 ? '...' : ''}
          </div>
        )}
        {!data.model && !data.prompt && (
          <div className="text-xs text-gray-400 mt-1.5 italic">No configuration</div>
        )}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
    </div>
  )
}
