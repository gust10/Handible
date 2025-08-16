import * as THREE from "three";
import { ArrowHelper } from "three";
import { isPinching2D, onPinchStart, onPinchEnd, updateRaycast, getRayVisualsPerHand, getConeVisualsPerHand, isPinchingState } from "./gestureControl.js";
import { getSceneObjects } from "./threeSetup.js"; // Added import

const NUM_HANDS_TO_DETECT = 2;
const EMA_ALPHA = 0.35;
const Z_MAGNIFICATION_FACTOR = 2;
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
const zAxisVisualsPerHand = []; // Only blue z-arrow per hand
const laserVisualsPerHand = []; // Laser line per hand
const palmSpheresPerHand = []; // New: Persistent spheres per hand
let lastVideoTime = -1;
let results = undefined;
let fpsCounterElement;
let frameCount = 0;
let lastFpsUpdateTime = performance.now();

const PALM_FACING_THRESHOLD = 0.7; // Adjust based on testing; assumes normal.z > this for facing camera
const PALM_SPHERE_RADIUS = 0.1; // Size of sphere in palm

// New: UI panel for left hand
let uiPanel = null;
const UI_PANEL_WIDTH = 1.0;
const UI_PANEL_HEIGHT = 0.6;
const UI_PANEL_OFFSET = new THREE.Vector3(0.6, 0.1, -0.5); // Offset to right side (adjust x for distance)
const UI_PANEL_TILT = -Math.PI / 12; // Slight tilt downwards
const smoothedUIPosition = new THREE.Vector3(); // For smooth following

export async function setupHandTracking(scene) {
  fpsCounterElement = document.getElementById("fps-counter");

  // Create UI panel once
  const panelGeometry = new THREE.PlaneGeometry(UI_PANEL_WIDTH, UI_PANEL_HEIGHT);
  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333, // Dark gray for clean aesthetic
    roughness: 0.2,
    metalness: 0.1,
    transparent: true, 
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  uiPanel = new THREE.Mesh(panelGeometry, panelMaterial);
  uiPanel.visible = false;
  uiPanel.castShadow = true;
  uiPanel.receiveShadow = true;
  scene.add(uiPanel);

  // Add buttons to UI panel
  const buttonPositions = [
    { x: -0.3, y: 0, color: 0xff0000 }, // Red button
    { x: 0, y: 0, color: 0x00ff00 }, // Green button
    { x: 0.3, y: 0, color: 0x0000ff } // Blue button
  ];

  buttonPositions.forEach(pos => {
    const buttonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32); // Smaller for UI
    const buttonMaterial = new THREE.MeshStandardMaterial({ 
      color: pos.color,
      roughness: 0.4,
      metalness: 0.5
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(pos.x, pos.y, 0.03); // Slightly above panel
    button.rotation.x = Math.PI / 2;
    uiPanel.add(button);
  });

  for (let i = 0; i < NUM_HANDS_TO_DETECT; i++) {
    const currentHandSpheres = [];
    const currentSmoothedLandmarks = [];
    const sharedMaterial = new THREE.MeshBasicMaterial({ color: 0xbffbff, transparent: true, opacity: 0.5});
    const sphereGeometry = new THREE.SphereGeometry(0.03, 16, 16); // 0.02 original

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
    const capsuleGeometry = new THREE.CapsuleGeometry(0.04, 1, 8, 16); // Thick radius 0.03, base length 1
    const capsuleMaterial = new THREE.MeshBasicMaterial({ color: 0xbffbff, transparent: true, opacity: 0.5 });
    for (const connection of HAND_CONNECTIONS) {
      const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
      capsule.visible = false;
      scene.add(capsule);
      currentHandConnections.push(capsule);
    }
    connectionVisualsPerHand.push(currentHandConnections);

    // Z-axis visual (blue)
    const zDir = new THREE.Vector3(0, 0, 1);
    const zArrow = new ArrowHelper(zDir, new THREE.Vector3(), 0.2, 0x0000ff);
    zArrow.visible = false;
    scene.add(zArrow);
    zAxisVisualsPerHand.push(zArrow);

    // Laser visual
    const laserMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });
    const laserGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const laserLine = new THREE.Line(laserGeometry, laserMaterial);
    laserLine.visible = false;
    scene.add(laserLine);
    laserVisualsPerHand.push(laserLine);

    // New: Create persistent palm sphere per hand
    const palmSphereGeometry = new THREE.SphereGeometry(PALM_SPHERE_RADIUS, 16, 16);
    const palmSphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green sphere for visibility
    const palmSphere = new THREE.Mesh(palmSphereGeometry, palmSphereMaterial);
    palmSphere.visible = false; // Initially hidden
    palmSphere.castShadow = true;
    palmSphere.receiveShadow = true;
    scene.add(palmSphere);
    palmSpheresPerHand.push(palmSphere);
  }
}

export function getWristPosition(handIndex) {
  if (handIndex >= 0 && handIndex < smoothedLandmarksPerHand.length) {
    return smoothedLandmarksPerHand[handIndex][0].clone();
  }
  return new THREE.Vector3();
}

export function getForwardDirection(handIndex) {
  if (handIndex >= 0 && handIndex < smoothedLandmarksPerHand.length) {
    const wrist = smoothedLandmarksPerHand[handIndex][0];
    const middleBase = smoothedLandmarksPerHand[handIndex][9];
    return middleBase.clone().sub(wrist).normalize();
  }
  return new THREE.Vector3(0, 0, -1);
}

