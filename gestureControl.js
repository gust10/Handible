import * as THREE from "three";
import { getSceneObjects } from "./sceneManager.js";
import { cleanupHandTracking, getHandTrackingData, setupHandTracking } from "./handTracking.js";

const raycaster = new THREE.Raycaster();
let grabbedObject = null;
let sceneCache = {}; // New: Global cache for static objects (reset on scene switch)
const rayVisualsPerHand = []; // Array to store ray visuals for each hand
const coneVisualsPerHand = []; // Array to store cone visuals for each hand
const smoothedRayOrigins = []; // Smoothed ray origin for each hand
const smoothedRayDirections = []; // Smoothed ray direction for each hand
export const isPinchingState = Array(2).fill(false); // Moved from handTracking.js
const EMA_ALPHA = 0.35; // Match hand tracking smoothing
const GRAB_SCALE_FACTOR = 3; // Scale grabbed object for visual feedback
const CLOSE_DISTANCE_THRESHOLD = 3.0; // Increased further to ensure interactions trigger
const SPHERE_RADIUS = 0.05; // Size of the created sphere
const CONE_RADIUS = 0.05; // Radius of the cone base
const CONE_HEIGHT = 0.1; // Height of the cone
const WHITEBOARD_WIDTH = 5; // Matches whiteboard width in threeSetup.js
const WHITEBOARD_HEIGHT = 3; // Matches whiteboard height in threeSetup.js
const TABLE_WIDTH = 3;
const TABLE_DEPTH = 2;
const TABLE_CURSOR_SCALE_FACTOR = 2.5; // Adjust as needed; higher = more coverage on table
const UI_PANEL_WIDTH = 1.0;
const UI_PANEL_HEIGHT = 0.6;
const CURSOR_SCALE_FACTOR = 2.5; // Adjust as needed to fit webcam FOV to whiteboard; higher = more coverage
const BUTTON_HOVER_THRESHOLD = 0.4; // Increased to account for 3D button size
const UIBUTTON_HOVER_THRESHOLD = 0.2; // Threshold for UI button hover
const UI_CURSOR_THRESHOLD = 1.5; // Distance threshold for right hand to UI panel
const UI_CURSOR_SENSITIVITY = 1.0; // Controls sensitivity of wrist rotation for UI cursor
const UI_CURSOR_ROTATION_OFFSET = -Math.PI / 6; // Rotation offset only for UI panel cursor
const KNOB_HOVER_THRESHOLD = 0.6; // Increased for easier knob grabbing

const CHESSBOARD_SIZE = 8; // 8x8 grid
const CHESSBOARD_SCALE_FACTOR = 4; // Adjust sensitivity to cover the chessboard; higher = more grid coverage
const HIGHLIGHT_COLOR = 0xffff00; // Yellow for snapped square
const ORANGE_COLOR = 0xffa500; // Orange for selected square
export const lastSnappedSquarePerHand = Array(2).fill(null); // {row, col, square} per hand

let onPinchStartCallbacks = []; // New: Array for user callbacks
let onPinchEndCallbacks = []; // New: Array for user callbacks

// New: Simple registration functions
export function registerOnPinchStart(callback) {
  onPinchStartCallbacks.push(callback);
}

export function registerOnPinchEnd(callback) {
  onPinchEndCallbacks.push(callback);
}

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

