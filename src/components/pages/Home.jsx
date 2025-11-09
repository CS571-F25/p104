import { useState } from 'react';
import TopNavBar from '../TopNavBar';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Dagre from '@dagrejs/dagre';

// Auto-layout function using Dagre
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new Dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  Dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 150 / 2,
      y: nodeWithPosition.y - 50 / 2,
    };
  });

  return { nodes, edges };
};

// Tag structure definition - Requirements
const requirementsStructure = {
  id: 'requirements',
  label: 'Requirements',
  children: [
    { id: 'basic-computer-sciences', label: 'Basic Computer Sciences' },
    { id: 'basic-calculus', label: 'Basic Calculus' },
    {
      id: 'additional-mathematics',
      label: 'Additional Mathematics',
      children: [
        { id: 'linear-algebra', label: 'Linear Algebra' },
        { id: 'probability-statistics', label: 'Probability or Statistics' },
      ]
    },
    {
      id: 'advanced-cs-courses',
      label: 'Advanced Computer Science Courses',
      children: [
        { id: 'theory-cs', label: 'Theory of Computer Science' },
        { id: 'software-hardware', label: 'Software & Hardware' },
        { id: 'applications', label: 'Applications' },
        { id: 'electives', label: 'Electives' },
      ]
    },
  ]
};

// Tag structure definition - Areas
const areasStructure = {
  id: 'areas',
  label: 'Areas',
  children: [
    {
      id: 'ai',
      label: 'AI',
      children: [
        { id: 'artificial-intelligence', label: 'Artificial intelligence' },
        { id: 'computer-vision', label: 'Computer vision' },
        { id: 'machine-learning', label: 'Machine learning' },
        { id: 'natural-language-processing', label: 'Natural language processing' },
        { id: 'web-information-retrieval', label: 'The Web & information retrieval' },
      ]
    },
    {
      id: 'systems',
      label: 'Systems',
      children: [
        { id: 'computer-architecture', label: 'Computer architecture' },
        { id: 'computer-networks', label: 'Computer networks' },
        { id: 'computer-security', label: 'Computer security' },
        { id: 'databases', label: 'Databases' },
        { id: 'design-automation', label: 'Design automation' },
        { id: 'embedded-realtime-systems', label: 'Embedded & real-time systems' },
        { id: 'high-performance-computing', label: 'High-performance computing' },
        { id: 'mobile-computing', label: 'Mobile computing' },
        { id: 'measurement-perf-analysis', label: 'Measurement & perf. analysis' },
        { id: 'operating-systems', label: 'Operating systems' },
        { id: 'programming-languages', label: 'Programming languages' },
        { id: 'software-engineering', label: 'Software engineering' },
      ]
    },
    {
      id: 'theory',
      label: 'Theory',
      children: [
        { id: 'algorithms-complexity', label: 'Algorithms & complexity' },
        { id: 'cryptography', label: 'Cryptography' },
        { id: 'logic-verification', label: 'Logic & verification' },
      ]
    },
    {
      id: 'interdisciplinary',
      label: 'Interdisciplinary Areas',
      children: [
        { id: 'comp-bio-bioinformatics', label: 'Comp. bio & bioinformatics' },
        { id: 'computer-graphics', label: 'Computer graphics' },
        { id: 'cs-education', label: 'Computer science education' },
        { id: 'economics-computation', label: 'Economics & computation' },
        { id: 'human-computer-interaction', label: 'Human-computer interaction' },
        { id: 'robotics', label: 'Robotics' },
        { id: 'visualization', label: 'Visualization' },
      ]
    }
  ]
};

export default function Home(props) {
  // Define course nodes
  const initialNodes = [];

  // Define prerequisite edges
  const initialEdges = [];

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // State for active tab
  const [activeTab, setActiveTab] = useState('requirements');

  // State for tag checkboxes
  const [checkedTags, setCheckedTags] = useState({});

  // Helper function to get all descendant IDs
  const getAllDescendantIds = (node) => {
    let ids = [node.id];
    if (node.children) {
      node.children.forEach(child => {
        ids = ids.concat(getAllDescendantIds(child));
      });
    }
    return ids;
  };

  // Handle checkbox change
  const handleTagChange = (tagId, node) => {
    setCheckedTags(prev => {
      const newChecked = { ...prev };
      const isCurrentlyChecked = prev[tagId];
      
      // Get all descendant IDs (including the node itself)
      const allIds = getAllDescendantIds(node);
      
      if (!isCurrentlyChecked) {
        // Checking: check this node and all descendants
        allIds.forEach(id => {
          newChecked[id] = true;
        });
      } else {
        // Unchecking: uncheck this node and all descendants
        allIds.forEach(id => {
          newChecked[id] = false;
        });
      }
      
      return newChecked;
    });
  };

  // Recursive function to render tag checkboxes
  const renderTagCheckbox = (node, level = 0) => {
    const isChecked = checkedTags[node.id] || false;
    const indent = level * 20;

    return (
      <div key={node.id}>
        <div style={{ marginLeft: `${indent}px`, marginBottom: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: level === 0 ? '16px' : level === 1 ? '14px' : '13px', fontWeight: level < 2 ? 'bold' : 'normal' }}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleTagChange(node.id, node)}
              style={{ marginRight: '8px' }}
            />
            {node.label}
          </label>
        </div>
        {node.children && node.children.map(child => renderTagCheckbox(child, level + 1))}
      </div>
    );
  };

  return (
    <div>
      <TopNavBar />
      <div style={{ display: 'flex', height: '700px' }}>
        {/* Left sidebar for tags */}
        <div style={{ 
          width: '300px', 
          background: '#f5f5f5', 
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tab buttons */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '2px solid #ddd',
            background: '#fff'
          }}>
            <button
              onClick={() => setActiveTab('requirements')}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                background: activeTab === 'requirements' ? '#f5f5f5' : '#fff',
                borderBottom: activeTab === 'requirements' ? '3px solid black' : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'requirements' ? 'bold' : 'normal'
              }}
            >
              By Requirements
            </button>
            <button
              onClick={() => setActiveTab('areas')}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                background: activeTab === 'areas' ? '#f5f5f5' : '#fff',
                borderBottom: activeTab === 'areas' ? '3px solid black' : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'areas' ? 'bold' : 'normal'
              }}
              title="This categorization is based on csrankings.org"
            >
              By Areas<sup style={{ fontSize: '9px', marginLeft: '2px' }}>?</sup>
            </button>
          </div>

          {/* Tag content */}
          <div style={{ 
            padding: '20px',
            overflowY: 'auto',
            flex: 1
          }}>
            {activeTab === 'requirements' && requirementsStructure.children.map(child => renderTagCheckbox(child, 0))}
            {activeTab === 'areas' && areasStructure.children.map(child => renderTagCheckbox(child, 0))}
          </div>
        </div>
        
        {/* Right content area for ReactFlow */}
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            style={{ background: 'white' }}
          >
            <Background color="#e0e0e0" gap={16} />
            <Controls />
            <MiniMap 
              nodeColor="#000"
              maskColor="rgba(0, 0, 0, 0.1)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}