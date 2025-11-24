import { X } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import type { Node } from 'reactflow'

interface NodeConfigPanelProps {
  node: Node | null
  onClose: () => void
}

export default function NodeConfigPanel({ node, onClose }: NodeConfigPanelProps) {
  const { updateNode } = useWorkflowStore()

  if (!node) return null

  const handleUpdate = (field: string, value: unknown) => {
    updateNode(node.id, { [field]: value })
  }

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Node Configuration</h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Node Type Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
            {(node.data.type as string)?.charAt(0).toUpperCase() +
              (node.data.type as string)?.slice(1) || 'Action'}
          </div>
        </div>

        {/* Label */}
        <div>
          <label htmlFor="node-label" className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            id="node-label"
            type="text"
            value={(node.data.label as string) || ''}
            onChange={(e) => handleUpdate('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter node label"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="node-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="node-description"
            value={(node.data.description as string) || ''}
            onChange={(e) => handleUpdate('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Enter node description (optional)"
          />
        </div>

        {/* Node ID (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-500 font-mono">
            {node.id}
          </div>
        </div>

        {/* Position Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X Position</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
              {Math.round(node.position.x)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y Position</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
              {Math.round(node.position.y)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
