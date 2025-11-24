import { Handle, Position, type NodeProps } from 'reactflow'
import { Code2 } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import NodeDataDisplay from './NodeDataDisplay'

interface RunJSNodeData {
  label: string
  type: 'run-js'
  code?: string
  [key: string]: unknown
}

export default function RunJSNode({ data, selected, id }: NodeProps<RunJSNodeData>) {
  const { currentNodeId, nodeInputs, nodeOutputs, isRunning } = useExecutionStore()
  const isCurrentlyRunning = currentNodeId === id && isRunning
  const input = nodeInputs.get(id)
  const output = nodeOutputs.get(id)

  return (
    <div
      className={`min-w-[220px] bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-primary-500' : 'border-gray-200'
      } ${isCurrentlyRunning ? 'ring-2 ring-green-500 ring-offset-2' : ''} transition-all`}
    >
      {/* Header */}
      <div className="bg-amber-500 text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
        <Code2 className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Run JavaScript</span>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{data.label || 'Run JS'}</div>
        {data.code ? (
          <div className="text-xs text-gray-500 mt-1.5 font-mono line-clamp-2">
            {data.code.substring(0, 50)}
            {data.code.length > 50 ? '...' : ''}
          </div>
        ) : (
          <div className="text-xs text-gray-400 mt-1.5 italic">No code configured</div>
        )}
        {(input !== undefined || output !== undefined || isCurrentlyRunning) && (
          <NodeDataDisplay input={input} output={output} isRunning={isCurrentlyRunning} />
        )}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
    </div>
  )
}
