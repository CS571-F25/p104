import { Container, Navbar, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function TopNavBar() {
  return <Navbar>
    <Container fluid>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Brand as={Link} to="/">
            <img
                src={logo}
                alt="Logo"
                height={48}
                style={{ verticalAlign: 'middle', marginRight: '0.5em' }}
            />
            <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 'bold' }}>
                UW Course Map
            </span>
        </Navbar.Brand>
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
                <Nav.Link as={Link} to="/about">About</Nav.Link>
            </Nav>
        </Navbar.Collapse>
    </Container>
  </Navbar>
}