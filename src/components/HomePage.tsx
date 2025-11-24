import { Plus, Trash2, FileText, Clock, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useWorkflowsStore } from '@/store/workflowsStore'
import WelcomePopup from './WelcomePopup'
import Documentation from './Documentation'

interface HomePageProps {
  onCreateNew: () => void
  onOpenWorkflow: (id: string) => void
}

export default function HomePage({ onCreateNew, onOpenWorkflow }: HomePageProps) {
  const { workflows, deleteWorkflow } = useWorkflowsStore()
  const [showWelcome, setShowWelcome] = useState(true)

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {showWelcome && <WelcomePopup onClose={() => setShowWelcome(false)} />}
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Workflow Builder
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">Create powerful automation workflows in your browser</p>
              </div>
            </div>
            <button
              onClick={onCreateNew}
              disabled={workflows.length >= 5}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:shadow-orange-200"
            >
              <Plus className="w-5 h-5" />
              Create New Workflow
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Documentation Section */}
        <Documentation />

        {/* Workflows Section */}
        {workflows.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-orange-100 shadow-sm">
            <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileText className="w-14 h-14 text-orange-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No workflows yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Get started by creating your first workflow</p>
            <button
              onClick={onCreateNew}
              disabled={workflows.length >= 5}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-6 h-6" />
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Workflows <span className="text-orange-600">({workflows.length}/5)</span>
              </h2>
              {workflows.length >= 5 && (
                <div className="text-sm text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 font-medium">
                  ⚠️ Maximum 5 workflows reached
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  onClick={() => onOpenWorkflow(workflow.id)}
                  className="bg-white rounded-xl border-2 border-orange-100 p-6 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group backdrop-blur-sm bg-white/90"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate mb-2 group-hover:text-orange-600 transition-colors">
                        {workflow.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Updated {formatDate(workflow.updatedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, workflow.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="font-semibold text-gray-700">{workflow.workflow.nodes.length}</span>
                      <span className="text-gray-500">nodes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                      <span className="font-semibold text-gray-700">{workflow.workflow.edges.length}</span>
                      <span className="text-gray-500">connections</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
