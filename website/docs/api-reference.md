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

## 🔊 Audio System

> **� Professional audio feedback system** - Web Audio API-powered sounds for enhanced user experience

<div className="api-section">

#### 🎼 `AudioSystem`

**Advanced audio management class for button sounds and UI feedback.**

```javascript
import { AudioSystem, audioSystem } from 'handible';

// Use the global instance
audioSystem.createClickSound();

// Or create a custom instance
const customAudio = new AudioSystem();
customAudio.setVolume(0.5);
```

**Key Methods:**
- 🔊 `createClickSound()` - High-quality click sound
- ✅ `createSuccessSound()` - Achievement/success chime  
- 🎯 `createHoverSound()` - Subtle hover feedback
- ❌ `createErrorSound()` - Error notification sound
- 🔇 `setVolume(volume)` - Master volume control (0.0-1.0)
- 🔄 `toggleEnabled()` - Enable/disable all sounds

</div>

<div className="api-section">

#### 🎮 `audioSystem`

**Global audio system instance - ready to use immediately.**

```javascript
import { audioSystem } from 'handible';

// Play sounds directly
audioSystem.createClickSound();        // 🔊 Button click
audioSystem.createSuccessSound();      // ✅ Success chime
audioSystem.createHoverSound();        // 🎯 Hover feedback
audioSystem.createErrorSound();        // ❌ Error sound

// Control settings
audioSystem.setVolume(0.3);            // 🔊 Set volume (0.0-1.0)
audioSystem.toggleEnabled();           // 🔄 Toggle on/off
```

</div>

<div className="api-section">

#### 🎛️ `toggleButtonSounds()` & `setButtonVolume(volume)`

**Convenient control functions for console debugging.**

```javascript
// Available globally in console
toggleButtonSounds();     // 🔄 Quick toggle
setButtonVolume(0.5);     // 🔊 Quick volume adjust

// Also importable
import { toggleButtonSounds, setButtonVolume } from 'handible';
```

| Function | Parameter | Description |
|----------|-----------|-------------|
| `toggleButtonSounds()` | - | 🔄 Toggle sounds on/off |
| `setButtonVolume()` | `volume: number` | 🔊 Set volume (0.0-1.0) |

</div>

---

## 🎬 Loading System

> **⏳ Professional loading experience** - Animated gauges with realistic progress stages

<div className="api-section">

#### 🌟 `sceneLoader`

**Advanced scene loading system with animated progress gauge.**

```javascript
import { sceneLoader } from 'handible';

// Show loading with automatic progress simulation
sceneLoader.show('tableScene');

// Manual progress control
sceneLoader.setProgress(25);
sceneLoader.setStage('Loading assets...');

// Hide when complete
sceneLoader.hide();
```

**Key Methods:**
- 📱 `show(sceneName)` - Display loading overlay for scene
- 📊 `setProgress(percentage)` - Set progress (0-100)
- 📝 `setStage(message)` - Update status message
- 🎭 `animateProgress(target, duration)` - Smooth progress animation
- 👻 `hide()` - Hide loading overlay

**Loading Stages:**
```javascript
// Automatic realistic stages during scene switching
"Initializing..."     → 15%
"Loading models..."   → 40% 
"Setting up scene..." → 70%
"Finalizing..."       → 90%
"Ready!"             → 100%
```

</div>

---

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

| Parameter | Type | Description |
|-----------|------|-------------|
| `scene` | `THREE.Scene` | 🎬 Three.js scene instance |

</div>

<div className="api-section">

#### 📍 `getWristPosition(handIndex)` & `getForwardDirection(handIndex)`

**Get precise hand positioning data.**

```javascript
const wristPos = getWristPosition(0);        // 📍 3D position
const direction = getForwardDirection(0);    // ➡️ Direction vector
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `handIndex` | `number` | 🔢 Hand index (0 or 1) |

**Returns:** `THREE.Vector3` - 3D position or direction

</div>

<div className="api-section">

#### � `predictWebcam(handLandmarker, videoElement)`

**Performs hand landmark prediction on webcam feed.**

```javascript
predictWebcam(handLandmarker, videoElement);
// 🤖 Updates internal hand tracking state with new landmarks
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `handLandmarker` | `HandLandmarker` | 🧠 MediaPipe detector instance |
| `videoElement` | `HTMLVideoElement` | 📹 Video input source |

</div>

<div className="api-section">

#### �📊 `getHandTrackingData()`

**Access the complete hand tracking dataset.**

```javascript
const data = getHandTrackingData();
// 📈 Contains landmarks, visuals, and hand count
// { smoothedLandmarksPerHand, landmarkVisualsPerHand, handCount, ... }
```

**Returns:** `Object` with hand tracking data including:
- `smoothedLandmarksPerHand` - Processed landmark positions
- `landmarkVisualsPerHand` - Visual elements for landmarks
- `handCount` - Current number of detected hands

</div>

<div className="api-section">

#### 🧹 `cleanupHandTracking(scene)`

**Cleans up hand tracking resources.**

