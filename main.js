import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
import { setupThreeScene } from "./threeSetup.js";
import { initHandLandmarker, startWebcam } from "./mediaPipeSetup.js";
import { setupHandTracking } from "./handTracking.js";
import { initGestureControl } from './gestureControl.js';



let scene, camera, renderer;
let video;
let handLandmarker;
let controls;

async function init() {
  console.log("애플리케이션 초기화 중...");
  document.getElementById("ema-alpha-display").textContent = 0.35;

  // Initialize Three.js
  ({ scene, camera, renderer, controls } = setupThreeScene());

  // Initialize MediaPipe HandLandmarker
  video = document.getElementById("webcamVideo");
  handLandmarker = await initHandLandmarker();

  // Setup hand tracking visualizations
  await setupHandTracking(scene);
  initGestureControl(scene, 2); // Pass scene and NUM_HANDS_TO_DETECT

  document.getElementById("loading-message").style.display = "none";
  await startWebcam(video, handLandmarker);
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.onload = init;