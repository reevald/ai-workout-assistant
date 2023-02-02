# AI Workout Assistant
An web application to help everyone do workout wherever and whenever. Supported by the pose detector feature to analyze every pose and auto count the number of repetitions made. So, let's create a healthy life by do workout every day!

![AI Workout Assistant Thumbnail](./public/img/social-media-thumbnail.png)

## How it Work
Image data which is obtained from video or webcam will be processed by pose detector using the MoveNet model to generate keypoints. Keypoints are used for repetition calculations and input for classifying workout types with Dense Neural Network (DNN) model.

![How AI Workout Work](./public/img/how-it-work-ai-workout.png)

## How to Run
- Prerequisites: you'll need to have [Git](https://git-scm.com/), [Node](https://nodejs.org/), and [NPM](https://www.npmjs.com/package/npm) installed and running on your machine.
- Clone this repository  
    ```Bash
    git clone https://github.com/reevald/ai-workout-assistant.git
    cd ai-workout-assistant
    ```
- Install dependencies
    ```Bash
    npm install
    ```
- Once the installation is done, you can run the app locally
    ```Bash
    npm run start-dev
    ```
- Then open http://localhost:8080 to see your app.

## Generate Your Own Workout
1) Open app locally or visit [aiworkout.live](https://aiworkout.live/)
2) Collect dataset (keypoints):  
    - Using webcam (open settings menu => click `record keypoints` button then click again when finish recording)  
    **Note:** (1) The app only records keypoints while its playing and the result will be csv format; (2) The value of each keypoint always in resolution 640x360 (when use webcam only).
    - Via upload video (open settings menu => click `upload video`)  
    **Note:** (1) The value of each keypoint will be dependence with resolution of video; (2) High resolution of video will be reduce fps; (3) You can switch video to webcam (vice versa) while recording (not recommended can cause different resolution of keypoints).
3) Generate new model and train as well  
    The model is binary classification to determine workout or not. Example: push-up (positive) or not push-up (negative). In the step 2 above, we have been collect positive class. For negative class, you can use this [video](https://www.youtube.com/watch?v=jJCd3sOuO2M) as negative class data (convert first to get keypoints with step 2 above). Then after collect positive and negative data, open this [colab](https://colab.research.google.com/drive/1t1t0H6xKit5uup7hFLOqGxD9cbPVcMxv?usp=sharing) and follow the instruction. You will be get the model with tfjs format which will be use on the next step.  
    **Note:** to continue next step you need to run app locally (check `How to Run` above)
4) Put the model into the app  
    First create new folder ./public/tfjs-model/your-workout then move tfjs model and bin file into the new folder.
5) Create new configuration
    - Change file: ./public/mock-data/workout.json  
        ```Json
        "nameWorkout": ["Push Up", "Squat", "Your Workout"], // Add your new workout name here
        "slugWorkout": ["push-up", "squat", "your-workout"], // Your slug must match with model folder name
        "duration": ["1 Minutes", "3 Minutes", "5 Minutes", "7 Minutes"], // You can change this
        ...
        ```
    - Create new file: ./public/rules/your-workout.json with config like this
        ```Json
        {
            "poseDetectorConfig": {
                "model": "MoveNet", // MoveNet, PoseNet or BlazePose (Ref: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
                "detectorConfig": {}, // Ref: https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/movenet
                "estimationConfig": {} // Check ref above
            },
            "classifierConfig": {
                "path": "./tfjs-model/your-workout/model.json", // change this
                "label": ["Other", "Your Workout"] // change this (must ordered by alphabet)
            },
            "rulesCountConfig": {
                "nameWorkout": "Your Workout", // change this
                "nameStage": ["Down", "Up"], // change this
                "pathImageStage": ["./img/iconmonstr-caret-down-circle-filled-64.png", "./img/iconmonstr-caret-up-circle-filled-64.png"], // change this (put file first into ./public/img folder)
                "anglePoint": {
                    // Example for push-up
                    "7": { // Change this (index keypoint)
                        "spouseIdx": [9, 5], // chang this (index keypoint)
                        "rangeAngle": [
                            { "min": 0, "max": 90 }, // change this (stage 1)
                            { "min": 150, "max": 180 } // change this (stage 2)
                        ]
                    },
                    "8": {
                        "spouseIdx": [10, 6],
                        "rangeAngle": [
                            { "min": 0, "max": 90 },
                            { "min": 150, "max": 180 }
                        ]
                    },
                    "13": {
                        "spouseIdx": [11, 15],
                        "rangeAngle": [
                            { "min": 150, "max": 180 },
                            { "min": 150, "max": 180 }
                        ]
                    },
                    "14": {
                        "spouseIdx": [12, 16],
                        "rangeAngle": [
                            { "min": 150, "max": 180 },
                            { "min": 150, "max": 180 }
                        ]
                    }
                }
            }
        }
        ```
        To determine index keypoints, please look at image below:
        ![Ilustration Keypoints](https://camo.githubusercontent.com/b8a385301ca6b034d5f4807505e528b4512a0aa78507dec9ebafcc829b9556be/68747470733a2f2f73746f726167652e676f6f676c65617069732e636f6d2f6d6f76656e65742f636f636f2d6b6579706f696e74732d3530302e706e67)  
        Source image: (https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
6) Run the app to testing
    ```Bash
    npm run start-dev
    ```
    Then open http://localhost:8080 to see your own workout and have fun!

## Limitations
- Cannot cover 3D angle yet
    - Planning: research lightweight model that can generate 3D keypoints like MoVNect, LHPE-nets or [other model](https://paperswithcode.com/task/3d-human-pose-estimation).
- Currently the high resolution makes fps slower
    - You can try upload videos with high and low resolution then compare them and watch the fps.
    - Solution right now: using limit to webcam with fixed "real" resolution 640x360. To display variate resolution screen, in this case we are using css manipulation.

## References
- Pose Detection with TFJS (https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)
- MoveNet Documentation (https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/movenet)
- MoveNet in TFHub (https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4)
- Pose Classification (https://developers.google.com/ml-kit/vision/pose-detection/classifying-poses)
- Original video (in image above)
    -   Man push-up (https://www.youtube.com/watch?v=OKn_6Me96Yc)
    -   Woman squating (1) (https://www.youtube.com/watch?v=LSj280OEKUI)
    -   Woman squating (2) (https://www.youtube.com/watch?v=QifjltKUMCk)

## TODOs
- Write documentations
- Write unit test
- Add audio effect (timer and movement direction)
- Data Augmentation (flip horizontal, scale, shear and shift) to try improve metric pose classification model (accuration)
- Convert to components (prefer using framework like react js)