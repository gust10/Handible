import * as THREE from "three";
import { getSceneObjects } from "./threeSetup.js";
import { getHandTrackingData } from "./handTracking.js";

const raycaster = new THREE.Raycaster();
let grabbedObject = null;
const rayVisualsPerHand = []; // Array to store ray visuals for each hand
const coneVisualsPerHand = []; // Array to store cone visuals for each hand
const smoothedRayOrigins = []; // Smoothed ray origin for each hand
const smoothedRayDirections = []; // Smoothed ray direction for each hand
export const isPinchingState = Array(2).fill(false); // Moved from handTracking.js
const EMA_ALPHA = 0.35; // Match hand tracking smoothing
const GRAB_SCALE_FACTOR = 1.2; // Scale grabbed object for visual feedback
const CLOSE_DISTANCE_THRESHOLD = 0.5; // Distance from hand to wall to consider "close"
const SPHERE_RADIUS = 0.05; // Size of the created sphere
const CONE_RADIUS = 0.05; // Radius of the cone base
const CONE_HEIGHT = 0.1; // Height of the cone

// Initialize ray and cone visuals for each hand
export function initGestureControl(scene, numHands) {
  for (let i = 0; i < numHands; i++) {
    // Ray visual (commented out for now)
    // const rayMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    // const rayGeometry = new THREE.BufferGeometry().setFromPoints([
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(0, 0, -5), // Extend ray 5 units forward
    // ]);
    // const rayLine = new THREE.Line(rayGeometry, rayMaterial);
    // rayLine.visible = false;
    // scene.add(rayLine);
    // rayVisualsPerHand.push(rayLine);

    // Cone visual
    const coneGeometry = new THREE.ConeGeometry(CONE_RADIUS, CONE_HEIGHT, 32);
    const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red cone
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.rotation.x = -Math.PI / 2; // Flipped to point towards the whiteboard (negative z)
    cone.visible = false;
    scene.add(cone);
    coneVisualsPerHand.push(cone);

    smoothedRayOrigins.push(new THREE.Vector3());
    smoothedRayDirections.push(new THREE.Vector3(0, 0, -1));
  }
}

export function isPinching2D(rawLandmarks, videoWidth, videoHeight, thresholdPixels = 35) {
  const thumbTip = rawLandmarks[4];
  const indexTip = rawLandmarks[8];
  const thumbX = thumbTip.x * videoWidth;
  const thumbY = thumbTip.y * videoHeight;
  const indexX = indexTip.x * videoWidth;
  const indexY = indexTip.y * videoHeight;
  const dx = thumbX - indexX;
  const dy = thumbY - indexY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < thresholdPixels;
}

export function onPinchStart(handIndex) {
  console.log(`Hand ${handIndex} pinch START`);
  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand } = getHandTrackingData();
  const handLandmarks = smoothedLandmarksPerHand[handIndex];

  // Use smoothed ray origin and direction
  const rayOrigin = smoothedRayOrigins[handIndex];
  const rayDirection = smoothedRayDirections[handIndex];
  raycaster.set(rayOrigin, rayDirection);

  // Find intersections with the wall
  const wall = scene.children.find(obj => obj.userData.isWall);
  if (wall) {
    const intersects = raycaster.intersectObject(wall);
    if (intersects.length > 0) {
      const intersectionPoint = intersects[0].point;
      const distanceToWall = intersects[0].distance;

      // Check if close enough
      if (distanceToWall < CLOSE_DISTANCE_THRESHOLD) {
        // Create small sphere at intersection point
        const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red sphere
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(intersectionPoint);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        scene.add(sphere);
        console.log("Created sphere at:", intersectionPoint);

        // Check if cursor is on a button and trigger it
        const cone = coneVisualsPerHand[handIndex];
        const buttons = scene.children.filter(obj => obj.userData.isButton);
        buttons.forEach(button => {
          const distanceToButton = cone.position.distanceTo(button.position);
          if (distanceToButton < 0.2) { // Threshold for "on the button"
            button.material.color.set(button.userData.activeColor);
            console.log("Button triggered:", button);
          }
        });

        return; // Skip grabbing other objects if creating sphere
      }
    }
  }

  // Fallback to grabbing nearest object if not close to wall
  grabNearestObject(handIndex);
}

export function onPinchEnd(handIndex) {
  console.log(`Hand ${handIndex} pinch END`);
  releaseObject(handIndex);
}

