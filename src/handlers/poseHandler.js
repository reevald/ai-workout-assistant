import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";

import DatasetHandler from "./datasetHandler";
import ClassifierHandler from "./classifierHandler";
import CounterHandler from "./counterHandler";
import WebcamHandler from "./webcamHandler";

export default class PoseHandler {
  constructor(webcamElem, cnvPoseElem) {
    // Dataset handler
    this.DBHandler = new DatasetHandler();
    this.isExtractKeypoints = false;

    // Camera Handler
    this.camHandler = new WebcamHandler(webcamElem);
    this.isVideoMode = false;
    this.scaler = null;

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
    this.isShowAdvice = false;
    this.isShowDirectionSign = true;
    this.tmpStage = "";
  }

  setup = async (poseDetectorConfig) => {
    this.estimationConfig = poseDetectorConfig.estimationConfig;
    // Prevent double setup for same configuration
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
    this.ctxPose.save();
    this.ctxPose.beginPath();
    // For handle flipping (horizontal)
    // eslint-disable-next-line no-underscore-dangle
    if (this.camHandler._facingMode === "user") {
      this.ctxPose.translate(this.cnvPoseElem.width, 0);
      this.ctxPose.scale(-1, 1);
    }
    // For handle scale when change resolution of screen
    if (this.scaler) {
      this.ctxPose.scale(this.scaler.w, this.scaler.h);
    }
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
    // Show number of angle in here, to overdraw previous skeleton & angles
    this.counter.listAngles.forEach((dataAngle) => {
      this.ctxPose.strokeText(`${dataAngle[0]}°`, dataAngle[1], dataAngle[2]);
    });
    this.counter.listAngles = [];
    this.ctxPose.restore();
    return xyPoints;
  };

  drawPose = () => {
    this.getPose().then((pose) => {
      if (pose && pose.length !== 0) {
        const xyPoints = this.drawSkeleton(pose[0].keypoints);
        if (
          xyPoints &&
          this.isClassify &&
          this.additionalElem.confidenceElem &&
          this.frame % this.frameClassify === 0
        ) {
          this.classifier.predict(xyPoints).then((result) => {
            // Case: 2 classes (workout & non-workout)
            this.currClass =
              result[0].confidence > result[1].confidence
                ? result[0].class
                : result[1].class;
            // Render confidence predict class with progress bar
            this.additionalElem.confidenceElem.style.clipPath = `inset(${
              (1 - result[1].confidence.toFixed(6)) * 100
            }% 0 0 0)`;
          });
        }
      }

      if (this.isClassify) {
        // Show counter
        if (this.additionalElem.countElem) {
          this.additionalElem.countElem.innerText = this.counter.count;
        }
        // Show directionSign
        if (
          this.isShowDirectionSign &&
          this.additionalElem.imgDirectionSignElem &&
          Object.keys(this.counter.nextStage).length !== 0 &&
          this.tmpStage !== this.counter.nextStage.nameStage
        ) {
          this.tmpStage = this.counter.nextStage.nameStage;
          if (this.counter.isNewAssetsImgStages) {
            this.counter.isNewAssetsImgStages = false;
            let htmlImgStages = "";
            this.counter.rules.pathImageStage.forEach((path) => {
              htmlImgStages += `<img
                class="animate-bounce"
                style="width: 56px; display: none"
                src="${path}"
                alt="Direction Sign"
              />`;
            });
            this.additionalElem.imgDirectionSignElem.innerHTML = htmlImgStages;
          }
          this.additionalElem.imgDirectionSignElem.style.display = this.counter
            .nextStage.nameStage
            ? "block"
            : "none";
          this.additionalElem.imgDirectionSignElem.children[
            this.counter.lastStage.idStage
          ].style.display = "none";
          this.additionalElem.imgDirectionSignElem.children[
            this.counter.nextStage.idStage
          ].style.display = "block";
          if (
            this.counter.isPlayAudStage &&
            this.counter.listAudStages[this.counter.nextStage.nameStage]
              .isLoaded
          ) {
            this.counter.listAudStages[this.counter.nextStage.nameStage].play();
          }
        }
        // Show advices
        if (this.isShowAdvice && this.additionalElem.adviceWrapElem) {
          const adviceHTML = this.counter.getAdvice();
          this.additionalElem.adviceWrapElem.style.display = adviceHTML
            ? "flex"
            : "none";
          this.additionalElem.adviceWrapElem.children[0].innerText =
            "Advice each frame";
          this.additionalElem.adviceWrapElem.children[1].innerHTML = adviceHTML;
        }
      }

      if (this.isLoop) {
        window.requestAnimationFrame(this.drawPose);
      }

      if (this.additionalElem.fpsElem) {
        const now = performance.now();
        while (this.times.length > 0 && this.times[0] <= now - 1000) {
          this.times.shift();
        }
        this.times.push(now);
        this.fps = this.times.length - 1;
        this.frame += 1;
        // This is to optimize how many times tfjs model will be predict
        // each 1 seconds. For example when fps 60, the model will be
        // predict each 60 / 10 = 6 frame.
        if (this.fps < 15) {
          this.frameClassify = Math.ceil(this.fps / 3); // prevent 0
        } else if (this.fps >= 15 && this.fps < 30) {
          this.frameClassify = Math.floor(this.fps / 5);
        } else if (this.fps >= 30 && this.fps < 45) {
          this.frameClassify = Math.floor(this.fps / 7);
        } else {
          this.frameClassify = Math.floor(this.fps / 10);
        }
        this.additionalElem.fpsElem.innerText = `FPS: ${this.fps}`;
      }
    });
  };
}
