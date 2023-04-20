import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import { UserAuthContextProvider } from "../context/userAuthContext";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Selling from "./components/Selling";
import NavBar from "./components/subcomponents/NavBar";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
function App() {
  return (
    <>
      <UserAuthContextProvider>
        <NavBar></NavBar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sell" element={<Selling />} />
        </Routes>
      </UserAuthContextProvider>
    </>
  );
}

export default App;
