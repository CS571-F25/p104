import { Handle, Position } from 'reactflow';

// Custom node component
export default function CustomNode({ data }) {
  const isStandalone = data.isStandalone === true;

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
