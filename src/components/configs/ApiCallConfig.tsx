interface ApiCallConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

export default function ApiCallConfig({ data, onUpdate }: ApiCallConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-1">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          id="api-url"
          type="url"
          value={(data.url as string) || ''}
          onChange={(e) => onUpdate('url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          placeholder="https://api.example.com/endpoint"
        />
      </div>

      <div>
        <label htmlFor="api-method" className="block text-sm font-medium text-gray-700 mb-1">
          HTTP Method
        </label>
        <select
          id="api-method"
          value={(data.method as string) || 'GET'}
          onChange={(e) => onUpdate('method', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div>
        <label htmlFor="api-headers" className="block text-sm font-medium text-gray-700 mb-1">
          Headers (JSON)
        </label>
        <textarea
          id="api-headers"
          value={(data.headers as string) || '{}'}
          onChange={(e) => {
            try {
              JSON.parse(e.target.value)
              onUpdate('headers', e.target.value)
            } catch {
              onUpdate('headers', e.target.value)
            }
          }}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-xs"
          placeholder='{"Authorization": "Bearer token"}'
        />
        <p className="text-xs text-gray-500 mt-1">Enter valid JSON object</p>
      </div>

      {(data.method === 'POST' || data.method === 'PUT' || data.method === 'PATCH') && (
        <div>
          <label htmlFor="api-body" className="block text-sm font-medium text-gray-700 mb-1">
            Request Body
          </label>
          <textarea
            id="api-body"
            value={(data.body as string) || ''}
            onChange={(e) => onUpdate('body', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-xs"
            placeholder="Request body (JSON or text)"
          />
        </div>
      )}
    </div>
  )
}
