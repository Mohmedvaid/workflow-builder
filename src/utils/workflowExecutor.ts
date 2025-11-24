import type { Workflow, WorkflowNode, WorkflowEdge } from '@/types'
import { resolveDataReferences, ensureJSONOutput } from './dataReference'
import { useEnvironmentStore } from '@/store/environmentStore'

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
  setNodeError: (nodeId: string, error: string | null) => void
}

/**
 * Executes a workflow starting from the trigger node
 * Only executes nodes connected to the trigger node
 */
export async function executeWorkflow(
  workflow: Workflow,
  executionStore?: ExecutionStore,
  workflowId?: string | null
): Promise<ExecutionContext> {
  const context: ExecutionContext = {
    nodeOutputs: new Map(),
    errors: [],
  }

  if (executionStore) {
    executionStore.startExecution()
  }

  // Find the trigger node (must be type 'trigger')
  const triggerNode = workflow.nodes.find((node) => node.type === 'trigger')

  if (!triggerNode) {
    if (executionStore) {
      executionStore.stopExecution()
    }
    context.errors.push({ nodeId: '', error: 'No trigger node found in workflow. A workflow must have exactly one trigger node.' })
    return context
  }

  try {
    // Get environment variables for this workflow
    const envVars = workflowId ? useEnvironmentStore.getState().getAllVariables(workflowId) : {}
    
    // Build a graph of reachable nodes from the trigger
    const reachableNodes = getReachableNodes(triggerNode.id, workflow)
    
    // Execute starting from the trigger node
    // Only nodes in reachableNodes will be executed
    await executeNode(triggerNode, workflow, context, null, executionStore, reachableNodes, envVars)
  } finally {
    if (executionStore) {
      executionStore.stopExecution()
    }
  }

  return context
}

/**
 * Executes a single node by ID
 * Used for individual node execution from the UI
 */
export async function executeSingleNode(
  nodeId: string,
  workflow: Workflow,
  environmentVariables: Record<string, string>,
  executionStore: ExecutionStore,
  executionHistoryStore: {
    startExecution: (name: string) => string
    saveNodeData: (nodeId: string, input?: unknown, output?: unknown) => void
    finishExecution: () => void
  }
): Promise<void> {
  const node = workflow.nodes.find((n) => n.id === nodeId)
  if (!node) {
    throw new Error(`Node with id ${nodeId} not found`)
  }

  // Skip if node is disabled
  if (node.data.disabled === true) {
    return
  }

  // Get input from previous node if connected
  const incomingEdges = workflow.edges.filter((edge) => edge.target === nodeId)
  let input: unknown = null
  if (incomingEdges.length > 0) {
    // For single node execution, we'll use null input
    // In a real scenario, you might want to execute the chain up to this node
    input = null
  }

  const context: ExecutionContext = {
    nodeOutputs: new Map(),
    errors: [],
  }

  try {
    executionStore.startExecution()
    const executionId = executionHistoryStore.startExecution(workflow.name)

    // Track execution data
    let currentExecutionData: Record<string, { input?: unknown; output?: unknown }> = {}

    // Create a wrapper execution store that also saves to history
    const wrappedExecutionStore: ExecutionStore = {
      ...executionStore,
      setNodeInput: (nodeId: string, input: unknown) => {
        executionStore.setNodeInput(nodeId, input)
        const existingOutput = currentExecutionData[nodeId]?.output
        executionHistoryStore.saveNodeData(nodeId, input, existingOutput)
        currentExecutionData[nodeId] = { ...currentExecutionData[nodeId], input }
      },
      setNodeOutput: (nodeId: string, output: unknown) => {
        executionStore.setNodeOutput(nodeId, output)
        const existingInput = currentExecutionData[nodeId]?.input
        executionHistoryStore.saveNodeData(nodeId, existingInput, output)
        currentExecutionData[nodeId] = { ...currentExecutionData[nodeId], output }
      },
    }

    // Execute just this node (don't execute connected nodes)
    await executeNode(node, workflow, context, input, wrappedExecutionStore, undefined, environmentVariables)

    executionHistoryStore.finishExecution()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    executionStore.setNodeError(nodeId, errorMessage)
    throw error
  } finally {
    executionStore.stopExecution()
  }
}

