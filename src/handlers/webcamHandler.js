/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */

// Disclaimer (Modification)
// Credit: Benson Ruan
// Repo: https://github.com/bensonruan/webcam-easy/
// Source file: https://github.com/bensonruan/webcam-easy/blob/master/dist/webcam-easy.js

export default class WebcamHandler {
  constructor(
    webcamElement,
    facingMode = "user" // environment or user
  ) {
    this._webcamElement = webcamElement;
    this._addVideoConfig = {};
    this._facingMode = facingMode;
    this._webcamList = [];
    this._streamList = [];
    this._selectedDeviceId = "";
  }

  get facingMode() {
    return this._facingMode;
  }

  set facingMode(value) {
    this._facingMode = value;
  }

  get webcamList() {
    return this._webcamList;
  }

  get webcamCount() {
    return this._webcamList.length;
  }

  get selectedDeviceId() {
    return this._selectedDeviceId;
  }

  /* Get all video input devices info */
  getVideoInputs(mediaDevices) {
    this._webcamList = [];
    mediaDevices.forEach((mediaDevice) => {
      if (mediaDevice.kind === "videoinput") {
        this._webcamList.push(mediaDevice);
      }
    });
    if (this._webcamList.length === 1) {
      this._facingMode = "user";
    }
    return this._webcamList;
  }

  /* Get media constraints */
  getMediaConstraints() {
    let videoConstraints = {};
    if (this._selectedDeviceId === "") {
      videoConstraints.facingMode = this._facingMode;
    } else {
      videoConstraints.deviceId = { exact: this._selectedDeviceId };
    }
    videoConstraints = {
      ...videoConstraints,
      ...this._addVideoConfig,
    };
    const constraints = {
      video: videoConstraints,
      audio: false,
    };
    return constraints;
  }

  /* Select camera based on facingMode */
  selectCamera() {
    for (const webcam of this._webcamList) {
      if (
        (this._facingMode === "user" &&
          webcam.label.toLowerCase().includes("front")) ||
        (this._facingMode === "environment" &&
          webcam.label.toLowerCase().includes("back"))
      ) {
        this._selectedDeviceId = webcam.deviceId;
        break;
      }
    }
  }

  /* Change Facing mode and selected camera */
  flip(mode) {
    // this._facingMode = this._facingMode === "user" ? "environment" : "user";
    this._facingMode = mode;
    // this._webcamElement.style.transform = "";
    if (this._facingMode === "user") {
      this._webcamElement.style.transform = "scale(-1,1)";
    } else {
      this._webcamElement.style.transform = "";
    }
    this.selectCamera();
  }

  /*
    1. Get permission from user
    2. Get all video input devices info
    3. Select camera based on facingMode 
    4. Start stream
  */
  async start(startStream = true) {
    return new Promise((resolve, reject) => {
      this.stop();
      navigator.mediaDevices
        .getUserMedia(this.getMediaConstraints()) // get permisson from user
        .then((stream) => {
          this._streamList.push(stream);
          this.info() // get all video input devices info
            .then(() => {
              this.selectCamera(); // select camera based on facingMode
              if (startStream) {
                this.stream()
                  .then(() => {
                    resolve(this._facingMode);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              } else {
                resolve(this._selectedDeviceId);
              }
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /* Get all video input devices info */
  async info() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          this.getVideoInputs(devices);
          resolve(this._webcamList);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /* Start streaming webcam to video element */
  async stream() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia(this.getMediaConstraints())
        .then((stream) => {
          this._streamList.push(stream);
          this._webcamElement.srcObject = stream;
          if (this._facingMode === "user") {
            this._webcamElement.style.transform = "scale(-1,1)";
          }
          this._webcamElement.play();
          resolve(this._facingMode);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  /* Stop streaming webcam */
  stop() {
    this._streamList.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    });
  }
}
