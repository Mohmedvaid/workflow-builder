import { useCallback, useMemo, useState, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useWorkflowStore } from '@/store/workflowStore'
import BaseNode from './nodes/BaseNode'
import ApiCallNode from './nodes/ApiCallNode'
import RunJSNode from './nodes/RunJSNode'
import WriteFileNode from './nodes/WriteFileNode'
import ReadFileNode from './nodes/ReadFileNode'
import AIModelNode from './nodes/AIModelNode'
import NodeConfigPanel from './NodeConfigPanel'

const nodeTypes = {
  default: BaseNode,
  trigger: BaseNode,
  action: BaseNode,
  condition: BaseNode,
  transform: BaseNode,
  'api-call': ApiCallNode,
  'run-js': RunJSNode,
  'write-file': WriteFileNode,
  'read-file': ReadFileNode,
  'ai-model': AIModelNode,
}

export default function WorkflowCanvas() {
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Close config panel if selected node is being deleted
      const isSelectedNodeDeleted = changes.some(
        (change) => change.type === 'remove' && change.id === selectedNode?.id
      )
      if (isSelectedNodeDeleted) {
        setSelectedNode(null)
      }
      setNodes(applyNodeChanges(changes, nodes))
    },
    [nodes, setNodes, selectedNode]
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, edges))
    },
    [edges, setEdges]
  )

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        // Prevent connecting a node to itself
        if (connection.source === connection.target) {
          return
        }
        setEdges(addEdge(connection, edges))
      }
    },
    [edges, setEdges]
  )

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 1 }), [])

  const defaultEdgeOptions = useMemo(
    () => ({
      style: { strokeWidth: 2, stroke: '#6b7280' },
      type: 'smoothstep',
      animated: false,
    }),
    []
  )

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Sync selected node with store when nodes update
  useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find((n) => n.id === selectedNode.id)
      if (updatedNode) {
        setSelectedNode(updatedNode)
      }
    }
  }, [nodes, selectedNode?.id])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultViewport={defaultViewport}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        attributionPosition="bottom-left"
        connectionLineStyle={{ strokeWidth: 2, stroke: '#6b7280' }}
      >
        <Background color="#e5e7eb" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node: Node) => {
            const type = (node.data as { type?: string })?.type || 'action'
            const colors: Record<string, string> = {
              trigger: '#10b981',
              action: '#3b82f6',
              condition: '#eab308',
              transform: '#a855f7',
              'api-call': '#6366f1',
              'run-js': '#f59e0b',
              'write-file': '#14b8a6',
              'read-file': '#06b6d4',
              'ai-model': '#ec4899',
            }
            return colors[type] || '#6b7280'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
      {selectedNode && (
        <NodeConfigPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  )
}