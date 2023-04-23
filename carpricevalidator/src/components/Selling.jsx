import { useEffect, useState } from "react";
import { Card, Container, Button } from "react-bootstrap";
import { useUserAuth } from "../../context/userAuthContext";
function Selling() {
  const [carData, setCarData] = useState([]);
  const { user } = useUserAuth();

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:5069/api/cars");
      const data = await response.json();
      setCarData(data);
    }
    fetchData();
  }, []);

  // check if user is logged in and if user is logged in then filter the cardata and add a delete button for users data only
  // if user is not logged in then show all the data without delete button
  const handleDeleteCar = async (uid) => {
    try {
      await fetch(`http://localhost:5069/api/cars?uid=${uid}`, {
        method: "DELETE",
      });
      const newCarData = carData.filter((car) => car.uid !== uid);
      setCarData(newCarData);
    } catch (error) {
      console.log(error.message);
    }
  };

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
            {user && user.email === car.seller_info.sellerEmail && (
              <Button variant="danger" onClick={() => handleDeleteCar(car.uid)}>
                Delete
              </Button>
            )}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default Selling;
