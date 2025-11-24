import type { Workflow } from '@/types'

/**
 * Downloads a workflow as a JSON file
 */
export const downloadWorkflow = (workflow: Workflow, filename?: string): void => {
  const dataStr = JSON.stringify(workflow, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${workflow.name || 'workflow'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Reads a workflow from a JSON file
 */
export const readWorkflowFile = (file: File): Promise<Workflow> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const workflow = JSON.parse(content) as Workflow
        resolve(workflow)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Generates a unique node ID
 */
export const generateNodeId = (type: string): string => {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validates a workflow structure
 */
export const validateWorkflow = (workflow: unknown): workflow is Workflow => {
  if (typeof workflow !== 'object' || workflow === null) return false
  
  const w = workflow as Record<string, unknown>
  return (
    typeof w.name === 'string' &&
    Array.isArray(w.nodes) &&
    Array.isArray(w.edges)
  )
}
