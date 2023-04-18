import { Button, Container, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../context/userAuthContext";
import { useState, useRef } from "react";

const Home = () => {
  const { logOut, user } = useUserAuth();
  const { email } = user;
  const [model, setModel] = useState("");
  const [make, setMake] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const carDetails = {
    model: model,
    make: make,
    year: year,
    mileage: mileage,
    price: price,
    condition: condition
  };
  const carMakeOptions = [
    'Acura', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'Cadillac', 'Chevrolet',
    'Chrysler', 'Dodge', 'Ferrari', 'FIAT', 'Fisker', 'Ford', 'GMC', 'Honda', 'Hyundai',
    'INFINITI', 'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln',
    'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes-Benz', 'MINI', 'Mitsubishi',
    'Nissan', 'Porsche', 'Ram', 'Rolls-Royce', 'Saab', 'Scion', 'smart', 'Subaru',
    'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1990 + 1 }, (_, index) => (
    <option key={index} value={currentYear - index}>
      {currentYear - index}
    </option>
  ));

  if (email) {
    // set email to local storage
    localStorage.setItem("email", email);
  }
  const inputRef = useRef();
  const emailFromLocalStorage = localStorage.getItem("email");
  const displayName = emailFromLocalStorage.split("@")[0];
  localStorage.setItem("displayName", displayName);
  let displayNameFromLocalStorage = localStorage.getItem("displayName");
  displayNameFromLocalStorage =
    displayNameFromLocalStorage.charAt(0).toUpperCase() +
    displayNameFromLocalStorage.slice(1);
  user.displayName = displayNameFromLocalStorage;

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  //  go to selling page and pass the car details as props to the selling page
  const handleSelling = async () => {
    try {
      navigate("/sell", { state: { carDetails: carDetails } });
    } catch (error) {
      console.log(error.message);
    }
  };

  const predict = async () => {
    try {
      const options = 
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(carDetails)
      }

      fetch("http://localhost:5069/model", options)
      .then(response => response.json())
      .then(data => {
        console.log("Prediction is " + data.prediction)
        setPrice(data.prediction)
      })
      .catch(error => console.error(error));

    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <Container>
        <div className="p-4 box mt-3 text-center">
          Hello Welcome {user.displayName} <br />
        </div>
        <div className="d-grid gap-2">
          <Button variant="primary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
        <div className="p-4 box mt-3 text-center">
          <h2 className="mb-3">Car Price Validator</h2>
          <h3>Enter Car Details</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            
            <Form.Group className="mb-3" controlId="formBasicYear">
            <Form.Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ color: 'grey' }}
            >
              <option value="" disabled>
                Select Year
              </option>
              {yearOptions}
            </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              style={{ color: 'grey' }}
              placeholder="Car Make"
            >
              <option value="" disabled style={{ color: 'grey' }}>
                Car Make
              </option>
              {carMakeOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="text"
                placeholder="Car Model"
                onChange={(e) => setModel(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Car Mileage"
                onChange={(e) => setMileage(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Control
              as="select"
              style={{ color: 'grey' }}
              placeholder="Car Condition"
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="" disabled style={{ color: 'grey' }}>
                Car Condition
              </option>
              <option value="excellent" title="Excellent Condition: Vehicle looks new & is in excellent mechanical condition.">Excellent</option>
              <option value="very good" title="Very Good Condition: Minor cosmetic defects & is in excellent mechanical condition.">Very Good</option>
              <option value="good" title="Good Condition: Some repairable cosmetic defects & is free of major mechanical problems.">Good</option>
              <option value="fair" title="Fair Condition: Some cosmetic defects that require repairing /replacing.">Fair</option>
              <option value="poor" title="Poor Condition: Severe wear or damage, not in good working condition.">Poor</option>
            </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control
                type="text"
                placeholder="Car Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>
          </Form>
        </div>

        <div className="d-grid gap-2">
          <Button variant="primary" onClick={predict}>
            Predict
          </Button>
        </div>

        <div className="p-4 box mt-3 text-center">
          <h2 className="mb-3">Sell Vehicle Page</h2>
        </div>

        <div className="d-grid gap-2">
          <Button variant="primary" onClick={handleSelling}>
            Sell Vehicle
          </Button>
        </div>
      </Container>
    </>
  );
};

export default Home;
