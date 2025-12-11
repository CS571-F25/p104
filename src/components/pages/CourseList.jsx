import { useState } from 'react';
import { Container, Form, Table, Card } from 'react-bootstrap';
import TopNavBar from '../TopNavBar';

export default function CourseList(props) {
  const { config } = props;
  const [searchQuery, setSearchQuery] = useState('');

  if (!config) {
    return <div>Loading...</div>;
  }

  // Filter courses based on search query
  const filteredCourses = config.coursesData.filter(course => {
    const searchLower = searchQuery.toLowerCase();
    const code = course.courseCode.toLowerCase();
    const name = course.courseName.toLowerCase();
    const description = (course.description || '').toLowerCase();

    return code.includes(searchLower) ||
      name.includes(searchLower) ||
      description.includes(searchLower);
  });

  // Helper to get formatted code
  const getDisplayCode = (rawCode) => {
    const extracted = config.extractCourseCode(rawCode);
    return extracted ? config.formatCourseCodeForDisplay(extracted) : rawCode;
  };

  return (
    <div>
      <TopNavBar />
      <Container className="mt-4 mb-5">
        <Card className="shadow-sm">
          <Card.Header as="h1" className="bg-primary text-white h2">Course List</Card.Header>
          <Card.Body>
            <p className="lead">
              Browse and search through all {config.name} courses.
            </p>

            <Form.Group className="mb-4">
              <Form.Control
                size="lg"
                type="text"
                placeholder="Search courses by code, name, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search courses"
              />
            </Form.Group>

            <div className="table-responsive">
              <Table striped bordered hover>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '15%' }}>Code</th>
                    <th style={{ width: '40%' }}>Name</th>
                    <th style={{ width: '10%' }}>Credits</th>
                    <th style={{ width: '35%' }}>Description / Requisites</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                      <tr key={index}>
                        <td style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                          {getDisplayCode(course.courseCode)}
                        </td>
                        <td>
                          <div className="fw-bold">{course.courseName}</div>
                          <div className="small text-muted mt-1">
                            Last Taught: {course.details?.lastTaught || 'N/A'}
                          </div>
                        </td>
                        <td>{course.credits}</td>
                        <td>
                          <div className="small mb-2">{course.description}</div>
                          {course.details?.requisites && (
                            <div className="small text-danger">
                              <strong>Requisites:</strong> {course.details.requisites}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No courses found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            <div className="text-muted mt-3">
              Showing {filteredCourses.length} of {config.coursesData.length} courses
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

