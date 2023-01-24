import WebcamHandler from "./handlers/webcamHandler";
import PoseHandler from "./handlers/poseHandler";

document.addEventListener("DOMContentLoaded", async () => {
  const webcamElem = document.getElementById("webcam");
  const cnvPoseElem = document.getElementById("cnvPose");

  const loaderElem = document.getElementById("loaderBox");
  const fpsElem = document.getElementById("fpsBox");
  const classElem = document.getElementById("classBox");
  const stageElem = document.getElementById("stageBox");
  const countElem = document.getElementById("countBox");
  const adviceElem = document.getElementById("adviceBox");
  const pauseBtnElem = document.getElementById("pauseBtn");
  const resumeBtnElem = document.getElementById("resumeBtn");
  const downloadDataBtnElem = document.getElementById("dataBtn");
  const accessCamBtnElem = document.getElementById("accessCamBtn");

  const WOCam = new WebcamHandler(webcamElem);
  const WOPose = new PoseHandler(webcamElem, cnvPoseElem);

  // Get configuration
  const setupChangeWO = async (path) => {
    await fetch(path)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error${resp.status}`);
        }
        return resp.json();
      })
      .then(async (data) => {
        WOPose.counter.setup(data.rulesCountConfig);
        await WOPose.setup(data.poseDetectorConfig)
          .then(() => {
            console.log("Detector Loaded");
          })
          .catch((e) => {
            console.error(e);
          });
        await WOPose.classifier
          .setup(data.classifierConfig)
          .then(() => {
            console.log("Classifier Ready to Use");
            loaderElem.style.display = "none";
          })
          .catch((e) => {
            console.error(e);
          });
      });
  };

  await setupChangeWO("./rules/squat.json");

  // WOPose.isLoop = true;
  WOPose.additionalElem = {
    ...WOPose.additionalElem,
    fpsElem,
    classElem,
    countElem,
    stageElem,
    adviceElem,
  };

  pauseBtnElem.addEventListener("click", () => {
    webcamElem.pause();
    WOPose.isLoop = false;
  });
  resumeBtnElem.addEventListener("click", () => {
    if (!webcamElem.paused && WOPose.isLoop) return;
    webcamElem.play();
    WOPose.isLoop = true;
    WOPose.drawPose();
  });
  downloadDataBtnElem.addEventListener("click", () => {
    WOPose.DBHandler.saveToCSV();
  });
  // Mode webcam
  if (webcamElem.src === "") {
    accessCamBtnElem.addEventListener("click", async () => {
      if (!webcamElem.paused && WOPose.isLoop) return;
      console.log("Loading Webcam...");
      await WOCam.start()
        .then((result) => {
          console.log("Webcam Streamed");
          console.log(result);
        })
        .catch((err) => {
          console.log("Webcam Access is Not Granted");
          console.error(err);
        });
    });

    webcamElem.addEventListener("loadeddata", () => {
      WOPose.isClassify = false;
      WOPose.isLoop = true;
      WOPose.drawPose();
    });
  } else {
    // Mode video (activate: add value on src attribute)
    WOPose.estimationConfig = {
      ...WOPose.estimationConfig,
      flipHorizontal: false,
    };
    WOPose.drawPose();
  }
});
