import { useState } from 'react'

interface FileConfigProps {
  data: Record<string, unknown>
  onUpdate: (field: string, value: unknown) => void
}

const FILE_EXTENSIONS = [
  { value: '', label: 'No extension' },
  { value: '.txt', label: '.txt - Text' },
  { value: '.json', label: '.json - JSON' },
  { value: '.csv', label: '.csv - CSV' },
  { value: '.xml', label: '.xml - XML' },
  { value: '.yaml', label: '.yaml - YAML' },
  { value: '.yml', label: '.yml - YAML' },
  { value: '.md', label: '.md - Markdown' },
  { value: '.html', label: '.html - HTML' },
  { value: '.css', label: '.css - CSS' },
  { value: '.js', label: '.js - JavaScript' },
  { value: '.ts', label: '.ts - TypeScript' },
  { value: '.py', label: '.py - Python' },
  { value: '.java', label: '.java - Java' },
  { value: '.cpp', label: '.cpp - C++' },
  { value: '.c', label: '.c - C' },
  { value: '.log', label: '.log - Log' },
  { value: '.conf', label: '.conf - Config' },
  { value: '.ini', label: '.ini - INI' },
  { value: '.env', label: '.env - Environment' },
]

function validateFilePath(path: string): { valid: boolean; error?: string } {
  if (!path.trim()) {
    return { valid: false, error: 'File path is required' }
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f]/
  if (invalidChars.test(path)) {
    return { valid: false, error: 'File path contains invalid characters' }
  }

  // Check for path traversal attempts
  if (path.includes('..')) {
    return { valid: false, error: 'Path traversal (..) is not allowed' }
  }

  // Check for absolute paths (in browser, we typically want relative or just filename)
  if (path.startsWith('/') && path.length > 1 && !path.startsWith('/tmp/')) {
    return { valid: false, error: 'Absolute paths are not recommended in browser environment' }
  }

  return { valid: true }
}

export default function FileConfig({ data, onUpdate }: FileConfigProps) {
  const operation = (data.operation as 'read' | 'write') || 'read'
  const filePath = (data.filePath as string) || ''
  const extension = (data.extension as string) || ''
  const [pathError, setPathError] = useState<string | null>(null)

  const handlePathChange = (newPath: string) => {
    const validation = validateFilePath(newPath)
    if (!validation.valid) {
      setPathError(validation.error || 'Invalid file path')
    } else {
      setPathError(null)
    }
    onUpdate('filePath', newPath)
  }

  const handleExtensionChange = (newExtension: string) => {
    onUpdate('extension', newExtension)
    // If file path doesn't end with the extension, append it
    if (newExtension && filePath && !filePath.endsWith(newExtension)) {
      // Remove old extension if it exists
      const pathWithoutExt = filePath.replace(/\.[^/.]+$/, '')
      onUpdate('filePath', pathWithoutExt + newExtension)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="file-operation" className="block text-sm font-medium text-gray-700 mb-1">
          Operation <span className="text-red-500">*</span>
        </label>
        <select
          id="file-operation"
          value={operation}
          onChange={(e) => onUpdate('operation', e.target.value as 'read' | 'write')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="read">Read File</option>
          <option value="write">Write File</option>
        </select>
      </div>

      <div>
        <label htmlFor="file-extension" className="block text-sm font-medium text-gray-700 mb-1">
          File Extension
        </label>
        <select
          id="file-extension"
          value={extension}
          onChange={(e) => handleExtensionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {FILE_EXTENSIONS.map((ext) => (
            <option key={ext.value} value={ext.value}>
              {ext.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Select file extension. The extension will be appended to the file path if not already present.
        </p>
      </div>

      <div>
        <label htmlFor="file-path" className="block text-sm font-medium text-gray-700 mb-1">
          File Path <span className="text-red-500">*</span>
        </label>
        <input
          id="file-path"
          type="text"
          value={filePath}
          onChange={(e) => handlePathChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm ${
            pathError ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder={operation === 'read' ? '/path/to/file.txt' : 'filename.txt'}
        />
        {pathError && (
          <p className="text-xs text-red-600 mt-1">{pathError}</p>
        )}
        {!pathError && (
          <p className="text-xs text-gray-500 mt-1">
            {operation === 'read'
              ? 'Path to the file to read. Use $json.property for dynamic paths.'
              : 'File name or path. Will be downloaded in browser. Use $json.property for dynamic paths.'}
          </p>
        )}
      </div>

      {operation === 'write' && (
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
            placeholder="File content to write. Leave empty to use data from previous node. Use $json.property, $env.VARIABLE_NAME, or $node.key"
          />
          <p className="text-xs text-gray-500 mt-1">
            If empty, will use data from connected input node
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Browser security restrictions limit file operations. 
          {operation === 'read'
            ? ' File reading requires user file input or server-side execution.'
            : ' File writing will trigger a download in the browser.'}
        </p>
      </div>
    </div>
  )
}

