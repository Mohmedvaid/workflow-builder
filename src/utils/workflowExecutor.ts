import type { Workflow, WorkflowNode, WorkflowEdge } from '@/types'

interface ExecutionContext {
  nodeOutputs: Map<string, unknown>
  errors: Array<{ nodeId: string; error: string }>
}

interface ExecutionStore {
  startExecution: () => void
  stopExecution: () => void
  setCurrentNode: (nodeId: string | null) => void
  setNodeInput: (nodeId: string, input: unknown) => void
  setNodeOutput: (nodeId: string, output: unknown) => void
}

/**
 * Executes a workflow starting from trigger nodes
 */
export async function executeWorkflow(
  workflow: Workflow,
  executionStore?: ExecutionStore
): Promise<ExecutionContext> {
  const context: ExecutionContext = {
    nodeOutputs: new Map(),
    errors: [],
  }

  if (executionStore) {
    executionStore.startExecution()
  }

  // Find all trigger nodes (nodes with no incoming edges)
  const triggerNodes = workflow.nodes.filter(
    (node) => !workflow.edges.some((edge) => edge.target === node.id)
  )

  if (triggerNodes.length === 0) {
    if (executionStore) {
      executionStore.stopExecution()
    }
    context.errors.push({ nodeId: '', error: 'No trigger nodes found in workflow' })
    return context
  }

  try {
    // Execute each trigger node and follow the workflow
    for (const triggerNode of triggerNodes) {
      await executeNode(triggerNode, workflow, context, null, executionStore)
    }
  } finally {
    if (executionStore) {
      executionStore.stopExecution()
    }
  }

  return context
}

/**
 * Executes a single node
 */
async function executeNode(
  node: WorkflowNode,
  workflow: Workflow,
  context: ExecutionContext,
  input: unknown,
  executionStore?: ExecutionStore
): Promise<unknown> {
  try {
    // Set current node and input for visual feedback
    if (executionStore) {
      executionStore.setCurrentNode(node.id)
      executionStore.setNodeInput(node.id, input)
    }

    // Small delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300))

    let output: unknown = null

    switch (node.type) {
      case 'trigger':
        output = await executeTriggerNode(node, input)
        break
      case 'action':
        output = await executeActionNode(node, input)
        break
      case 'condition':
        output = await executeConditionNode(node, input)
        break
      case 'transform':
        output = await executeTransformNode(node, input)
        break
      case 'api-call':
        output = await executeApiCallNode(node, input)
        break
      case 'run-js':
        output = await executeRunJSNode(node, input)
        break
      case 'write-file':
        output = await executeWriteFileNode(node, input)
        break
      case 'read-file':
        output = await executeReadFileNode(node, input)
        break
      case 'ai-model':
        output = await executeAIModelNode(node, input)
        break
      default:
        output = input
    }

    context.nodeOutputs.set(node.id, output)

    // Set output for visual feedback
    if (executionStore) {
      executionStore.setNodeOutput(node.id, output)
    }

    // Execute connected nodes
    const outgoingEdges = workflow.edges.filter((edge) => edge.source === node.id)
    for (const edge of outgoingEdges) {
      const targetNode = workflow.nodes.find((n) => n.id === edge.target)
      if (targetNode) {
        await executeNode(targetNode, workflow, context, output, executionStore)
      }
    }

    return output
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    context.errors.push({ nodeId: node.id, error: errorMessage })
    if (executionStore) {
      executionStore.setNodeOutput(node.id, { error: errorMessage })
    }
    return null
  }
}

async function executeTriggerNode(node: WorkflowNode, _input: unknown): Promise<unknown> {
  return { triggered: true, timestamp: new Date().toISOString(), data: node.data }
}

async function executeActionNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  return { ...(input as object), action: node.data.label || 'Action executed' }
}

async function executeConditionNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  // Simple condition evaluation - in real implementation, this would evaluate the condition
  const condition = (node.data.condition as string) || 'true'
  try {
    // Simple evaluation - in production, use a proper expression evaluator
    const result = eval(`(${condition})`)
    return { condition: result, input }
  } catch {
    return { condition: true, input }
  }
}

async function executeTransformNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  return { transformed: true, original: input, transform: node.data.label }
}

async function executeApiCallNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const url = (node.data.url as string) || ''
  const method = (node.data.method as string) || 'GET'
  const headers = parseJSON((node.data.headers as string) || '{}', {})
  const body = node.data.body as string | undefined

  if (!url) {
    throw new Error('API URL is required')
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? body : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json().catch(() => response.text())
    return { success: true, status: response.status, data }
  } catch (error) {
    throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function executeRunJSNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const code = (node.data.code as string) || ''

  if (!code.trim()) {
    throw new Error('JavaScript code is required')
  }

  try {
    // Create a safe execution context
    const func = new Function('input', code)
    const result = func(input)
    return result
  } catch (error) {
    throw new Error(`JavaScript execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function executeWriteFileNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const filePath = (node.data.filePath as string) || ''
  const content = (node.data.content as string) || JSON.stringify(input, null, 2)

  if (!filePath) {
    throw new Error('File path is required')
  }

  // In browser, we can only download files, not write to arbitrary paths
  // This is a limitation of browser security
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filePath.split('/').pop() || 'file.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return { success: true, filePath, message: 'File downloaded (browser limitation)' }
}

async function executeReadFileNode(node: WorkflowNode, _input: unknown): Promise<unknown> {
  const filePath = (node.data.filePath as string) || ''

  if (!filePath) {
    throw new Error('File path is required')
  }

  // Browser security prevents reading arbitrary files
  // In a real implementation, this would require user file input
  throw new Error(
    'File reading is not supported in browser. Use a file input node or server-side execution.'
  )
}

async function executeAIModelNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const model = (node.data.model as string) || 'gpt-3.5-turbo'
  const prompt = (node.data.prompt as string) || ''
  const temperature = (node.data.temperature as number) ?? 0.7
  const maxTokens = (node.data.maxTokens as number) ?? 1000

  if (!prompt) {
    throw new Error('Prompt is required')
  }

  // Replace {{input}} placeholder with actual input data
  const processedPrompt = prompt.replace(/\{\{input\}\}/g, JSON.stringify(input))

  // Note: This is a placeholder. In production, you would call the actual AI API
  // This requires API keys and proper authentication
  return {
    success: false,
    message: 'AI model execution requires API configuration. This is a placeholder response.',
    model,
    prompt: processedPrompt,
    temperature,
    maxTokens,
  }
}

/**
 * Helper function to parse JSON safely
 */
function parseJSON<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}
