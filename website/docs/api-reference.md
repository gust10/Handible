---
sidebar_position: 4
title: "🚀 API Reference"
description: "Complete API documentation for Handible gesture control library"
---

# 🚀 API Reference

> **Complete reference for Handible gesture control library** - Build immersive hand-tracking experiences with Three.js

---

## 🎯 Core Functions

### ⚡ Setup and Initialization

<div className="api-section">

#### 🌟 `startGestureControl(videoElement, scene, numHands = 2)`

**The one-stop function to get your gesture control up and running!**

```javascript
import { startGestureControl } from 'handible';

const handLandmarker = await startGestureControl(video, scene, 2);
// 🎉 You're ready to track hands!
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoElement` | `HTMLVideoElement` | 📹 Webcam input element |
| `scene` | `THREE.Scene` | 🎬 Your Three.js scene |
| `numHands` | `number` | ✋ Number of hands to track (default: 2) |

**Returns:** `Promise<HandLandmarker>` - MediaPipe hand landmark detector

</div>

<div className="api-section">

#### 📱 `activateWebcamInCorner(videoElement)`

**Stylishly positions your webcam feed in the corner.**

```javascript
activateWebcamInCorner(videoElement);
// ✨ Webcam now appears in a neat corner overlay
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoElement` | `HTMLVideoElement` | 📹 Video element to position |

</div>

<div className="api-section">

#### 🧠 `initializeMediaPipe(videoElement)`

**Powers up the AI brain behind hand tracking.**

```javascript
const handLandmarker = await initializeMediaPipe(videoElement);
// 🤖 MediaPipe is now ready to detect hands
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `videoElement` | `HTMLVideoElement` | 📹 Video element for tracking |

**Returns:** `Promise<HandLandmarker>` - Initialized MediaPipe detector

</div>

<div className="api-section">

#### 🎮 `initGestureControl(scene, numHands)`

**Sets up the visual elements and gesture state management.**

```javascript
initGestureControl(scene, 2);
// 🎯 Cone cursors and gesture state are ready
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `scene` | `THREE.Scene` | 🎬 Three.js scene instance |
| `numHands` | `number` | ✋ Number of hands to track |

</div>

---

## 🏗️ Scene Management

<div className="api-section">

#### 🔗 `setSceneObjects({ scene, camera, renderer, controls })`

**Connects your Three.js setup with Handible.**

```javascript
setSceneObjects({ 
  scene: myScene, 
  camera: myCamera, 
  renderer: myRenderer, 
  controls: myControls 
});
// 🔌 Everything is now connected!
```

| Property | Type | Description |
|----------|------|-------------|
| `scene` | `THREE.Scene` | 🎬 Your main scene |
| `camera` | `THREE.Camera` | 📷 Scene camera |
| `renderer` | `THREE.WebGLRenderer` | 🖼️ WebGL renderer |
| `controls` | `OrbitControls` | 🎮 Camera controls |

</div>

<div className="api-section">

#### 📋 `getSceneObjects()`

**Retrieves your registered Three.js objects.**

```javascript
const { scene, camera, renderer, controls } = getSceneObjects();
// 📦 Access all your scene objects
```

**Returns:** `{ scene, camera, renderer, controls }`

</div>

---

## ✋ Gesture Detection

<div className="api-section">

#### 🤏 `isPinching2D(rawLandmarks, videoWidth, videoHeight, thresholdPixels = 30)`

**Detects pinch gestures with precision.**

```javascript
const isPinching = isPinching2D(landmarks, 640, 480, 25);
if (isPinching) {
  console.log('🤏 Pinch detected!');
}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rawLandmarks` | `Array` | - | 👆 Hand landmarks from MediaPipe |
| `videoWidth` | `number` | - | 📐 Video feed width |
| `videoHeight` | `number` | - | 📐 Video feed height |
| `thresholdPixels` | `number` | `30` | 📏 Pinch detection sensitivity |

**Returns:** `boolean` - True if pinch is detected

</div>

<div className="api-section">

#### 🚀 `onPinchStart(handIndex, handedness, isUIActive)`

**Handles the magic when a pinch begins.**

```javascript
// This is called automatically when pinch starts
// Triggers button presses and object grabbing ✨
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `handIndex` | `number` | 🔢 Hand index (0 or 1) |
| `handedness` | `string` | 👈👉 'Left' or 'Right' |
| `isUIActive` | `boolean` | 🖥️ UI panel active state |

</div>

<div className="api-section">

#### 🛑 `onPinchEnd(handIndex)`

**Handles cleanup when pinch ends.**

```javascript
// Automatically releases objects and resets states 🔄
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `handIndex` | `number` | 🔢 Hand index (0 or 1) |

