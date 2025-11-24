import { Handle, Position, type NodeProps } from 'reactflow'
import type { NodeType } from '@/types'
import { useExecutionStore } from '@/store/executionStore'
import NodeDataDisplay from './NodeDataDisplay'

interface BaseNodeData {
  label: string
  type: NodeType
  [key: string]: unknown
}

const nodeTypeColors: Record<NodeType, string> = {
  trigger: 'bg-green-500',
  action: 'bg-blue-500',
  condition: 'bg-yellow-500',
  transform: 'bg-purple-500',
}

const nodeTypeLabels: Record<NodeType, string> = {
  trigger: 'Trigger',
  action: 'Action',
  condition: 'Condition',
  transform: 'Transform',
}

export default function BaseNode({ data, selected, id }: NodeProps<BaseNodeData>) {
  const nodeType = data.type || 'action'
  const colorClass = nodeTypeColors[nodeType]
  const typeLabel = nodeTypeLabels[nodeType]
  const { currentNodeId, nodeInputs, nodeOutputs, isRunning } = useExecutionStore()
  const isCurrentlyRunning = currentNodeId === id && isRunning
  const input = nodeInputs.get(id)
  const output = nodeOutputs.get(id)

  return (
    <div
      className={`min-w-[200px] bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-primary-500' : 'border-gray-200'
      } ${isCurrentlyRunning ? 'ring-2 ring-green-500 ring-offset-2' : ''} transition-all`}
    >
      {/* Header */}
      <div className={`${colorClass} text-white px-4 py-2 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide">{typeLabel}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{data.label || 'Untitled Node'}</div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-1">{data.description as string}</div>
        )}
        {(input !== undefined || output !== undefined || isCurrentlyRunning) && (
          <NodeDataDisplay input={input} output={output} isRunning={isCurrentlyRunning} />
        )}
      </div>

      {/* Handles */}
      {nodeType !== 'trigger' && (
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      )}
      {nodeType !== 'condition' && (
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
      )}
      {nodeType === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            className="w-3 h-3 bg-green-500"
            style={{ left: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="w-3 h-3 bg-red-500"
            style={{ left: '70%' }}
          />
        </>
      )}
    </div>
  )
}