```javascript
cleanupHandTracking(scene);
// 🗑️ Removes all hand tracking visuals and frees memory
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `scene` | `THREE.Scene` | 🎬 Scene to clean up |

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

| Parameter | Type | Description |
|-----------|------|-------------|
| `handIndex` | `number` | 🔢 Hand index (0 or 1) |
| `handedness` | `string` | 👈👉 'Left' or 'Right' |
| `isUIActive` | `boolean` | 🖥️ UI panel active state |

</div>

<div className="api-section">

#### 🤏 `grabNearestObject(handIndex, handedness, isUIActive, triggeredButton)`

**Intelligently grabs the nearest interactive object.**

```javascript
// Automatically finds and grabs closest object
// Provides visual feedback with color changes 🌈
grabNearestObject(0, 'Right', false, null);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `handIndex` | `number` | 🔢 Hand index (0 or 1) |
| `handedness` | `string` | 👈👉 'Left' or 'Right' |
| `isUIActive` | `boolean` | 🖥️ UI panel active state |
| `triggeredButton` | `Object` | 🔘 Button that triggered the grab |

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

> **🎛️ Fine-tune every aspect** of your hand tracking experience with these configuration options.

---

### 🎯 Interaction Thresholds

Control how close hands need to be for different interactions:

| Constant | Value | Description |
|----------|-------|-------------|
| `BUTTON_HOVER_THRESHOLD` | `0.4` | 🔘 **Wall buttons** - General button interaction distance |
| `UIBUTTON_HOVER_THRESHOLD` | `0.2` | 🖥️ **UI buttons** - Precise UI panel button distance |
| `UI_CURSOR_THRESHOLD` | `1.5` | 📱 **UI activation** - Distance to activate UI panel |
| `KNOB_HOVER_THRESHOLD` | `0.6` | 🎛️ **Knob interaction** - Slider/knob manipulation distance |
| `CLOSE_DISTANCE_THRESHOLD` | `3.0` | 🤏 **General interaction** - Maximum interaction range |

```javascript
// Example usage
import { BUTTON_HOVER_THRESHOLD, UIBUTTON_HOVER_THRESHOLD } from 'handible';

console.log(`Wall button threshold: ${BUTTON_HOVER_THRESHOLD}`);
console.log(`UI button threshold: ${UIBUTTON_HOVER_THRESHOLD}`);
```

---

### 🖥️ UI Panel Settings

Configure the floating UI panel system:

| Constant | Value | Description |
|----------|-------|-------------|
| `UI_PANEL_WIDTH` | `1.0` | 📐 **Panel width** - Horizontal size of UI panel |
| `UI_PANEL_HEIGHT` | `0.6` | 📐 **Panel height** - Vertical size of UI panel |
| `UI_CURSOR_SENSITIVITY` | `1.0` | 🎛️ **Movement sensitivity** - Cursor movement scaling |
| `UI_CURSOR_ROTATION_OFFSET` | `-π/6` | 🔄 **Rotation offset** - Cursor rotation adjustment |

```javascript
// Create custom UI panel with these dimensions
const panelGeometry = new THREE.PlaneGeometry(UI_PANEL_WIDTH, UI_PANEL_HEIGHT);
```

---

### 🏗️ Surface Dimensions  

Define the size of interactive surfaces:

| Constant | Value | Description |
|----------|-------|-------------|
| `WHITEBOARD_WIDTH` | `5` | 📋 **Whiteboard width** - Horizontal surface size |
| `WHITEBOARD_HEIGHT` | `3` | 📋 **Whiteboard height** - Vertical surface size |
| `TABLE_WIDTH` | `3` | 🪑 **Table width** - Horizontal table size |
| `TABLE_DEPTH` | `2` | 🪑 **Table depth** - Table depth dimension |

```javascript
// Use in surface configuration
SurfaceInteractionSystem.registerSurface(tableSurface, {
  width: TABLE_WIDTH,
  height: TABLE_DEPTH,
  // ... other config
});
```

---

### ♟️ Chessboard Configuration

Settings for grid-based interactions:

| Constant | Value | Description |
|----------|-------|-------------|
| `CHESSBOARD_SIZE` | `8` | 🏁 **Grid size** - 8x8 grid system |
| `CHESSBOARD_SCALE_FACTOR` | `4` | 📏 **Grid sensitivity** - Cursor-to-grid mapping |
| `HIGHLIGHT_COLOR` | `0xffff00` | 💛 **Highlight color** - Yellow square highlights |

```javascript
// Access current grid position
import { lastSnappedSquarePerHand, HIGHLIGHT_COLOR } from 'handible';

const currentSquare = lastSnappedSquarePerHand[0]; // {row: 3, col: 4, square: mesh}
```

---

### 🎯 Cursor Scaling

Control cursor movement and scaling behavior:

| Constant | Value | Description |
|----------|-------|-------------|
| `CURSOR_SCALE_FACTOR` | `2.5` | 🎮 **General scaling** - Basic cursor movement scaling |
| `TABLE_CURSOR_SCALE_FACTOR` | `2.5` | 🪑 **Table scaling** - Table-specific cursor scaling |
| `GRAB_SCALE_FACTOR` | `3` | 🤏 **Grab scaling** - Object scale when grabbed |

