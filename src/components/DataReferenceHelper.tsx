import { Info, X } from 'lucide-react'

interface DataReferenceHelperProps {
  onDismiss?: () => void
}

export default function DataReferenceHelper({ onDismiss }: DataReferenceHelperProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 relative">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-blue-100 rounded-md transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3 text-blue-600" />
        </button>
      )}
      <div className="flex items-start gap-2 pr-6">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-800">
          <p className="font-medium mb-1">Use data from previous nodes:</p>
          <p className="font-mono">$json.property</p>
          <p className="mt-1 text-blue-700">
            Example: <span className="font-mono">$json.data.name</span>
          </p>
          <p className="mt-2 font-medium">Use environment variables:</p>
          <p className="font-mono">$env.VARIABLE_NAME</p>
          <p className="mt-1 text-blue-700">
            Example: <span className="font-mono">$env.API_KEY</span>
          </p>
        </div>
      </div>
    </div>
  )
}

