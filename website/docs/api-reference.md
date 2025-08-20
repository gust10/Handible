---
sidebar_position: 4
---


# API Reference

## Core Functions

### Setup and Initialization

#### `startGestureControl(videoElement, scene, numHands = 2)`
Initializes the hand tracking and gesture control system.
- `videoElement`: HTMLVideoElement for webcam input
- `scene`: THREE.Scene instance
- `numHands`: Number of hands to track (default: 2)
- Returns: `Promise` containing the MediaPipe hand landmark detector

#### `activateWebcamInCorner(videoElement)`
Activates and positions the webcam feed in the corner of the screen.
- `videoElement`: HTMLVideoElement to setup

#### `initializeMediaPipe(videoElement)`
Initializes the MediaPipe HandLandmarker.
- `videoElement`: HTMLVideoElement for tracking
- Returns: `Promise` containing the MediaPipe hand landmark detector

### Scene Management

#### `setSceneObjects({ scene, camera, renderer, controls })`
Registers Three.js objects with the library.
- `scene`: THREE.Scene
- `camera`: THREE.Camera
- `renderer`: THREE.WebGLRenderer
- `controls`: OrbitControls

#### `getSceneObjects()`
Returns the current scene objects.
- Returns: `{ scene, camera, renderer, controls }`

### Gesture Detection

#### `isPinching2D(rawLandmarks, videoWidth, videoHeight, thresholdPixels = 30)`
Detects pinch gestures in 2D space.
- Returns: boolean

#### `registerOnPinchStart(callback)`
Registers a callback for pinch start events.
- `callback`: (handIndex: number, handedness: string) => void

#### `registerOnPinchEnd(callback)`
Registers a callback for pinch end events.
- `callback`: (handIndex: number) => void

### Hand Tracking

#### `setupHandTracking(scene)`
Initializes hand tracking visualizations.
- `scene`: THREE.Scene

#### `getWristPosition(handIndex)`
Gets the current wrist position for a hand.
- Returns: THREE.Vector3

#### `getForwardDirection(handIndex)`
Gets the forward direction vector for a hand.
- Returns: THREE.Vector3

### Interaction

#### `updateRaycast(handIndex, handedness, isUIActive)`
Updates the ray casting system for hand interaction.

#### `grabNearestObject(handIndex, handedness, isUIActive, triggeredButton)`
Attempts to grab the nearest interactive object.

## Constants

### Interaction Thresholds
```javascript
CLOSE_DISTANCE_THRESHOLD = 3.0
BUTTON_HOVER_THRESHOLD = 0.4
UI_CURSOR_THRESHOLD = 1.5
KNOB_HOVER_THRESHOLD = 0.6
```

### UI Configuration
```javascript
UI_PANEL_WIDTH = 1.0
UI_PANEL_HEIGHT = 0.6
UI_CURSOR_SENSITIVITY = 1.0
```

### Visualization
```javascript
SPHERE_RADIUS = 0.05
CONE_RADIUS = 0.05
CONE_HEIGHT = 0.1
```
