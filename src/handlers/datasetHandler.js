export default class DatasetHandler {
  constructor() {
    this.DBKeypoints = [
      [
        "nose_x",
        "nose_y",
        "left_eye_x",
        "left_eye_y",
        "right_eye_x",
        "right_eye_y",
        "left_ear_x",
        "left_ear_y",
        "right_ear_x",
        "right_ear_y",
        "left_shoulder_x",
        "left_shoulder_y",
        "right_shoulder_x",
        "right_shoulder_y",
        "left_elbow_x",
        "left_elbow_y",
        "right_elbow_x",
        "right_elbow_y",
        "left_wrist_x",
        "left_wrist_y",
        "right_wrist_x",
        "right_wrist_y",
        "left_hip_x",
        "left_hip_y",
        "right_hip_x",
        "right_hip_y",
        "left_knee_x",
        "left_knee_y",
        "right_knee_x",
        "right_knee_y",
        "left_ankle_x",
        "left_ankle_y",
        "right_ankle_x",
        "right_ankle_y",
      ],
    ];
  }

  addKeypoints = (keypoints) => {
    this.DBKeypoints.push(keypoints);
  };

  saveToCSV = () => {
    const csvContent = `data:text/csv;charset=utf-8,${this.DBKeypoints.map(
      (row) => row.join(",")
    ).join("\n")}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "datasetX.csv");
    document.body.appendChild(link);
    link.click();
    this.DBKeypoints = [this.DBKeypoints[0]]; // clear
    document.body.removeChild(link);
  };
}
