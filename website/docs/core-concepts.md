---
sidebar_position: 3
---

# Core Concepts

## Hand Tracking System

The hand tracking system is powered by MediaPipe's HandLandmarker, providing accurate real-time hand detection and landmark tracking. The system tracks up to 21 3D landmarks per hand.

### Hand Landmarks

Each hand is tracked using 21 landmarks, including:
- Wrist (landmark 0)
- Thumb (landmarks 1-4)
- Index finger (landmarks 5-8)
- Middle finger (landmarks 9-12)
- Ring finger (landmarks 13-16)
- Pinky finger (landmarks 17-20)

## Gesture Detection

### Pinch Detection

The library includes built-in pinch detection that works in both 2D and 3D space:

```javascript
import { isPinching2D } from 'metahands';

// Check if a hand is performing a pinch gesture
const isPinching = isPinching2D(handLandmarks, videoWidth, videoHeight);
```

### Custom Gesture Events

You can register callbacks for pinch gestures:

```javascript
import { registerOnPinchStart, registerOnPinchEnd } from 'handible';

registerOnPinchStart((handIndex, handedness) => {
  console.log(`Pinch started with ${handedness} hand`);
});

registerOnPinchEnd((handIndex) => {
  console.log(`Pinch ended for hand ${handIndex}`);
});
```

## Scene Integration

The library seamlessly integrates with Three.js scenes:

```javascript
import { setSceneObjects } from 'handible';

// Set up your Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

// Register your scene with Metahands
setSceneObjects({ scene, camera, renderer, controls });
```

### Ray Casting and Object Interaction

The library provides ray casting capabilities for object interaction:
- Ray visualization for each hand
- Object grabbing and manipulation
- Distance-based interaction thresholds
- Smooth movement interpolation
