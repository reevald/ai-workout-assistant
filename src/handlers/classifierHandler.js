import { tensor } from "@tensorflow/tfjs-core";
import { loadLayersModel } from "@tensorflow/tfjs-layers";
import "@tensorflow/tfjs-backend-webgl";

export default class ClassifierHandler {
  constructor() {
    this.model = null;
    this.label = [];
    this.stdConfig = null;
  }

  setup = async (classifierConfig, stdConfig) => {
    this.label = classifierConfig.label;
    this.stdConfig = stdConfig;
    this.model = await loadLayersModel(classifierConfig.path);
  };

  standarization = (arrData) =>
    // Change range data from resolution webcam / video to [0, 1]
    arrData.map((data, idx) => {
      if (idx % 2 === 0) {
        return data / this.stdConfig.width;
      }
      return data / this.stdConfig.height;
    });

  predict = async (stdData) => {
    if (!this.model && !this.stdConfig) return null;
    const inputData = tensor([this.standarization(stdData)]);
    const result = await this.model.predict(inputData).data();
    // Enrich output predict
    const outputData = Array.from(result).map((value, idx) => ({
      class: this.label[idx],
      confidence: value,
    }));
    return outputData;
  };
}
