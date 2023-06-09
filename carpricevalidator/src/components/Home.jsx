import { Button, Container, Form, Alert } from "react-bootstrap";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../context/userAuthContext";
import { useState, useRef, useEffect } from "react";
import BarGraph from "./subcomponents/BarGraph";
import LineGraph from "./subcomponents/LineGraph";
import PieGraph from "./subcomponents/PieGraph";

import models from "./jsons/carModels";
import usStates from "./jsons/US_States.json";
import axios from "axios";

const Home = () => {
  const [model, setModel] = useState("");
  const [make, setMake] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState("");
  const [carImage, setCarImage] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhoneNumber, setSellerPhoneNumber] = useState("");
  const [sellerState, setSellerState] = useState("");
  const [sellerCity, setSellerCity] = useState("");
  const [sellerZip, setSellerZip] = useState("");
  const [price, setPrice] = useState("");
  const [predictedPrice, setPredictedPrice] = useState("");
  const [predictionConfidence, setPredictionConfidence] = useState("");
  const [error, setError] = useState("");
  const { user, logOut } = useUserAuth();
  const [isOpen, setIsOpen] = useState(false);

  const predictForm = useRef(null);

  //graphs stuff
  const [predictors, setPredictors] = useState({});

  //validation stuff
  const [predictValidated, setPredictValidated] = useState(false);
  const [sellValidated, setSellValidated] = useState(false);
  const carDetails = {
    model: model,
    make: make,
    year: year,
    mileage: mileage,
    price: price,
    condition: condition,
    image: "",
  };

  const sellerDetails = {
    sellerName: sellerName,
    sellerEmail: sellerEmail,
    phoneNumber: sellerPhoneNumber,
    state: sellerState,
    city: sellerCity,
    zip: sellerZip,
  };
  const carMakeOptions = [
    "Acura",
    "Alfa-romeo",
    "Aston-martin",
    "Audi",
    "Bmw",
    "Buick",
    "Cadillac",
    "Chevrolet",
    "Chrysler",
    "Dodge",
    "Ferrari",
    "Fiat",
    "Ford",
    "Gmc",
    "Harley-davidson",
    "Honda",
    "Hyundai",
    "INFINITI",
    "Jaguar",
    "Jeep",
    "Kia",
    "Land rover",
    "Lexus",
    "Lincoln",
    "Mazda",
    "Mercedes-benz",
    "Mercury",
    "Mini",
    "Mitsubishi",
    "Nissan",
    "Pontiac",
    "Porsche",
    "Ram",
    "Rover",
    "Saturn",
    "Subaru",
    "Tesla",
    "Toyota",
    "Volkswagen",
    "Volvo",
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, index) => (
      <option key={index} value={currentYear - index}>
        {currentYear - index}
      </option>
    )
  );

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };
  const handleImage = (e) => {
    if (e.target.files[0].size > 100000)
      alert("File size must be 100kb or under.")
    else
      setCarImage(e.target.files[0]);
  };
  //  go to selling page
  const handleSelling = async () => {
    const reader = new FileReader();
    reader.readAsDataURL(carImage);
    reader.onloadend = () => {
      carDetails.image = reader.result;
      const bodyData = {
        car_info: carDetails,
        seller_info: sellerDetails,
      };
      axios
        .post("http://localhost:5069/api/sell", bodyData)
        .then((res) => {
          if (res.status === 200) {
            alert("Car details submitted successfully");
            navigate("/marketplace");
          } else {
            alert("Something went wrong");
          }
        })
        .catch((err) => {
          console.log(err);
          alert(err);
        });
    };
  };

  const predictSubmit = (e) => {
    e.preventDefault();

    if (e.currentTarget.checkValidity() === false) {
      //failed
      setPredictValidated(true);
    } else {
      setPredictValidated(false); //no point in validation anymore.
      predict();
    }
  };

  // user state changed; set the user email.
  useEffect(() => {
    setSellerEmail(user && user.email ? user.email.toLowerCase() : "")
  }, [user]);

  const sellSubmit = (e) => {
    e.preventDefault();

    //first, check if predict form isn't valid
    const predictBad = predictForm.current.checkValidity() === false;
    setPredictValidated(predictBad);

    //Now check if seller information is not valid.
    const validBad = e.currentTarget.checkValidity() === false;
    setSellValidated(validBad);

    //check if user is signed in.
    if(!user)
    {
      alert("Please login before listing a car.")
      return;
    }

    if (!predictBad && !validBad) { //all information are valid, sell!
      handleSelling();
    }
  };

  //Fetch the prediction from the backend.
  const predict = async () => {
    try {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carDetails),
      };

      fetch("http://localhost:5069/model", options)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          return response.json();
        })
        .then((data) => {
          setPredictionConfidence(parseFloat(data.confidence));
          setPredictors(data.predictors);
          setPrice(parseFloat(data.prediction));
          setPredictedPrice(parseFloat(data.prediction));
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  return (
    <>
      <div className="row">
        {/* <Login isOpen={isOpen} setIsOpen={setIsOpen} /> */}
        <div className="col-6">
          <div className="p-4 box mt-3">
            <h2 className="mb-3">Car Information</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form
              noValidate
              validated={predictValidated}
              onSubmit={predictSubmit}
              ref={predictForm}
            >
              <Form.Group className="mb-3" controlId="formBasicYear">
                <Form.Label required>Year</Form.Label>
                <Form.Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ color: "grey" }}
                  required
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  {yearOptions}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Select a valid year.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicMake">
                <Form.Label>Make</Form.Label>
                <Form.Select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  style={{ color: "grey" }}
                  required
                  placeholder="Car Make"
                >
                  <option value="" disabled style={{ color: "grey" }}>
                    Car Make
                  </option>
                  {carMakeOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Select a valid car manufacturer.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicModel">
                <Form.Label>Model</Form.Label>
                <Form.Select
                  value={model}
                  disabled={!make}
                  readOnly={!make}
                  placeholder="Car Model"
                  required
                  onChange={(e) => {
                    setModel(e.target.value);
                  }}
                >
                  <option value="" disabled style={{ color: "grey" }}>
                    Car Model
                  </option>
                  {make && //Only show if make is selected.
                    models[make.toLowerCase()].map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Select a valid car model.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicMileage">
                <Form.Label>Mileage</Form.Label>
                <Form.Control
                  type="number"
                  value={mileage}
                  step="100"
                  placeholder="Car Mileage"
                  onChange={(e) => setMileage(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Input the car's mileage.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicCondition">
                <Form.Label>Condition</Form.Label>
                <Form.Control
                  as="select"
                  value={condition}
                  style={{ color: "grey" }}
                  placeholder="Car Condition"
                  onChange={(e) => setCondition(e.target.value)}
                  required
                >
                  <option value="" disabled style={{ color: "grey" }}>
                    Car Condition
                  </option>
                  <option
                    value="new"
                    title="New Condition: Car is practically new, barely driven."
                  >
                    New
                  </option>
                  <option
                    value="excellent"
                    title="Excellent Condition: Vehicle looks new & is in excellent mechanical condition."
                  >
                    Excellent
                  </option>
                  <option
                    value="good"
                    title="Good Condition: Some repairable cosmetic defects & is free of major mechanical problems."
                  >
                    Good
                  </option>
                  <option
                    value="fair"
                    title="Fair Condition: Some cosmetic defects that require repairing /replacing."
                  >
                    Fair
                  </option>
                  <option
                    value="salvage"
                    title="Poor Condition: Severe wear or damage, not in good working condition."
                  >
                    Salvage
                  </option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  Select the car's condition.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="text-center">
                <Button type="submit" className="col-10" variant="primary">
                  Predict
                </Button>
              </div>
            </Form>
          </div>
        </div>

        <div className="col-6">
          <div className="p-4 box mt-3">
            <h2 className="mb-3">Selling Information</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form noValidate validated={sellValidated} onSubmit={sellSubmit}>
              <Form.Label>Car Image</Form.Label>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Control
                  type="file"
                  accept="image/jpeg, image/png"
                  onChange={(e) => handleImage(e)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Insert a car image.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Seller's Name</Form.Label>
                <Form.Control
                  type="text"
                  accept="image/*"
                  placeholder="Seller's Name"
                  required
                  onChange={(e) => setSellerName(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Insert the seller's name.
                </Form.Control.Feedback>
              </Form.Group>

              <div className="row">
                <div className="col-6">
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Seller's Email</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Seller's Account Email"
                      disabled={!user}
                      readOnly
                      value={sellerEmail}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Insert the seller's email.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-6">
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Seller's Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Phone Number"
                      onChange={(e) => setSellerPhoneNumber(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Insert the seller's phone number.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-3">
                  <Form.Label>Seller's State</Form.Label>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Select
                      type="text"
                      value={sellerState}
                      placeholder="State"
                      onChange={(e) => setSellerState(e.target.value)}
                      required
                    >
                      <option value="" disabled style={{ color: "grey" }}>
                        State
                      </option>
                      {usStates.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Input the seller's state.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col">
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Seller's City</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="City"
                      onChange={(e) => setSellerCity(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Input the seller's city.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
                <div className="col-2">
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Seller's Zip</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Zip"
                      maxLength={5}
                      onChange={(e) => setSellerZip(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Input seller's zip code.
                    </Form.Control.Feedback>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Car Price</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Car Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Input the price, or use the prediction.
                </Form.Control.Feedback>
              </Form.Group>
              <div className="text-center">
                <Button className="col-10" type="submit" variant="primary">
                  Sell
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </div>

      <div className="container-fluid text-center">
        <div className="display-3">PREDICTION PRICE RANGE</div>
        <div className="display-4">
          {(predictionConfidence * predictedPrice).toFixed(2).toString() +
            " - " +
            ((2 - predictionConfidence) * predictedPrice).toFixed(2).toString()}
        </div>
      </div>

      {predictedPrice ? (
        <div className="row px-5">
          <div className="col-sm text-center">
            <BarGraph data={predictors.conditions} />
            If the car was new, you would have gained 
            ${(predictors.conditions.new - predictedPrice).toFixed(2)}
          </div>

          <div className="col-sm text-center">
            <LineGraph data={predictors.mileage} />
            Due to a mileage of {mileage}, $
            {mileage > 0 ? (
              predictors.mileage.price[predictors.mileage.price.length - 1] -
              predictedPrice
            ).toFixed(2) : "0.00"}{" "}
            were lost.
          </div>

          <div className="col-sm text-center">
            <PieGraph data={predictors.modelRatio}/>
            Your model is ${Math.abs(predictors.modelRatio.priceDifference.toFixed(2))} {(predictors.modelRatio.priceDifference > 0) ? "more" : "less"} than
            the median price of the manufacturer.
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Home;
