import { Form } from 'react-bootstrap';

export default function TagFilter({ node, checkedTags, handleTagChange, level = 0 }) {
  const isChecked = checkedTags[node.id] || false;
  const indent = level * 20;

  return (
    <div key={node.id}>
      <div style={{ marginLeft: `${indent}px`, marginBottom: '8px' }}>
        <Form.Check
          type="checkbox"
          id={`check-${node.id}`}
          label={node.label}
          checked={isChecked}
          onChange={() => handleTagChange(node.id, node)}
          style={{
            fontSize: level === 0 ? '16px' : level === 1 ? '14px' : '13px',
            fontWeight: level < 2 ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        />
      </div>
      {node.children && node.children.map(child => (
        <TagFilter
          key={child.id}
          node={child}
          checkedTags={checkedTags}
          handleTagChange={handleTagChange}
          level={level + 1}
        />
      ))}
    </div>
  );
}
