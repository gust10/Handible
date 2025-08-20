---
sidebar_position: 2
---

# Getting Started with Handible

Handible is a powerful hand tracking and gesture control library that combines MediaPipe's hand detection capabilities with Three.js for 3D visualization and interaction. This library enables you to create immersive hand-based interactions in web applications.

## Installation

```bash
# Installation instructions will go here once the package is published
npm install handible
```

## Basic Setup

Here's a minimal example to get started with Handible:

```javascript
import { startGestureControl } from 'handible';

// Create your Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Get or create a video element for the webcam
const video = document.getElementById('webcamVideo');

// Initialize the hand tracking system
async function init() {
  // Start the gesture control system
  const handLandmarker = await startGestureControl(video, scene);
}

init();
```

## Key Features

- Real-time hand tracking using MediaPipe
- 3D gesture control integration with Three.js
- Support for multiple hands (up to 2 hands simultaneously)
- UI interaction capabilities
- Pinch gesture detection
- Ray casting for object interaction
- Smooth hand movement with EMA filtering
