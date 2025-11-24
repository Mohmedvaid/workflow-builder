interface AIAgentConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

export default function AIAgentConfig({ data, onUpdate }: AIAgentConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ai-agent-model" className="block text-sm font-medium text-gray-700 mb-1">
          Model <span className="text-red-500">*</span>
        </label>
        <select
          id="ai-agent-model"
          value={(data.model as string) || 'gpt-4'}
          onChange={(e) => onUpdate('model', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="claude-3-haiku">Claude 3 Haiku</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Recommended: GPT-4 or Claude 3 Opus for agent tasks</p>
      </div>

      <div>
        <label htmlFor="ai-agent-system-prompt" className="block text-sm font-medium text-gray-700 mb-1">
          System Instructions <span className="text-red-500">*</span>
        </label>
        <textarea
          id="ai-agent-system-prompt"
          value={(data.systemPrompt as string) || ''}
          onChange={(e) => onUpdate('systemPrompt', e.target.value)}
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
          placeholder="You are an AI agent that can make decisions and take actions. Define your role, capabilities, and how you should behave."
        />
        <p className="text-xs text-gray-500 mt-1">
          Define the agent's role, behavior, and decision-making criteria. Use <code className="bg-gray-100 px-1 rounded">{'{{input}}'}</code> to reference data from previous nodes.
        </p>
      </div>

      <div>
        <label htmlFor="ai-agent-tools" className="block text-sm font-medium text-gray-700 mb-1">
          Available Tools (JSON)
        </label>
        <textarea
          id="ai-agent-tools"
          value={(data.tools as string) || '[]'}
          onChange={(e) => {
            try {
              JSON.parse(e.target.value)
              onUpdate('tools', e.target.value)
            } catch {
              onUpdate('tools', e.target.value)
            }
          }}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-xs"
          placeholder='[{"name": "search", "description": "Search the web"}, {"name": "calculate", "description": "Perform calculations"}]'
        />
        <p className="text-xs text-gray-500 mt-1">
          Define tools/functions the agent can use. Format: Array of objects with "name" and "description"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ai-agent-temperature" className="block text-sm font-medium text-gray-700 mb-1">
            Temperature
          </label>
          <input
            id="ai-agent-temperature"
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
          <label htmlFor="ai-agent-max-tokens" className="block text-sm font-medium text-gray-700 mb-1">
            Max Tokens
          </label>
          <input
            id="ai-agent-max-tokens"
            type="number"
            min="1"
            max="4096"
            value={(data.maxTokens as number) ?? 2000}
            onChange={(e) => onUpdate('maxTokens', parseInt(e.target.value) || 2000)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">1 - 4096 (default: 2000)</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-800">
          <strong>AI Agent:</strong> This node creates an autonomous agent that can make decisions, use tools, and take actions based on the system instructions. The agent maintains conversation context and can chain multiple operations.
        </p>
      </div>
    </div>
  )
}

