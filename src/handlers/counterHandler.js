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
        detail: [],
      });
    });
    this.obsStages.push({
      idStage: -1,
      nameStage: "None",
      sum: 0,
      detail: [],
    }); // Last stage (other);
  };

  setup = (rulesConfig) => {
    this.rules = rulesConfig;
    this.initStage();
  };

  resetCount = () => {
    this.count = 0;
  };

  determineCurrStage = () => {
    if (this.obsStages.length !== 0) {
      this.obsStages.sort((a, b) => b.sum - a.sum);
      const statusStage =
        this.obsStages[0].sum === this.sumObsPoints ? "FULL" : "PARTIAL";
      this.currStage = {
        statusStage,
        idStage: this.obsStages[0].idStage,
        nameStage: this.obsStages[0].nameStage,
      };
      if (
        statusStage === "FULL" &&
        this.currStage.nameStage !== this.lastStage.nameStage &&
        this.currStage.idStage === this.rules.nameStage.length - 1
      ) {
        this.count += 1;
      }
      if (
        statusStage === "FULL" &&
        this.obsStages[0].nameStage !== "None" &&
        (Object.keys(this.lastStage).length === 0 ||
          this.lastStage.nameStage !== this.obsStages[0].nameStage)
      ) {
        this.lastStage = {
          idStage: this.obsStages[0].idStage,
          nameStage: this.obsStages[0].nameStage,
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
    if (this.currStage.statusStage === "FULL") {
      if (this.currStage.nameStage === "None") {
        // First of all (nameStage[0] on this.rules)
        return `Please Move to "${this.rules.nameStage[0]}"`;
      }
      return "<li>Good Job!</li>";
    }
    // For partial (statusStage)
    // If nameStage "None"
    if (this.currStage.nameStage === "None") {
      if (Object.keys(this.lastStage).length === 0) {
        return `Please Move to "${this.rules.nameStage[0]}"`;
      }
      return `Please Move to "${this.nextStage.nameStage}"`;
    }
    let advice = "";
    this.obsStages.forEach((stage) => {
      if (stage.nameStage !== this.currStage.nameStage) {
        stage.detail.forEach((dataAngle, idxAngle) => {
          if (idxAngle === this.rules.nameStage.length) return;
          const { rangeAngle } = this.rules.anglePoint[dataAngle[0]];
          advice += `<li>${dataAngle[1]} (id: ${dataAngle[0]}) must in range [${rangeAngle[idxAngle].min}, ${rangeAngle[idxAngle].max}] to move "${this.nextStage.nameStage}"</li>`;
        });
      }
    });
    return advice;
  };

  detectAnglesAndStages = (keypoints, classPredict) => {
    if (this.rules && this.ctxPose && classPredict === this.rules.nameWorkout) {
      keypoints.forEach((oriPoint, idx) => {
        if (Object.keys(this.rules.anglePoint[idx]).length === 0) return;
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
            this.obsStages[idStage].detail.push([idx, keypoints[idx].name]);
            isStageNone = false;
          }
        });
        if (isStageNone) {
          this.obsStages[this.obsStages.length - 1].sum += 1;
          this.obsStages[this.obsStages.length - 1].detail.push([
            idx,
            keypoints[idx].name,
          ]);
        }
      });
      this.determineCurrStage();
    }
  };
}
