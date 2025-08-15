import * as THREE from "three";

export let raycaster = new THREE.Raycaster();
export let grabbedObject = null;

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
  grabNearestObject();
}

export function onPinchEnd(handIndex) {
  console.log(`Hand ${handIndex} pinch END`);
  releaseObject();
}

export function grabNearestObject() {
  console.log("Grabbing object...");
  // TODO: Raycast toward hand & attach object
}

export function releaseObject() {
  console.log("Releasing object...");
  // TODO: Drop or deselect object
}