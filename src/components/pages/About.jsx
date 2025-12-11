import { Container, Card, ListGroup } from 'react-bootstrap';
import TopNavBar from '../TopNavBar';

export default function About(props) {
  return (
    <div className="min-vh-100 bg-light">
      <TopNavBar />
      <Container className="py-5">
        <Card className="shadow-sm">
          <Card.Header as="h1" className="bg-primary text-white">About This Project</Card.Header>
          <Card.Body>
            <h2 className="h4 mb-3">Project Description</h2>
            <Card.Text className="mb-4">
              BadgerCourseMap is an interactive web application designed to help students at UW Madison visualize the prerequisite structures across undergraduate programs, starting with the Computer Science major.
            </Card.Text>

            <h2 className="h4 mb-3">Key Features</h2>
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item>
                <strong>Interactive Prerequisite Tree:</strong> Visualize courses as nodes in a dynamic graph.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Course Details:</strong> Click on any node to view comprehensive course information, including credits, descriptions, and learning outcomes.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Prerequisite Visualization:</strong> Automatically highlight prerequisite paths when a specific course is selected.
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Requirement Filtering:</strong> Filter and highlight courses based on major requirements (e.g., Basic Computer Sciences).
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Course Search:</strong> Browse and search the complete course catalog for the major.
              </ListGroup.Item>
            </ListGroup>

            <h2 className="h4 mb-3">Future Roadmap</h2>
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item>
                • Support for additional majors beyond Computer Science
              </ListGroup.Item>
              <ListGroup.Item>
                • Integration with MadGrades and direct UW Guide links
              </ListGroup.Item>
              <ListGroup.Item>
                • "Planned" vs. "Completed" course tracking
              </ListGroup.Item>
              <ListGroup.Item>
                • Visualization of external prerequisites (e.g., Math requirements for CS)
              </ListGroup.Item>
            </ListGroup>

          </Card.Body>
        </Card>
      </Container>
    </div >
  );
}