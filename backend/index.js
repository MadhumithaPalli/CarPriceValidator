import express from "express";
import cors from "cors";
import * as tf from "@tensorflow/tfjs";

import admin from "firebase-admin";
import serviceAccount from "./firebase-key.json" assert { type: "json" };
import carModels from "./modelResources/carModel.json" assert { type: "json" };
import conditions from "./modelResources/condition.json" assert { type: "json" };
import manufacturers from "./modelResources/manufacturers.json" assert { type: "json" };

import { dirname } from "path";
import { fileURLToPath } from "url";
import { error } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.get("/api", (req, res) => {
  res.send("Server is up and running");
});

function standardScaler(array) {
  // Calculate mean and standard deviation
  const mean = array.reduce((acc, val) => acc + val, 0) / array.length;
  const stdDev = Math.sqrt(
    array.reduce((acc, val) => acc + (val - mean) ** 2, 0) / array.length
  );

  // Scale the array
  const scaledArray = array.map((val) => (val - mean) / stdDev);

  return scaledArray;
}

app.post("/model", async (req, res) => {
  try {
    const model = await tf.loadLayersModel(
      "http://localhost:5069/model/model.json"
    );
    const carInfo = req.body;

    carInfo.make = carInfo.make.toLowerCase();
    carInfo.model = carInfo.model.toLowerCase();

    let makeArray = Array(manufacturers.length).fill(0);
    makeArray[manufacturers.indexOf(carInfo.make)] = 1; //Set which manufacturer it is.

    let featureArray = [
      parseInt(carInfo.year),
      carModels[carInfo.make][carInfo.model],
      conditions[carInfo.condition],
      parseFloat(carInfo.mileage),
    ];
    console.log(featureArray);

    featureArray = featureArray.concat(makeArray); //combines the feature array with the manufacturers array
    const inputData = tf.tensor2d([featureArray]);

    let prediction = model.predict(inputData);
    const predictionArray = await prediction.array();

    prediction = Math.sqrt(predictionArray[0]); //model uses MSE as loss, so we must square root it to get the actual price.

    const data = {
      prediction: prediction,
      confidence: 0.82,
    };

    res.send(JSON.stringify(data));
  } catch {
    const data = {
      prediction: -1,
      confidence: 0.82,
    };

    res.send(JSON.stringify(data));
  }
});
// make an id for the car based on the user's name and car's make and model
// function makeId(name, make, model) {
//   return name + make + model;
// }
app.post("/api/sell", async (req, res) => {
  try {
    const carInfo = req.body.car_info;

    const sellerInfo = req.body.seller_info;
    // make a unique id for the car from the seller's name and timestamp
    const id = sellerInfo.sellerName + Date.now();
    const data = {
      car_info: carInfo,
      seller_info: sellerInfo,
      uid: id,
    };

    await db.collection("cars").doc(id).set(data);
    res.send("Success");
  } catch {
    res.send("Error");
  }
});

app.get("/api/cars", async (req, res) => {
  try {
    const cars = [];
    const snapshot = await db.collection("cars").get();
    snapshot.forEach((doc) => {
      cars.push(doc.data());
    });
    res.json(cars);
  } catch (error) {
    res.send(error);
  }
});

app.delete("/api/cars/", async (req, res) => {
  let nomatach = false;
  const id = req.body.uid;
  console.log(id);
  // find the car with the matching id and delete it
  try {
    if (id == null) throw new Error("No id provided");
    const doc = await db.collection("cars").doc(id).get();
    if (!doc.exists) {
      nomatach = true;
      throw new Error("No matching document");
    }
    await db.collection("cars").doc(id).delete();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Success" });
});

const PORT = process.env.PORT || 5069;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
