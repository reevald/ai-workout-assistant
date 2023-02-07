import AudioHandler from "./audioHandler";

export default class TimerHandler {
  constructor() {
    this.currTime = 0; // in second
    this.targetTime = null;
    this.interval = 1000; // in miliseconds
    this.duration = null; // in second
    this.isPaused = true;
    this.runner = null;
    this.type = "INC"; // INC or DEC
    this.firstDelayDuration = null;
    this.currDelayTime = 0; // Count down
    this.isFirstDelay = true;
    this.isPlayAudTimer = true;
    this.audStart = new AudioHandler({
      src: "./audio/start-from-google-translate.webm",
    });
    this.audDone = new AudioHandler({
      src: "./audio/done-from-freesound.webm",
    });
    this.listAudCounts = [
      new AudioHandler({ src: "./audio/one-from-google-translate.webm" }),
      new AudioHandler({ src: "./audio/two-from-google-translate.webm" }),
      new AudioHandler({ src: "./audio/three-from-google-translate.webm" }),
    ];
    this.audStart.setup();
    this.audDone.setup();
    this.listAudCounts.forEach((audCount) => {
      audCount.setup();
    });
  }

  setup = (timerConfig) => {
    this.interval = timerConfig.interval;
    this.duration = timerConfig.duration;
    this.type = timerConfig.type;
    this.firstDelayDuration = timerConfig.firstDelayDuration;
    this.reset();
  };

  reset = () => {
    this.isPaused = false;
    this.currDelayTime = this.firstDelayDuration;
    this.targetTime = this.type === "INC" ? this.duration : 0;
    this.currTime = this.type === "INC" ? 0 : this.duration;
  };

  start = (delayCB, finishDelayCB, timerCB, finishTimerCB) => {
    this.reset();
    if (this.runner !== null || this.targetTime === null) return;
    this.runner = setInterval(() => {
      if (!this.isPaused) {
        if (this.isFirstDelay) {
          if (
            this.isPlayAudTimer &&
            this.currDelayTime !== 0 &&
            this.listAudCounts[this.currDelayTime - 1].isLoaded
          ) {
            this.listAudCounts[this.currDelayTime - 1].play();
          }
          delayCB(this.currDelayTime);
          if (this.currDelayTime === 0) {
            finishDelayCB();
            this.isFirstDelay = false;
            this.isPaused = false;
          }
          this.currDelayTime -= 1;
        } else {
          if (
            this.isPlayAudTimer &&
            this.audStart.isLoaded &&
            Math.abs(this.currTime - this.targetTime) === this.duration
          ) {
            this.audStart.play();
          }
          if (this.type === "INC") {
            this.currTime += 1;
          }
          if (this.type === "DEC") {
            this.currTime -= 1;
          }
          timerCB(this.getCurrTime());
          if (this.currTime === this.targetTime) {
            if (this.isPlayAudTimer && this.audDone.isLoaded) {
              this.audDone.play();
            }
            finishTimerCB();
            this.isPaused = false;
            this.remove();
          }
        }
      }
    }, this.interval);
  };

  resume = () => {
    if (!this.isPaused) return;
    this.isPaused = false;
  };

  pause = () => {
    if (this.isPaused) return;
    this.isPaused = true;
  };

  remove = () => {
    clearInterval(this.runner);
    this.runner = null;
  };

  getCurrTime = () => {
    const minutes = Math.floor(this.currTime / 60);
    const seconds = this.currTime % 60;
    return { minutes, seconds };
  };
}
