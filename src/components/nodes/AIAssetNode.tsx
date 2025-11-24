import { Handle, Position, type NodeProps } from 'reactflow'
import { Image, Video, Mic, FileText, Layers } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import NodeDataDisplay from './NodeDataDisplay'
import LoadingSpinner from '../LoadingSpinner'
import NodeActions from './NodeActions'

interface AIAssetNodeData {
  label: string
  type: 'ai-asset'
  assetType?: 'tts' | 'stt' | 'image' | 'video' | 'embedding'
  model?: string
  [key: string]: unknown
}

const assetTypeIcons = {
  tts: Mic,
  stt: Mic,
  image: Image,
  video: Video,
  embedding: Layers,
}

const assetTypeLabels = {
  tts: 'TTS',
  stt: 'STT',
  image: 'Image',
  video: 'Video',
  embedding: 'Embedding',
}

export default function AIAssetNode({ data, selected, id }: NodeProps<AIAssetNodeData>) {
  const { currentNodeId, nodeInputs, nodeOutputs, isRunning, nodeErrors } = useExecutionStore()
  const { getLatestNodeData } = useExecutionHistoryStore()
  const isCurrentlyRunning = currentNodeId === id && isRunning
  const hasError = nodeErrors[id] !== undefined
  const disabled = data.disabled === true
  const workflowId = new URLSearchParams(window.location.search).get('workflowId')
  
  const currentInput = nodeInputs[id]
  const currentOutput = nodeOutputs[id]
  const historyData = getLatestNodeData(id)
  
  const input = currentInput !== undefined ? currentInput : (historyData?.input !== undefined ? historyData.input : undefined)
  const output = currentOutput !== undefined ? currentOutput : (historyData?.output !== undefined ? historyData.output : undefined)

  const assetType = data.assetType || 'image'
  const Icon = assetTypeIcons[assetType] || Image
  const label = assetTypeLabels[assetType] || 'Asset'

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
        <NodeActions nodeId={id} nodeType="ai-asset" disabled={disabled} workflowId={workflowId} />
      </div>

      {/* Header */}
      <div className="bg-purple-500 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">AI {label}</span>
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
        <div className="text-sm font-medium text-gray-900 truncate">{data.label || `AI ${label}`}</div>
        {data.model && (
          <div className="text-xs text-gray-500 mt-1.5 truncate">
            Model: <span className="font-mono">{data.model}</span>
          </div>
        )}
        {!data.model && (
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

