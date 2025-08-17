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
const CLOSE_DISTANCE_THRESHOLD = 3.0; // Increased further to ensure interactions trigger
const SPHERE_RADIUS = 0.05; // Size of the created sphere
const CONE_RADIUS = 0.05; // Radius of the cone base
const CONE_HEIGHT = 0.1; // Height of the cone
const WHITEBOARD_WIDTH = 5; // Matches whiteboard width in threeSetup.js
const WHITEBOARD_HEIGHT = 3; // Matches whiteboard height in threeSetup.js
const UI_PANEL_WIDTH = 1.0;
const UI_PANEL_HEIGHT = 0.6;
const CURSOR_SCALE_FACTOR = 2.5; // Adjust as needed to fit webcam FOV to whiteboard; higher = more coverage
const BUTTON_HOVER_THRESHOLD = 0.4; // Increased to account for 3D button size
const BUTTON_SNAP_OFFSET = 0.06; // Offset for cursor snap above button surface
const UI_CURSOR_THRESHOLD = 1.5; // Distance threshold for right hand to UI panel
const UI_CURSOR_SENSITIVITY = 1.0; // Controls sensitivity of wrist rotation for UI cursor
const UI_CURSOR_ROTATION_OFFSET = -Math.PI / 6; // Rotation offset only for UI panel cursor
const KNOB_HOVER_THRESHOLD = 0.6; // Increased for easier knob grabbing

// Initialize ray and cone visuals for each hand
export function initGestureControl(scene, numHands) {
  for (let i = 0; i < numHands; i++) {
    // Cone visual (no initial rotation; we'll set quaternion dynamically)
    const coneGeometry = new THREE.ConeGeometry(CONE_RADIUS, CONE_HEIGHT, 32);
    const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red cone
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.visible = false;
    scene.add(cone);
    coneVisualsPerHand.push(cone);

    smoothedRayOrigins.push(new THREE.Vector3());
    smoothedRayDirections.push(new THREE.Vector3(0, 0, -1));
  }
}

export function isPinching2D(rawLandmarks, videoWidth, videoHeight, thresholdPixels = 45) {
  const thumbTip = rawLandmarks[4];
  const indexTip = rawLandmarks[8];
  const thumbX = thumbTip.x * videoWidth;
  const thumbY = thumbTip.y * videoHeight;
  const indexX = indexTip.x * videoWidth;
  const indexY = indexTip.y * videoHeight;
  const dx = thumbX - indexX;
  const dy = thumbY - indexY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  // console.log(`Pinch distance hand ${rawLandmarks.handIndex || 'unknown'}: ${distance}`); // Debug pinch detection
  return distance < thresholdPixels;
}

export function onPinchStart(handIndex, handedness, isUIActive) {
  // console.log(`Hand ${handIndex} pinch START, isUIActive: ${isUIActive}, handedness: ${handedness}`);
  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand } = getHandTrackingData();
  const handLandmarks = smoothedLandmarksPerHand[handIndex];

  const cone = coneVisualsPerHand[handIndex];

  // Skip if cursor disabled
  if (isUIActive && handedness === 'Left') {
    // console.log(`Hand ${handIndex} skipped: left hand with UI active`);
    return; // Disable for left hand when UI open
  }

  let buttons = [];
  let normal = new THREE.Vector3();
  let triggeredButton = false;

  if (isUIActive && handedness === 'Right') {
    const panel = scene.children.find(obj => obj.isMesh && obj.material?.color.getHex() === 0xbffbff);
    if (panel) {
      const wrist = handLandmarks[0];
      const distanceToPanel = wrist.distanceTo(panel.position);
      if (distanceToPanel >= UI_CURSOR_THRESHOLD) {
        console.log(`Hand ${handIndex} too far from UI panel: ${distanceToPanel}`);
        return; // Skip if right hand not close to UI
      }
      buttons = panel.children.filter(obj => obj.userData.isUIButton);
      normal = new THREE.Vector3(0, 0, 1).applyQuaternion(panel.quaternion).normalize();
    } else {
      // console.log(`Hand ${handIndex} UI panel not found`);
      return;
    }
  } else {
    const wall = scene.children.find(obj => obj.userData.isWall);
    if (wall) {
      buttons = wall.children.filter(obj => obj.userData.isButton);
      normal = new THREE.Vector3(0, 0, 1).applyQuaternion(wall.quaternion).normalize();
    } else {
      // console.log(`Hand ${handIndex} whiteboard not found`);
      return;
    }
  }

  // Check for button interactions based on cone proximity
  buttons.forEach(button => {
    const buttonWorldPos = new THREE.Vector3();
    button.getWorldPosition(buttonWorldPos);
    const distanceToButton = cone.position.distanceTo(buttonWorldPos);
    // console.log(`Hand ${handIndex} distance to button: ${distanceToButton}`);
    if (distanceToButton < BUTTON_HOVER_THRESHOLD) {
      // Press effect: move button "down" along its local z (towards board/panel)
      button.position.z -= 0.05; // Depress by half height
      button.material.color.set(button.userData.activeColor);
      console.log("Button pressed:", button);
      triggeredButton = true;
    }
  });

  // If no button triggered and on whiteboard, try grabbing nearest object (e.g., slider knob)
  if (!triggeredButton && !isUIActive) {
    grabNearestObject(handIndex);
  }

  // Reset buttons after press
  if (triggeredButton) {
    buttons.forEach(button => {
      setTimeout(() => {
        button.position.copy(button.userData.defaultPosition);
        button.material.color.set(button.userData.defaultColor);
      }, 200); // 200ms press duration
    });
  }
}

