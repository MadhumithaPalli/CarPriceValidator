import express from "express";
import cors from "cors";
import * as tf from "@tensorflow/tfjs";

import carModels from "./modelResources/carModel.json" assert {type: "json"};
import manufacturers from "./modelResources/manufacturers.json" assert {type: "json"};
import admin from "firebase-admin";
import serviceAccount from "./firebase-key.json" assert { type: "json" };

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
    carInfo.condition = carInfo.condition.toLowerCase();

    //Encoded manufacturers
    let makeArray = Array(manufacturers.length).fill(0);
    makeArray[manufacturers.indexOf(carInfo.make)] = 1; //Set which manufacturer it is.
  
    //Set up the numeric values
    const conditionEncode = {
      'salvage': 0,
      "fair": 1,
      "good": 2,
      "excellent": 3,
      "like new": 3,
      "new": 4,
      }

    let featureArray = [parseInt(carInfo.year), carModels[carInfo.make][carInfo.model], conditionEncode[carInfo.condition], parseFloat(carInfo.mileage)]

    //SCALE THE NUMERIC VALUES
    const std = [9.200451033514081, 2.199239500419152, 2.190692871697908, 176266.83642522214]
    const mean = [2011.0181361520472, 2.758601108630125, 9.808964681763117, 94841.79498648774]
    for (let i = 0; i < featureArray.length; i++) 
    {
      featureArray[i] = (featureArray[i] - mean[i]) / std[i];
    }
  
    //Merge to create the full feature array
    featureArray = featureArray.concat(makeArray)
    const inputData = tf.tensor2d([featureArray]);

    console.log(featureArray)
    
    let prediction = model.predict(inputData)
    const predictionArray = await prediction.array();
  
    prediction = predictionArray[0]
  
    const data =
    {
      prediction: prediction,
      confidence: 0.80
    }

    res.send(JSON.stringify(data));
  }
  catch(error)
  {
    console.log(error)

    const data =
    {
      prediction: -1,
      confidence: 0.80
    }

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
