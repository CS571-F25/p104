import { Nav, Card } from 'react-bootstrap';
import TagFilter from './TagFilter';
import CourseDetail from './CourseDetail';

export default function Sidebar({
  activeTab,
  setActiveTab,
  config,
  checkedTags,
  handleTagChange,
  selectedCourse
}) {
  return (
    <div style={{ width: '350px', height: '100%', display: 'flex', flexDirection: 'column', background: '#f8f9fa', borderRight: '1px solid #dee2e6' }}>
      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="bg-white px-2 pt-2">
        <Nav.Item className="w-50 text-center">
          <Nav.Link eventKey="requirements">Requirements</Nav.Link>
        </Nav.Item>

        <Nav.Item className="w-50 text-center">
          <Nav.Link eventKey="detail">Detail</Nav.Link>
        </Nav.Item>
      </Nav>

      <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
        {activeTab === 'requirements' && (
          <div>
            {config.requirementsStructure.children.map(child => (
              <TagFilter
                key={child.id}
                node={child}
                checkedTags={checkedTags}
                handleTagChange={handleTagChange}
                level={0}
              />
            ))}
          </div>
        )}

        {activeTab === 'detail' && (
          <CourseDetail selectedCourse={selectedCourse} />
        )}
      </div>
    </div>
  );
}