/**
 * Gets all nodes reachable from a starting node using BFS
 * This ensures we only execute nodes connected to the trigger
 */
function getReachableNodes(startNodeId: string, workflow: Workflow): Set<string> {
  const reachable = new Set<string>()
  const queue: string[] = [startNodeId]
  
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!
    if (reachable.has(currentNodeId)) {
      continue
    }
    
    reachable.add(currentNodeId)
    
    // Find all nodes connected from this node
    const outgoingEdges = workflow.edges.filter((edge) => edge.source === currentNodeId)
    for (const edge of outgoingEdges) {
      if (!reachable.has(edge.target)) {
        queue.push(edge.target)
      }
    }
  }
  
  return reachable
}

/**
 * Executes a single node
 */
async function executeNode(
  node: WorkflowNode,
  workflow: Workflow,
  context: ExecutionContext,
  input: unknown,
  executionStore?: ExecutionStore,
  reachableNodes?: Set<string>,
  environmentVariables?: Record<string, string>
): Promise<unknown> {
  // Skip nodes that are not reachable from the trigger
  if (reachableNodes && !reachableNodes.has(node.id)) {
    return null
  }

  // Skip disabled nodes
  if (node.data.disabled === true) {
    // Pass input through to next nodes
    if (executionStore) {
      executionStore.setNodeOutput(node.id, input)
    }
    context.nodeOutputs.set(node.id, input)
    
    // Still execute connected nodes with the input
    const outgoingEdges = workflow.edges.filter((edge) => edge.source === node.id)
    for (const edge of outgoingEdges) {
      const targetNode = workflow.nodes.find((n) => n.id === edge.target)
      if (targetNode) {
        await executeNode(targetNode, workflow, context, input, executionStore, reachableNodes, environmentVariables)
      }
    }
    return input
  }
  try {
    // Get node-specific key-value pairs
    const nodeKeyValuePairs = (node.data.keyValuePairs as Record<string, string>) || {}
    
    // Resolve data references in node data before execution (including env vars and node key-value pairs)
    const resolvedNodeData = resolveDataReferences(node.data, input, environmentVariables, nodeKeyValuePairs) as WorkflowNode['data']
    const nodeWithResolvedData: WorkflowNode = {
      ...node,
      data: resolvedNodeData,
    }

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
        output = await executeTriggerNode(nodeWithResolvedData, input)
        break
      case 'condition':
        output = await executeConditionNode(nodeWithResolvedData, input)
        break
      case 'api-call':
        output = await executeApiCallNode(nodeWithResolvedData, input)
        break
      case 'run-js':
        // For JS nodes, we need to resolve references in code but pass environment variables
        output = await executeRunJSNode(nodeWithResolvedData, input, environmentVariables)
        break
      case 'file':
        output = await executeFileNode(nodeWithResolvedData, input)
        break
      case 'ai-chat':
        output = await executeAIChatNode(nodeWithResolvedData, input, environmentVariables)
        break
      case 'ai-asset':
        output = await executeAIAssetNode(nodeWithResolvedData, input, environmentVariables)
        break
      default:
        output = input
    }

    // Ensure output is always JSON
    const jsonOutput = ensureJSONOutput(output)
    context.nodeOutputs.set(node.id, jsonOutput)

    // Set output for visual feedback and save to history
    if (executionStore) {
      executionStore.setNodeOutput(node.id, jsonOutput)
    }

    // Execute connected nodes (only if reachableNodes is defined - i.e., in full workflow execution)
    // For single node execution (reachableNodes is undefined), we skip executing connected nodes
    if (reachableNodes !== undefined) {
      const outgoingEdges = workflow.edges.filter((edge) => edge.source === node.id)
      for (const edge of outgoingEdges) {
        const targetNode = workflow.nodes.find((n) => n.id === edge.target)
        if (targetNode && !targetNode.data.disabled) {
          await executeNode(targetNode, workflow, context, jsonOutput, executionStore, reachableNodes, environmentVariables)
        }
      }
    }

    return jsonOutput
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    context.errors.push({ nodeId: node.id, error: errorMessage })
    if (executionStore) {
      executionStore.setNodeError(node.id, errorMessage)
      executionStore.setNodeOutput(node.id, { error: errorMessage })
    }
    return null
  }
}

