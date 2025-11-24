import { Handle, Position, type NodeProps } from 'reactflow'
import { FileDown } from 'lucide-react'

interface WriteFileNodeData {
  label: string
  type: 'write-file'
  filePath?: string
  content?: string
  [key: string]: unknown
}

export default function WriteFileNode({ data, selected }: NodeProps<WriteFileNodeData>) {
  return (
    <div
      className={`min-w-[220px] bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-primary-500' : 'border-gray-200'
      } transition-all`}
    >
      {/* Header */}
      <div className="bg-teal-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <FileDown className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Write File</span>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{data.label || 'Write File'}</div>
        {data.filePath ? (
          <div className="text-xs text-gray-500 mt-1.5 truncate font-mono">{data.filePath}</div>
        ) : (
          <div className="text-xs text-gray-400 mt-1.5 italic">No file path configured</div>
        )}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
    </div>
  )
}
