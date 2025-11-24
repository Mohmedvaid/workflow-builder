import Layout from './components/Layout'
import { useWorkflowStore } from './store/workflowStore'
import { generateNodeId } from './utils/workflowUtils'
import type { NodeType } from '@/types'
import type { Node } from 'reactflow'

function App() {
  const { addNode, nodes } = useWorkflowStore()

  const handleNodeTypeSelect = (type: NodeType) => {
    // Calculate position for new node (center of canvas with some offset based on existing nodes)
    const nodeCount = nodes.length
    const x = 250 + (nodeCount % 5) * 50
    const y = 100 + Math.floor(nodeCount / 5) * 100

    // Generate label based on node type
    const getLabel = (nodeType: NodeType): string => {
      const labels: Record<NodeType, string> = {
        trigger: 'Trigger',
        action: 'Action',
        condition: 'Condition',
        transform: 'Transform',
        'api-call': 'API Call',
        'run-js': 'Run JavaScript',
        'write-file': 'Write File',
        'read-file': 'Read File',
        'ai-model': 'AI Model',
      }
      return labels[nodeType] || 'Node'
    }

    const newNode: Node = {
      id: generateNodeId(type),
      type: type,
      position: { x, y },
      data: {
        type: type,
        label: getLabel(type),
      },
    }

    addNode(newNode)
  }

  return <Layout onNodeTypeSelect={handleNodeTypeSelect} />
}

export default App
