import { Handle, Position, type NodeProps } from 'reactflow'
import { Globe } from 'lucide-react'

interface ApiCallNodeData {
  label: string
  type: 'api-call'
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: string
  body?: string
  [key: string]: unknown
}

export default function ApiCallNode({ data, selected }: NodeProps<ApiCallNodeData>) {
  return (
    <div
      className={`min-w-[220px] bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-primary-500' : 'border-gray-200'
      } transition-all`}
    >
      {/* Header */}
      <div className="bg-indigo-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Globe className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">API Call</span>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{data.label || 'API Call'}</div>
        {data.url && (
          <div className="text-xs text-gray-500 mt-1.5 truncate">
            <span className="font-mono">{data.method || 'GET'}</span> {data.url}
          </div>
        )}
        {!data.url && (
          <div className="text-xs text-gray-400 mt-1.5 italic">No URL configured</div>
        )}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
    </div>
  )
}
