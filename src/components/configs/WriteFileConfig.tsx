interface WriteFileConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

export default function WriteFileConfig({ data, onUpdate }: WriteFileConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="file-path" className="block text-sm font-medium text-gray-700 mb-1">
          File Path <span className="text-red-500">*</span>
        </label>
        <input
          id="file-path"
          type="text"
          value={(data.filePath as string) || ''}
          onChange={(e) => onUpdate('filePath', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          placeholder="/path/to/file.txt"
        />
        <p className="text-xs text-gray-500 mt-1">
          Note: File operations run in browser (limited by browser security)
        </p>
      </div>

      <div>
        <label htmlFor="file-content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="file-content"
          value={(data.content as string) || ''}
          onChange={(e) => onUpdate('content', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-xs"
          placeholder="File content to write. Leave empty to use data from previous node."
        />
        <p className="text-xs text-gray-500 mt-1">
          If empty, will use data from connected input node
        </p>
      </div>
    </div>
  )
}
