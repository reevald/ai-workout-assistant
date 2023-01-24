import * as tfc from "@tensorflow/tfjs-core";
import * as tfl from "@tensorflow/tfjs-layers";
import "@tensorflow/tfjs-backend-webgl";

export default class ClassifierHandler {
  constructor() {
    this.model = null;
    this.label = [];
    this.stdConfig = {};
  }

  setup = async (classifierConfig) => {
    this.label = classifierConfig.label;
    this.stdConfig = classifierConfig.stdConfig;
    this.model = await tfl.loadLayersModel(classifierConfig.path);
  };

  standarization = (arrData) =>
    arrData.map((data, idx) => {
      if (idx % 2 === 0) {
        return data / this.stdConfig.width;
      }
      return data / this.stdConfig.height;
    });

  predict = async (stdData) => {
    if (!this.model) return null;
    const inputData = tfc.tensor([this.standarization(stdData)]);
    const result = await this.model.predict(inputData).data();
    const outputData = Array.from(result).map((value, idx) => ({
      class: this.label[idx],
      confidence: value,
    }));
    outputData.sort((a, b) => b.confidence - a.confidence);
    return outputData[0];
  };
}
