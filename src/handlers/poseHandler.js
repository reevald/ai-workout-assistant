import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

import DatasetHandler from "./datasetHandler";
import ClassifierHandler from "./classifierHandler";
import CounterHandler from "./counterHandler";

export default class PoseHandler {
  constructor(webcamElem, cnvPoseElem) {
    // Dataset handler
    this.DBHandler = new DatasetHandler();
    this.isExtractKeypoints = false;
    // Model Handler
    this.classifier = new ClassifierHandler();
    this.isClassify = true;
    this.currClass = "";
    this.frameClassify = 6;

    // FPS config
    this.frame = 0;
    this.fps = 0;
    this.times = [];

    this.isLoop = false;
    this.additionalElem = {};
    this.webcamElem = webcamElem;
    this.cnvPoseElem = cnvPoseElem;
    this.ctxPose = this.cnvPoseElem.getContext
      ? this.cnvPoseElem.getContext("2d")
      : null;
    this.nameModel = "";
    this.model = null;
    this.detector = null;
    this.detectorConfig = {};
    this.estimationConfig = {};

    // Skeleton config
    this.tresholdPoints = 0.3;
    this.lines = {
      0: [
        [0, 1],
        [0, 2],
      ],
      1: [[1, 3]],
      2: [[2, 4]],
      3: [],
      4: [],
      5: [
        [5, 7],
        [5, 6],
        [5, 11],
      ],
      6: [
        [6, 8],
        [6, 12],
      ],
      7: [[7, 9]],
      8: [[8, 10]],
      9: [],
      10: [],
      11: [
        [11, 12],
        [11, 13],
      ],
      12: [[12, 14]],
      13: [[13, 15]],
      14: [[14, 16]],
      15: [],
      16: [],
    };
    // Counter handler
    this.counter = new CounterHandler(this.ctxPose);
  }

  setup = async (poseDetectorConfig) => {
    this.estimationConfig = poseDetectorConfig.estimationConfig;
    if (
      this.nameModel === poseDetectorConfig.model &&
      JSON.stringify(this.detectorConfig) ===
        JSON.stringify(poseDetectorConfig.detectorConfig)
    )
      return;
    this.nameModel = poseDetectorConfig.model;
    this.model = poseDetection.SupportedModels[this.nameModel];
    this.detectorConfig = poseDetectorConfig.detectorConfig;
    this.detector = await poseDetection.createDetector(
      this.model,
      this.detectorConfig
    );
  };

  getPose = async () =>
    this.detector.estimatePoses(this.webcamElem, this.estimationConfig);

  drawSkeleton = (keypoints) => {
    if (!this.ctxPose) return null;
    this.ctxPose.clearRect(
      0,
      0,
      this.cnvPoseElem.width,
      this.cnvPoseElem.height
    );
    // Draw Angle:
    this.ctxPose.beginPath();
    this.ctxPose.fillStyle = "#eab308";
    this.counter.initStage();
    this.counter.detectAnglesAndStages(keypoints, this.currClass);
    this.ctxPose.stroke();
    this.ctxPose.fill();

    // Draw skeleton
    this.ctxPose.beginPath();
    this.ctxPose.fillStyle = "rgba(45,253,255,255)";
    this.ctxPose.strokeStyle = "black";

    const xyPoints = [];
    keypoints.forEach((p, i) => {
      xyPoints.push(p.x, p.y);
      if (p.score > this.tresholdPoints) {
        this.ctxPose.moveTo(p.x, p.y);
        this.ctxPose.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        this.lines[i].forEach((l) => {
          if (keypoints[l[1]].score > this.tresholdPoints) {
            this.ctxPose.moveTo(p.x, p.y);
            this.ctxPose.lineTo(keypoints[l[1]].x, keypoints[l[1]].y);
          }
        });
      }
    });
    // to collect dataset (TMP)
    if (this.isExtractKeypoints) {
      this.DBHandler.addKeypoints(xyPoints);
    }
    this.ctxPose.stroke();
    this.ctxPose.fill();
    this.ctxPose.strokeStyle = "white";
    this.counter.listAngles.forEach((dataAngle) => {
      this.ctxPose.strokeText(`${dataAngle[0]}°`, dataAngle[1], dataAngle[2]);
    });
    this.counter.listAngles = [];
    return xyPoints;
  };

  drawPose = () => {
    this.getPose().then((pose) => {
      if (pose.length !== 0) {
        // console.log(this.DBHandler.DBKeypoints);
        const xyPoints = this.drawSkeleton(pose[0].keypoints);
        if (
          xyPoints &&
          this.isClassify &&
          this.additionalElem.classElem &&
          this.frame % this.frameClassify === 0
        ) {
          this.classifier.predict(xyPoints).then((result) => {
            this.currClass = result.class;
            this.additionalElem.classElem.innerHTML = `
              <h1>Classifier run each: ${this.frameClassify} Frame</li> 
              <li>Class: ${result.class}</li>
              <li>Confidence: ${result.confidence}</li>
            `;
          });
        }
      }

      if (this.isClassify) {
        // Show counter
        if (this.additionalElem.countElem) {
          this.additionalElem.countElem.innerHTML = `
            <li>Count: ${this.counter.count}</li>`;
        }
        // Show stages
        if (this.additionalElem.stageElem) {
          this.additionalElem.stageElem.innerHTML = `
            <li>Last Stage: ${this.counter.lastStage.nameStage}</li>
            <li>Next Stage: ${this.counter.nextStage.nameStage}</li>
            <li>Current Stage: ${this.counter.currStage.nameStage}</li>
            <li>Status Current Stage: ${this.counter.currStage.statusStage}</li>`;
        }
        // Show advices
        if (
          this.additionalElem.adviceElem &&
          this.frame % this.frameClassify === 0
        ) {
          this.additionalElem.adviceElem.innerHTML = `
            <h1>Advice run each: ${this.frameClassify} Frame</h1>
            ${this.counter.getAdvice()}
          `;
        }
      }
      // console.log(pose[0].keypoints);
      if (this.isLoop) {
        window.requestAnimationFrame(this.drawPose);
      }
      if (this.additionalElem.fpsElem) {
        const now = performance.now();
        while (this.times.length > 0 && this.times[0] <= now - 1000) {
          this.times.shift();
        }
        this.times.push(now);
        this.fps = this.times.length;
        this.frame += 1;
        if (this.fps < 15) {
          this.frameClassify = Math.ceil(this.fps / 3); // prevent 0
        } else if (this.fps >= 15 && this.fps < 30) {
          this.frameClassify = Math.floor(this.fps / 5);
        } else if (this.fps >= 30 && this.fps < 45) {
          this.frameClassify = Math.floor(this.fps / 7);
        } else {
          this.frameClassify = Math.floor(this.fps / 10);
        }
        this.additionalElem.fpsElem.innerHTML = `
          <li>FPS: ${this.fps}</li>
        `;
      }
    });
  };
}
