'use strict';

const express = require('express');
const axios = require('axios');
var body = require('body-parser');
require('dotenv').config();
const PORT = process.env.PORT || 3000;


const app = express();
app.use(body.raw({ type:'*/*' }));
app.get('/', (req, res) => res.send('Hello World!'));
app.post('/', async (req, res) => {
  console.log();
  const data = await detectFace(req.body);
  const id = await identifyFace(data);
  res.end();
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const detectFace = async (data) => {
  return await axios.post('/detect', data, {
    baseURL: process.env.ENDPOINT,
    params: {
      returnFaceId: true,
      returnFaceLandmarks: false,
      recognitionModel: "recognition_02",
      returnRecognitionModel: false,
      detectionModel: "detection_01"
    },
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
      "Content-Type": "application/octet-stream"
    }
  });
}
const identifyFace = async (faceIds) => {
  const requestBody = {
    personGroupId: process.env.GROUPNAME,
    faceIds: faceIds,
    maxNumOfCandidatesReturned: 1,
    confidenceThreshold: 0.5
  }
  return await axios.post('/identify', requestBody, {
    baseURL: process.env.ENDPOINT,
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
      "Content-Type": "application/json"
    }
  })
}

(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
console.log(`Server running at ${PORT}`);