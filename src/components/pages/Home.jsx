import { useState, useEffect } from 'react';
import TopNavBar from '../TopNavBar';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  getBezierPath,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom curved edge with enhanced curvature
function CurvedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  // Create a more pronounced curve by adjusting control points
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.5, // Increase curvature for more visible curves
  });
  
  return (
    <path
      id={id}
      style={style}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}

const edgeTypes = {
  curved: CurvedEdge,
};

// Custom node component that hides handles for standalone nodes
function CustomNode({ data, selected }) {
  // Use the isStandalone flag from data prop
  const isStandalone = data.isStandalone === true;
  
  // React Flow applies node.style to the wrapper, so we only need inner content styling
  const innerStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    fontSize: data.style?.fontSize || '12px',
    fontWeight: data.style?.fontWeight || 'bold',
    color: data.style?.color || '#000',
  };
  
  return (
    <div style={innerStyle}>
      {!isStandalone && (
        <>
          <Handle type="target" position={Position.Top} />
          <Handle type="source" position={Position.Bottom} />
        </>
      )}
      <div>{data.label}</div>
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

// Function to create nodes and edges from course data
const createNodesAndEdges = (coursesData, config) => {
  const nodes = [];
  const edges = [];
  
  // Create a map of course codes for quick lookup
  const courseMap = new Map();
  
  coursesData.forEach(course => {
    // Extract the course code properly
    const courseCode = config.extractCourseCode(course.courseCode);
    
    // Only process valid courses with numbers
    if (courseCode) {
      courseMap.set(courseCode, course);
      
      // Create node with enhanced styling
      const nodeStyle = {
        background: '#fff',
        border: '2px solid #555',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontWeight: 'bold',
        width: 100,
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
      
      const node = {
        id: courseCode,
        type: 'custom',
        data: { 
          label: config.formatCourseCodeForDisplay(courseCode),
          isStandalone: false, // Will be updated after edges are created
          style: nodeStyle,
        },
        position: { x: 0, y: 0 }, // Will be set by layout algorithm
        style: nodeStyle,
      };
      nodes.push(node);
    }
  });
  
  // Create edges based on prerequisites
  coursesData.forEach(course => {
    const courseCode = config.extractCourseCode(course.courseCode);
    
    if (courseCode && course.details && course.details.requisites) {
      const prerequisites = config.parseCoursePrerequisites(course.details.requisites);
      
      prerequisites.forEach((prereq, index) => {
        // Check if the prerequisite course exists in our course map
        if (courseMap.has(prereq)) {
          // Create edge from prerequisite to current course
          // Start with gray color, will be changed on node click
          const edge = {
            id: `${prereq}-${courseCode}`,
            source: prereq,
            target: courseCode,
            type: 'curved', // Use custom curved edges with enhanced curvature
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#999',
            },
            style: { 
              stroke: '#999',
              strokeWidth: 2,
              opacity: 0.4,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            },
            zIndex: edges.length,
          };
          edges.push(edge);
        }
      });
    }
  });
  
  // Mark standalone nodes (nodes with no edges)
  const nodesWithEdges = new Set();
  edges.forEach(edge => {
    nodesWithEdges.add(edge.source);
    nodesWithEdges.add(edge.target);
  });
  
  nodes.forEach(node => {
    if (!nodesWithEdges.has(node.id)) {
      node.data.isStandalone = true;
    }
  });
  
  return { nodes, edges };
};

// Auto-layout function - groups courses by level (100s, 200s, 300s, etc.)
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  // Group nodes by course level (hundreds digit)
  const nodesByLevel = {};
  nodes.forEach((node) => {
    const courseNumber = node.id.match(/\d{3}/)?.[0];
    const courseLevel = courseNumber ? Math.floor(parseInt(courseNumber) / 100) * 100 : 0;
    if (!nodesByLevel[courseLevel]) {
      nodesByLevel[courseLevel] = [];
    }
    nodesByLevel[courseLevel].push(node);
  });

  // Sort levels
  const levels = Object.keys(nodesByLevel).map(Number).sort((a, b) => a - b);

  // Position nodes manually by level with better spacing
  const rowHeight = 200; // Increased for better vertical spacing
  const colWidth = 150;  // Adjusted for node width
  
  levels.forEach((level, levelIndex) => {
    const nodesInLevel = nodesByLevel[level];
    const yPos = levelIndex * rowHeight;
    
    // Sort nodes in this level by course number for consistent layout
    nodesInLevel.sort((a, b) => {
      const numA = parseInt(a.id.match(/\d{3}/)?.[0] || '0');
      const numB = parseInt(b.id.match(/\d{3}/)?.[0] || '0');
      return numA - numB;
    });
    
    // Calculate starting x position to center the row
    const totalWidth = nodesInLevel.length * colWidth;
    const startX = -totalWidth / 2;
    
    nodesInLevel.forEach((node, index) => {
      node.position = {
        x: startX + index * colWidth + colWidth / 2,
        y: yPos
      };
    });
  });

  return { nodes, edges };
};

