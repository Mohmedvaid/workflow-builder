import { Download, Upload, FileText, Trash2 } from 'lucide-react'
import { useWorkflowStore } from '@/store/workflowStore'
import { downloadWorkflow, readWorkflowFile } from '@/utils/workflowUtils'
import { useRef } from 'react'

export default function Header() {
  const { exportWorkflow, importWorkflow, clearWorkflow, workflowName, setWorkflowName } =
    useWorkflowStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const workflow = exportWorkflow()
    downloadWorkflow(workflow)
  }

  const handleLoad = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const workflow = await readWorkflowFile(file)
        importWorkflow(workflow)
      } catch (error) {
        alert('Failed to load workflow: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the workflow? This action cannot be undone.')) {
      clearWorkflow()
    }
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800">Workflow Builder</h1>
        </div>
        <div className="h-6 w-px bg-gray-300" />
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Workflow name"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleLoad}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Load
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </header>
  )
}
