import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import { UserAuthContextProvider } from "../context/userAuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Selling from "./components/Selling";
import "./App.css";
function App() {
  return (
    <Container style={{ width: "400px" }}>
      <Row>
        <Col>
          <UserAuthContextProvider>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/sell" element={<Selling />} />
            </Routes>
          </UserAuthContextProvider>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