async function executeTriggerNode(node: WorkflowNode, _input: unknown): Promise<unknown> {
  return ensureJSONOutput({
    triggered: true,
    timestamp: new Date().toISOString(),
    data: node.data,
  })
}

async function executeConditionNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  // Simple condition evaluation - in real implementation, this would evaluate the condition
  const condition = (node.data.condition as string) || 'true'
  try {
    // Simple evaluation - in production, use a proper expression evaluator
    const result = eval(`(${condition})`)
    return ensureJSONOutput({ condition: result, input })
  } catch {
    return ensureJSONOutput({ condition: true, input })
  }
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
    return ensureJSONOutput({ success: true, status: response.status, data })
  } catch (error) {
    throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function executeRunJSNode(
  node: WorkflowNode,
  input: unknown,
  environmentVariables?: Record<string, string>
): Promise<unknown> {
  let code = (node.data.code as string) || ''

  if (!code.trim()) {
    throw new Error('JavaScript code is required')
  }

  try {
    // Resolve data references in the code string, but handle them specially for JavaScript
    // We need to properly escape values when replacing $json references in code
    const jsonPattern = /\$json(\.[a-zA-Z0-9_]+)+/g
    const envPattern = /\$env\.[a-zA-Z0-9_]+/g
    const nodePattern = /\$node\.[a-zA-Z0-9_]+/g
    
    // Replace $json references with proper JavaScript access
    code = code.replace(jsonPattern, (match) => {
      const path = match.replace('$json', '')
      const keys = path.split('.').filter(Boolean)
      
      let value: unknown = input
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = (value as Record<string, unknown>)[key]
        } else {
          return 'undefined'
        }
      }
      
      // Properly escape the value for JavaScript
      if (value === null || value === undefined) {
        return 'null'
      } else if (typeof value === 'string') {
        // Escape the string properly for JavaScript using JSON.stringify
        return JSON.stringify(value)
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
      } else {
        // For objects/arrays, stringify them
        return JSON.stringify(value)
      }
    })
    
    // Replace $env references
    code = code.replace(envPattern, (match) => {
      const varName = match.replace('$env.', '')
      const value = environmentVariables?.[varName]
      if (value === undefined) {
        return 'undefined'
      }
      return JSON.stringify(value)
    })
    
    // Replace $node references (these should be resolved before execution via resolveDataReferences)
    // But if they're still in the code, handle them
    const nodeKeyValuePairs = (node.data.keyValuePairs as Record<string, string>) || {}
    code = code.replace(nodePattern, (match) => {
      const key = match.replace('$node.', '')
      const value = nodeKeyValuePairs[key]
      if (value === undefined) {
        return 'undefined'
      }
      return JSON.stringify(value)
    })
    
    // Create a safe execution context
    const func = new Function('input', code)
    const result = func(input)
    return ensureJSONOutput(result)
  } catch (error) {
    throw new Error(`JavaScript execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function executeFileNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const operation = (node.data.operation as 'read' | 'write') || 'read'
  const filePath = (node.data.filePath as string) || ''
  const extension = (node.data.extension as string) || ''

  if (!filePath) {
    throw new Error('File path is required')
  }

  // Validate file path
  const invalidChars = /[<>:"|?*\x00-\x1f]/
  if (invalidChars.test(filePath)) {
    throw new Error('File path contains invalid characters')
  }

  if (filePath.includes('..')) {
    throw new Error('Path traversal (..) is not allowed')
  }

  // Ensure file path has extension if one is specified
  let finalPath = filePath
  if (extension && !filePath.endsWith(extension)) {
    // Remove any existing extension and add the selected one
    const pathWithoutExt = filePath.replace(/\.[^/.]+$/, '')
    finalPath = pathWithoutExt + extension
  }

  if (operation === 'read') {
    // Browser security prevents reading arbitrary files
    // In a real implementation, this would require user file input
    throw new Error(
      'File reading is not supported in browser. Use a file input node or server-side execution.'
    )
  } else {
    // Write operation - download file in browser
    const content = (node.data.content as string) || JSON.stringify(input, null, 2)

    // Determine MIME type based on extension
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.csv': 'text/csv',
      '.xml': 'application/xml',
      '.yaml': 'text/yaml',
      '.yml': 'text/yaml',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.ts': 'text/typescript',
      '.py': 'text/x-python',
      '.java': 'text/x-java-source',
      '.cpp': 'text/x-c++src',
      '.c': 'text/x-csrc',
      '.log': 'text/plain',
      '.conf': 'text/plain',
      '.ini': 'text/plain',
      '.env': 'text/plain',
    }

    const mimeType = extension ? mimeTypes[extension] || 'text/plain' : 'text/plain'

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = finalPath.split('/').pop() || 'file.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return ensureJSONOutput({
      success: true,
      filePath: finalPath,
      extension,
      operation: 'write',
      message: 'File downloaded (browser limitation)',
    })
  }
}

/**
 * Validates OpenAI API key format
 */
function validateAPIKey(apiKey: string | undefined): boolean {
  if (!apiKey) return false
  // OpenAI API keys start with 'sk-' and are typically 51 characters long
  return apiKey.startsWith('sk-') && apiKey.length >= 20
}

/**
 * Gets OpenAI API key from environment variables
 */
function getOpenAIAPIKey(environmentVariables?: Record<string, string>): string | null {
  const apiKey = environmentVariables?.OPENAI_API_KEY
  if (!apiKey || !validateAPIKey(apiKey)) {
    return null
  }
  return apiKey
}

/**
 * Executes OpenAI Chat Completions API call
 */
async function executeAIChatNode(
  node: WorkflowNode,
  input: unknown,
  environmentVariables?: Record<string, string>
): Promise<unknown> {
  const apiKey = getOpenAIAPIKey(environmentVariables)
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set it in environment variables as $env.OPENAI_API_KEY')
  }

  const model = (node.data.model as string) || 'gpt-4o'
  const userPrompt = (node.data.prompt as string) || ''
  const systemPrompt = (node.data.systemPrompt as string) || ''

  if (!userPrompt) {
    throw new Error('User prompt is required')
  }

  try {
    // Build messages array - include system prompt if provided
    const messages: Array<{ role: string; content: string }> = []
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      })
    }
    messages.push({
      role: 'user',
      content: userPrompt,
    })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText} (${response.status})`)
    }

    const data = await response.json()
    
    // Extract the assistant's message content
    const content = data.choices?.[0]?.message?.content || ''
    
    // Check if user wants full response or just content
    const returnFullResponse = (node.data.returnFullResponse as boolean) ?? false
    
    if (returnFullResponse) {
      // Return the full response object
      return ensureJSONOutput({
        success: true,
        model,
        content,
        usage: data.usage || {},
        response: data,
      })
    } else {
      // Return only the content field
      return ensureJSONOutput({
        content,
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to call OpenAI API: ${String(error)}`)
  }
}

/**
 * Executes OpenAI Asset Generation API calls (TTS, STT, Images, Video, Embeddings)
 */
async function executeAIAssetNode(
  node: WorkflowNode,
  input: unknown,
  environmentVariables?: Record<string, string>
): Promise<unknown> {
  const apiKey = getOpenAIAPIKey(environmentVariables)
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Set it in environment variables as $env.OPENAI_API_KEY')
  }

  const assetType = (node.data.assetType as 'tts' | 'stt' | 'image' | 'video' | 'embedding') || 'image'
  const model = (node.data.model as string) || ''

  if (!model) {
    throw new Error('Model is required')
  }

  try {
    switch (assetType) {
      case 'tts':
        return await executeTTS(node, apiKey, input)
      case 'stt':
        return await executeSTT(node, apiKey, input)
      case 'image':
        return await executeImageGeneration(node, apiKey, input)
      case 'video':
        return await executeVideoGeneration(node, apiKey, input)
      case 'embedding':
        return await executeEmbedding(node, apiKey, input)
      default:
        throw new Error(`Unsupported asset type: ${assetType}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Failed to execute AI asset node: ${String(error)}`)
  }
}

/**
 * Executes Text-to-Speech API call
 */
async function executeTTS(node: WorkflowNode, apiKey: string, input: unknown): Promise<unknown> {
  const model = (node.data.model as string) || 'tts-1'
  const text = (node.data.input as string) || ''
  const voice = (node.data.voice as string) || 'default'
  const format = (node.data.format as string) || undefined
  const speed = (node.data.speed as string) ? parseFloat(node.data.speed as string) : undefined
  const emotion = (node.data.emotion as string) || undefined

  if (!text) {
    throw new Error('Text input is required for TTS')
  }

  const payload: Record<string, unknown> = {
    model,
    input: text,
    voice,
  }

  // Add optional parameters only if they are set
  if (format) {
    payload.response_format = format
  }
  if (speed !== undefined) {
    payload.speed = speed
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`OpenAI TTS API error: ${errorData.error?.message || response.statusText} (${response.status})`)
  }

  // TTS returns audio data as blob
  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)

  return ensureJSONOutput({
    success: true,
    model,
    audioUrl,
    voice,
    format: format || 'mp3',
    speed: speed || 1.0,
    emotion: emotion || 'neutral',
    text,
  })
}

/**
 * Executes Speech-to-Text API call
 */
async function executeSTT(node: WorkflowNode, apiKey: string, input: unknown): Promise<unknown> {
  const model = (node.data.model as string) || 'whisper-1'
  const audioUrl = (node.data.audioUrl as string) || ''
  const language = (node.data.language as string) || undefined

  if (!audioUrl) {
    throw new Error('Audio URL is required for STT')
  }

  // Fetch the audio file
  const audioResponse = await fetch(audioUrl)
  if (!audioResponse.ok) {
    throw new Error(`Failed to fetch audio file: ${audioResponse.statusText}`)
  }

  const audioBlob = await audioResponse.blob()
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.mp3')
  formData.append('model', model)
  if (language) {
    formData.append('language', language)
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`OpenAI STT API error: ${errorData.error?.message || response.statusText} (${response.status})`)
  }

  const data = await response.json()

  return ensureJSONOutput({
    success: true,
    model,
    text: data.text || '',
    language: data.language,
    response: data,
  })
}

/**
 * Executes Image Generation API call
 */
async function executeImageGeneration(node: WorkflowNode, apiKey: string, input: unknown): Promise<unknown> {
  const model = (node.data.model as string) || 'dall-e-2'
  const prompt = (node.data.prompt as string) || ''
  const size = (node.data.size as string) || '1024x1024'
  const quality = (node.data.quality as string) || 'standard'
  const n = (node.data.n as number) ?? 1

  if (!prompt) {
    throw new Error('Prompt is required for image generation')
  }

  const payload: Record<string, unknown> = {
    model,
    prompt,
    n,
    size,
  }

  // Only include quality for dall-e-3 models
  if (model.includes('dall-e-3') || model.includes('gpt-image')) {
    payload.quality = quality
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`OpenAI Image API error: ${errorData.error?.message || response.statusText} (${response.status})`)
  }

  const data = await response.json()

  return ensureJSONOutput({
    success: true,
    model,
    images: data.data || [],
    prompt,
    size,
    quality,
  })
}

/**
 * Executes Video Generation API call (Sora)
 */
async function executeVideoGeneration(node: WorkflowNode, apiKey: string, input: unknown): Promise<unknown> {
  const model = (node.data.model as string) || 'sora-2'
  const prompt = (node.data.prompt as string) || ''
  const duration = (node.data.duration as number) ?? 10

  if (!prompt) {
    throw new Error('Prompt is required for video generation')
  }

  const response = await fetch('https://api.openai.com/v1/videos/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      duration,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`OpenAI Video API error: ${errorData.error?.message || response.statusText} (${response.status})`)
  }

  const data = await response.json()

  return ensureJSONOutput({
    success: true,
    model,
    video: data.data?.[0] || {},
    prompt,
    duration,
  })
}

/**
 * Executes Embedding API call
 */
async function executeEmbedding(node: WorkflowNode, apiKey: string, input: unknown): Promise<unknown> {
  const model = (node.data.model as string) || 'text-embedding-3-small'
  const text = (node.data.input as string) || ''
  const dimensions = (node.data.dimensions as number) || undefined

  if (!text) {
    throw new Error('Text input is required for embeddings')
  }

  const payload: Record<string, unknown> = {
    model,
    input: text,
  }

  if (dimensions) {
    payload.dimensions = dimensions
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`OpenAI Embedding API error: ${errorData.error?.message || response.statusText} (${response.status})`)
  }

  const data = await response.json()

  return ensureJSONOutput({
    success: true,
    model,
    embedding: data.data?.[0]?.embedding || [],
    usage: data.usage || {},
  })
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
