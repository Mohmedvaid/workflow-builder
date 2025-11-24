import { Settings, X } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'

interface WorkflowSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function WorkflowSettings({ isOpen, onClose }: WorkflowSettingsProps) {
  const { timeout, setTimeout } = useWorkflowStore()

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = Math.max(0, Math.min(23, parseInt(e.target.value) || 0))
    setTimeout({ hours, minutes: timeout.minutes })
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
    setTimeout({ hours: timeout.hours, minutes })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Workflow Settings</h2>
              <p className="text-sm text-gray-500">Configure your workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Timeout Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Timeout
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  Maximum time allowed for workflow execution. Workflow will be terminated if it
                  exceeds this time.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label htmlFor="timeout-hours" className="block text-xs font-medium text-gray-600 mb-1">
                      Hours
                    </label>
                    <input
                      id="timeout-hours"
                      type="number"
                      min="0"
                      max="23"
                      value={timeout.hours}
                      onChange={handleHoursChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="timeout-minutes" className="block text-xs font-medium text-gray-600 mb-1">
                      Minutes
                    </label>
                    <input
                      id="timeout-minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={timeout.minutes}
                      onChange={handleMinutesChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Timeout:</strong>{' '}
                    {timeout.hours > 0 || timeout.minutes > 0 ? (
                      <>
                        {timeout.hours > 0 && `${timeout.hours}h `}
                        {timeout.minutes > 0 && `${timeout.minutes}m`}
                        {timeout.hours === 0 && timeout.minutes === 0 && '0m'}
                      </>
                    ) : (
                      'No timeout set'
                    )}
                  </p>
                </div>
              </div>
            </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
