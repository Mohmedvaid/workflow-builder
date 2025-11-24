import Header from './Header'
import Sidebar from './Sidebar'
import WorkflowCanvas from './WorkflowCanvas'
import type { NodeType } from '@/types'

interface LayoutProps {
  onNodeTypeSelect?: (type: NodeType) => void
}

export default function Layout({ onNodeTypeSelect }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onNodeTypeSelect={onNodeTypeSelect} />
        <WorkflowCanvas />
      </div>
    </div>
  )
}