</div>

<div className="api-section">

#### 🎣 `registerOnPinchStart(callback)` & `registerOnPinchEnd(callback)`

**Hook into pinch events with custom callbacks.**

```javascript
registerOnPinchStart((handIndex, handedness) => {
  console.log(`✨ ${handedness} hand started pinching!`);
  // Your custom logic here
});

registerOnPinchEnd((handIndex) => {
  console.log(`🛑 Hand ${handIndex} stopped pinching`);
  // Cleanup or trigger effects
});
```

</div>

---

## 🖐️ Hand Tracking

<div className="api-section">

#### 🎨 `setupHandTracking(scene)`

**Creates beautiful visual representations of hands.**

```javascript
await setupHandTracking(scene);
// 🌟 Hand landmarks and connections now appear in your scene
```

</div>

<div className="api-section">

#### 📍 `getWristPosition(handIndex)` & `getForwardDirection(handIndex)`

**Get precise hand positioning data.**

```javascript
const wristPos = getWristPosition(0);        // 📍 3D position
const direction = getForwardDirection(0);    // ➡️ Direction vector
```

**Returns:** `THREE.Vector3` - 3D position or direction

</div>

<div className="api-section">

#### 📊 `getHandTrackingData()`

**Access the complete hand tracking dataset.**

```javascript
const data = getHandTrackingData();
// 📈 Contains landmarks, visuals, and hand count
```

</div>

---

## 🎯 Surface Interaction System

> **🚀 The most powerful feature!** Interact with flat surfaces in 3D space.

<div className="api-section">

#### 🏗️ `SurfaceInteractionSystem`

**Advanced surface interaction management class.**

```javascript
import { SurfaceInteractionSystem } from 'handible';

// Register a custom surface
SurfaceInteractionSystem.registerSurface(mySurface, {
  width: 2,
  height: 1.5,
  cursorScaleFactor: 3.0,
  buttonHoverThreshold: 0.3,
  getNormal: (surface) => new THREE.Vector3(0, 0, 1),
  getButtonFilter: (obj) => obj.userData.isCustomButton
});
```

**Key Methods:**
- 📝 `registerSurface(surface, config)` - Register interactive surfaces
- 🎯 `updateCursorOnSurface()` - Handle cursor positioning
- 🔘 `handleButtonInteractions()` - Manage button states
- ♟️ `handleChessboardInteraction()` - Grid snapping magic

</div>

---

## 🎮 Object Interaction

<div className="api-section">

#### 🔄 `updateRaycast(handIndex, handedness, isUIActive)`

**The core interaction update loop.**

```javascript
// Called every frame to update hand interactions
updateRaycast(0, 'Right', false);
// 🎯 Updates cursor position and handles surface interactions
```

</div>

<div className="api-section">

#### 🤏 `grabNearestObject(handIndex, handedness, isUIActive, triggeredButton)`

**Intelligently grabs the nearest interactive object.**

```javascript
// Automatically finds and grabs closest object
// Provides visual feedback with color changes 🌈
```

</div>

---

## 🎨 Visual Elements

<div className="api-section">

#### 👁️ `getRayVisualsPerHand()` & `getConeVisualsPerHand()`

**Access the visual cursor elements.**

```javascript
const cones = getConeVisualsPerHand();
cones.forEach(cone => {
  cone.material.color.set(0x00ff00); // 💚 Make cursors green
});
```

</div>

---

## 📊 State Variables

<div className="api-grid">

### `isPinchingState`
```javascript
// Array tracking pinch state for each hand
[false, true] // Hand 0: not pinching, Hand 1: pinching
```

### `lastSnappedSquarePerHand`
```javascript
// Chess/grid position data
[{row: 3, col: 4, square: meshRef}, null]
```

</div>

---

## ⚙️ Configuration Constants

<div className="config-grid">

### 🎯 **Interaction Thresholds**
```javascript
BUTTON_HOVER_THRESHOLD = 0.4        // 🔘 Wall buttons
UIBUTTON_HOVER_THRESHOLD = 0.2      // 🖥️ UI buttons (precise)
UI_CURSOR_THRESHOLD = 1.5           // 📱 UI activation distance
```