// returns boolean whether the hand is pinching
export function isPinching2D(rawLandmarks, videoWidth, videoHeight, thresholdPixels = 30) {
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

export function onPinchStart(handIndex, handedness, isUIActive) {
  // Call user callbacks
  onPinchStartCallbacks.forEach(cb => cb(handIndex, handedness));

  console.log("pinch Start", handIndex, handedness, isUIActive);
  // console.log(`Hand ${handIndex} pinch START, isUIActive: ${isUIActive}, handedness: ${handedness}`);
  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand } = getHandTrackingData();
  const handLandmarks = smoothedLandmarksPerHand[handIndex];

  const cone = coneVisualsPerHand[handIndex];

  // Skip if cursor disabled
  if (isUIActive && handedness === 'Left') {
    console.log(`Hand ${handIndex} skipped: left hand with UI active`);
    return; // Disable for left hand when UI open
  }

  let buttons = [];
  let normal = new THREE.Vector3();
  let triggeredButton = false;

  // right hand UI cursor logic
  if (isUIActive && handedness === 'Right') {
    const panel = scene.children.find(obj => obj.isMesh && obj.material?.color.getHex() === 0xbffbff); // color matches UI panel
    if (panel) {
      const wrist = handLandmarks[0];
      const distanceToPanel = wrist.distanceTo(panel.position);
      if (distanceToPanel >= UI_CURSOR_THRESHOLD) {
        return; // Skip if right hand not close to UI
      }
      buttons = panel.children.filter(obj => obj.userData.isUIButton);
      normal = new THREE.Vector3(0, 0, 1).applyQuaternion(panel.quaternion).normalize();
    } else {
      // UI panel not found
      return;
    }
  } else {
    const wall = scene.children.find(obj => obj.userData.isWall);
    if (wall) {
      buttons = wall.children.filter(obj => obj.userData.isButton);
      normal = new THREE.Vector3(0, 0, 1).applyQuaternion(wall.quaternion).normalize();
    } else {
      const table = scene.children.find(obj => obj.userData.isTable);
      if (table) {
        buttons = table.children.filter(obj => obj.userData.isButton); // If buttons on table
        normal = new THREE.Vector3(0, 1, 0).applyQuaternion(table.quaternion).normalize(); // Up for table
      } else {
        return; // No interactive surface
      }
    }
  }

  // Check for button interactions based on cone proximity
  buttons.forEach(button => {
    const buttonWorldPos = new THREE.Vector3();
    button.getWorldPosition(buttonWorldPos);
    const distanceToButton = cone.position.distanceTo(buttonWorldPos);
    if (distanceToButton < BUTTON_HOVER_THRESHOLD) {
      // Press effect: move button "down" along its local z (towards board/panel)
      button.position.z -= 0.05; // Depress by half height
      button.material.color.set(button.userData.activeColor);
      console.log("Button pressed:", button);
      
      // Trigger scene switch if this is the designated button
      if (button.userData.action === 'switchToTableScene') {
        switchToScene('table');
      }
      
      triggeredButton = true;
    }
  });

  
  grabNearestObject(handIndex, handedness, isUIActive, triggeredButton); // Pass checks
  

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
  // Call user callbacks
  onPinchEndCallbacks.forEach(cb => cb(handIndex, handedness));

  console.log(`Hand ${handIndex} pinch END`);
  releaseObject(handIndex);
}

