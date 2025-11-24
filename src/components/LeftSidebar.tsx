import { useState } from 'react'
import { Home, Trash2, Settings, Save, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { useWorkflowsStore } from '@/store/workflowsStore'
import { downloadWorkflow } from '@/utils/workflowUtils'

interface LeftSidebarProps {
  onHome: () => void
  onSettings: () => void
  currentWorkflowId: string | null
  onToggle?: (isOpen: boolean) => void
}

export default function LeftSidebar({ onHome, onSettings, currentWorkflowId, onToggle }: LeftSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }
  const { exportWorkflow, clearWorkflow, workflowName } = useWorkflowStore()
  const { updateWorkflow } = useWorkflowsStore()

  const handleSave = () => {
    if (!currentWorkflowId) {
      alert('No workflow to save')
      return
    }
    const workflow = exportWorkflow()
    updateWorkflow(currentWorkflowId, workflow)
    alert('Workflow saved successfully!')
  }

  const handleDownload = () => {
    const workflow = exportWorkflow()
    downloadWorkflow(workflow)
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the workflow? This action cannot be undone.')) {
      clearWorkflow()
    }
  }

  const menuItems = [
    {
      icon: Home,
      label: 'Home',
      onClick: onHome,
      color: 'text-gray-700 hover:bg-gray-100',
    },
    {
      icon: Save,
      label: 'Save',
      onClick: handleSave,
      color: 'text-blue-700 hover:bg-blue-50',
      disabled: !currentWorkflowId,
    },
    {
      icon: Download,
      label: 'Download',
      onClick: handleDownload,
      color: 'text-green-700 hover:bg-green-50',
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onSettings,
      color: 'text-purple-700 hover:bg-purple-50',
    },
    {
      icon: Trash2,
      label: 'Clear',
      onClick: handleClear,
      color: 'text-red-700 hover:bg-red-50',
    },
  ]

  return (
    <div
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 shadow-lg z-30 transition-all duration-300 ${
        isOpen ? 'w-48' : 'w-16'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Menu Items */}
      <div className="flex flex-col pt-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              onClick={item.onClick}
              disabled={item.disabled}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                item.color
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
                isOpen ? 'justify-start' : 'justify-center'
              }`}
              title={isOpen ? undefined : item.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
