import type { Workflow } from '@/types'
import { generateNodeId } from './workflowUtils'

/**
 * Creates a demo workflow with trigger, API call, and JS nodes
 */
export function createDemoWorkflow(): Workflow {
  const triggerId = generateNodeId('trigger')
  const apiCallId = generateNodeId('api-call')
  const jsNodeId = generateNodeId('run-js')

  return {
    name: 'Demo Workflow',
    nodes: [
      {
        id: triggerId,
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: 'Start',
          type: 'trigger',
          description: 'Workflow trigger - execution starts here',
        },
      },
      {
        id: apiCallId,
        type: 'api-call',
        position: { x: 350, y: 200 },
        data: {
          label: 'Fetch Data',
          type: 'api-call',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          method: 'GET',
          headers: '{}',
          body: '',
        },
      },
      {
        id: jsNodeId,
        type: 'run-js',
        position: { x: 600, y: 200 },
        data: {
          label: 'Process Data',
          type: 'run-js',
          code: `// Access data from the API call node
const apiData = $json;

// Process the data
const result = {
  title: apiData.title || 'No title',
  body: apiData.body || 'No body',
  processed: true,
  timestamp: new Date().toISOString()
};

return result;`,
        },
      },
    ],
    edges: [
      {
        id: `edge-${triggerId}-${apiCallId}`,
        source: triggerId,
        target: apiCallId,
      },
      {
        id: `edge-${apiCallId}-${jsNodeId}`,
        source: apiCallId,
        target: jsNodeId,
      },
    ],
    timeout: { hours: 1, minutes: 0 },
    updatedAt: new Date().toISOString(),
  }
}

