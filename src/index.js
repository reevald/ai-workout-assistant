// import * as tfc from '@tensorflow/tfjs-core';
// import * as tfl from '@tensorflow/tfjs-layers';
// import '@tensorflow/tfjs-backend-webgl';
// import * as poseDetection from '@tensorflow-models/pose-detection';

// const webcamElem = document.getElementById("webcam");

// async function initPoseModels() {
//   const detectorConfig = {
//     architecture: 'MobileNetV1',
//     outputStride: 16,
//     inputResolution: { width: 640, height: 480 },
//     multiplier: 0.75
//   };
//   const model = poseDetection.SupportedModels.PoseNet;
//   const detector = await poseDetection.createDetector(model, detectorConfig);
//   const poses = await detector.estimatePoses(webcamElem);
  
//   console.log(poses);
// }

// navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
//   webcamElem.srcObject = stream;
//   webcamElem.addEventListener('loadeddata', function () {
//     initPoseModels();
//     console.log("Test");
//   });
// });

// Test load tfjs model
// import { loadWorkoutModel } from "./handlers/tfjsModelHandler";

// loadWorkoutModel().then((model) => {console.log(model)});