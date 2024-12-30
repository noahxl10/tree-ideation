import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import ThoughtNode from '@/components/ThoughtNode';
import { useEffect } from 'react';
import type { SelectThought } from '@db/schema';

interface ThoughtFlowProps {
  thoughts: SelectThought[];
  onNodeSelect: (id: string | null) => void;
  selectedNode: string | null;
  onDeleteThought: (id: string) => void;
}

const nodeTypes = {
  thought: ThoughtNode,
};

export default function ThoughtFlow({ thoughts, onNodeSelect, selectedNode, onDeleteThought }: ThoughtFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!thoughts) return;

    const newNodes: Node[] = thoughts.map((thought) => ({
      id: thought.id.toString(),
      type: 'thought',
      position: thought.position as { x: number; y: number },
      data: { 
        content: thought.content,
        response: thought.response,
        isSelected: thought.id.toString() === selectedNode,
        onDelete: () => onDeleteThought(thought.id.toString()),
      },
    }));

    const newEdges: Edge[] = thoughts
      .filter((thought) => thought.parentId)
      .map((thought) => ({
        id: `e${thought.parentId}-${thought.id}`,
        source: thought.parentId!.toString(),
        target: thought.id.toString(),
        type: 'smoothstep',
        animated: true,
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [thoughts, selectedNode, onDeleteThought]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={(_, node) => onNodeSelect(node.id)}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}