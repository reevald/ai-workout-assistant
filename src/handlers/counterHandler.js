import AudioHandler from "./audioHandler";

export default class CounterHandler {
  constructor(ctxPose) {
    this.count = 0;
    this.rules = null;
    this.ctxPose = ctxPose;
    this.lastStage = {};
    this.nextStage = {};
    this.currStage = {};
    this.sumObsPoints = 0;
    this.obsStages = [];
    this.listAngles = [];
    this.isNewAssetsImgStages = false;
    this.isPlayAudStage = true;
    this.listAudStages = {};
    this.audCount = new AudioHandler({
      src: "./audio/count-from-pixabay.webm",
    });
    this.audCount.setup();
  }

  initStage = () => {
    this.currStage = {};
    this.obsStages = [];
    this.sumObsPoints = 0;
    this.rules.nameStage.forEach((stage, idx) => {
      this.obsStages.push({
        idStage: idx,
        nameStage: stage,
        sum: 0,
        detail: {},
      });
    });
    this.obsStages.push({
      idStage: -1,
      nameStage: "None",
      sum: 0,
      detail: {},
    }); // Last stage (other);
  };

  setup = (rulesConfig) => {
    this.rules = rulesConfig;
    this.isNewAssetsImgStages = true;
    this.initStage();
    this.rules.nameStage.forEach((stage, idx) => {
      this.listAudStages[stage] = new AudioHandler({
        src: this.rules.pathAudioStage[idx],
      });
      this.listAudStages[stage].setup();
    });
  };

  resetCount = () => {
    this.count = 0;
  };

  determineCurrStage = () => {
    if (this.obsStages.length !== 0) {
      // Sort Observation Stages by sum / number of anglepoint each stage
      const sortObsStages = [...this.obsStages].sort((a, b) => b.sum - a.sum);
      const statusStage =
        sortObsStages[0].sum === this.sumObsPoints ? "FULL" : "PARTIAL";
      this.currStage = {
        statusStage,
        idStage: sortObsStages[0].idStage,
        nameStage: sortObsStages[0].nameStage,
      };
      if (
        statusStage === "FULL" &&
        this.currStage.nameStage !== this.lastStage.nameStage &&
        this.currStage.idStage === this.rules.nameStage.length - 1
      ) {
        this.count += 1;
        if (this.isPlayAudStage && this.audCount.isLoaded) {
          this.audCount.play();
        }
      }
      if (
        statusStage === "FULL" &&
        sortObsStages[0].nameStage !== "None" &&
        (Object.keys(this.lastStage).length === 0 ||
          this.lastStage.nameStage !== sortObsStages[0].nameStage)
      ) {
        this.lastStage = {
          idStage: sortObsStages[0].idStage,
          nameStage: sortObsStages[0].nameStage,
        };
        const nextIdStage =
          this.lastStage.idStage + 1 !== this.rules.nameStage.length
            ? this.lastStage.idStage + 1
            : 0;
        this.nextStage = {
          idStage: nextIdStage,
          nameStage: this.rules.nameStage[nextIdStage],
        };
      }
    }
  };

  getAdvice = () => {
    if (Object.keys(this.nextStage).length === 0) return "";
    let advice = "";
    let counter = 1;

    const listIdxTrueAngle = this.obsStages[this.nextStage.idStage].detail;

    this.obsStages.forEach((stage) => {
      if (stage.nameStage === this.nextStage.nameStage) return;
      Object.keys(stage.detail).forEach((idKeypoint) => {
        if (idKeypoint in listIdxTrueAngle) return;

        if (counter === 1) {
          advice += `<p>To move ${this.nextStage.nameStage} :</p>`;
        }

        const { rangeAngle } = this.rules.anglePoint[idKeypoint];

        advice += `<p>${counter}) Angle <b>${stage.detail[idKeypoint].name
          .split("_")
          .map((name) => name.charAt(0).toUpperCase() + name.substr(1))
          .join(" ")}</b> (${stage.detail[idKeypoint].angle}°) must between ${
          rangeAngle[this.nextStage.idStage].min
        }° and ${rangeAngle[this.nextStage.idStage].max}°</p>`;

        counter += 1;
      });
    });
    return advice;
  };

  detectAnglesAndStages = (keypoints, classPredict) => {
    if (this.rules && this.ctxPose && classPredict === this.rules.nameWorkout) {
      keypoints.forEach((oriPoint, idx) => {
        if (!(idx in this.rules.anglePoint)) return;
        const { spouseIdx, rangeAngle } = this.rules.anglePoint[idx];
        const spousePointA = keypoints[spouseIdx[0]];
        const spousePointB = keypoints[spouseIdx[1]];
        let gradientLineA = Math.atan2(
          spousePointA.y - oriPoint.y,
          spousePointA.x - oriPoint.x
        );
        let gradientLineB = Math.atan2(
          spousePointB.y - oriPoint.y,
          spousePointB.x - oriPoint.x
        );
        let degAngle =
          parseInt(
            ((gradientLineB - gradientLineA) / Math.PI) * 180 + 360,
            10
          ) % 360;

        this.ctxPose.moveTo(oriPoint.x, oriPoint.y);

        if (degAngle > 180) {
          degAngle = 360 - degAngle;
          [gradientLineA, gradientLineB] = [gradientLineB, gradientLineA];
        }

        this.ctxPose.arc(
          oriPoint.x,
          oriPoint.y,
          20,
          gradientLineA,
          gradientLineB
        );
        this.ctxPose.fill();

        this.listAngles.push([degAngle, oriPoint.x + 5, oriPoint.y]);
        // Check angle for classify stage
        this.sumObsPoints += 1;
        let isStageNone = true;
        rangeAngle.forEach((range, idStage) => {
          if (degAngle >= range.min && degAngle <= range.max) {
            this.obsStages[idStage].sum += 1;
            this.obsStages[idStage].detail[idx] = {
              name: keypoints[idx].name,
              angle: degAngle,
            };
            isStageNone = false;
          }
        });
        if (isStageNone) {
          this.obsStages[this.obsStages.length - 1].sum += 1;
          this.obsStages[this.obsStages.length - 1].detail[idx] = {
            name: keypoints[idx].name,
            angle: degAngle,
          };
        }
      });
      this.determineCurrStage();
    }
  };
}
