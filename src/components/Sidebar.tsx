import {
  Play,
  Settings,
  GitBranch,
  Code,
  Globe,
  Code2,
  FileDown,
  FileUp,
  Brain,
  Bot,
  Search,
  X,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import type { NodeType } from '@/types'

interface NodeTypeItem {
  type: NodeType
  label: string
  icon: React.ReactNode
  color: string
  description: string
  category: 'basic' | 'advanced'
}

const nodeTypes: NodeTypeItem[] = [
  // Basic nodes
  {
    type: 'trigger',
    label: 'Trigger',
    icon: <Play className="w-4 h-4" />,
    color: 'bg-green-500',
    description: 'Start your workflow',
    category: 'basic',
  },
  {
    type: 'action',
    label: 'Action',
    icon: <Settings className="w-4 h-4" />,
    color: 'bg-blue-500',
    description: 'Perform an action',
    category: 'basic',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: <GitBranch className="w-4 h-4" />,
    color: 'bg-yellow-500',
    description: 'Add conditional logic',
    category: 'basic',
  },
  {
    type: 'transform',
    label: 'Transform',
    icon: <Code className="w-4 h-4" />,
    color: 'bg-purple-500',
    description: 'Transform data',
    category: 'basic',
  },
  // Advanced nodes
  {
    type: 'api-call',
    label: 'API Call',
    icon: <Globe className="w-4 h-4" />,
    color: 'bg-indigo-500',
    description: 'Make HTTP requests',
    category: 'advanced',
  },
  {
    type: 'run-js',
    label: 'Run JavaScript',
    icon: <Code2 className="w-4 h-4" />,
    color: 'bg-amber-500',
    description: 'Execute JavaScript code',
    category: 'advanced',
  },
  {
    type: 'write-file',
    label: 'Write File',
    icon: <FileDown className="w-4 h-4" />,
    color: 'bg-teal-500',
    description: 'Write data to file',
    category: 'advanced',
  },
  {
    type: 'read-file',
    label: 'Read File',
    icon: <FileUp className="w-4 h-4" />,
    color: 'bg-cyan-500',
    description: 'Read data from file',
    category: 'advanced',
  },
  {
    type: 'ai-model',
    label: 'AI Model',
    icon: <Brain className="w-4 h-4" />,
    color: 'bg-pink-500',
    description: 'Call AI/LLM models',
    category: 'advanced',
  },
  {
    type: 'ai-agent',
    label: 'AI Agent',
    icon: <Bot className="w-4 h-4" />,
    color: 'bg-violet-500',
    description: 'Autonomous AI agent with tools',
    category: 'advanced',
  },
]

interface SidebarProps {
  onNodeTypeSelect?: (type: NodeType) => void
}

export default function Sidebar({ onNodeTypeSelect }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNodeTypes = useMemo(() => {
    if (!searchQuery.trim()) return nodeTypes
    const query = searchQuery.toLowerCase()
    return nodeTypes.filter(
      (node) =>
        node.label.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        node.type.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const basicNodes = filteredNodeTypes.filter((n) => n.category === 'basic')
  const advancedNodes = filteredNodeTypes.filter((n) => n.category === 'advanced')

  return (
    <aside className="w-80 bg-white border-l border-gray-200 h-full overflow-hidden flex flex-col shadow-xl">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Node Palette
          </h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Basic Nodes */}
        {basicNodes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Basic
            </h3>
            <div className="space-y-2">
              {basicNodes.map((nodeType) => (
              <button
                key={nodeType.type}
                onClick={() => onNodeTypeSelect?.(nodeType.type)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
              >
                <div
                  className={`${nodeType.color} text-white rounded p-1.5 flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  {nodeType.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{nodeType.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{nodeType.description}</div>
                </div>
              </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Nodes */}
        {advancedNodes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Advanced
            </h3>
            <div className="space-y-2">
              {advancedNodes.map((nodeType) => (
              <button
                key={nodeType.type}
                onClick={() => onNodeTypeSelect?.(nodeType.type)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left group"
              >
                <div
                  className={`${nodeType.color} text-white rounded p-1.5 flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  {nodeType.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{nodeType.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{nodeType.description}</div>
                </div>
              </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredNodeTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No nodes found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Tips Footer */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Tips
        </h3>
        <ul className="text-xs text-gray-600 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>Click a node type to add it to the canvas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>Connect nodes by dragging from handles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 mt-0.5">•</span>
            <span>Save your workflow as JSON</span>
          </li>
        </ul>
      </div>
    </aside>
  )
}