export function onPinchEnd(handIndex) {
  console.log(`Hand ${handIndex} pinch END`);
  releaseObject(handIndex);
}

export function updateRaycast(handIndex, handedness, isUIActive) {
  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand, landmarkVisualsPerHand, connectionVisualsPerHand } = getHandTrackingData();
  const handLandmarks = smoothedLandmarksPerHand[handIndex];
  
  // Use landmark 3 (thumb IP) as ray origin
  const rayOrigin = handLandmarks[3].clone();

  // Calculate ray direction (from wrist to middle finger tip)
  const wrist = handLandmarks[0];
  const middleTip = handLandmarks[12];
  const rayDirection = new THREE.Vector3()
    .subVectors(middleTip, wrist)
    .normalize();

  // Smooth ray origin and direction
  smoothedRayOrigins[handIndex].lerp(rayOrigin, EMA_ALPHA);
  smoothedRayDirections[handIndex].lerp(rayDirection, EMA_ALPHA);

  const cone = coneVisualsPerHand[handIndex];

  // Skip if cursor disabled
  if (isUIActive && handedness === 'Left') {
    // console.log(`Hand ${handIndex} skipped: left hand with UI active`);
    cone.visible = false;
    return; // Disable for left hand when UI open
  }

  if (isUIActive && handedness === 'Right') {
    const panel = scene.children.find(obj => obj.isMesh && obj.material?.color.getHex() === 0xbffbff);
    if (panel) {
      const distanceToPanel = wrist.distanceTo(panel.position);
      if (distanceToPanel >= UI_CURSOR_THRESHOLD) {
        console.log(`Hand ${handIndex} too far from UI panel: ${distanceToPanel}`);
        cone.visible = false;
        return; // Skip if right hand not close to UI
      }

      // Apply rotation offset for UI panel cursor only
      const adjustedDirection = smoothedRayDirections[handIndex].clone();
      const rotationMatrix = new THREE.Matrix4().makeRotationX(UI_CURSOR_ROTATION_OFFSET);
      adjustedDirection.applyMatrix4(rotationMatrix).normalize();

      // Use wrist-based raycasting with adjusted direction for UI cursor
      raycaster.set(wrist, adjustedDirection);
      const intersects = raycaster.intersectObject(panel);
      if (intersects.length === 0) {
        console.log(`Hand ${handIndex} no UI panel intersection`);
        cone.visible = false;
        return;
      }
      let intersectPoint = intersects[0].point;

      // Convert intersection point to local panel coordinates to clamp
      const localPos = intersectPoint.clone().applyMatrix4(panel.matrixWorld.clone().invert());
      const clampedX = Math.max(-UI_PANEL_WIDTH / 2, Math.min(UI_PANEL_WIDTH / 2, localPos.x * UI_CURSOR_SENSITIVITY));
      const clampedY = Math.max(-UI_PANEL_HEIGHT / 2, Math.min(UI_PANEL_HEIGHT / 2, localPos.y * UI_CURSOR_SENSITIVITY));
      localPos.set(clampedX, clampedY, 0);
      const worldPos = localPos.applyMatrix4(panel.matrixWorld);

      // Calculate panel normal
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(panel.quaternion).normalize();

      // Set cone direction: from base to tip = -normal (tip towards panel)
      const coneDirection = normal.clone().negate();
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), coneDirection);

      // Set position to base = tip + normal * CONE_HEIGHT
      cone.position.copy(worldPos).add(normal.multiplyScalar(CONE_HEIGHT));

      cone.visible = true;

      // Check for hover on UI buttons and apply effects; also find closest hovered button for snapping
      const buttons = panel.children.filter(obj => obj.userData.isUIButton);
      let hoveredButton = null;
      let minDistance = Infinity;
      buttons.forEach(button => {
        const buttonWorldPos = new THREE.Vector3();
        button.getWorldPosition(buttonWorldPos);
        const distanceToButton = cone.position.distanceTo(buttonWorldPos);
        // console.log(`Hand ${handIndex} distance to UI button: ${distanceToButton}`);
        if (distanceToButton < BUTTON_HOVER_THRESHOLD) {
          if (isPinchingState[handIndex]) {
            // Press handled in onPinchStart
          } else {
            button.scale.set(1.1, 1.1, 1.1);
            button.material.color.set(button.userData.hoverColor);
          }
          if (distanceToButton < minDistance) {
            minDistance = distanceToButton;
            hoveredButton = button;
          }
        } else {
          button.scale.set(1, 1, 1);
          button.material.color.set(button.userData.defaultColor);
        }
      });

      // If hovering over a button, snap the cone (cursor) to the top of the button
      if (hoveredButton) {
        const buttonWorldPos = new THREE.Vector3();
        hoveredButton.getWorldPosition(buttonWorldPos);
        const buttonTop = buttonWorldPos.clone().add(normal.multiplyScalar(0.05)); // 0.1 height / 2 = 0.05
        cone.position.copy(buttonTop).add(normal.multiplyScalar(CONE_HEIGHT));
      }

      return; // Exit after handling UI cursor
    } else {
      // console.log(`Hand ${handIndex} UI panel not found`);
      cone.visible = false;
      return;
    }
  }

  // Original whiteboard cursor logic
  const wall = scene.children.find(obj => obj.userData.isWall);
  if (wall) {
    // Use landmark 3 (thumb IP) for cursor position
    const cursorPoint = handLandmarks[3];
    const scaledX = cursorPoint.x * CURSOR_SCALE_FACTOR;
    const scaledY = cursorPoint.y * CURSOR_SCALE_FACTOR;
    // Clamp to whiteboard boundaries (local space)
    const clampedX = Math.max(-WHITEBOARD_WIDTH / 2, Math.min(WHITEBOARD_WIDTH / 2, scaledX));
    const clampedY = Math.max(-WHITEBOARD_HEIGHT / 2, Math.min(WHITEBOARD_HEIGHT / 2, scaledY));

    // Convert local position (at surface z=0 for tip) to world space
    const localPos = new THREE.Vector3(clampedX, clampedY, 0);
    const worldPos = localPos.applyMatrix4(wall.matrixWorld); // Tip position

    // Calculate wall normal
    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(wall.quaternion).normalize();

    // Set cone direction: from base to tip = -normal (tip towards board)
    const coneDirection = normal.clone().negate();
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), coneDirection);

    // Set position to base = tip + normal * CONE_HEIGHT
    cone.position.copy(worldPos).add(normal.multiplyScalar(CONE_HEIGHT));

    cone.visible = true;

    // Check for hover on whiteboard buttons and apply effects; also find closest hovered button for snapping
    const buttons = wall.children.filter(obj => obj.userData.isButton);
    let hoveredButton = null;
    let minDistance = Infinity;
    buttons.forEach(button => {
      const buttonWorldPos = new THREE.Vector3();
      button.getWorldPosition(buttonWorldPos);
      const distanceToButton = cone.position.distanceTo(buttonWorldPos);
      // console.log(`Hand ${handIndex} distance to whiteboard button: ${distanceToButton}`);
      if (distanceToButton < BUTTON_HOVER_THRESHOLD) {
        if (isPinchingState[handIndex]) {
          // Press handled in onPinchStart
        } else {
          button.scale.set(1.1, 1.1, 1.1);
          button.material.color.set(button.userData.hoverColor);
        }
        if (distanceToButton < minDistance) {
          minDistance = distanceToButton;
          hoveredButton = button;
        }
      } else {
        button.scale.set(1, 1, 1);
        button.material.color.set(button.userData.defaultColor);
      }
    });

    // Check for hover on knob and apply effects
    const knobs = wall.children.filter(obj => obj.userData.isKnob);
    knobs.forEach(knob => {
      const knobWorldPos = new THREE.Vector3();
      knob.getWorldPosition(knobWorldPos);
      const distanceToKnob = cone.position.distanceTo(knobWorldPos);
      // console.log(`Hand ${handIndex} distance to knob: ${distanceToKnob}`);
      if (distanceToKnob < KNOB_HOVER_THRESHOLD) {
        if (isPinchingState[handIndex]) {
          // Grab handled in onPinchStart
        } else {
          knob.scale.set(1.1, 1.1, 1.1);
          knob.material.color.set(knob.userData.hoverColor);
        }
      } else {
        knob.scale.set(1, 1, 1);
        knob.material.color.set(knob.userData.defaultColor);
      }
    });

    // If hovering over a button, snap the cone (cursor) to the top of the button
    if (hoveredButton) {
      const buttonWorldPos = new THREE.Vector3();
      hoveredButton.getWorldPosition(buttonWorldPos);
      const buttonTop = buttonWorldPos.clone().add(normal.multiplyScalar(0.05)); // 0.1 height / 2 = 0.05
      cone.position.copy(buttonTop).add(normal.multiplyScalar(CONE_HEIGHT));
    }
  }

  // If the grabbed object is the knob, constrain its movement horizontally along the slider track
  if (grabbedObject && grabbedObject.userData.isKnob && grabbedObject.userData.handIndex === handIndex) {
    raycaster.set(cone.position, smoothedRayDirections[handIndex]); // Use cursor position for raycasting
    const intersects = raycaster.intersectObject(wall);
    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point;
      const localPos = intersectPoint.clone().applyMatrix4(wall.matrixWorld.clone().invert());
      localPos.x = Math.max(-1.5, Math.min(1.5, localPos.x)); // Clamp to slider track width (3 units wide)
      localPos.y = -0.5; // Fixed y position of slider
      localPos.z = 0.1; // Fixed z position (above board)
      grabbedObject.position.copy(localPos.applyMatrix4(wall.matrixWorld));
      // console.log(`Hand ${handIndex} moved knob to x: ${localPos.x}`);
    } else {
      // console.log(`Hand ${handIndex} no intersection with wall for knob movement`);
    }
  }

  // If an object is grabbed (non-knob), move it to the cursor position
  if (grabbedObject && !grabbedObject.userData.isKnob && grabbedObject.userData.handIndex === handIndex) {
    grabbedObject.position.copy(cone.position);
    // console.log(`Hand ${handIndex} moved non-knob object to: ${cone.position.x}, ${cone.position.y}, ${cone.position.z}`);
  }
}