// New: Cache function (call in initGestureControl or on scene switch)
function cacheSceneObjects(scene) {
  sceneCache.wall = scene.children.find(obj => obj.userData.isWall);
  sceneCache.table = scene.children.find(obj => obj.userData.isTable);
  sceneCache.chessboard = scene.getObjectByProperty('isChessboard', true);
  sceneCache.uiPanel = scene.children.find(obj => obj.isMesh && obj.material?.color.getHex() === 0xbffbff);
  console.log('Scene objects cached'); // Debug
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
        cone.visible = false;
        return; //no UI panel intersection
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
        if (distanceToButton < UIBUTTON_HOVER_THRESHOLD) {
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
      // UI panel not found
      cone.visible = false;
      return;
    }
  }

  // Original whiteboard cursor logic
  const wall = scene.children.find(obj => obj.userData.isWall);
  const table = scene.children.find(obj => obj.userData.isTable);
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
      const buttonTop = buttonWorldPos.clone().add(normal.multiplyScalar(1)); // 0.1 height / 2 = 0.05 f
      cone.position.copy(buttonTop).add(normal.multiplyScalar(CONE_HEIGHT));
    }
  } else if (table) {
    // New: Check for chessboard first (snapping/highlighting takes priority)
    const chessboard = scene.getObjectByProperty('isChessboard', true); // Recursive find
    if (chessboard) {
      // console.log("chessboard found for hand", handIndex);
      const cursorPoint = handLandmarks[3]; // Thumb IP
      const scaledX = cursorPoint.x * CHESSBOARD_SCALE_FACTOR;
      const scaledZ = -cursorPoint.y * CHESSBOARD_SCALE_FACTOR; // Negated for vertical direction

      // Map to grid 0-7
      const col = Math.floor((scaledX + 1) * (CHESSBOARD_SIZE / 2));
      const row = Math.floor((scaledZ + 1) * (CHESSBOARD_SIZE / 2));
      const clampedCol = Math.max(0, Math.min(CHESSBOARD_SIZE - 1, col));
      const clampedRow = Math.max(0, Math.min(CHESSBOARD_SIZE - 1, row));

      // Get square and its world position
      const squareIndex = clampedRow * CHESSBOARD_SIZE + clampedCol;
      const square = chessboard.children[squareIndex];
      if (square) {
        const worldPos = new THREE.Vector3();
        square.getWorldPosition(worldPos);

        // Highlight the square
        square.material.color.set(HIGHLIGHT_COLOR);

        // Set cone position to square center (above surface)
        const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(table.quaternion).normalize();
        cone.position.copy(worldPos);

        // Cone direction: point upwards
        const coneDirection = normal;
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), coneDirection);

        cone.visible = true;

        // If grabbedObject, move it to snapped position
        if (grabbedObject && grabbedObject.userData.handIndex === handIndex) {
          console.log(grabbedObject.position.y, worldPos.y, cone.position.y)
        }
      }
      // Store last snapped for pinch
      lastSnappedSquarePerHand[handIndex] = { row: clampedRow, col: clampedCol, square };
      // console.log(lastSnappedSquarePerHand[handIndex]);
    } else {
      // Fallback: Basic table cursor if no chessboard
      const cursorPoint = handLandmarks[3];
      const scaledX = cursorPoint.x * TABLE_CURSOR_SCALE_FACTOR;
      const scaledZ = -cursorPoint.y * TABLE_CURSOR_SCALE_FACTOR;
      const clampedX = Math.max(-TABLE_WIDTH / 2, Math.min(TABLE_WIDTH / 2, scaledX));
      const clampedZ = Math.max(-TABLE_DEPTH / 2, Math.min(TABLE_DEPTH / 2, scaledZ));

      const localPos = new THREE.Vector3(clampedX, 0.1, clampedZ);
      const worldPos = localPos.applyMatrix4(table.matrixWorld);

      const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(table.quaternion).normalize();
      cone.position.copy(worldPos);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      cone.visible = true;

      if (grabbedObject && grabbedObject.userData.handIndex === handIndex) {
        grabbedObject.position.copy(cone.position);
      }
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
    // HERE
    // const offsetPosition = cone.position.clone().add(new THREE.Vector3(0, 0.8, 0)); // Lift by 0.15 (adjust for object height)
    console.log(grabbedObject.position.y, cone.position.y)
    grabbedObject.position.copy(cone.position);
    console.log(grabbedObject.position.y, cone.position.y)
    // grabbedObject.position.copy(cone.position);
    // console.log(`Hand ${handIndex} moved non-knob object to: ${cone.position.x}, ${cone.position.y}, ${cone.position.z}`);
  }
}

