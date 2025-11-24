/**
 * Resolves data references in strings like $json.property, $env.VARIABLE_NAME, or $node.key
 * Supports accessing data from the current input, environment variables, and node key-value pairs
 */
export function resolveDataReference(
  reference: string,
  inputData: unknown,
  environmentVariables?: Record<string, string>,
  nodeKeyValuePairs?: Record<string, string>
): unknown {
  if (typeof reference !== 'string') {
    return reference
  }

  // Check if the string contains a data reference ($json, $env, or $node)
  const jsonPattern = /\$json(\.[a-zA-Z0-9_]+)+/g
  const envPattern = /\$env\.[a-zA-Z0-9_]+/g
  const nodePattern = /\$node\.[a-zA-Z0-9_]+/g
  const jsonMatches = reference.match(jsonPattern) || []
  const envMatches = reference.match(envPattern) || []
  const nodeMatches = reference.match(nodePattern) || []
  const matches = [...jsonMatches, ...envMatches, ...nodeMatches]

  if (matches.length === 0) {
    return reference
  }

  // If the entire string is just a single reference (possibly with whitespace), return the value directly
  const trimmedRef = reference.trim()
  if (matches.length === 1 && trimmedRef === matches[0]) {
    // Check if it's a node key-value pair
    if (trimmedRef.startsWith('$node.')) {
      const key = trimmedRef.replace('$node.', '')
      return nodeKeyValuePairs?.[key] || undefined
    }
    
    // Check if it's an env variable
    if (trimmedRef.startsWith('$env.')) {
      const varName = trimmedRef.replace('$env.', '')
      return environmentVariables?.[varName] || undefined
    }
    
    // Otherwise it's a JSON reference
    const path = trimmedRef.replace('$json', '')
    const keys = path.split('.').filter(Boolean)
    
    let value: unknown = inputData
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key]
      } else {
        return undefined
      }
    }
    return value
  }

  // Otherwise, replace references within the string
  let resolved = reference
  for (const match of matches) {
    let value: unknown = undefined
    
    // Handle node key-value pair references
    if (match.startsWith('$node.')) {
      const key = match.replace('$node.', '')
      value = nodeKeyValuePairs?.[key]
    } else if (match.startsWith('$env.')) {
      // Handle environment variable references
      const varName = match.replace('$env.', '')
      value = environmentVariables?.[varName]
    } else {
      // Handle JSON references
      const path = match.replace('$json', '')
      const keys = path.split('.').filter(Boolean)

      value = inputData
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = (value as Record<string, unknown>)[key]
        } else {
          value = undefined
          break
        }
      }
    }

    if (value !== undefined) {
      // Convert value to string for replacement
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      resolved = resolved.replace(match, stringValue)
    } else {
      // If reference not found, replace with empty string
      resolved = resolved.replace(match, '')
    }
  }

  // Try to parse as JSON if it looks like JSON, otherwise return as string
  try {
    return JSON.parse(resolved)
  } catch {
    return resolved
  }
}

/**
 * Resolves all data references in an object recursively
 */
export function resolveDataReferences(
  data: unknown,
  inputData: unknown,
  environmentVariables?: Record<string, string>,
  nodeKeyValuePairs?: Record<string, string>
): unknown {
  if (data === null || data === undefined) {
    return data
  }

  if (typeof data === 'string') {
    return resolveDataReference(data, inputData, environmentVariables, nodeKeyValuePairs)
  }

  if (Array.isArray(data)) {
    return data.map((item) => resolveDataReferences(item, inputData, environmentVariables, nodeKeyValuePairs))
  }

  if (typeof data === 'object') {
    const resolved: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      resolved[key] = resolveDataReferences(value, inputData, environmentVariables, nodeKeyValuePairs)
    }
    return resolved
  }

  return data
}

/**
 * Ensures output is always JSON-serializable
 */
export function ensureJSONOutput(output: unknown): unknown {
  if (output === null || output === undefined) {
    return null
  }

  // If it's already a plain object or array, return as is
  if (typeof output === 'object' && !(output instanceof Date) && !(output instanceof RegExp)) {
    try {
      // Test if it's JSON serializable
      JSON.stringify(output)
      return output
    } catch {
      // If not serializable, convert to a safe object
      return { value: String(output) }
    }
  }

  // For primitives, wrap in an object
  if (typeof output === 'string' || typeof output === 'number' || typeof output === 'boolean') {
    return { value: output }
  }

  // For other types, convert to string representation
  return { value: String(output) }
}

