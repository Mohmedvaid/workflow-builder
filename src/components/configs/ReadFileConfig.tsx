interface ReadFileConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

export default function ReadFileConfig({ data, onUpdate }: ReadFileConfigProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="read-file-path" className="block text-sm font-medium text-gray-700 mb-1">
          File Path <span className="text-red-500">*</span>
        </label>
        <input
          id="read-file-path"
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

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Browser security restrictions limit file reading. For production
          use, consider using a file input node or server-side file operations.
        </p>
      </div>
    </div>
  )
}