export function grabNearestObject(handIndex, handedness, isUIActive, triggeredButton) {
  if (isUIActive || triggeredButton) {
    return; // Internal check: Skip if UI or button context
  }

  const { scene } = getSceneObjects();
  const { smoothedLandmarksPerHand, landmarkVisualsPerHand, connectionVisualsPerHand } = getHandTrackingData();
  const handLandmarks = smoothedLandmarksPerHand[handIndex];
  if (!handLandmarks || handLandmarks.length === 0) return; // Guard: No landmarks

  const cone = coneVisualsPerHand[handIndex];
  if (!cone || !cone.visible) return; // No cone, skip

  const conePosition = new THREE.Vector3();
  cone.getWorldPosition(conePosition); // Get cone's world position (cursor tip)
  
  // Find nearest grabbable object near cone
  const grabbableObjects = [];
  scene.traverse(obj => {
  if (obj.userData?.isGrabbable && 
      !obj.userData?.isWall && 
      !landmarkVisualsPerHand.flat().includes(obj) && 
      !connectionVisualsPerHand.flat().includes(obj)) {
    grabbableObjects.push(obj);
  }
});
  grabbableObjects.map(obj => {
    const objPos = new THREE.Vector3();
    obj.getWorldPosition(objPos);
    return { obj, distance: conePosition.distanceTo(objPos) };
  }).sort((a, b) => a.distance - b.distance); // Sort by distance


  console.log(grabbableObjects[0]);
  if (grabbableObjects.length === 0 || grabbableObjects[0].distance > 0.5) { // Threshold, adjust as needed
    console.log(`Hand ${handIndex} no nearby grabbable object near cone.`);
    return;
  }
  
  // Grab the nearest
  const closest = grabbableObjects[0];
  grabbedObject = closest;

  // Ensure userData exists (fix for undefined error)
  if (!grabbedObject.userData) {
    grabbedObject.userData = {};
  }

  // New: Store and change color (e.g., to red 0xff0000)
  if (grabbedObject.material) { // Guard for material
    grabbedObject.userData = grabbedObject.userData || {}; // Ensure userData
    grabbedObject.userData.originalColor = grabbedObject.material.color.clone();
    grabbedObject.material.color.set(0xffa500); // Change to blue hex: 0x0000ff
  }

  // Ensure userData exists before using it
  console.log(grabbedObject);
  // Now safe to set
  // grabbedObject.userData.originalScale = grabbedObject.scale.clone();
  // grabbedObject.scale.multiplyScalar(GRAB_SCALE_FACTOR);
  grabbedObject.userData.handIndex = handIndex;

  if (grabbedObject) {
    console.log("grabbedObject");
  }
  // if (grabbedObject.userData.isKnob) {
  //   grabbedObject.material.color.set(grabbedObject.userData.activeColor);
  // }
  // console.log(`Hand ${handIndex} grabbed: ${grabbedObject.name || grabbedObject.id}`);
}

function releaseObject(handIndex) {
  if (grabbedObject && grabbedObject.userData.handIndex === handIndex) {
    grabbedObject.scale.copy(grabbedObject.userData.originalScale || grabbedObject.scale); // Restore scale
    if (grabbedObject.userData.isKnob) {
      grabbedObject.material.color.set(grabbedObject.userData.defaultColor);
      // console.log(`Hand ${handIndex} released knob`);
    }
    grabbedObject.userData.handIndex = null; // Clear hand association
    grabbedObject.material.color.set(0xff0000);
    grabbedObject = null;
    // console.log(`Hand ${handIndex} released object`);
  }
}

async function switchToScene(sceneName) {
  let { scene, camera, renderer, controls } = getSceneObjects();

  // Dispose old scene resources
  scene.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(mat => mat.dispose());
      else child.material.dispose();
    }
  });
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
  renderer.dispose();
  controls.dispose();

  // Clear hand tracking state (visuals arrays, counters, etc.)
  cleanupHandTracking(scene);

  // Clear gesture control state (visuals and smoothed arrays)
  coneVisualsPerHand.length = 0;
  smoothedRayOrigins.length = 0;
  smoothedRayDirections.length = 0;
  isPinchingState.fill(false);
  grabbedObject = null; // Clear any grabbed reference

  let setupFunction;
  switch (sceneName) {
    case 'whiteboard':
      const { setupThreeScene } = await import('./threeSetup.js');
      setupFunction = setupThreeScene;
      break;
    case 'table':
      const { setupTableScene } = await import('./tableSetup.js');
      setupFunction = setupTableScene;
      break;
    default:
      console.error(`Unknown scene: ${sceneName}`);
      return;
  }

  setupFunction();

  // Re-setup hand tracking and gestures with new scene
  const { scene: newScene } = getSceneObjects();
  await setupHandTracking(newScene);
  initGestureControl(newScene, 2); // Re-add cones and reset gesture state
}

export function getRayVisualsPerHand() {
  return rayVisualsPerHand;
}

export function getConeVisualsPerHand() {
  return coneVisualsPerHand;
}