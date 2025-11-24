import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

interface AIChatConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

const CHAT_MODELS = [
  { value: 'gpt-5.1', label: 'GPT-5.1' },
  { value: 'gpt-5', label: 'GPT-5' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o-nano', label: 'GPT-4o Nano' },
]

export default function AIChatConfig({ data, onUpdate }: AIChatConfigProps) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const keyValuePairs = (data.keyValuePairs as Record<string, string>) || {}
  const keyValueEntries = Object.entries(keyValuePairs)

  const handleAddKeyValue = () => {
    if (newKey.trim() && newValue.trim()) {
      const updated = { ...keyValuePairs, [newKey.trim()]: newValue.trim() }
      onUpdate('keyValuePairs', updated)
      setNewKey('')
      setNewValue('')
      setIsAdding(false)
    }
  }

  const handleDeleteKeyValue = (key: string) => {
    const updated = { ...keyValuePairs }
    delete updated[key]
    onUpdate('keyValuePairs', updated)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ai-chat-model" className="block text-sm font-medium text-gray-700 mb-1">
          Model <span className="text-red-500">*</span>
        </label>
        <select
          id="ai-chat-model"
          value={(data.model as string) || 'gpt-4o'}
          onChange={(e) => onUpdate('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {CHAT_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </div>

      {/* Key-Value Pairs Section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Key-Value Pairs
          </label>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Define key-value pairs for this node. Reference them in the prompt using <code className="bg-gray-100 px-1 rounded">$node.key</code>
        </p>

        {/* Add New Key-Value Form */}
        {isAdding && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key"
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              />
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Value"
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddKeyValue}
                className="px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAdding(false)
                  setNewKey('')
                  setNewValue('')
                }}
                className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Key-Value List */}
        {keyValueEntries.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-xs border border-gray-200 rounded-md bg-gray-50">
            No key-value pairs defined
          </div>
        ) : (
          <div className="space-y-2">
            {keyValueEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-700 font-mono">{key}</div>
                  <div className="text-xs text-gray-600 font-mono truncate">{value}</div>
                </div>
                <button
                  onClick={() => handleDeleteKeyValue(key)}
                  className="p-1 hover:bg-red-100 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="ai-chat-system-prompt" className="block text-sm font-medium text-gray-700 mb-1">
          System Prompt
        </label>
        <textarea
          id="ai-chat-system-prompt"
          value={(data.systemPrompt as string) || ''}
          onChange={(e) => onUpdate('systemPrompt', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Enter system instructions (optional). You can use $json.property, $env.VARIABLE_NAME, or $node.key to reference values."
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional: Define the assistant's behavior and role
        </p>
      </div>

      <div>
        <label htmlFor="ai-chat-user-prompt" className="block text-sm font-medium text-gray-700 mb-1">
          User Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          id="ai-chat-user-prompt"
          value={(data.prompt as string) || ''}
          onChange={(e) => onUpdate('prompt', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Enter your prompt here. You can use $json.property, $env.VARIABLE_NAME, or $node.key to reference values."
        />
        <p className="text-xs text-gray-500 mt-1">
          Use <code className="bg-gray-100 px-1 rounded">$json.property</code>, <code className="bg-gray-100 px-1 rounded">$env.VARIABLE_NAME</code>, or <code className="bg-gray-100 px-1 rounded">$node.key</code> to reference values
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label htmlFor="ai-chat-return-full" className="block text-sm font-medium text-gray-700 mb-1">
              Return Full Response
            </label>
            <p className="text-xs text-gray-500">
              When enabled, returns the complete API response. When disabled, returns only the content field.
            </p>
          </div>
          <div className="ml-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="ai-chat-return-full"
                type="checkbox"
                checked={(data.returnFullResponse as boolean) ?? false}
                onChange={(e) => onUpdate('returnFullResponse', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Requires OpenAI API key. Configure it in workflow settings or environment variables using <code className="bg-yellow-100 px-1 rounded">$env.OPENAI_API_KEY</code>.
        </p>
      </div>
    </div>
  )
}

