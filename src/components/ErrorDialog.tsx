import { X, AlertCircle } from 'lucide-react'

interface ErrorInfo {
  nodeId: string
  error: string
}

interface ErrorDialogProps {
  errors: ErrorInfo[]
  onClose: () => void
  nodeLabels?: Record<string, string>
}

export default function ErrorDialog({ errors, onClose, nodeLabels = {} }: ErrorDialogProps) {
  if (errors.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Workflow Execution Errors ({errors.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {errors.map((errorInfo, index) => {
              const nodeLabel = nodeLabels[errorInfo.nodeId] || errorInfo.nodeId || 'Unknown Node'
              return (
                <div
                  key={index}
                  className="bg-red-50 border border-red-200 rounded-md p-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-red-900 mb-1">
                        {nodeLabel}
                      </div>
                      <div className="text-sm text-red-800 break-words">
                        {errorInfo.error}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

