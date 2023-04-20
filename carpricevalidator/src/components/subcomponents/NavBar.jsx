import { Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Login from "../Login";
import { useState } from "react";
import { useUserAuth } from "../../../context/userAuthContext";
function NavBar(prop) {
  const [showModal, setShowModal] = useState(false);
  const handleModal = () => {
    setShowModal(!showModal);
  };
  const { user, logOut } = useUserAuth();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container fluid>
          <Navbar.Brand href="home">Vroom Value</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="home">Home</Nav.Link>
            <Nav.Link href="sell">Marketplace</Nav.Link>
          </Nav>
          {user ? (
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="outline-light" onClick={handleModal}>
              Login
            </Button>
          )}
        </Container>
      </Navbar>

      <Login showModal={showModal} handleModal={handleModal} />
    </>
  );
}

export default NavBar;
