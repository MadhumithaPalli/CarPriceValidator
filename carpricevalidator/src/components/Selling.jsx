import React from "react";
import { useLocation } from "react-router-dom";
const Selling = () => {
  const { state } = useLocation();
  console.log("State: ", state);
  return <div>Selling</div>;
};

export default Selling;
