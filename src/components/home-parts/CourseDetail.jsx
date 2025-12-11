import { Card, Badge, ListGroup } from 'react-bootstrap';

export default function CourseDetail({ selectedCourse }) {
  if (!selectedCourse) {
    return (
      <div className="text-muted text-center mt-5">
        <p>Click on a course node to view its details</p>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <Card.Body>
        <Card.Title as="h2" className="mb-3">
          {selectedCourse.courseCode}
        </Card.Title>
        <Card.Subtitle as="h3" className="mb-3 text-muted">
          {selectedCourse.courseName}
        </Card.Subtitle>

        <div className="mb-4">
          <p className="mb-2">
            <strong>Credits:</strong> <Badge bg="secondary">{selectedCourse.credits}</Badge>
          </p>
          <p className="mb-2">
            <strong>Description:</strong> {selectedCourse.description}
          </p>

          {selectedCourse.details && (
            <>
              {selectedCourse.details.requisites && (
                <p className="mb-2 text-danger">
                  <strong>Requisites:</strong> {selectedCourse.details.requisites}
                </p>
              )}
              {selectedCourse.details.courseDesignation && (
                <p className="mb-2">
                  <strong>Course Designation:</strong> {selectedCourse.details.courseDesignation}
                </p>
              )}
              {selectedCourse.details.repeatableForCredit && (
                <p className="mb-2">
                  <strong>Repeatable for Credit:</strong> {selectedCourse.details.repeatableForCredit}
                </p>
              )}
              {selectedCourse.details.lastTaught && (
                <p className="mb-2">
                  <strong>Last Taught:</strong> {selectedCourse.details.lastTaught}
                </p>
              )}
            </>
          )}

          {selectedCourse.learningOutcomes && selectedCourse.learningOutcomes.length > 0 && (
            <div className="mt-4">
              <strong>Learning Outcomes:</strong>
              <ListGroup variant="flush" className="mt-2">
                {selectedCourse.learningOutcomes.map((outcome, index) => (
                  <ListGroup.Item key={index} className="border-0 p-1">
                    • {outcome}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
