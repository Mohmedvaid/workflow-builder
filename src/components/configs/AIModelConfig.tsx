interface AIModelConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

export default function AIModelConfig({ data, onUpdate }: AIModelConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ai-model" className="block text-sm font-medium text-gray-700 mb-1">
          Model <span className="text-red-500">*</span>
        </label>
        <select
          id="ai-model"
          value={(data.model as string) || 'gpt-3.5-turbo'}
          onChange={(e) => onUpdate('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="claude-3-haiku">Claude 3 Haiku</option>
        </select>
      </div>

      <div>
        <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">
          Prompt <span className="text-red-500">*</span>
        </label>
        <textarea
          id="ai-prompt"
          value={(data.prompt as string) || ''}
          onChange={(e) => onUpdate('prompt', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          placeholder="Enter your prompt here. You can use {{input}} to reference data from previous nodes."
        />
        <p className="text-xs text-gray-500 mt-1">
          Use <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code> to reference data
          from previous nodes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ai-temperature" className="block text-sm font-medium text-gray-700 mb-1">
            Temperature
          </label>
          <input
            id="ai-temperature"
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={(data.temperature as number) ?? 0.7}
            onChange={(e) => onUpdate('temperature', parseFloat(e.target.value) || 0.7)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">0.0 - 2.0 (default: 0.7)</p>
        </div>

        <div>
          <label htmlFor="ai-max-tokens" className="block text-sm font-medium text-gray-700 mb-1">
            Max Tokens
          </label>
          <input
            id="ai-max-tokens"
            type="number"
            min="1"
            max="4096"
            value={(data.maxTokens as number) ?? 1000}
            onChange={(e) => onUpdate('maxTokens', parseInt(e.target.value) || 1000)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">1 - 4096 (default: 1000)</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> AI model calls require API keys. Configure your API keys in the
          workflow settings or environment variables.
        </p>
      </div>
    </div>
  )
}
