import { useEffect, useState } from "react";
import { Card, Container } from "react-bootstrap";

function Selling() {
  const [carData, setCarData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:5069/api/cars");
      const data = await response.json();
      setCarData(data);
    }
    fetchData();
  }, []);

  return (
    <div className="card-container">
      {carData.map((car) => (
        <Card key={car.uid} className="selling-card">
          <Card.Img variant="top" src={car.car_info.image} />
          <Card.Body>
            <Card.Title>
              {car.car_info.make} {car.car_info.model}
            </Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {car.car_info.year}
            </Card.Subtitle>
            <Card.Text>Price : {car.car_info.price}</Card.Text>
            <Card.Text>Seller Name : {car.seller_info.sellerName}</Card.Text>
            <Card.Text>Seller Email : {car.seller_info.sellerEmail}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default Selling;
