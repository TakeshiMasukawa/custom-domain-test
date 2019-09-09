'use strict';

const express = require('express');
const axios = require('axios');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
require('dotenv').config();
const PORT = process.env.PORT || 3000;


const app = express();
app.get('/', (req, res) => res.send('Hello World!'));
app.post('/',  upload.single('file'), async (req, res) => {
  console.log();
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-type');
  const detectResult = await detectFace(req.file.buffer);
  if(!detectResult.data.length){
    res.json({message:"notFound"});
    return;
  }
  const identifyResult = await identifyFace(detectResult.data.map(d => d.faceId));
  const candidates = identifyResult.data.filter(d => d.candidates.length).map(d => d.candidates[0]);
  if(!candidates.length){
    res.json({message:"unknown"});
    return;
  }
  let mes = "";
  if(candidates.some(c => c.personId === process.env.MIKA_PERSON_ID)){
    mes += "Mika";
  }
  if(candidates.some(c => c.personId === process.env.RIKA_PERSON_ID)){
    mes += "Rika";
  }
  res.json({message:mes});
});
app.use(function (req, res, next) {
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
  }).catch(err => console.log(err));
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