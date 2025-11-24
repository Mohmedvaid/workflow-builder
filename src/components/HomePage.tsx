import { Plus, Trash2, FileText, Clock } from 'lucide-react'
import { useWorkflowsStore } from '@/store/workflowsStore'

interface HomePageProps {
  onCreateNew: () => void
  onOpenWorkflow: (id: string) => void
}

export default function HomePage({ onCreateNew, onOpenWorkflow }: HomePageProps) {
  const { workflows, deleteWorkflow } = useWorkflowsStore()

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Workflow Builder</h1>
                <p className="text-sm text-gray-500">Create and manage your workflows</p>
              </div>
            </div>
            <button
              onClick={onCreateNew}
              disabled={workflows.length >= 5}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Create New Workflow
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {workflows.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No workflows yet</h2>
            <p className="text-gray-600 mb-8">Get started by creating your first workflow</p>
            <button
              onClick={onCreateNew}
              disabled={workflows.length >= 5}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Create Your First Workflow
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Your Workflows ({workflows.length}/{5})
              </h2>
              {workflows.length >= 5 && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200">
                  Maximum 5 workflows reached
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  onClick={() => onOpenWorkflow(workflow.id)}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                        {workflow.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Updated {formatDate(workflow.updatedAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, workflow.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{workflow.workflow.nodes.length}</span> nodes
                    </div>
                    <div>
                      <span className="font-medium">{workflow.workflow.edges.length}</span> connections
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
