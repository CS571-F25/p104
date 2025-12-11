import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CurvedEdge from './CurvedEdge';
import CustomNode from './CustomNode';

const edgeTypes = {
  curved: CurvedEdge,
};

const nodeTypes = {
  custom: CustomNode,
};

export default function GraphWrapper({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  translateExtent
}) {
  return (
    <div style={{ flex: 1, height: '100%', background: 'white', border: '1px solid #e0e0e0' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        style={{ background: 'white' }}
        connectionLineType="default"
        defaultEdgeOptions={{
          type: 'curved',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          },
        }}
        edgesFocusable={true}
        edgesUpdatable={false}
        nodesDraggable={false}
        minZoom={0.1}
        maxZoom={2}
        translateExtent={translateExtent}
        panOnDrag={true}
        preventScrolling={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
      >
        <Background color="#e0e0e0" gap={16} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor="#000"
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable={true}
          zoomable={true}
          style={{
            width: 120,
            height: 80,
          }}
        />
      </ReactFlow>
    </div>
  );
}
