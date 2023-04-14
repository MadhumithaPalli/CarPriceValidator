// CarPriceValidator.js

import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const CarPriceValidator = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('');
  const [year, setYear] = useState('');

  const handleMakeChange = (e) => {
    setMake(e.target.value);
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

  const handleMileageChange = (e) => {
    setMileage(e.target.value);
  };

  const handleConditionChange = (e) => {
    setCondition(e.target.value);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  const handlePredictClick = () => {
    // Handle predict button click logic here
    // You can access the values of make, model, mileage, condition, and year state variables to perform validation and prediction
  };

  return (
    <div>
      <h1>Car Price Validator</h1>
      <Form>
        <Form.Group controlId="make">
          <Form.Label>Make:</Form.Label>
          <Form.Control
            type="text"
            value={make}
            onChange={handleMakeChange}
          />
        </Form.Group>
        <Form.Group controlId="model">
          <Form.Label>Model:</Form.Label>
          <Form.Control
            type="text"
            value={model}
            onChange={handleModelChange}
          />
        </Form.Group>
        <Form.Group controlId="mileage">
          <Form.Label>Mileage:</Form.Label>
          <Form.Control
            type="number"
            value={mileage}
            onChange={handleMileageChange}
          />
        </Form.Group>
        <Form.Group controlId="condition">
          <Form.Label>Condition:</Form.Label>
          <Form.Control
            type="text"
            value={condition}
            onChange={handleConditionChange}
          />
        </Form.Group>
        <Form.Group controlId="year">
          <Form.Label>Year:</Form.Label>
          <Form.Control
            type="number"
            value={year}
            onChange={handleYearChange}
          />
        </Form.Group>
        <Button variant="primary" onClick={handlePredictClick}>
          Predict
        </Button>
      </Form>
    </div>
  );
};

export default CarPriceValidator;