export function updateRaycast(handIndex) {
  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand, landmarkVisualsPerHand, connectionVisualsPerHand } = getHandTrackingData();
  const handLandmarks = smoothedLandmarksPerHand[handIndex];
  
  // Calculate ray origin (midpoint of index tip and thumb tip)
  const indexTip = handLandmarks[8];
  const thumbTip = handLandmarks[4];
  const rayOrigin = new THREE.Vector3()
    .addVectors(indexTip, thumbTip)
    .divideScalar(2);

  // Calculate ray direction (from wrist to middle finger tip)
  const wrist = handLandmarks[0];
  const middleTip = handLandmarks[12];
  const rayDirection = new THREE.Vector3()
    .subVectors(middleTip, wrist)
    .normalize();

  // Smooth ray origin and direction
  smoothedRayOrigins[handIndex].lerp(rayOrigin, EMA_ALPHA);
  smoothedRayDirections[handIndex].lerp(rayDirection, EMA_ALPHA);

  // Update raycaster
  raycaster.set(smoothedRayOrigins[handIndex], smoothedRayDirections[handIndex]);

  // Comment out ray visual for now
  // const rayLine = rayVisualsPerHand[handIndex];
  // const points = [
  //   smoothedRayOrigins[handIndex],
  //   smoothedRayOrigins[handIndex].clone().add(smoothedRayDirections[handIndex].clone().multiplyScalar(5)),
  // ];
  // rayLine.geometry.setFromPoints(points);
  // rayLine.visible = true; // Always visible when hand is detected

  // Update cone cursor on whiteboard
  const wall = scene.children.find(obj => obj.userData.isWall);
  if (wall) {
    const midPoint = new THREE.Vector3().addVectors(indexTip, thumbTip).divideScalar(2);
    const cursorPos = new THREE.Vector3(midPoint.x, midPoint.y, wall.position.z + 0.01); // Slightly above the whiteboard
    const cone = coneVisualsPerHand[handIndex];
    cone.position.copy(cursorPos);
    cone.visible = true;

    // Check hover and pinch on buttons
    const buttons = scene.children.filter(obj => obj.userData.isButton);
    buttons.forEach(button => {
      const distanceToButton = cone.position.distanceTo(button.position);
      if (distanceToButton < 0.2) { // Threshold for "on the button"
        if (isPinchingState[handIndex]) {
          button.material.color.set(button.userData.activeColor);
        } else {
          button.material.color.set(button.userData.hoverColor);
        }
      } else {
        button.material.color.set(button.userData.defaultColor);
      }
    });
  }

  // If an object is grabbed, move it to the ray origin
  if (grabbedObject && grabbedObject.userData.handIndex === handIndex) {
    grabbedObject.position.copy(smoothedRayOrigins[handIndex]);
  }
}

function grabNearestObject(handIndex) {
  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand, landmarkVisualsPerHand, connectionVisualsPerHand } = getHandTrackingData();
  const handLandmarks = smoothedLandmarksPerHand[handIndex];
  
  // Use smoothed ray origin and direction
  const rayOrigin = smoothedRayOrigins[handIndex];
  const rayDirection = smoothedRayDirections[handIndex];
  raycaster.set(rayOrigin, rayDirection);

  const selectableObjects = scene.children.filter(
    (obj) =>
      obj.isMesh &&
      !landmarkVisualsPerHand.flat().includes(obj) &&
      !connectionVisualsPerHand.flat().includes(obj) &&
      !obj.userData.isWall // Exclude the whiteboard from grabbing
  );
  const intersects = raycaster.intersectObjects(selectableObjects);

  if (intersects.length > 0) {
    grabbedObject = intersects[0].object;
    grabbedObject.userData.originalScale = grabbedObject.scale.clone();
    grabbedObject.scale.multiplyScalar(GRAB_SCALE_FACTOR); // Visual feedback
    grabbedObject.userData.handIndex = handIndex; // Track which hand grabbed it
    console.log("Grabbed:", grabbedObject.name || grabbedObject.id);
  }
}

function releaseObject(handIndex) {
  if (grabbedObject && grabbedObject.userData.handIndex === handIndex) {
    grabbedObject.scale.copy(grabbedObject.userData.originalScale || grabbedObject.scale); // Restore scale
    grabbedObject.userData.handIndex = null; // Clear hand association
    grabbedObject = null;
    console.log("Released object");
  }
}

export function getRayVisualsPerHand() {
  return rayVisualsPerHand;
}

export function getConeVisualsPerHand() {
  return coneVisualsPerHand;
}