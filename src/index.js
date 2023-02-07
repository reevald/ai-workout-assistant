import PoseHandler from "./handlers/poseHandler";
import TimerHandler from "./handlers/timerHandler";
import ScoreHandler from "./handlers/scoreHandler";
import SettingsHandler from "./handlers/settingsHandler";

document.addEventListener("DOMContentLoaded", async () => {
  let webcamElem = document.getElementById("webcamBox");
  const cnvPoseElem = document.getElementById("cnvPoseBox");
  const parentWebcamElem = document.getElementById("parentWebcamBox");

  const loaderElem = document.getElementById("loaderBox");
  const fpsElem = document.getElementById("fpsBox");
  const countElem = document.getElementById("countBox");
  const timerElem = document.getElementById("timerBox");
  const delayElem = document.getElementById("delayBox");
  const pauseBtnElem = document.getElementById("pauseBtn");
  const resumeBtnElem = document.getElementById("resumeBtn");
  const accessCamBtnElem = document.getElementById("accessCamBtn");

  const chooseWOElem = document.getElementById("chooseWOBox");
  const formChooseWOElem = document.getElementById("formChooseWOBox");
  const accessCamElem = document.getElementById("accessCamBox");
  const titleWOElem = document.getElementById("titleWOBox");
  const confidenceElem = document.getElementById("confidenceBox");
  const resultElem = document.getElementById("resultBox");
  const resultRepElem = document.getElementById("resultRepBox");
  const resultTitleElem = document.getElementById("resultTitleBox");
  const resultOKBtnElem = document.getElementById("resultOKBtn");
  const uploadVideoBtnElem = document.getElementById("uploadVideoBtn");
  const goWebcamBtnElem = document.getElementById("goWebcamBtn");

  const settingsBtnElem = document.getElementById("settingsBtn");
  const settingsElem = document.getElementById("settingsBox");
  const saveSettingsBtnElem = document.getElementById("saveSettingsBtn");
  const cancelSettingsBtnElem = document.getElementById("cancelSettingsBtn");
  const segSettingsWOBtnElem = document.getElementById("segSettingsWOBtn");
  const segSettingsAdvBtnElem = document.getElementById("segSettingsAdvBtn");
  const bodySettingsWOElem = document.getElementById("bodySettingsWOBox");
  const bodySettingsAdvElem = document.getElementById("bodySettingsAdvBox");

  const scoresBtnElem = document.getElementById("scoresBtn");
  const scoresElem = document.getElementById("scoresBox");
  const scoresOKBtnElem = document.getElementById("scoresOKBtn");
  const segJourneyBtnElem = document.getElementById("segJourneyBtn");
  const segBestBtnElem = document.getElementById("segBestBtn");
  const bodyJourneyElem = document.getElementById("bodyJourneyBox");
  const bodyBestScoreElem = document.getElementById("bodyBestScoreBox");

  const helpElem = document.getElementById("helpBox");
  const helpBtnElem = document.getElementById("helpBtn");
  const segHowToUseBtnElem = document.getElementById("segHowToUseBtn");
  const segAboutBtnElem = document.getElementById("segAboutBtn");
  const bodyHowToUseElem = document.getElementById("bodyHowToUseBox");
  const bodyAboutElem = document.getElementById("bodyAboutBox");
  const helpOKBtnElem = document.getElementById("helpOKBtn");

  const developerModeElem = document.getElementById("developerModeBox");
  const imgDirectionSignElem = document.getElementById("imgDirectionSignBox");
  const goAdviceBtnElem = document.getElementById("goAdviceBtn");
  const adviceWrapElem = document.getElementById("adviceWrapBox");
  const sliderAdviceElem = document.getElementById("sliderAdviceBox");
  const sliderCameraElem = document.getElementById("sliderCameraBox");
  const recordKeypointsBtnElem = document.getElementById("recordKeypointsBtn");
  const pingRecordElem = document.getElementById("pingRecordBox");
  const restartBtnElem = document.getElementById("restartBtn");

  let isFirstPlay = true;
  let isWebcamSecPlay = false;
  let widthRealVideo = 640;
  let heightRealVideo = 360;
  let widthResult = 0;
  let heightResult = 0;
  const ratio = {
    h: 9,
    w: 16,
  };

  const WOPose = new PoseHandler(webcamElem, cnvPoseElem);
  const WOTimer = new TimerHandler();
  const WOScore = new ScoreHandler();
  const WOSettings = new SettingsHandler();

  WOPose.additionalElem = {
    fpsElem,
    countElem,
    adviceWrapElem,
    confidenceElem,
    imgDirectionSignElem,
  };

  // eslint-disable-next-line no-underscore-dangle
  WOPose.camHandler._addVideoConfig = {
    width: widthRealVideo,
    height: heightRealVideo,
  };

  const resizeHandler = () => {
    widthResult = window.innerWidth > 1280 ? 1280 : window.innerWidth;
    heightResult = Math.floor(widthResult * (ratio.h / ratio.w));
    if (heightResult > window.innerHeight) {
      heightResult = window.innerHeight;
      widthResult = Math.floor(heightResult * (ratio.w / ratio.h));
    }

    parentWebcamElem.setAttribute(
      "style",
      `width:${widthResult}px;height:${heightResult}px`
    );

    for (let i = 0; i < parentWebcamElem.children.length; i += 1) {
      const element = parentWebcamElem.children[i];
      if (element.tagName === "CANVAS") {
        cnvPoseElem.width = widthResult;
        cnvPoseElem.height = heightResult;
      } else {
        element.style.width = `${widthResult}px`;
        element.style.height = `${heightResult}px`;
      }
    }

    WOPose.scaler = {
      w: widthResult / widthRealVideo,
      h: heightResult / heightRealVideo,
    };
  };

  // First run to auto adjust screen
  resizeHandler();

  window.addEventListener("resize", () => {
    resizeHandler();
  });

  // Render current settings and show to choose new settings
  const getHTMLChooseWO = (data, isSettings) => {
    // isSettings (true) to Advance Settings segment
    let htmlChooseWO = "";
    htmlChooseWO += isSettings
      ? `
      <div class="mb-3">What workout do you want?</div>
      `
      : `
      <div class="flex-1 overflow-y-auto flex flex-col items-center w-full">
        <h1 class="font-bold text-2xl mt-3 mb-5">AI Workout Assistant</h1>
        <div class="relative w-full flex flex-row justify-center items-center">
          <img
            src="./img/undraw_pilates_gpdb.svg"
            alt="Ilustration of Workout"
            class="w-1/2"
          />
          <div id="chooseHelpBtn" class="absolute top-0 bg-yellow-500 text-white font-bold py-1 px-2 rounded-lg cursor-pointer hover:bg-amber-500">Need Help ?</div>
        </div>
        <div class="mt-5 mb-3">What workout do you want?</div>
      `;

    data.nameWorkout.forEach((nameWO, idx) => {
      if (idx === 0) {
        htmlChooseWO += `<fieldset class="grid grid-cols-2 gap-3 w-full">`;
      }
      htmlChooseWO += `
        <label
          for="${isSettings ? `settingsName${idx}` : `chooseName${idx}`}"
          class="flex cursor-pointer items-center pl-4 border border-gray-200 rounded-lg"
        >
          <input
            id="${isSettings ? `settingsName${idx}` : `chooseName${idx}`}"
            type="radio"
            value="${data.slugWorkout[idx]}"
            name="${isSettings ? "settingsNameWO" : "chooseNameWO"}"
            class="w-4 h-4 text-yellow-600"
            required
          />
          <span class="w-full py-4 ml-2 text-sm font-medium text-gray-600"
            >${nameWO}</span
          >
        </label>
        `;
      if (idx === data.nameWorkout.length - 1) {
        htmlChooseWO += `</fieldset>`;
      }
    });

    htmlChooseWO += `<div class="${
      isSettings ? "mt-3" : "mt-5"
    } mb-3">How long?</div>`;

    data.duration.forEach((duration, idx) => {
      if (idx === 0) {
        htmlChooseWO += `<fieldset class="grid grid-cols-2 gap-3 w-full">`;
      }
      htmlChooseWO += `
        <label
          for="${
            isSettings ? `settingsDuration${idx}` : `chooseDuration${idx}`
          }"
          class="flex cursor-pointer items-center pl-4 border border-gray-200 rounded-lg"
        >
          <input
            id="${
              isSettings ? `settingsDuration${idx}` : `chooseDuration${idx}`
            }"
            type="radio"
            value="${duration}"
            name="${isSettings ? "settingsDurationWO" : "chooseDurationWO"}"
            class="w-4 h-4 text-yellow-600"
            required
          />
          <span class="w-full py-4 ml-2 text-sm font-medium text-gray-600"
            >${duration}</span
          >
        </label>
        `;
      if (idx === data.duration.length - 1) {
        htmlChooseWO += `</fieldset>`;
      }
    });

    htmlChooseWO += isSettings
      ? ""
      : `
        </div>
        <button
          id="submitWOBtn"
          type="submit"
          class="w-full bg-yellow-500 text-white py-2 text-xl font-bold rounded-lg mb-2 mt-5 hover:bg-amber-500"
        >
          Next
        </button>
      `;

    return htmlChooseWO;
  };

  // Ask to get permission to access camera
  const getAccessCam = async () => {
    if (!webcamElem.paused && WOPose.isLoop) return;
    loaderElem.style.display = "flex";
    // Try get permission as well as stream
    await WOPose.camHandler
      .start()
      .then(() => {
        // Save settings if got access camera to use in future (reload)
        WOSettings.change({
          isAccessCamera: true,
        });
        loaderElem.style.display = "none";
        accessCamElem.style.display = "none";
      })
      .catch((err) => {
        console.log("Permission Denied: Webcam Access is Not Granted");
        console.error(err);
        // eslint-disable-next-line no-alert
        alert("Webcam Access is Not Granted, Try to Refresh Page");
      });
  };

  // Update and show current time
  const setCurrTime = () => {
    const currTime = WOTimer.getCurrTime();
    timerElem.innerHTML = `${`0${currTime.minutes}`.slice(
      -2
    )}:${`0${currTime.seconds}`.slice(-2)}`;
  };

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
        const title = `${data.rulesCountConfig.nameWorkout} - ${WOSettings.DBWOSettings.currDuration}`;
        titleWOElem.innerText = title;
        resultTitleElem.innerText = title;

        // Setup timer to first play
        WOTimer.remove();
        WOTimer.setup({
          interval: 1000,
          duration: WOPose.isVideoMode
            ? Math.floor(webcamElem.duration)
            : 60 * +WOSettings.DBWOSettings.currDuration.split(" ")[0],
          type: "DEC",
          firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
        });
        WOTimer.isFirstDelay = !WOPose.isVideoMode;
        setCurrTime();

        // Setup and load pose detector (movenet or other)
        await WOPose.setup(data.poseDetectorConfig)
          .then(() => {
            console.log("Detector Loaded");
          })
          .catch((e) => {
            console.error(e);
          });

        // Setup and load classifier (tfjs model)
        await WOPose.classifier
          .setup(data.classifierConfig, {
            width: widthRealVideo,
            height: heightRealVideo,
          })
          .then(async () => {
            console.log("Classifier Ready to Use");
            chooseWOElem.style.display = "none";
            if (WOSettings.DBWOSettings.isAccessCamera) {
              // It still try to get access (auto) to check if disabled
              if (!WOPose.isVideoMode) await getAccessCam();
            } else {
              loaderElem.style.display = "none";
              accessCamElem.style.display = "flex";
            }
          })
          .catch((e) => {
            console.error(e);
          });
      })
      .catch((e) => {
        console.error(e);
      });
  };

  helpBtnElem.addEventListener("click", () => {
    helpElem.style.display = "flex";
  });

  helpOKBtnElem.addEventListener("click", () => {
    helpElem.style.display = "none";
  });

  segHowToUseBtnElem.addEventListener("click", () => {
    if (bodyHowToUseElem.style.display !== "none") return;
    bodyAboutElem.style.display = "none";
    bodyHowToUseElem.style.display = "flex";
    segAboutBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segAboutBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segHowToUseBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segHowToUseBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  segAboutBtnElem.addEventListener("click", () => {
    if (bodyAboutElem.style.display !== "none") return;
    bodyHowToUseElem.style.display = "none";
    bodyAboutElem.style.display = "flex";
    segHowToUseBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segHowToUseBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segAboutBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segAboutBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  restartBtnElem.addEventListener("click", () => {
    loaderElem.style.display = "flex";
    delayElem.innerText = "";

    WOTimer.setup({
      interval: 1000,
      duration: WOPose.isVideoMode
        ? Math.floor(webcamElem.duration)
        : 60 * +WOSettings.DBWOSettings.currDuration.split(" ")[0],
      type: "DEC",
      firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
    });

    WOPose.counter.resetCount();
    countElem.innerText = "0";

    WOTimer.isFirstDelay = !WOPose.isVideoMode;
    if (WOPose.isVideoMode && webcamElem.currentTime !== 0) {
      webcamElem.currentTime = 0;
      webcamElem.load();
    }

    setCurrTime();
    WOTimer.pause();
    webcamElem.pause();
    WOPose.isLoop = false;
    isFirstPlay = true;
    isWebcamSecPlay = true;
    WOPose.counter.lastStage = {};
    WOPose.counter.nextStage = {};

    // Clear screen
    imgDirectionSignElem.style.display = "none";
    adviceWrapElem.style.display = "none";
    resumeBtnElem.style.display = "flex";
    restartBtnElem.style.display = "none";
    pauseBtnElem.style.display = "none";
    loaderElem.style.display = "none";
  });

  recordKeypointsBtnElem.addEventListener("click", () => {
    // Toggler for start and stop extract keypoints each frame
    WOPose.isExtractKeypoints = !WOPose.isExtractKeypoints;
    if (WOPose.isExtractKeypoints) {
      pingRecordElem.classList.remove("bg-gray-500");
      pingRecordElem.classList.add("bg-red-500");
      pingRecordElem.children[0].style.display = "block";
    } else {
      pingRecordElem.classList.remove("bg-red-500");
      pingRecordElem.classList.add("bg-gray-500");
      pingRecordElem.children[0].style.display = "none";
      WOPose.DBHandler.saveToCSV();
    }
  });

  scoresBtnElem.addEventListener("click", () => {
    // Render current journey score and best score
    let htmlJourney = "";
    let htmlBestScore = "";
    const bestScore = WOScore.getBestScoreByReps();
    Object.keys(bestScore).forEach((nameWO) => {
      htmlBestScore += `
        <div class="mb-3 text-gray-500 font-bold border-t-2 pt-1">
          ${nameWO}
        </div>
      `;
      Object.keys(bestScore[nameWO]).forEach((durationWO, idx) => {
        if (idx === 0) {
          htmlBestScore += `
            <div class="mb-3 grid grid-cols-2 gap-3 w-full">
          `;
        }
        htmlBestScore += `
          <div
            class="flex flex-col w-full bg-white rounded-lg overflow-hidden shadow-sm"
          >
            <div
              class="p-1 bg-yellow-400 text-center font-medium text-sm text-gray-500"
            >
              ${durationWO}
            </div>
            <div class="p-1 text-center text-gray-500 font-medium text-lg">
              ${bestScore[nameWO][durationWO]}<span class="text-xs"> Reps</span>
            </div>
          </div>
        `;
        if (idx === Object.keys(bestScore[nameWO]).length - 1) {
          htmlBestScore += `
            </div>
          `;
        }
      });
    });

    if (WOScore.DBWOScore.length === 0) {
      htmlJourney += `
      <div class="flex flex-row w-full h-full justify-center items-center">
        <div class="flex flex-col items-center">
          <img
            src="./img/undraw_void_-3-ggu.svg"
            alt="Ilustration of Void"
            class="w-1/2"
          />
          <div class="p-3 text-sm text-gray-600 text-center">There are no Journey Scores. Let's do Workout to change that!</div>
        </div>
      </div>
      `;
    }
    // Sort by id (date miliseconds) to get newest score
    const sortDBWOScore = [...WOScore.DBWOScore].sort((a, b) => b.id - a.id);
    sortDBWOScore.forEach((data) => {
      htmlJourney += `
        <div
          class="mb-3 w-full border-t-2 border-yellow-200 bg-white flex flex-row justify justify-between px-3 py-1.5"
        >
          <div class="flex flex-col items-start justify-between">
            <div class="flex flex-row items-center">
              <div class="text-md text-gray-600 font-semibold mr-2">
                ${data.nameWorkout}
              </div>
              <div
                class="text-xs px-1 py-0.5 bg-gray-200 rounded-lg text-gray-600 font-semibold"
              >
                ${data.duration}
              </div>
            </div>
            <div class="text-xs">${data.date}</div>
          </div>
          <div class="flex flex-col items-center justify-between">
            <div class="text-xl font-semibold text-gray-600">${data.repetition}</div>
            <div class="text-xs">Reps</div>
          </div>
        </div>
      `;
    });
    bodyJourneyElem.innerHTML = htmlJourney;
    bodyBestScoreElem.innerHTML = htmlBestScore;
    scoresElem.style.display = "flex";
  });

  scoresOKBtnElem.addEventListener("click", () => {
    scoresElem.style.display = "none";
  });

  segJourneyBtnElem.addEventListener("click", () => {
    // Show body journey element
    if (bodyJourneyElem.style.display !== "none") return;
    bodyBestScoreElem.style.display = "none";
    bodyJourneyElem.style.display = "block";
    segBestBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segBestBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segJourneyBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segJourneyBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  segBestBtnElem.addEventListener("click", () => {
    // Show body best score element
    if (bodyBestScoreElem.style.display !== "none") return;
    bodyJourneyElem.style.display = "none";
    bodyBestScoreElem.style.display = "block";
    segJourneyBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segJourneyBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segBestBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segBestBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  segSettingsWOBtnElem.addEventListener("click", () => {
    // Show body settings (choose WO) element
    if (bodySettingsWOElem.style.display !== "none") return;
    bodySettingsAdvElem.style.display = "none";
    bodySettingsWOElem.style.display = "block";
    segSettingsAdvBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segSettingsAdvBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segSettingsWOBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segSettingsWOBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  segSettingsAdvBtnElem.addEventListener("click", () => {
    // Show body advance settings element
    if (bodySettingsAdvElem.style.display !== "none") return;
    bodySettingsWOElem.style.display = "none";
    bodySettingsAdvElem.style.display = "block";
    segSettingsWOBtnElem.classList.remove("bg-amber-300", "text-gray-600");
    segSettingsWOBtnElem.classList.add("bg-amber-200", "text-gray-400");
    segSettingsAdvBtnElem.classList.remove("bg-amber-200", "text-gray-400");
    segSettingsAdvBtnElem.classList.add("bg-amber-300", "text-gray-600");
  });

  settingsBtnElem.addEventListener("click", () => {
    // Show modal / pop up settings element (choose WO & advance settings)
    settingsElem.style.display = "flex";
    // Get and show current settings
    document.querySelector(
      `input[value="${WOSettings.DBWOSettings.currWorkout}"][name="settingsNameWO"]`
    ).checked = true;
    document.querySelector(
      `input[value="${WOSettings.DBWOSettings.currDuration}"][name="settingsDurationWO"]`
    ).checked = true;
    document.querySelector('input[name="settingsAEBox"]').checked =
      WOSettings.DBWOSettings.isAudioEffect !== undefined
        ? WOSettings.DBWOSettings.isAudioEffect
        : true; // Default setting Audio Effect
    document.querySelector('input[name="settingsFSBox"]').checked =
      WOSettings.DBWOSettings.isFullscreen !== undefined
        ? WOSettings.DBWOSettings.isFullscreen
        : false; // Default setting Full Screen
    document.querySelector('input[name="settingsFCBox"]').checked =
      WOSettings.DBWOSettings.isFlipCamera !== undefined
        ? WOSettings.DBWOSettings.isFlipCamera
        : false; // Default setting Flip Camera
    document.querySelector('input[name="settingsDSBox"]').checked =
      WOSettings.DBWOSettings.isDirectionSign !== undefined
        ? WOSettings.DBWOSettings.isDirectionSign
        : true; // Default setting Direction Sign
    document.querySelector('input[name="settingsDMBox"]').checked =
      WOSettings.DBWOSettings.isDeveloperMode !== undefined
        ? WOSettings.DBWOSettings.isDeveloperMode
        : false; // Default setting Developer Mode
  });

  const actionSettings = {
    currWorkoutDuration: async (data) => {
      loaderElem.style.display = "flex";
      delayElem.innerText = "";
      webcamElem.pause();
      WOPose.isLoop = false;
      isFirstPlay = true;
      isWebcamSecPlay = true;
      WOPose.counter.lastStage = {};
      WOPose.counter.nextStage = {};

      if (data.durationWO.isChange) {
        WOTimer.setup({
          interval: 1000,
          duration: WOPose.isVideoMode
            ? Math.floor(webcamElem.duration)
            : 60 * +data.durationWO.value.split(" ")[0],
          type: "DEC",
          firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
        });

        setCurrTime();
        const title = `${WOPose.counter.rules.nameWorkout} - ${data.durationWO.value}`;
        titleWOElem.innerText = title;
        resultTitleElem.innerText = title;
      }
      if (data.nameWO.isChange) {
        await setupChangeWO(`./rules/${data.nameWO.value}.json`);
      }

      WOTimer.isFirstDelay = !WOPose.isVideoMode;
      if (WOPose.isVideoMode && webcamElem.currentTime !== 0) {
        webcamElem.currentTime = 0;
        webcamElem.load();
      }

      WOTimer.pause();
      // Clear screen
      imgDirectionSignElem.style.display = "none";
      adviceWrapElem.style.display = "none";
      resumeBtnElem.style.display = "flex";
      restartBtnElem.style.display = "none";
      pauseBtnElem.style.display = "none";
      loaderElem.style.display = "none";
    },
    isAudioEffect: (data) => {
      WOPose.counter.isPlayAudStage = data;
      WOTimer.isPlayAudTimer = data;
    },
    isFullscreen: (data) => {
      if (data && !document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (
        !data &&
        document.exitFullscreen &&
        document.fullscreenElement
      ) {
        document.exitFullscreen();
      }
    },
    isFlipCamera: (data) => {
      // Default (user for webcam) and auto change to "environment" if video
      const facingMode = data ? "environment" : "user";
      WOPose.camHandler.flip(facingMode);
    },
    isDirectionSign: (data) => {
      // Toggler to show direction sign
      WOPose.isShowDirectionSign = data;
      if (WOPose.isClassify) {
        imgDirectionSignElem.style.display = data ? "block" : "none";
      }
    },
    isDeveloperMode: (data) => {
      // Toggler to show developer mode element
      developerModeElem.style.display = data ? "flex" : "none";
    },
  };

  saveSettingsBtnElem.addEventListener("click", () => {
    // Get newest data settings
    const currWorkout = document.querySelector(
      'input[name="settingsNameWO"]:checked'
    ).value;
    const currDuration = document.querySelector(
      'input[name="settingsDurationWO"]:checked'
    ).value;
    const isAudioEffect = document.querySelector(
      'input[name="settingsAEBox"]'
    ).checked;
    const isFullscreen = document.querySelector(
      'input[name="settingsFSBox"]'
    ).checked;
    const isFlipCamera = document.querySelector(
      'input[name="settingsFCBox"]'
    ).checked;
    const isDirectionSign = document.querySelector(
      'input[name="settingsDSBox"]'
    ).checked;
    const isDeveloperMode = document.querySelector(
      'input[name="settingsDMBox"]'
    ).checked;

    // Send newest settings to check and get change
    WOSettings.change(
      {
        currWorkout,
        currDuration,
        isAudioEffect,
        isFullscreen,
        isFlipCamera,
        isDirectionSign,
        isDeveloperMode,
      },
      actionSettings
    );
    settingsElem.style.display = "none";
  });

  cancelSettingsBtnElem.addEventListener("click", () => {
    settingsElem.style.display = "none";
  });

  // Get configuration of scores
  const setupWOScore = async (path) => {
    await fetch(path)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error${resp.status}`);
        }
        return resp.json();
      })
      .then(async (data) => {
        formChooseWOElem.innerHTML = getHTMLChooseWO(data, false);
        bodySettingsWOElem.innerHTML = getHTMLChooseWO(data, true);
        document
          .getElementById("chooseHelpBtn")
          .addEventListener("click", () => {
            helpElem.style.display = "flex";
          });
        // Init and try to load localStorage data scores
        WOScore.setup(data);
        // Init and try to load localStorage data settings
        WOSettings.setup(data.settingsConfig, {
          isFlipCamera: actionSettings.isFlipCamera,
          isDeveloperMode: actionSettings.isDeveloperMode,
        });
        if (
          WOSettings.isGetPrevSettings &&
          WOSettings.DBWOSettings.currWorkout &&
          WOSettings.DBWOSettings.currWorkout !== "None"
        ) {
          loaderElem.style.display = "flex";
          await setupChangeWO(
            `./rules/${WOSettings.DBWOSettings.currWorkout}.json`
          );
        } else {
          chooseWOElem.style.display = "flex";
          loaderElem.style.display = "none";
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  await setupWOScore("./mock-data/workout.json");

  // Just for initial (once run)
  // It will be remove when replaced by new webcamElem
  // Check: uploadVideoBtnElem
  webcamElem.addEventListener("loadeddata", () => {
    if (!WOPose.isVideoMode) {
      if (WOPose.isClassify) {
        WOPose.isClassify = false;
      }
      WOPose.isLoop = true;
      sliderCameraElem.checked = true;
      if (isWebcamSecPlay) {
        isWebcamSecPlay = false;
      }
      delayElem.innerText = "";
      WOTimer.pause();
      WOPose.counter.resetCount();
      WOPose.drawPose();
    }
  });

  accessCamBtnElem.addEventListener("click", async () => {
    await getAccessCam();
  });

  formChooseWOElem.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Get user choice
    const workout = document.querySelector(
      'input[name="chooseNameWO"]:checked'
    ).value;
    const duration = document.querySelector(
      'input[name="chooseDurationWO"]:checked'
    ).value;
    if (event.submitter.id === "submitWOBtn") {
      // Change without action as initial run (first play)
      WOSettings.change({
        currWorkout: workout,
        currDuration: duration,
      });
      chooseWOElem.style.display = "flex";
      loaderElem.style.display = "flex";
      await setupChangeWO(`./rules/${workout}.json`);
    }
  });

  // Callback to update and show delay time
  const delayCB = (time) => {
    delayElem.innerText = time;
  };
  // Callback when delay time is finished
  const finishDelayCB = () => {
    delayElem.innerText = "";
  };
  // Callback to update and show current time
  const timerCB = (time) => {
    timerElem.innerText = `${`0${time.minutes}`.slice(
      -2
    )}:${`0${time.seconds}`.slice(-2)}`;
  };
  // Callback when timer is finished
  const finishTimerCB = () => {
    // Only save when not video mode
    if (!WOPose.isVideoMode) {
      WOScore.addNewData({
        id: +new Date(),
        nameWorkout: WOPose.counter.rules.nameWorkout,
        duration: WOSettings.DBWOSettings.currDuration,
        repetition: WOPose.counter.count,
        date: new Date().toLocaleString(),
      });
    }
    setCurrTime();
    WOTimer.isFirstDelay = !WOPose.isVideoMode;
    resultRepElem.innerText = WOPose.counter.count;
    WOTimer.start(delayCB, finishDelayCB, timerCB, finishTimerCB);
    WOTimer.pause();
    webcamElem.pause();
    isFirstPlay = true;
    WOPose.isLoop = false;
    WOPose.counter.resetCount();
    WOPose.counter.lastStage = {};
    WOPose.counter.nextStage = {};
    resultElem.style.display = "flex";
    resumeBtnElem.style.display = "flex";
    restartBtnElem.style.display = "none";
    pauseBtnElem.style.display = "none";
    imgDirectionSignElem.style.display = "none";
    adviceWrapElem.style.display = "none";
  };

  // Fired when timer is finished and try to restart with OK btn
  resultOKBtnElem.addEventListener("click", () => {
    resultElem.style.display = "none";
    if (isFirstPlay && WOPose.isVideoMode) {
      webcamElem.pause();
      webcamElem.currentTime = 0;
      webcamElem.load();
    } else {
      WOTimer.reset();
      setCurrTime();
    }
  });

  // Pause webcam or video
  pauseBtnElem.addEventListener("click", () => {
    WOTimer.pause();
    webcamElem.pause();
    WOPose.isLoop = false;
    resumeBtnElem.style.display = "flex";
    restartBtnElem.style.display = "flex";
    pauseBtnElem.style.display = "none";
  });

  // Play or resume button for video and webcam
  resumeBtnElem.addEventListener("click", () => {
    if (!isFirstPlay && !webcamElem.paused && WOPose.isLoop) return;
    pauseBtnElem.style.display = "flex";
    restartBtnElem.style.display = "none";
    resumeBtnElem.style.display = "none";
    const firstPlay = isFirstPlay;

    if (isFirstPlay) {
      isFirstPlay = false;
      WOPose.isClassify = true;
      WOTimer.start(delayCB, finishDelayCB, timerCB, finishTimerCB);
    }

    WOTimer.resume();
    WOPose.isLoop = true;
    webcamElem.play().then(() => {
      if (!isWebcamSecPlay && firstPlay && !WOPose.isVideoMode) {
        console.log("It run?");
        isWebcamSecPlay = true;
        // Return to stop redraw again (first play)
        return;
      }
      WOPose.drawPose();
    });
  });

  uploadVideoBtnElem.addEventListener("change", (event) => {
    if (event.target.files && event.target.files[0]) {
      // Stop webcam first before replace with video
      WOPose.camHandler.stop();
      WOPose.isClassify = true;
      WOPose.isLoop = false;
      WOPose.isVideoMode = true;
      webcamElem.pause();
      // Remove current webcamElem to fix error pose detector
      // during transition source webcam to video (it's async, not directly changing)
      webcamElem.remove();

      const newWebcamElem = document.createElement("video");
      newWebcamElem.setAttribute("id", "webcamBox");
      newWebcamElem.setAttribute("class", "bg-gray-200 z-10");
      newWebcamElem.setAttribute(
        "style",
        `width: ${widthResult}px; height: ${heightResult}px`
      );
      newWebcamElem.muted = true;

      parentWebcamElem.insertBefore(newWebcamElem, parentWebcamElem.firstChild);

      newWebcamElem.setAttribute(
        "src",
        URL.createObjectURL(event.target.files[0])
      );
      newWebcamElem.load();
      newWebcamElem.play();
      // When first time upload video, the facingMode is always "environment"
      // So we need to flip true ("environment" mode) to draw canvas properly
      WOSettings.change(
        { isFlipCamera: true },
        { isFlipCamera: actionSettings.isFlipCamera }
      );

      newWebcamElem.addEventListener("loadeddata", () => {
        if (WOPose.isVideoMode) {
          webcamElem = newWebcamElem;
          WOPose.webcamElem = newWebcamElem;
          // This is for prepare when to switch to webcam again
          // eslint-disable-next-line no-underscore-dangle
          WOPose.camHandler._webcamElement = newWebcamElem;
        }
        WOPose.counter.resetCount();
        countElem.innerText = "0";
        delayElem.innerText = "";
        WOTimer.setup({
          interval: 1000,
          duration: WOPose.isVideoMode
            ? Math.floor(webcamElem.duration)
            : 60 * +WOSettings.DBWOSettings.currDuration.split(" ")[0],
          type: "DEC",
          firstDelayDuration: WOPose.isVideoMode ? 0 : 3,
        });
        WOTimer.isFirstDelay = !WOPose.isVideoMode;
        WOTimer.pause();
        setCurrTime();
        webcamElem.pause();
        WOPose.counter.lastStage = {};
        WOPose.counter.nextStage = {};
        if (widthRealVideo !== 0 && WOPose.isVideoMode) {
          heightRealVideo = newWebcamElem.videoHeight;
          widthRealVideo = newWebcamElem.videoWidth;
        }
        WOPose.scaler = {
          w: widthResult / widthRealVideo,
          h: heightResult / heightRealVideo,
        };
        WOPose.classifier.stdConfig = {
          width: widthRealVideo,
          height: heightRealVideo,
        };
        resumeBtnElem.style.display = "flex";
        restartBtnElem.style.display = "none";
        pauseBtnElem.style.display = "none";
        imgDirectionSignElem.style.display = "none";
        adviceWrapElem.style.display = "none";
        sliderCameraElem.checked = !WOPose.isVideoMode;
      });
    }
  });

  // Advice auto show when classifier is running
  goAdviceBtnElem.addEventListener("click", (event) => {
    event.preventDefault();
    WOPose.isShowAdvice = !WOPose.isShowAdvice;
    sliderAdviceElem.checked = WOPose.isShowAdvice;
    if (WOPose.isClassify) {
      adviceWrapElem.style.display = WOPose.isShowAdvice ? "flex" : "none";
    }
  });

  goWebcamBtnElem.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!WOPose.isVideoMode) return;
    widthRealVideo = 640;
    heightRealVideo = 360;
    // Constraint settings for webcam
    // eslint-disable-next-line no-underscore-dangle
    WOPose.camHandler._addVideoConfig = {
      width: widthRealVideo,
      height: heightRealVideo,
    };
    WOPose.classifier.stdConfig = {
      width: widthRealVideo,
      height: heightRealVideo,
    };
    WOPose.isLoop = false;
    isWebcamSecPlay = true;
    sliderCameraElem.checked = true;
    WOPose.isVideoMode = false;
    await WOPose.camHandler.start();
  });
});