```javascript
// Objects automatically scale when grabbed
grabbedObject.scale.multiplyScalar(GRAB_SCALE_FACTOR);
```

---

### 🎨 Visual Elements

Customize the appearance of visual components:

| Constant | Value | Description |
|----------|-------|-------------|
| `CONE_HEIGHT` | `0.1` | 🔺 **Cursor height** - 3D cursor cone height |
| `CONE_RADIUS` | `0.05` | 🔺 **Cursor radius** - 3D cursor cone thickness |
| `SPHERE_RADIUS` | `0.05` | ⚫ **Landmark size** - Hand landmark sphere size |
| `PALM_SPHERE_RADIUS` | `0.03` | 🟢 **Palm indicator** - Palm sphere size |

```javascript
// Customize cursor appearance
const cones = getConeVisualsPerHand();
cones[0].scale.set(2, 2, 2); // Make cursor bigger
```

---

### ⚡ Animation & Smoothing

Fine-tune movement smoothing and animations:

| Constant | Value | Description |
|----------|-------|-------------|
| `EMA_ALPHA` | `0.35` | 📈 **Smoothing factor** - Exponential moving average (0-1) |

```javascript
// Lower values = smoother but slower response
// Higher values = more responsive but less smooth
// Range: 0.1 (very smooth) to 0.9 (very responsive)
```

<div className="config-note">

> � **Customization Tip:** Start with default values and adjust based on your specific use case. UI interactions typically need smaller thresholds for precision.

> ⚡ **Performance Tip:** Higher smoothing values (closer to 1.0) provide more responsive interactions but may appear jittery on lower-end devices.

> 🎯 **Accessibility Tip:** Consider offering users the ability to adjust interaction thresholds for different hand sizes and mobility levels.

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
import { registerOnPinchStart, registerOnPinchEnd, audioSystem } from 'handible';

// React to gestures with audio feedback
registerOnPinchStart((handIndex, handedness) => {
  console.log(`✨ ${handedness} hand gesture detected!`);
  audioSystem.createClickSound();  // 🔊 Audio feedback
});

registerOnPinchEnd((handIndex) => {
  console.log(`🔄 Hand ${handIndex} gesture ended`);
  audioSystem.createSuccessSound(); // ✅ Success sound
});
```

### 🎬 **Scene Switching with Loading**
```javascript
import { sceneLoader } from 'handible';

async function switchToCustomScene() {
  // Show loading gauge
  sceneLoader.show('customScene');
  
  // Simulate loading stages
  sceneLoader.setStage('Loading models...');
  await sceneLoader.animateProgress(40, 1000);
  
  sceneLoader.setStage('Setting up lights...');
  await sceneLoader.animateProgress(70, 800);
  
  sceneLoader.setStage('Finalizing...');
  await sceneLoader.animateProgress(100, 500);
  
  // Hide loading overlay
  sceneLoader.hide();
}
```

### 🔊 **Audio System Control**
```javascript
import { audioSystem, toggleButtonSounds, setButtonVolume } from 'handible';

// Volume control
audioSystem.setVolume(0.7);        // 🔊 Set to 70%
setButtonVolume(0.3);              // 🔊 Quick console control

// Sound testing
audioSystem.createClickSound();    // 🔊 Test click
audioSystem.createHoverSound();    // 🎯 Test hover
audioSystem.createSuccessSound();  // ✅ Test success
audioSystem.createErrorSound();    // ❌ Test error

// Toggle sounds
toggleButtonSounds();              // 🔄 Quick toggle
audioSystem.toggleEnabled();       // 🔄 Programmatic toggle
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

### 🎮 **Complete Interactive Setup**
```javascript
import { 
  startGestureControl, 
  setSceneObjects, 
  registerOnPinchStart,
  audioSystem,
  sceneLoader
} from 'handible';

// Complete setup with all features
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Initialize with loading
sceneLoader.show('main');
sceneLoader.setStage('Initializing...');

setSceneObjects({ scene, camera, renderer });

sceneLoader.setStage('Setting up hand tracking...');
await sceneLoader.animateProgress(50, 1000);

const video = document.getElementById('webcam');
await startGestureControl(video, scene, 2);

// Add audio feedback
registerOnPinchStart((handIndex, handedness) => {
  audioSystem.createClickSound();
});

// Set comfortable volume
audioSystem.setVolume(0.4);

sceneLoader.setStage('Ready!');
await sceneLoader.animateProgress(100, 500);
sceneLoader.hide();

// 🎊 Complete setup with audio, loading, and hand tracking!
```

</div>

---

<div className="footer-note">

> 💡 **Pro Tip:** Start with the basic setup and gradually add audio feedback and loading systems. The library is designed to be progressively enhanced!

> 🎯 **Performance:** All interactions are optimized with smoothing algorithms and efficient distance calculations for 60fps experiences.

> � **Audio:** Web Audio API provides high-quality, low-latency sound effects that enhance user experience without performance impact.

> 🎬 **Loading:** Professional loading gauges with realistic progress stages keep users engaged during scene transitions.

> �🔧 **Customization:** Every threshold, visual element, and audio setting can be customized to fit your specific use case.

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
