import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function NavBar(prop) {
  return(
    <Navbar bg="primary" variant="dark">
    <Container fluid>
      <Navbar.Brand href="home">Vroom Value</Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link href="home">Home</Nav.Link>
        <Nav.Link href="sell">Marketplace</Nav.Link>
      </Nav>
    </Container>
    </Navbar>
  )

}

export default NavBar
