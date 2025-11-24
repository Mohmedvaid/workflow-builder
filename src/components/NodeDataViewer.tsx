import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { useExecutionStore } from '@/store/executionStore'
import { useExecutionHistoryStore } from '@/store/executionHistoryStore'
import { useWorkflowStore } from '@/store/workflowStore'
import type { Node } from 'reactflow'
import ApiCallConfig from './configs/ApiCallConfig'
import RunJSConfig from './configs/RunJSConfig'
import FileConfig from './configs/FileConfig'
import AIChatConfig from './configs/AIChatConfig'
import AIAssetConfig from './configs/AIAssetConfig'
import DataReferenceHelper from './DataReferenceHelper'

interface NodeDataViewerProps {
  node: Node | null
  onClose: () => void
}

export default function NodeDataViewer({ node, onClose }: NodeDataViewerProps) {
  const { nodeInputs, nodeOutputs } = useExecutionStore()
  const { getLatestNodeData } = useExecutionHistoryStore()
  const { edges, updateNode } = useWorkflowStore()
  
  // Store original node data and edited data
  const [originalNodeData, setOriginalNodeData] = useState<Record<string, unknown> | null>(null)
  const [editedNodeData, setEditedNodeData] = useState<Record<string, unknown>>({})
  const [showDataReferenceHelper, setShowDataReferenceHelper] = useState(true)

  // Initialize with node data when node changes
  useEffect(() => {
    if (node) {
      // Deep copy of node data
      const original = JSON.parse(JSON.stringify(node.data))
      setOriginalNodeData(original)
      setEditedNodeData(original)
      // Reset helper visibility when node changes
      setShowDataReferenceHelper(true)
    }
  }, [node?.id])

  if (!node) return null

  // Get data from current execution first, then from persistent history
  const currentInput = nodeInputs[node.id]
  const currentOutput = nodeOutputs[node.id]
  const historyData = getLatestNodeData(node.id)
  
  const input = currentInput !== undefined ? currentInput : (historyData?.input !== undefined ? historyData.input : undefined)
  const output = currentOutput !== undefined ? currentOutput : (historyData?.output !== undefined ? historyData.output : undefined)
  const hasData = input !== undefined || output !== undefined
  const nodeType = (editedNodeData.type as string) || (node.data.type as string) || 'trigger'

  const handleUpdate = (field: string, value: unknown) => {
    setEditedNodeData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Apply all changes to the node
    updateNode(node.id, editedNodeData)
    onClose()
  }

  const handleCancel = () => {
    // Revert to original data
    if (originalNodeData) {
      setEditedNodeData(originalNodeData)
      updateNode(node.id, originalNodeData)
    }
    onClose()
  }

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        handleCancel()
      }
    } else {
      handleCancel()
    }
  }

  // Check if there are unsaved changes
  const hasChanges = originalNodeData !== null && JSON.stringify(originalNodeData) !== JSON.stringify(editedNodeData)

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && node) {
        const hasUnsavedChanges = originalNodeData !== null && JSON.stringify(originalNodeData) !== JSON.stringify(editedNodeData)
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            handleCancel()
          }
        } else {
          handleCancel()
        }
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [node, originalNodeData, editedNodeData])

  // Find connected nodes
  const incomingEdges = edges.filter((edge) => edge.target === node.id)
  const outgoingEdges = edges.filter((edge) => edge.source === node.id)

  const formatData = (data: unknown): string => {
    if (data === null || data === undefined) return 'No data'
    if (typeof data === 'string') return data
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {(editedNodeData.label as string) || node.data.label || 'Node Data'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Node ID: <span className="font-mono">{node.id}</span>
              {hasChanges && (
                <span className="ml-3 text-xs text-amber-600 font-medium">• Unsaved changes</span>
              )}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content - Always show 3 sections */}
        <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Input Data */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">Input Data</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {incomingEdges.length > 0
                        ? `From ${incomingEdges.length} connected node(s)`
                        : 'No incoming connections'}
                    </p>
                  </div>
                  {input !== undefined && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Data Available
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {input !== undefined ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {formatData(input)}
                  </pre>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {hasData ? (
                      <>
                        <p>No input data available</p>
                        <p className="text-sm mt-2">This node doesn't receive input from other nodes</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <p className="font-medium">No execution data</p>
                        <p className="text-sm mt-2">Run the workflow to see input data here</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Middle Section - Configuration */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="bg-purple-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-purple-900">Configuration</h3>
                <p className="text-sm text-purple-700 mt-1">Edit node settings</p>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  {/* Node Type Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                      {nodeType
                        .split('-')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
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
                      value={(editedNodeData.label as string) || ''}
                      onChange={(e) => handleUpdate('label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter node label"
                    />
                  </div>

                  {/* Specialized Configuration */}
                  <div className="border-t border-gray-200 pt-4">
                    {incomingEdges.length > 0 && showDataReferenceHelper && (
                      <DataReferenceHelper onDismiss={() => setShowDataReferenceHelper(false)} />
                    )}
                    {nodeType === 'api-call' && (
                      <ApiCallConfig data={editedNodeData} onUpdate={handleUpdate} />
                    )}
                    {nodeType === 'run-js' && <RunJSConfig data={editedNodeData} onUpdate={handleUpdate} />}
                    {nodeType === 'file' && (
                      <FileConfig data={editedNodeData} onUpdate={handleUpdate} />
                    )}
                    {nodeType === 'ai-chat' && <AIChatConfig data={editedNodeData} onUpdate={handleUpdate} />}
                    {nodeType === 'ai-asset' && <AIAssetConfig data={editedNodeData} onUpdate={handleUpdate} />}
                    {!['api-call', 'run-js', 'file', 'ai-chat', 'ai-asset'].includes(nodeType) && (
                      <div>
                        <label
                          htmlFor="node-description"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Description
                        </label>
                        <textarea
                          id="node-description"
                          value={(editedNodeData.description as string) || ''}
                          onChange={(e) => handleUpdate('description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          placeholder="Enter node description (optional)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                  {hasChanges && (
                    <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
                  )}
                  {!hasChanges && <span className="text-xs text-gray-500">No changes</span>}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Output Data */}
            <div className="w-1/3 flex flex-col">
              <div className="bg-green-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Output Data</h3>
                    <p className="text-sm text-green-700 mt-1">
                      {outgoingEdges.length > 0
                        ? `To ${outgoingEdges.length} connected node(s)`
                        : 'No outgoing connections'}
                    </p>
                  </div>
                  {output !== undefined && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Data Available
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                {output !== undefined ? (
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {formatData(output)}
                  </pre>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    {hasData ? (
                      <>
                        <p>No output data available</p>
                        <p className="text-sm mt-2">This node hasn't produced output yet</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                        </div>
                        <p className="font-medium">No execution data</p>
                        <p className="text-sm mt-2">Run the workflow to see output data here</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}
