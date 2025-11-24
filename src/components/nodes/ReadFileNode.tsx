import { Handle, Position, type NodeProps } from 'reactflow'
import { FileUp } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import NodeDataDisplay from './NodeDataDisplay'

interface ReadFileNodeData {
  label: string
  type: 'read-file'
  filePath?: string
  [key: string]: unknown
}

export default function ReadFileNode({ data, selected, id }: NodeProps<ReadFileNodeData>) {
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
      className={`min-w-[220px] bg-white rounded-lg shadow-md border-2 ${
        selected ? 'border-primary-500' : 'border-gray-200'
      } ${isCurrentlyRunning ? 'ring-2 ring-green-500 ring-offset-2' : ''} transition-all`}
    >
      {/* Header */}
      <div className="bg-cyan-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileUp className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Read File</span>
        </div>
        {(input !== undefined || output !== undefined) && (
          <div className="w-2 h-2 bg-white rounded-full" title="Has execution data - Double-click to view" />
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">{data.label || 'Read File'}</div>
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
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
    </div>
  )
}
