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
} from 'lucide-react'
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
]

interface SidebarProps {
  onNodeTypeSelect?: (type: NodeType) => void
}

export default function Sidebar({ onNodeTypeSelect }: SidebarProps) {
  const basicNodes = nodeTypes.filter((n) => n.category === 'basic')
  const advancedNodes = nodeTypes.filter((n) => n.category === 'advanced')

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Node Palette
        </h2>

        {/* Basic Nodes */}
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

        {/* Advanced Nodes */}
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
      </div>

      <div className="p-4 border-t border-gray-200 mt-4">
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