// Updated: Function to check if open palm is facing the camera, handling left/right handedness
function isPalmFacingCamera(handIndex, smoothedLandmarks, handedness) {
  const wrist = smoothedLandmarks[0];
  const indexBase = smoothedLandmarks[5];
  const pinkyBase = smoothedLandmarks[17];

  const vec1 = new THREE.Vector3().subVectors(indexBase, wrist);
  const vec2 = new THREE.Vector3().subVectors(pinkyBase, wrist);
  let normal = new THREE.Vector3().crossVectors(vec1, vec2).normalize();

  // Adjust for handedness: Flip normal for left hand to consistent direction
  if (handedness === 'Left') {
    normal.negate();
  }

  // Assuming camera is at positive z, facing negative z; palm facing camera if normal z > threshold
  return normal.z > PALM_FACING_THRESHOLD;
}

// New: Function to update palm sphere position and visibility
function updatePalmSphere(handIndex, smoothedLandmarks, isFacing) {
  const palmSphere = palmSpheresPerHand[handIndex];
  if (!palmSphere) return;

  if (isFacing) {
    // Palm center approx average of wrist, index/pinky/ring/middle bases
    const palmCenter = new THREE.Vector3()
      .add(smoothedLandmarks[0])
      .add(smoothedLandmarks[5])
      .add(smoothedLandmarks[9])
      .add(smoothedLandmarks[13])
      .add(smoothedLandmarks[17])
      .divideScalar(5);

    palmSphere.position.copy(palmCenter);
    palmSphere.visible = true;
    console.log(`Hand ${handIndex} palm sphere toggled ON at:`, palmCenter);
  } else {
    palmSphere.visible = false;
    console.log(`Hand ${handIndex} palm sphere toggled OFF`);
  }
}

// New: Function to update UI panel for left hand
function updateUIPanel(smoothedLandmarks, isFacing) {
  if (!uiPanel) return;

  if (isFacing) {
    // Hand center for positioning (e.g., wrist)
    const handCenter = smoothedLandmarks[0].clone(); // Wrist

    // Smooth position
    smoothedUIPosition.lerp(handCenter.add(UI_PANEL_OFFSET), EMA_ALPHA);

    uiPanel.position.copy(smoothedUIPosition);

    // Face camera with slight tilt
    uiPanel.lookAt(getSceneObjects().camera.position); // Face camera
    uiPanel.rotation.x += UI_PANEL_TILT; // Add slight tilt

    uiPanel.visible = true;
    console.log("UI panel toggled ON");
  } else {
    uiPanel.visible = false;
    console.log("UI panel toggled OFF");
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
    connectionVisualsPerHand[i].forEach((capsule) => (capsule.visible = false));
    zAxisVisualsPerHand[i].visible = false;
    laserVisualsPerHand[i].visible = false;
    palmSpheresPerHand[i].visible = false; // Hide palm spheres by default
  }
  if (uiPanel) uiPanel.visible = false; // Hide UI panel by default

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
      const currentZArrow = zAxisVisualsPerHand[handIndex];
      const currentLaser = laserVisualsPerHand[handIndex];

      currentLandmarkSpheres.forEach((sphere) => (sphere.visible = true));
      currentHandConnections.forEach((capsule) => (capsule.visible = true));
      currentZArrow.visible = true;
      currentLaser.visible = true;

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
        const capsule = currentHandConnections[i];
        const startPos = currentSmoothedLandmarks[startLandmarkIndex];
        const endPos = currentSmoothedLandmarks[endLandmarkIndex];

        // Position midway
        capsule.position.copy(startPos.clone().add(endPos).multiplyScalar(0.5));

        // Direction and length
        const direction = endPos.clone().sub(startPos).normalize();
        const length = endPos.distanceTo(startPos);

        // Scale (CapsuleGeometry is along y, length in y)
        capsule.scale.set(1, length, 1);

        // Rotation: align y-axis with direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        capsule.quaternion.copy(quaternion);
      }

      // Update z-axis visual (blue arrow)
      const wrist = currentSmoothedLandmarks[0];
      const forward = getForwardDirection(handIndex);
      currentZArrow.position.copy(wrist);
      currentZArrow.setDirection(forward);
      currentZArrow.setLength(0.2);

      // Update laser visual
      const laserEnd = wrist.clone().add(forward.multiplyScalar(10)); // Use forward for alignment
      const positions = currentLaser.geometry.attributes.position.array;
      positions[0] = wrist.x;
      positions[1] = wrist.y;
      positions[2] = wrist.z;
      positions[3] = laserEnd.x;
      positions[4] = laserEnd.y;
      positions[5] = laserEnd.z;
      currentLaser.geometry.attributes.position.needsUpdate = true;

      // New: Detect palm facing camera and toggle/update sphere visibility
      const handedness = results.handedness[handIndex][0].categoryName; // 'Left' or 'Right'
      const facingNow = isPalmFacingCamera(handIndex, currentSmoothedLandmarks, handedness);
      updatePalmSphere(handIndex, currentSmoothedLandmarks, facingNow);

      // New: If left hand and facing, update UI panel
      if (handedness === 'Left') {
        updateUIPanel(currentSmoothedLandmarks, facingNow);
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