export default function Home(props) {
  // Get major configuration from props
  const config = props.config;
  
  if (!config) {
    throw new Error('Home component requires a config prop. Please provide a major configuration.');
  }
  
  // Create nodes and edges from course data
  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(config.coursesData, config);

  // Apply layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Calculate bounds for panning limits based on node positions
  const calculateTranslateExtent = () => {
    if (nodes.length === 0) return undefined;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const nodeWidth = node.style?.width || 100;
      const nodeHeight = node.style?.height || 50;
      
      minX = Math.min(minX, node.position.x - 100); // Extra padding
      minY = Math.min(minY, node.position.y - 100);
      maxX = Math.max(maxX, node.position.x + nodeWidth + 100);
      maxY = Math.max(maxY, node.position.y + nodeHeight + 100);
    });
    
    return [[minX, minY], [maxX, maxY]];
  };

  const translateExtent = calculateTranslateExtent();

  // State for active tab
  const [activeTab, setActiveTab] = useState('requirements');

  // State for tag checkboxes
  const [checkedTags, setCheckedTags] = useState({});

  // State for selected course in detail view
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Helper function to find course data by course code
  const findCourseByCode = (courseCode) => {
    return config.coursesData.find(course => {
      const extractedCode = config.extractCourseCode(course.courseCode);
      return extractedCode === courseCode;
    });
  };

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

  // Find all prerequisite nodes recursively (all nodes "above" a given node)
  const findAllPrerequisites = (nodeId, edgeList) => {
    const prerequisites = new Set();
    const visited = new Set();
    
    const traverse = (currentId) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      
      // Find all edges that point to the current node (where current node is the target)
      edgeList.forEach(edge => {
        if (edge.target === currentId) {
          prerequisites.add(edge.source);
          traverse(edge.source); // Recursively find prerequisites of prerequisites
        }
      });
    };
    
    traverse(nodeId);
    return prerequisites;
  };

  // Find all edges in the prerequisite chain
  const findPrerequisiteEdges = (nodeId, edgeList) => {
    const prerequisiteNodes = findAllPrerequisites(nodeId, edgeList);
    const prerequisiteEdges = new Set();
    
    // Add the selected node to the set to include edges directly pointing to it
    const relevantNodes = new Set([...prerequisiteNodes, nodeId]);
    
    // Find all edges that connect prerequisite nodes or point to the selected node
    edgeList.forEach(edge => {
      if (relevantNodes.has(edge.source) && relevantNodes.has(edge.target)) {
        prerequisiteEdges.add(edge.id);
      }
    });
    
    return prerequisiteEdges;
  };

  // Handle node click
  const handleNodeClick = (event, node) => {
    if (selectedNodeId === node.id) {
      // If clicking the same node, deselect it
      setSelectedNodeId(null);
      setSelectedCourse(null);
    } else {
      // Select the new node
      setSelectedNodeId(node.id);
      
      // Find the course data and set it
      const course = findCourseByCode(node.id);
      if (course) {
        setSelectedCourse(course);
        
        // If currently on "By Requirements" tab, switch to Detail tab
        if (activeTab === 'requirements') {
          setActiveTab('detail');
        }
      }
    }
  };

  // Update edges based on selected node
  const updateEdgeStyles = () => {
    if (!selectedNodeId) {
      // No node selected - make all edges gray
      setEdges(edges => 
        edges.map(edge => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: '#999',
            strokeWidth: 2,
            opacity: 0.4,
          },
          markerEnd: {
            ...edge.markerEnd,
            color: '#999',
          },
          animated: false,
        }))
      );
    } else {
      // Node selected - highlight prerequisite edges
      const highlightedEdges = findPrerequisiteEdges(selectedNodeId, edges);
      
      setEdges(edges =>
        edges.map(edge => {
          const isHighlighted = highlightedEdges.has(edge.id);
          
          return {
            ...edge,
            style: {
              ...edge.style,
              stroke: isHighlighted ? '#000' : '#999',
              strokeWidth: isHighlighted ? 3 : 2,
              opacity: isHighlighted ? 0.9 : 0.3,
            },
            markerEnd: {
              ...edge.markerEnd,
              color: isHighlighted ? '#000' : '#999',
            },
            animated: isHighlighted,
          };
        })
      );
    }
  };

  // Helper function to get tags for a specific course
  const getTagsForCourse = (courseCode) => {
    const tags = [];
    
    // Iterate through all checked tags
    Object.keys(checkedTags).forEach(tagId => {
      if (checkedTags[tagId] && config.tagToCoursesMap[tagId] && config.tagToCoursesMap[tagId].includes(courseCode)) {
        tags.push(tagId);
      }
    });
    
    return tags;
  };

  // Update node styles based on selected node and tag highlighting
  const updateNodeStyles = () => {
    setNodes(nodes =>
      nodes.map(node => {
        const isSelected = node.id === selectedNodeId;
        const courseTags = getTagsForCourse(node.id);
        const isTagHighlighted = courseTags.length > 0;
        
        // Priority: selected node > tag highlighted > default
        let background = '#fff';
        let color = '#000';
        let border = '2px solid #ccc';
        let boxShadow = 'none';
        
        // Helper function to create colored borders (used for both selected and non-selected tag-highlighted nodes)
        const createColoredBorders = () => {
          const borderThickness = 3;
          const firstTagColor = config.tagColors[courseTags[0]] || '#ffd700';
          border = `${borderThickness}px solid ${firstTagColor}`;
          
          if (courseTags.length > 1) {
            const shadows = courseTags.slice(1).map((tagId, index) => {
              const color = config.tagColors[tagId] || '#ffd700';
              const outerOffset = borderThickness * (index + 2);
              const innerOffset = borderThickness * (index + 1);
              // For selected nodes, use gray background instead of white for the cutout
              const cutoutColor = isSelected ? '#4a4a4a' : '#fff';
              return `0 0 0 ${innerOffset}px ${cutoutColor}, 0 0 0 ${outerOffset}px ${color}`;
            });
            boxShadow = shadows.join(', ');
          } else {
            boxShadow = 'none';
          }
        };
        
        if (isSelected && isTagHighlighted) {
          // Selected AND tag highlighted: gray background with colored borders
          background = '#4a4a4a';
          color = '#fff';
          createColoredBorders();
        } else if (isSelected) {
          // Selected but not tag highlighted: gray background with gray border
          background = '#4a4a4a';
          color = '#fff';
          border = '3px solid #4a4a4a';
          boxShadow = 'none';
        } else if (isTagHighlighted) {
          // Tag highlighted but not selected: white background with colored borders
          background = '#fff';
          color = '#000';
          createColoredBorders();
        }
        
        const updatedStyle = {
          ...node.style,
          background,
          color,
          border,
          boxShadow,
        };
        
        return {
          ...node,
          style: updatedStyle,
          data: {
            ...node.data,
            style: updatedStyle,
          },
        };
      })
    );
  };

  // Effect to update edge styles when selected node changes
  useEffect(() => {
    updateEdgeStyles();
    updateNodeStyles();
  }, [selectedNodeId, checkedTags]);

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
              onClick={() => setActiveTab('detail')}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                background: activeTab === 'detail' ? '#f5f5f5' : '#fff',
                borderBottom: activeTab === 'detail' ? '3px solid black' : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'detail' ? 'bold' : 'normal'
              }}
            >
              Detail
            </button>
          </div>

          {/* Tag content */}
          <div style={{ 
            padding: '20px',
            overflowY: 'auto',
            flex: 1
          }}>
            {activeTab === 'requirements' && config.requirementsStructure.children.map(child => renderTagCheckbox(child, 0))}
            {activeTab === 'detail' && (
              <div>
                {selectedCourse ? (
                  <div>
                    <h2 style={{ marginTop: '0', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
                      {selectedCourse.courseCode}
                    </h2>
                    <h3 style={{ marginTop: '0', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                      {selectedCourse.courseName}
                    </h3>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ margin: '8px 0', fontSize: '14px' }}>
                        <strong>Credits:</strong> {selectedCourse.credits}
                      </p>
                      <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: '1.6' }}>
                        <strong>Description:</strong> {selectedCourse.description}
                      </p>
                      {selectedCourse.details && (
                        <>
                          {selectedCourse.details.requisites && (
                            <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: '1.6' }}>
                              <strong>Requisites:</strong> {selectedCourse.details.requisites}
                            </p>
                          )}
                          {selectedCourse.details.courseDesignation && (
                            <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: '1.6' }}>
                              <strong>Course Designation:</strong> {selectedCourse.details.courseDesignation}
                            </p>
                          )}
                          {selectedCourse.details.repeatableForCredit && (
                            <p style={{ margin: '8px 0', fontSize: '14px' }}>
                              <strong>Repeatable for Credit:</strong> {selectedCourse.details.repeatableForCredit}
                            </p>
                          )}
                          {selectedCourse.details.lastTaught && (
                            <p style={{ margin: '8px 0', fontSize: '14px' }}>
                              <strong>Last Taught:</strong> {selectedCourse.details.lastTaught}
                            </p>
                          )}
                        </>
                      )}
                      {selectedCourse.learningOutcomes && selectedCourse.learningOutcomes.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                            Learning Outcomes:
                          </strong>
                          <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                            {selectedCourse.learningOutcomes.map((outcome, index) => (
                              <li key={index} style={{ marginBottom: '6px' }}>
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                    Click on a course node to view its details
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right content area for ReactFlow */}
        <div style={{ flex: 1, background: 'white', border: '1px solid #e0e0e0' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
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
            // Disable edge updates to reduce overlapping issues
            edgesFocusable={true}
            edgesUpdatable={false}
            // Lock nodes in place - prevent dragging
            nodesDraggable={false}
            // Add min/max zoom for better control
            minZoom={0.1}
            maxZoom={2}
            // Constrain panning to graph bounds
            translateExtent={translateExtent}
            // Prevent panning beyond content
            panOnDrag={true}
            preventScrolling={false}
            // Enable mouse wheel zoom
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
      </div>
    </div>
  );
}