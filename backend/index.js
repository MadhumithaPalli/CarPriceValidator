import express from "express";
import cors from "cors";
import * as tf from '@tensorflow/tfjs';
import fs from "fs";

import carModels from "./modelResources/carModel.json" assert {type: "json"};
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

const PORT = process.env.PORT || 5069;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
