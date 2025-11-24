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

    const newNode: Node = {
      id: generateNodeId(type),
      type: type,
      position: { x, y },
      data: {
        type: type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      },
    }

    addNode(newNode)
  }

  return <Layout onNodeTypeSelect={handleNodeTypeSelect} />
}

export default App
