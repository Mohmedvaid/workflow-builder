import { useState } from 'react'
import { Eye, EyeOff, Plus, Trash2, Key } from 'lucide-react'
import { useEnvironmentStore } from '@/store/environmentStore'

interface EnvironmentVariablesProps {
  workflowId: string | null
}

export default function EnvironmentVariables({ workflowId }: EnvironmentVariablesProps) {
  const { getAllVariables, setVariable, deleteVariable } = useEnvironmentStore()
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  if (!workflowId) return null

  const variables = getAllVariables(workflowId)
  const variableEntries = Object.entries(variables)

  const handleToggleVisibility = (key: string) => {
    setShowValues((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAdd = () => {
    if (newKey.trim() && newValue.trim()) {
      setVariable(workflowId, newKey.trim(), newValue.trim())
      setNewKey('')
      setNewValue('')
      setIsAdding(false)
    }
  }

  const handleDelete = (key: string) => {
    if (confirm(`Are you sure you want to delete the environment variable "${key}"?`)) {
      deleteVariable(workflowId, key)
    }
  }

  const maskValue = (value: string) => {
    return '•'.repeat(Math.min(value.length, 20))
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Environment Variables
          </label>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Variable
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Store sensitive data like API keys. Reference them in nodes using <code className="bg-gray-100 px-1 rounded">$env.VARIABLE_NAME</code>.
        </p>

        {/* Security Warning */}
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-xs text-red-800">
            <strong>⚠️ Security Notice:</strong> Environment variables are <strong>NOT saved</strong> to browser storage or session. They will be cleared when you reload the page. This is by design for security.
          </p>
        </div>

        {/* Add New Variable Form */}
        {isAdding && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Variable Name
              </label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="API_KEY"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="your-secret-value"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewKey('')
                  setNewValue('')
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Variables List */}
        {variableEntries.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm border border-gray-200 rounded-md bg-gray-50">
            <Key className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No environment variables set</p>
            <p className="text-xs mt-1">Click "Add Variable" to create one</p>
          </div>
        ) : (
          <div className="space-y-2">
            {variableEntries.map(([key, value]) => {
              const isVisible = showValues[key] || false
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-700 mb-1 font-mono">
                      {key}
                    </div>
                    <div className="text-sm font-mono text-gray-600">
                      {isVisible ? (
                        <span className="break-all">{value}</span>
                      ) : (
                        <span className="text-gray-400">{maskValue(value)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleVisibility(key)}
                      className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                      title={isVisible ? 'Hide value' : 'Show value'}
                    >
                      {isVisible ? (
                        <EyeOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(key)}
                      className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
                      title="Delete variable"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

