import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
import { getSceneObjects } from "./sceneManager.js";
import { setupThreeScene } from "./threeSetup.js";
import { initHandLandmarker, startWebcam } from "./mediaPipeSetup.js";
import { setupHandTracking } from "./handTracking.js";
import { initGestureControl } from './gestureControl.js';
import { setupTableScene } from "./tableSetup.js";



let scene, camera, renderer;
let video;
let handLandmarker;
let controls;

async function init() {
  console.log("애플리케이션 초기화 중...");
  document.getElementById("ema-alpha-display").textContent = 0.35;

  // Initialize Three.js
  // setupThreeScene();
  setupTableScene();

  // Add resize listener once, using current objects
  window.addEventListener("resize", onResize);

  // Initialize MediaPipe HandLandmarker
  video = document.getElementById("webcamVideo");
  handLandmarker = await initHandLandmarker();

  // Setup hand tracking visualizations
  await setupHandTracking(getSceneObjects().scene);
  initGestureControl(getSceneObjects().scene, 2); // Pass scene and NUM_HANDS_TO_DETECT

  document.getElementById("loading-message").style.display = "none";
  await startWebcam(video, handLandmarker);
  animate();
}

function onResize() {
  const { camera, renderer } = getSceneObjects();
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function animate() {
  requestAnimationFrame(animate);
  const { scene, camera, renderer, controls } = getSceneObjects(); // Fetch fresh each frame
  controls.update();
  renderer.render(scene, camera);
}

window.onload = init;