### 🖥️ **UI Panel Settings**
```javascript
UI_PANEL_WIDTH = 1.0                // 📐 Panel dimensions
UI_PANEL_HEIGHT = 0.6
UI_CURSOR_SENSITIVITY = 1.0         // 🎛️ Movement sensitivity
```

### ♟️ **Chessboard Magic**
```javascript
CHESSBOARD_SIZE = 8                 // 🏁 8x8 grid
HIGHLIGHT_COLOR = 0xffff00          // 💛 Yellow highlights
CHESSBOARD_SCALE_FACTOR = 4         // 📏 Grid sensitivity
```

### 🎨 **Visual Elements**
```javascript
CONE_HEIGHT = 0.1                   // 🔺 Cursor size
CONE_RADIUS = 0.05
SPHERE_RADIUS = 0.05                // ⚫ Landmark size
```

</div>

---

## 💡 Usage Examples

<div className="example-section">

### 🚀 **Quick Start**
```javascript
import { startGestureControl, setSceneObjects } from 'handible';

// Minimal setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

setSceneObjects({ scene, camera, renderer });
await startGestureControl(document.getElementById('webcam'), scene, 2);

// 🎉 That's it! You now have hand tracking!
```

### 🎣 **Custom Interactions**
```javascript
import { registerOnPinchStart, registerOnPinchEnd } from 'handible';

// React to gestures
registerOnPinchStart((handIndex, handedness) => {
  console.log(`✨ ${handedness} hand gesture detected!`);
  playSound('pinch-start.mp3');
});

registerOnPinchEnd((handIndex) => {
  console.log(`🔄 Hand ${handIndex} gesture ended`);
  triggerParticleEffect();
});
```

### 🏗️ **Advanced Surface Setup**
```javascript
import { SurfaceInteractionSystem } from 'handible';

// Create an interactive hologram
const hologramSurface = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 2),
  new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7 })
);

SurfaceInteractionSystem.registerSurface(hologramSurface, {
  width: 3,
  height: 2,
  cursorScaleFactor: 2.0,
  buttonHoverThreshold: 0.25,
  getNormal: () => new THREE.Vector3(0, 0, 1),
  getButtonFilter: (obj) => obj.userData.isHologramButton
});

// 🌟 Now your hologram responds to hand gestures!
```

</div>

---

<div className="footer-note">

> 💡 **Pro Tip:** Start with the basic setup and gradually add custom interactions. The library is designed to be progressively enhanced!

> 🎯 **Performance:** All interactions are optimized with smoothing algorithms and efficient distance calculations.

> 🔧 **Customization:** Every threshold and visual element can be customized to fit your specific use case.

</div>

### Hand Tracking

#### `setupHandTracking(scene)`
Initializes hand tracking visualizations.
- `scene`: THREE.Scene
- Creates visual elements for hand landmarks and connections

#### `getWristPosition(handIndex)`
Gets the current wrist position for a hand.
- `handIndex`: Index of the hand (0 or 1)
- Returns: THREE.Vector3 world position

#### `getForwardDirection(handIndex)`
Gets the forward direction vector for a hand.
- `handIndex`: Index of the hand (0 or 1)
- Returns: THREE.Vector3 normalized direction

#### `getHandTrackingData()`
Returns current hand tracking data.
- Returns: Object containing landmarks, visuals, and hand count

#### `predictWebcam(handLandmarker, videoElement)`
Performs hand landmark prediction on webcam feed.
- `handLandmarker`: MediaPipe HandLandmarker instance
- `videoElement`: HTML video element
- Updates internal hand tracking state

#### `cleanupHandTracking(scene)`
Cleans up hand tracking resources.
- `scene`: THREE.Scene to clean up
- Removes all hand tracking visuals from scene

### Surface Interaction System

#### `SurfaceInteractionSystem`
Advanced surface interaction management class.

##### Methods:
- `registerSurface(surface, config)`: Registers a surface for interaction
  - `surface`: THREE.Object3D surface object
  - `config`: Configuration object with width, height, thresholds, etc.
- `updateCursorOnSurface(handIndex, handLandmarks, surface, cone)`: Updates cursor position on surface
- `handleButtonInteractions(handIndex, cone, surface, buttons, threshold)`: Manages button hover and selection
- `handleChessboardInteraction(handIndex, cursorPoint, surface, chessboard, cone)`: Handles chessboard grid snapping

### Object Interaction

#### `updateRaycast(handIndex, handedness, isUIActive)`
Updates the ray casting system for hand interaction.
- `handIndex`: Index of the hand (0 or 1)
- `handedness`: 'Left' or 'Right'
- `isUIActive`: Boolean indicating if UI panel is active
- Updates cursor position and handles surface interactions

