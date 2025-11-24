import Layout from './components/Layout'
import type { NodeType } from '@/types'

function App() {
  const handleNodeTypeSelect = (type: NodeType) => {
    // This will be implemented when we add React Flow
    console.log('Node type selected:', type)
  }

  return <Layout onNodeTypeSelect={handleNodeTypeSelect} />
}

export default App
