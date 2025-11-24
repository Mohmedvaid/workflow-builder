import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import WorkflowCanvas from './WorkflowCanvas'
import WorkflowSettings from './WorkflowSettings'
import LeftSidebar from './LeftSidebar'
import FloatingAddButton from './FloatingAddButton'
import type { NodeType } from '@/types'

interface LayoutProps {
  onNodeTypeSelect?: (type: NodeType) => void
  onBackToHome?: () => void
  currentWorkflowId: string | null
}

export default function Layout({ onNodeTypeSelect, onBackToHome, currentWorkflowId }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleNodeSelect = (type: NodeType) => {
    onNodeTypeSelect?.(type)
    setIsSidebarOpen(false) // Close sidebar after selecting a node
  }

  return (
    <div className="h-screen flex flex-col relative">
      <LeftSidebar
        onHome={onBackToHome || (() => {})}
        onSettings={() => setIsSettingsOpen(true)}
        currentWorkflowId={currentWorkflowId}
        onToggle={(isOpen) => setIsLeftSidebarOpen(isOpen)}
      />
      <div
        className="flex flex-col transition-all duration-300 flex-1"
        style={{ marginLeft: isLeftSidebarOpen ? '192px' : '64px' }}
      >
        <Header />
        <div className="flex-1 flex overflow-hidden relative">
          <WorkflowCanvas />
          {isSidebarOpen && (
            <div className="absolute right-0 top-0 bottom-0 z-20">
              <Sidebar onNodeTypeSelect={handleNodeSelect} />
            </div>
          )}
          <FloatingAddButton onClick={handleToggleSidebar} />
          <WorkflowSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
      </div>
    </div>
  )
}
