import * as THREE from "three";
import { isPinching2D, onPinchStart, onPinchEnd, updateRaycast, getRayVisualsPerHand, getConeVisualsPerHand, isPinchingState } from "./gestureControl.js";

const NUM_HANDS_TO_DETECT = 2;
const EMA_ALPHA = 0.35;
const Z_MAGNIFICATION_FACTOR = 5;
const Z_OFFSET_FOR_DIRECT_DEPTH = 0;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
];

const landmarkVisualsPerHand = [];
const connectionVisualsPerHand = [];
const smoothedLandmarksPerHand = [];
let lastVideoTime = -1;
let results = undefined;
let fpsCounterElement;
let frameCount = 0;
let lastFpsUpdateTime = performance.now();

export async function setupHandTracking(scene) {
  fpsCounterElement = document.getElementById("fps-counter");

  for (let i = 0; i < NUM_HANDS_TO_DETECT; i++) {
    const currentHandSpheres = [];
    const currentSmoothedLandmarks = [];
    const sharedMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const sphereGeometry = new THREE.SphereGeometry(0.02, 16, 16);

    for (let j = 0; j < 21; j++) {
      const sphereMaterial = (j === 4 || j === 8) ? new THREE.MeshBasicMaterial({ color: 0x00ffff }) : sharedMaterial;
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.visible = false;
      scene.add(sphere);
      currentHandSpheres.push(sphere);
      currentSmoothedLandmarks.push(new THREE.Vector3());
    }
    landmarkVisualsPerHand.push(currentHandSpheres);
    smoothedLandmarksPerHand.push(currentSmoothedLandmarks);

    const currentHandConnections = [];
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
    for (const connection of HAND_CONNECTIONS) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geometry, lineMaterial);
      line.visible = false;
      scene.add(line);
      currentHandConnections.push(line);
    }
    connectionVisualsPerHand.push(currentHandConnections);
  }
}

export function predictWebcam(video, handLandmarker) {
  if (!handLandmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    requestAnimationFrame(() => predictWebcam(video, handLandmarker));
    return;
  }

  const startTimeMs = performance.now();
  lastVideoTime = video.currentTime;
  results = handLandmarker.detectForVideo(video, startTimeMs);

  frameCount++;
  const currentTime = performance.now();
  if (currentTime - lastFpsUpdateTime >= 1000) {
    fpsCounterElement.textContent = `FPS: ${frameCount}`;
    frameCount = 0;
    lastFpsUpdateTime = currentTime;
  }

  // Hide visuals for all hands by default
  for (let i = 0; i < NUM_HANDS_TO_DETECT; i++) {
    landmarkVisualsPerHand[i].forEach((sphere) => (sphere.visible = false));
    connectionVisualsPerHand[i].forEach((line) => (line.visible = false));
  }

  if (results && results.landmarks && results.landmarks.length > 0) {
    for (let handIndex = 0; handIndex < results.landmarks.length; handIndex++) {
      const currentHandLandmarks = results.landmarks[handIndex];
      const pinchingNow = isPinching2D(currentHandLandmarks, video.videoWidth, video.videoHeight);

      if (pinchingNow && !isPinchingState[handIndex]) {
        console.log(`Hand ${handIndex} PINCH START`);
        isPinchingState[handIndex] = true;
        onPinchStart(handIndex);
      } else if (!pinchingNow && isPinchingState[handIndex]) {
        console.log(`Hand ${handIndex} PINCH END`);
        isPinchingState[handIndex] = false;
        onPinchEnd(handIndex);
      }

      const tipColor = pinchingNow ? 0xff0000 : 0x00ffff;
      landmarkVisualsPerHand[handIndex][4].material.color.set(tipColor);
      landmarkVisualsPerHand[handIndex][8].material.color.set(tipColor);

      const currentLandmarkSpheres = landmarkVisualsPerHand[handIndex];
      const currentHandConnections = connectionVisualsPerHand[handIndex];
      const currentSmoothedLandmarks = smoothedLandmarksPerHand[handIndex];

      currentLandmarkSpheres.forEach((sphere) => (sphere.visible = true));
      currentHandConnections.forEach((line) => (line.visible = true));

      for (let i = 0; i < currentHandLandmarks.length; i++) {
        const rawLandmark = currentHandLandmarks[i];
        // Revert to original limited range for hand visuals (small size)
        const targetX = (1.0 - rawLandmark.x - 0.5) * 2;
        const targetY = (rawLandmark.y - 0.5) * -2;
        const targetZ = rawLandmark.z * Z_MAGNIFICATION_FACTOR + Z_OFFSET_FOR_DIRECT_DEPTH;
        const currentPosition = new THREE.Vector3(targetX, targetY, targetZ);
        currentSmoothedLandmarks[i].lerp(currentPosition, EMA_ALPHA);
        currentLandmarkSpheres[i].position.copy(currentSmoothedLandmarks[i]);
      }

      for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
        const connection = HAND_CONNECTIONS[i];
        const startLandmarkIndex = connection[0];
        const endLandmarkIndex = connection[1];
        const line = currentHandConnections[i];
        const positions = line.geometry.attributes.position.array;
        positions[0] = currentSmoothedLandmarks[startLandmarkIndex].x;
        positions[1] = currentSmoothedLandmarks[startLandmarkIndex].y;
        positions[2] = currentSmoothedLandmarks[startLandmarkIndex].z;
        positions[3] = currentSmoothedLandmarks[endLandmarkIndex].x;
        positions[4] = currentSmoothedLandmarks[endLandmarkIndex].y;
        positions[5] = currentSmoothedLandmarks[endLandmarkIndex].z;
        line.geometry.attributes.position.needsUpdate = true;
      }

      // Update raycast for this hand
      updateRaycast(handIndex);
    }
  }

  // Hide rays for undetected hands
  const rayVisuals = getRayVisualsPerHand();
  for (let i = results && results.landmarks ? results.landmarks.length : 0; i < NUM_HANDS_TO_DETECT; i++) {
    const rayLine = rayVisuals[i];
    if (rayLine) rayLine.visible = false;
  }

  // Hide cones for undetected hands
  const coneVisuals = getConeVisualsPerHand();
  for (let i = results && results.landmarks ? results.landmarks.length : 0; i < NUM_HANDS_TO_DETECT; i++) {
    const cone = coneVisuals[i];
    if (cone) cone.visible = false;
  }

  requestAnimationFrame(() => predictWebcam(video, handLandmarker));
}

export function getHandTrackingData() {
  return { landmarkVisualsPerHand, connectionVisualsPerHand, smoothedLandmarksPerHand };
}