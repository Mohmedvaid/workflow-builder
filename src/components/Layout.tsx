import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import WorkflowCanvas from './WorkflowCanvas'
import type { NodeType } from '@/types'

interface LayoutProps {
  onNodeTypeSelect?: (type: NodeType) => void
}

export default function Layout({ onNodeTypeSelect }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleNodeSelect = (type: NodeType) => {
    onNodeTypeSelect?.(type)
    setIsSidebarOpen(false) // Close sidebar after selecting a node
  }

  return (
    <div className="h-screen flex flex-col">
      <Header onToggleNodePalette={handleToggleSidebar} />
      <div className="flex-1 flex overflow-hidden relative">
        <WorkflowCanvas />
        {isSidebarOpen && (
          <div className="absolute right-0 top-0 bottom-0 z-20">
            <Sidebar onNodeTypeSelect={handleNodeSelect} />
          </div>
        )}
      </div>
    </div>
  )
}
