import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

export default function Documentation() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-orange-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">How to Use Workflow Builder</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 py-4 border-t border-orange-100 bg-orange-50/30">
          <div className="space-y-6 text-gray-700">
            {/* Getting Started */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">Getting Started</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                <li>Click "Create New Workflow" to start building</li>
                <li>Click the <span className="font-mono bg-white px-1 rounded">+</span> icon in the top right to add nodes</li>
                <li>Connect nodes by dragging from the right handle of one node to the left handle of another</li>
                <li>Double-click any node to configure it and view input/output data</li>
                <li>Click "Run" in the header to execute your workflow</li>
              </ol>
            </section>

            {/* Node Types */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">Node Types</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong className="text-orange-600">Trigger:</strong> Start point of your workflow (required, only one per workflow)
                </li>
                <li>
                  <strong className="text-orange-600">Condition:</strong> Branch your workflow based on conditions
                </li>
                <li>
                  <strong className="text-orange-600">API Call:</strong> Make HTTP requests to external APIs
                </li>
                <li>
                  <strong className="text-orange-600">Run JavaScript:</strong> Execute custom JavaScript code
                </li>
                <li>
                  <strong className="text-orange-600">File:</strong> Read or write files (browser download for writes)
                </li>
                <li>
                  <strong className="text-orange-600">AI Chat:</strong> Interact with OpenAI chat models (GPT-4, GPT-5, etc.)
                </li>
                <li>
                  <strong className="text-orange-600">AI Asset:</strong> Generate TTS, STT, images, videos, or embeddings
                </li>
              </ul>
            </section>

            {/* Data References */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">Data References</h4>
              <p className="text-sm mb-2">Access data from previous nodes, environment variables, or node-specific key-value pairs:</p>
              <ul className="space-y-2 text-sm ml-4">
                <li>
                  <code className="bg-white px-2 py-1 rounded text-orange-600">$json.property</code> - Access output from previous node
                </li>
                <li>
                  <code className="bg-white px-2 py-1 rounded text-orange-600">$env.VARIABLE_NAME</code> - Access environment variables
                </li>
                <li>
                  <code className="bg-white px-2 py-1 rounded text-orange-600">$node.key</code> - Access node-specific key-value pairs
                </li>
              </ul>
              <p className="text-sm mt-2 text-gray-600">
                Example: <code className="bg-white px-2 py-1 rounded">$json.data.name</code> or <code className="bg-white px-2 py-1 rounded">$env.API_KEY</code>
              </p>
            </section>

            {/* Node Actions */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">Node Actions</h4>
              <p className="text-sm mb-2">Each node has three action icons in the top-right corner:</p>
              <ul className="space-y-2 text-sm ml-4">
                <li>
                  <strong>▶ Play:</strong> Execute only this node (useful for testing)
                </li>
                <li>
                  <strong>⚡ Power:</strong> Enable/disable node (disabled nodes are bypassed during execution)
                </li>
                <li>
                  <strong>🗑️ Trash:</strong> Delete the node
                </li>
              </ul>
            </section>

            {/* Environment Variables */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">Environment Variables</h4>
              <p className="text-sm">
                Access Settings from the left sidebar to manage environment variables. These are stored in memory only 
                and cleared on page reload for security. Use them to store API keys and other sensitive data.
              </p>
            </section>

            {/* Tips */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">Tips & Best Practices</h4>
              <ul className="space-y-2 text-sm ml-4 list-disc">
                <li>Workflows are limited to 50 nodes and 5 workflows total</li>
                <li>Always start with a Trigger node</li>
                <li>Use Condition nodes to create branching logic</li>
                <li>Save your workflow frequently (auto-saves every 2 seconds)</li>
                <li>Double-click nodes to view execution data and configure settings</li>
                <li>Workflows execute only nodes connected to the trigger node</li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

