import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
import { predictWebcam } from "./handTracking.js";

export async function initHandLandmarker() {
  console.log("MediaPipe HandLandmarker 모델 로드 중...");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  const handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
  console.log("MediaPipe HandLandmarker 로드 완료.");
  return handLandmarker;
}

export async function startWebcam(video, handLandmarker) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadeddata = () => {
      console.log("웹캠 비디오 로드 완료.");
      predictWebcam(video, handLandmarker);
    };
  } catch (error) {
    console.error("웹캠 접근 오류:", error);
    document.getElementById("loading-message").textContent =
      "오류: 웹캠에 접근할 수 없습니다. 카메라 접근을 허용해 주십시오.";
    document.getElementById("loading-message").style.color = "red";
  }
}