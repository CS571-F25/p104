import { useState, useEffect } from 'react';
import { useNodesState, useEdgesState, MarkerType } from 'reactflow';
import TopNavBar from '../TopNavBar';
import Sidebar from '../home-parts/Sidebar';
import GraphWrapper from '../home-parts/GraphWrapper';

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
        type: 'custom', // Matches type in GraphWrapper
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
            type: 'curved', // Matches type in GraphWrapper
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
      // No node selected - make all edges darker gray for accessibility
      setEdges(edges =>
        edges.map(edge => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: '#767676', // WCAG compliant gray
            strokeWidth: 2,
            opacity: 0.6, // Increased opacity
          },
          markerEnd: {
            ...edge.markerEnd,
            color: '#767676',
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
              stroke: isHighlighted ? '#000' : '#767676',
              strokeWidth: isHighlighted ? 3 : 2,
              opacity: isHighlighted ? 1 : 0.3,
            },
            markerEnd: {
              ...edge.markerEnd,
              color: isHighlighted ? '#000' : '#767676',
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
        let border = '2px solid #555';
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
              const cutoutColor = isSelected ? '#333' : '#fff'; // Darker gray for contrast
              return `0 0 0 ${innerOffset}px ${cutoutColor}, 0 0 0 ${outerOffset}px ${color}`;
            });
            boxShadow = shadows.join(', ');
          } else {
            boxShadow = 'none';
          }
        };

        if (isSelected && isTagHighlighted) {
          // Selected AND tag highlighted: gray background with colored borders
          background = '#333';
          color = '#fff';
          createColoredBorders();
        } else if (isSelected) {
          // Selected but not tag highlighted: gray background with gray border
          background = '#333';
          color = '#fff';
          border = '3px solid #333';
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

  return (
    <div>
      <TopNavBar />
      <h1 className="visually-hidden">Course Map Visualization</h1>
      <div style={{ display: 'flex', height: '700px' }}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          config={config}
          checkedTags={checkedTags}
          handleTagChange={handleTagChange}
          selectedCourse={selectedCourse}
        />

        <GraphWrapper
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          translateExtent={translateExtent}
        />
      </div>
    </div>
  );
}