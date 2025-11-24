import { Handle, Position, type NodeProps } from 'reactflow'
import type { NodeType } from '@/types'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import NodeDataDisplay from './NodeDataDisplay'
import LoadingSpinner from '../LoadingSpinner'
import NodeActions from './NodeActions'

interface BaseNodeData {
  label: string
  type: NodeType
  [key: string]: unknown
}

const nodeTypeColors: Record<NodeType, string> = {
  trigger: 'bg-green-500',
  condition: 'bg-yellow-500',
}

const nodeTypeLabels: Record<NodeType, string> = {
  trigger: 'Trigger',
  condition: 'Condition',
}

export default function BaseNode({ data, selected, id }: NodeProps<BaseNodeData>) {
  const nodeType = data.type || 'trigger'
  const colorClass = nodeTypeColors[nodeType]
  const typeLabel = nodeTypeLabels[nodeType]
  const { currentNodeId, nodeInputs, nodeOutputs, isRunning, nodeErrors } = useExecutionStore()
  const { getLatestNodeData } = useExecutionHistoryStore()
  const isCurrentlyRunning = currentNodeId === id && isRunning
  const hasError = nodeErrors[id] !== undefined
  const disabled = data.disabled === true
  
  // Get current workflow ID from URL
  const workflowId = new URLSearchParams(window.location.search).get('workflowId')
  
  // Get data from current execution first, then from persistent history
  const currentInput = nodeInputs[id]
  const currentOutput = nodeOutputs[id]
  const historyData = getLatestNodeData(id)
  
  const input = currentInput !== undefined ? currentInput : (historyData?.input !== undefined ? historyData.input : undefined)
  const output = currentOutput !== undefined ? currentOutput : (historyData?.output !== undefined ? historyData.output : undefined)

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
        <NodeActions nodeId={id} nodeType={nodeType} disabled={disabled} workflowId={workflowId} />
      </div>

      {/* Header */}
      <div className={`${colorClass} text-white px-4 py-2 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide">{typeLabel}</span>
          <div className="flex items-center gap-2">
            {isCurrentlyRunning && <LoadingSpinner size="sm" />}
            {(input !== undefined || output !== undefined) && !isCurrentlyRunning && (
              <div className="w-2 h-2 bg-white rounded-full" title="Has execution data - Double-click to view" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900 truncate">{data.label || 'Untitled Node'}</div>
        {data.description && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{data.description as string}</div>
        )}
        {(input !== undefined || output !== undefined || isCurrentlyRunning) && (
          <NodeDataDisplay input={input} output={output} isRunning={isCurrentlyRunning} />
        )}
      </div>

      {/* Handles */}
      {nodeType !== 'trigger' && (
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-gray-400" />
      )}
      {nodeType !== 'condition' && (
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-gray-400" />
      )}
      {nodeType === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-3 h-3 bg-green-500"
            style={{ top: '30%' }}
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="w-3 h-3 bg-red-500"
            style={{ top: '70%' }}
          />
        </>
      )}
    </div>
  )
}