function grabNearestObject(handIndex) {
  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand, landmarkVisualsPerHand, connectionVisualsPerHand } = getHandTrackingData();
  const cone = coneVisualsPerHand[handIndex];
  
  // Use cursor position (cone.position) as ray origin to align with visual feedback
  const rayOrigin = cone.position.clone();
  const rayDirection = smoothedRayDirections[handIndex];
  raycaster.set(rayOrigin, rayDirection);

  const selectableObjects = scene.children.filter(
    (obj) =>
      obj.isMesh &&
      !landmarkVisualsPerHand.flat().includes(obj) &&
      !connectionVisualsPerHand.flat().includes(obj) &&
      !obj.userData.isWall // Exclude the whiteboard from grabbing
  );
  // console.log(`Hand ${handIndex} selectable objects: ${selectableObjects.length}`);
  const intersects = raycaster.intersectObjects(selectableObjects, true); // true for recursive (children)

  console.log(`Hand ${handIndex} grab attempt: ${intersects.length} intersections found`);
  if (intersects.length > 0) {
    intersects.forEach(intersect => {
      console.log(`Intersected object: ${intersect.object.userData.isKnob ? 'knob' : intersect.object.name || intersect.object.id}`);
    });
    grabbedObject = intersects[0].object;
    grabbedObject.userData.originalScale = grabbedObject.scale.clone();
    grabbedObject.scale.multiplyScalar(GRAB_SCALE_FACTOR); // Visual feedback
    grabbedObject.userData.handIndex = handIndex; // Track which hand grabbed it
    if (grabbedObject.userData.isKnob) {
      grabbedObject.material.color.set(grabbedObject.userData.activeColor);
      // console.log(`Hand ${handIndex} grabbed knob`);
    } else {
      // console.log(`Hand ${handIndex} grabbed object: ${grabbedObject.name || grabbedObject.id}`);
    }
  } else {
    // console.log(`Hand ${handIndex} no object intersected for grabbing`);
  }
}

function releaseObject(handIndex) {
  if (grabbedObject && grabbedObject.userData.handIndex === handIndex) {
    grabbedObject.scale.copy(grabbedObject.userData.originalScale || grabbedObject.scale); // Restore scale
    if (grabbedObject.userData.isKnob) {
      grabbedObject.material.color.set(grabbedObject.userData.defaultColor);
      // console.log(`Hand ${handIndex} released knob`);
    }
    grabbedObject.userData.handIndex = null; // Clear hand association
    grabbedObject = null;
    // console.log(`Hand ${handIndex} released object`);
  }
}

export function getRayVisualsPerHand() {
  return rayVisualsPerHand;
}

export function getConeVisualsPerHand() {
  return coneVisualsPerHand;
}