#### `grabNearestObject(handIndex, handedness, isUIActive, triggeredButton)`
Attempts to grab the nearest interactive object.
- `handIndex`: Index of the hand (0 or 1)
- `handedness`: 'Left' or 'Right'
- `isUIActive`: Boolean indicating if UI panel is active
- `triggeredButton`: Boolean indicating if a button was triggered
- Finds and grabs the closest grabbable object within range

### Visual Elements

#### `getRayVisualsPerHand()`
Returns ray visual elements for each hand.
- Returns: Array of THREE.Object3D ray visuals

#### `getConeVisualsPerHand()`
Returns cone visual elements (cursors) for each hand.
- Returns: Array of THREE.Mesh cone visuals

## State Variables

### `isPinchingState`
Array tracking pinch state for each hand.
- Type: `boolean[]`
- Length: 2 (for 2 hands)

### `lastSnappedSquarePerHand`
Array storing last snapped chessboard square for each hand.
- Type: `Array<{row: number, col: number, square: THREE.Mesh}>`
- Contains row, column, and square mesh reference

## Configuration Constants

### Interaction Thresholds
```javascript
BUTTON_HOVER_THRESHOLD = 0.4        // Wall button hover distance
UIBUTTON_HOVER_THRESHOLD = 0.2      // UI button hover distance (more precise)
UI_CURSOR_THRESHOLD = 1.5           // Distance for UI panel activation
KNOB_HOVER_THRESHOLD = 0.6          // Knob interaction distance
CLOSE_DISTANCE_THRESHOLD = 3.0      // General interaction threshold
```

### UI Panel Configuration
```javascript
UI_PANEL_WIDTH = 1.0                // UI panel width
UI_PANEL_HEIGHT = 0.6               // UI panel height
UI_CURSOR_SENSITIVITY = 1.0         // UI cursor movement sensitivity
UI_CURSOR_ROTATION_OFFSET = -π/6    // UI cursor rotation offset
```

### Surface Dimensions
```javascript
WHITEBOARD_WIDTH = 5                // Whiteboard width
WHITEBOARD_HEIGHT = 3               // Whiteboard height
TABLE_WIDTH = 3                     // Table width
TABLE_DEPTH = 2                     // Table depth
```

### Chessboard Configuration
```javascript
CHESSBOARD_SIZE = 8                 // 8x8 grid
CHESSBOARD_SCALE_FACTOR = 4         // Sensitivity for grid coverage
HIGHLIGHT_COLOR = 0xffff00          // Yellow highlight for selected squares
```

### Cursor and Visual Settings
```javascript
CURSOR_SCALE_FACTOR = 2.5           // Cursor movement scaling
TABLE_CURSOR_SCALE_FACTOR = 2.5     // Table-specific cursor scaling
SPHERE_RADIUS = 0.05                // Hand landmark sphere size
CONE_RADIUS = 0.05                  // Cursor cone base radius
CONE_HEIGHT = 0.1                   // Cursor cone height
GRAB_SCALE_FACTOR = 3               // Scale factor for grabbed objects
```

### Smoothing and Animation
```javascript
EMA_ALPHA = 0.35                    // Exponential moving average factor for smoothing
```

## Usage Examples

### Basic Setup
```javascript
import { startGestureControl, setSceneObjects } from 'handible';

// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Register scene objects
setSceneObjects({ scene, camera, renderer });

// Get video element and start gesture control
const video = document.getElementById('webcam');
await startGestureControl(video, scene, 2);
```

### Custom Interaction Callbacks
```javascript
import { registerOnPinchStart, registerOnPinchEnd } from 'handible';

// Register custom pinch handlers
registerOnPinchStart((handIndex, handedness) => {
  console.log(`Hand ${handIndex} (${handedness}) started pinching`);
});

registerOnPinchEnd((handIndex) => {
  console.log(`Hand ${handIndex} released pinch`);
});
```

### Surface Registration
```javascript
import { SurfaceInteractionSystem } from 'handible';

// Register a custom surface
const customSurface = new THREE.Mesh(geometry, material);
SurfaceInteractionSystem.registerSurface(customSurface, {
  width: 2,
  height: 1.5,
  cursorScaleFactor: 3.0,
  buttonHoverThreshold: 0.3,
  getNormal: (surface) => new THREE.Vector3(0, 0, 1),
  getButtonFilter: (obj) => obj.userData.isCustomButton
});
```
