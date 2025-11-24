interface RunJSConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

export default function RunJSConfig({ data, onUpdate }: RunJSConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="js-code" className="block text-sm font-medium text-gray-700 mb-1">
          JavaScript Code <span className="text-red-500">*</span>
        </label>
        <textarea
          id="js-code"
          value={(data.code as string) || ''}
          onChange={(e) => onUpdate('code', e.target.value)}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-xs"
          placeholder="// Your JavaScript code here&#10;// Access input data via 'input' variable&#10;// Return result with 'return' statement&#10;&#10;const result = input.data;&#10;return { data: result };"
        />
        <p className="text-xs text-gray-500 mt-1">
          Code will have access to <code className="bg-gray-100 px-1 rounded">input</code> variable
          from previous nodes
        </p>
      </div>
    </div>
  )
}
