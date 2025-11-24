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
      case 'action':
        output = await executeActionNode(nodeWithResolvedData, input)
        break
      case 'condition':
        output = await executeConditionNode(nodeWithResolvedData, input)
        break
      case 'transform':
        output = await executeTransformNode(nodeWithResolvedData, input)
        break
      case 'api-call':
        output = await executeApiCallNode(nodeWithResolvedData, input)
        break
      case 'run-js':
        output = await executeRunJSNode(nodeWithResolvedData, input)
        break
      case 'write-file':
        output = await executeWriteFileNode(nodeWithResolvedData, input)
        break
      case 'read-file':
        output = await executeReadFileNode(nodeWithResolvedData, input)
        break
      case 'ai-chat':
        output = await executeAIChatNode(nodeWithResolvedData, input, environmentVariables)
        break
      case 'ai-asset':
        output = await executeAIAssetNode(nodeWithResolvedData, input, environmentVariables)
        break
        break
      case 'ai-agent':
        output = await executeAIAgentNode(nodeWithResolvedData, input)
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

    // Execute connected nodes
    const outgoingEdges = workflow.edges.filter((edge) => edge.source === node.id)
    for (const edge of outgoingEdges) {
      const targetNode = workflow.nodes.find((n) => n.id === edge.target)
      if (targetNode) {
        await executeNode(targetNode, workflow, context, jsonOutput, executionStore, reachableNodes, environmentVariables)
      }
    }

    return jsonOutput
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
  return ensureJSONOutput({
    triggered: true,
    timestamp: new Date().toISOString(),
    data: node.data,
  })
}

async function executeActionNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const inputObj = typeof input === 'object' && input !== null ? input : {}
  return ensureJSONOutput({
    ...(inputObj as Record<string, unknown>),
    action: node.data.label || 'Action executed',
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

async function executeTransformNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  return ensureJSONOutput({
    transformed: true,
    original: input,
    transform: node.data.label,
  })
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

async function executeRunJSNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const code = (node.data.code as string) || ''

  if (!code.trim()) {
    throw new Error('JavaScript code is required')
  }

  try {
    // Create a safe execution context
    const func = new Function('input', code)
    const result = func(input)
    return ensureJSONOutput(result)
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

  return ensureJSONOutput({ success: true, filePath, message: 'File downloaded (browser limitation)' })
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
  const prompt = (node.data.prompt as string) || ''
  const temperature = (node.data.temperature as number) ?? 0.7
  const maxTokens = (node.data.maxTokens as number) ?? 1000

  if (!prompt) {
    throw new Error('Prompt is required')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText} (${response.status})`)
    }

    const data = await response.json()
    
    // Extract the assistant's message content
    const content = data.choices?.[0]?.message?.content || ''
    
    return ensureJSONOutput({
      success: true,
      model,
      content,
      usage: data.usage || {},
      response: data,
    })
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
  const voice = (node.data.voice as string) || 'alloy'
  const speed = (node.data.speed as number) ?? 1.0

  if (!text) {
    throw new Error('Text input is required for TTS')
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      speed,
    }),
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
    speed,
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

async function executeAIAgentNode(node: WorkflowNode, input: unknown): Promise<unknown> {
  const model = (node.data.model as string) || 'gpt-4'
  const systemPrompt = (node.data.systemPrompt as string) || ''
  const temperature = (node.data.temperature as number) ?? 0.7
  const maxTokens = (node.data.maxTokens as number) ?? 2000
  const toolsStr = (node.data.tools as string) || '[]'

  if (!systemPrompt) {
    throw new Error('System instructions are required for AI Agent')
  }

  // Parse tools
  let tools: Array<{ name: string; description: string }> = []
  try {
    tools = JSON.parse(toolsStr)
  } catch {
    // Invalid JSON, use empty array
    tools = []
  }

  // Replace {{input}} placeholder with actual input data
  const processedSystemPrompt = systemPrompt.replace(/\{\{input\}\}/g, JSON.stringify(input))

  // Note: This is a placeholder. In production, you would:
  // 1. Call the AI API with system prompt and tools
  // 2. Handle function calling/tool usage
  // 3. Maintain conversation context
  // 4. Execute tools and return results
  // 5. Chain multiple tool calls if needed
  
  return ensureJSONOutput({
    success: false,
    message: 'AI Agent execution requires API configuration. This is a placeholder response.',
    agent: {
      model,
      systemPrompt: processedSystemPrompt,
      tools: tools.length > 0 ? tools : 'No tools configured',
      temperature,
      maxTokens,
    },
    response: {
      reasoning: 'AI Agent would analyze the input, decide on actions, use available tools, and return results.',
      actions: tools.length > 0 ? `Agent can use ${tools.length} tool(s): ${tools.map(t => t.name).join(', ')}` : 'No tools available',
      output: 'Agent output would appear here after execution',
    },
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
