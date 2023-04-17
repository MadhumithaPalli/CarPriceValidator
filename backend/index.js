import express from "express";
import cors from "cors";
import * as tf from '@tensorflow/tfjs';
import fs from "fs";

import carModels from "./modelResources/carModel.json" assert {type: "json"};
import conditions from "./modelResources/condition.json" assert {type: "json"};
import manufacturers from "./modelResources/manufacturers.json" assert {type: "json"};

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

app.get("/api", (req, res) => {
  res.send("Server is up and running");
});

function standardScaler(array) {
  // Calculate mean and standard deviation
  const mean = array.reduce((acc, val) => acc + val, 0) / array.length;
  const stdDev = Math.sqrt(array.reduce((acc, val) => acc + (val - mean) ** 2, 0) / array.length);
  
  // Scale the array
  const scaledArray = array.map((val) => (val - mean) / stdDev);
  
  return scaledArray;
}

app.post('/model', async (req, res) => {
  try{
    const model = await tf.loadLayersModel('http://localhost:5069/model/model.json');
    const carInfo = req.body
  
    console.log(carInfo)
    let makeArray = Array(manufacturers.length).fill(0);
    makeArray[manufacturers.indexOf(carInfo.make)] = 1; //Set which manufacturer it is.
  
    let featureArray = [parseInt(carInfo.year), carModels[carInfo.make][carInfo.model], conditions[carInfo.condition], parseFloat(carInfo.mileage)]
    console.log(featureArray)
  
    featureArray = featureArray.concat(makeArray) //combines the feature array with the manufacturers array
    const inputData = tf.tensor2d([featureArray]);
    
    let prediction = model.predict(inputData)
    const predictionArray = await prediction.array();
  
    prediction = Math.sqrt(predictionArray[0]) //model uses MSE as loss, so we must square root it to get the actual price.
  
    const data =
    {
      prediction: prediction,
      confidence: 0.82
    }

    res.send(JSON.stringify(data));
  }
  catch
  {
    const data =
    {
      prediction: -1,
      confidence: 0.82
    }

    res.send(JSON.stringify(data));
  }
});

const PORT = process.env.PORT || 5069;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
