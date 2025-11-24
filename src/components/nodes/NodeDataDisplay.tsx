import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'

interface NodeDataDisplayProps {
  input?: unknown
  output?: unknown
  isRunning?: boolean
}

export default function NodeDataDisplay({ input, output, isRunning }: NodeDataDisplayProps) {
  const [showInput, setShowInput] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  const formatData = (data: unknown): string => {
    if (data === null || data === undefined) return 'No data'
    if (typeof data === 'string') return data.length > 100 ? data.substring(0, 100) + '...' : data
    try {
      const json = JSON.stringify(data, null, 2)
      return json.length > 200 ? json.substring(0, 200) + '...' : json
    } catch {
      return String(data)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Input Data (Left) */}
      {input !== undefined && (
        <div className="flex-1 relative">
          <button
            onClick={() => setShowInput(!showInput)}
            className={`w-full text-left px-2 py-1 text-xs rounded border transition-colors ${
              showInput
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" />
              <span className="font-medium">Input</span>
            </div>
          </button>
          {showInput && (
            <div className="absolute left-0 top-full mt-1 z-20 w-64 bg-white border border-gray-300 rounded-md shadow-lg p-2 max-h-48 overflow-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {formatData(input)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Running Indicator */}
      {isRunning && (
        <div className="flex items-center justify-center w-6 h-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Output Data (Right) */}
      {output !== undefined && (
        <div className="flex-1 relative">
          <button
            onClick={() => setShowOutput(!showOutput)}
            className={`w-full text-left px-2 py-1 text-xs rounded border transition-colors ${
              showOutput
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="font-medium">Output</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>
          {showOutput && (
            <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white border border-gray-300 rounded-md shadow-lg p-2 max-h-48 overflow-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {formatData(output)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
