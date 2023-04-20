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

async function predict(year, make, model, condition, mileage) //predict given values.
{
    //retrieve the model
    const mlModel = await tf.loadLayersModel(
      "http://localhost:5069/model/model.json"
    );

    //Encoded manufacturers
    let makeArray = Array(manufacturers.length).fill(0);
    makeArray[manufacturers.indexOf(make)] = 1; //Set which manufacturer it is.
  
    //Set up the numeric values
    const conditionEncode = {
      'salvage': 0,
      "fair": 1,
      "good": 2,
      "excellent": 3,
      "new": 4,
      }

    let featureArray = [year, carModels[make][model], conditionEncode[condition], mileage]

    console.log(featureArray)

    //SCALE THE NUMERIC VALUES
    const std = [6.0088270199943725, 0.7007531240326841, 0.5598212710061845, 67433.14457317894] //this is based on the model trained.
    const mean = [2012.131193755739, 1.1055213161032302, 2.4497704315886133, 91953.27159320477]
    for (let i = 0; i < featureArray.length; i++) 
    {
      featureArray[i] = (featureArray[i] - mean[i]) / std[i];
    }
  
    //Merge to create the full feature array
    featureArray = featureArray.concat(makeArray)
    const inputData = tf.tensor2d([featureArray])
    let prediction = mlModel.predict(inputData)

    const predictionArray = await prediction.array();
  
    prediction = predictionArray[0] // the main prediction.
    return parseFloat(prediction[0]).toFixed(2) //round it to two decimal
}

app.post("/model", async (req, res) => {
  try {
    const carInfo = req.body;

    carInfo.make = carInfo.make.toLowerCase();
    carInfo.model = carInfo.model.toLowerCase();
    carInfo.condition = carInfo.condition.toLowerCase();
    carInfo.mileage = parseFloat(carInfo.mileage)
    carInfo.year = parseInt(carInfo.year)
  
    let prediction = await predict(carInfo.year, carInfo.make, carInfo.model, carInfo.condition, carInfo.mileage) // the main prediction.

    //Calculate possible values for weight
    let predictors = {}

    let curMileage = carInfo.mileage
    predictors.mileage = {feature: [], price: []}
    if(curMileage > 0)
    {
      do
      {
        predictors.mileage.feature.push(curMileage)
        predictors.mileage.price.push(await predict(carInfo.year, carInfo.make, carInfo.model, carInfo.condition, curMileage))
        curMileage = Math.floor(curMileage - (carInfo.mileage/10));
      }while(curMileage >= 0)
    }

    //Calculate the rest of conditions
    predictors.conditions = {[carInfo.condition]: prediction}
    let conditions = ["salvage", "fair", "good", "excellent", "new"]
    conditions = conditions.filter(e => e != carInfo.condition)
    do
    {
      let curCon = conditions.shift()
      predictors.conditions[curCon] = await predict(carInfo.year, carInfo.make, carInfo.model, curCon, carInfo.mileage)
    }while(conditions.length > 0)
  
    const data =
    {
      prediction: prediction,
      confidence: 0.84,
      predictors: predictors
    }

    res.send(JSON.stringify(data));
  }
  catch(error)
  {
    res.statusMessage = "Error in prediction: " + error;
    res.status(400).end();
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
