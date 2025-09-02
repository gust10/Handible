---
sidebar_position: 7
title: "🎯 Examples"
description: "Code examples and use cases for Handible"
---

# 🎯 Examples & Use Cases

> **Learn by doing** - Explore practical examples and real-world applications

---

## 🚀 Quick Examples

### 👋 **Basic Hand Tracking**

```javascript
import { startGestureControl, getHandPosition } from 'handible';

// Initialize
const video = document.getElementById('webcam');
const scene = new THREE.Scene();
await startGestureControl(video, scene);

// Track hand position
function animate() {
  const handPos = getHandPosition(0);
  if (handPos) {
    console.log(`Hand at: x=${handPos.x}, y=${handPos.y}, z=${handPos.z}`);
  }
  requestAnimationFrame(animate);
}
animate();
```

### 🤏 **Pinch Detection**

```javascript
import { isPinching2D, onPinchStart, onPinchEnd } from 'handible';

// Register pinch events
onPinchStart(0, (hand) => {
  console.log('Pinch started!', hand);
});

onPinchEnd(0, (hand) => {
  console.log('Pinch ended!', hand);
});

// Or check in animation loop
function checkGestures() {
  if (isPinching2D(0)) {
    // Do something while pinching
    object.material.color.setHex(0xff0000);
  } else {
    object.material.color.setHex(0x00ff00);
  }
}
```

### 🎯 **Object Manipulation**

```javascript
import { grabNearestObject, isPinching2D } from 'handible';

let grabbedObject = null;

function handleObjectGrab() {
  if (isPinching2D(0) && !grabbedObject) {
    // Grab nearest object
    grabbedObject = grabNearestObject(0, scene);
    if (grabbedObject) {
      grabbedObject.material.emissive.setHex(0x444444);
    }
  } else if (!isPinching2D(0) && grabbedObject) {
    // Release object
    grabbedObject.material.emissive.setHex(0x000000);
    grabbedObject = null;
  }
}
```

---

## 🎨 **UI Controls Example**

### 🔘 **Virtual Button**

```javascript
import { SurfaceInteractionSystem } from 'handible';

// Create a button
const buttonGeometry = new THREE.PlaneGeometry(2, 1);
const buttonMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x4CAF50,
  transparent: true 
});
const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
scene.add(button);

// Register as interactive surface
SurfaceInteractionSystem.registerSurface(button, {
  width: 2,
  height: 1,
  cursorScaleFactor: 3.0,
  onClick: () => {
    console.log('Button clicked!');
    // Button animation
    button.scale.set(0.9, 0.9, 1);
    setTimeout(() => {
      button.scale.set(1, 1, 1);
    }, 100);
  },
  onHover: () => {
    button.material.color.setHex(0x66BB6A);
  },
  onLeave: () => {
    button.material.color.setHex(0x4CAF50);
  }
});
```

### 🎚️ **Virtual Slider**

```javascript
// Create slider track
const trackGeometry = new THREE.PlaneGeometry(4, 0.2);
const trackMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
const track = new THREE.Mesh(trackGeometry, trackMaterial);

// Create slider handle
const handleGeometry = new THREE.PlaneGeometry(0.4, 0.6);
const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x2196F3 });
const handle = new THREE.Mesh(handleGeometry, handleMaterial);

scene.add(track);
scene.add(handle);

// Slider interaction
SurfaceInteractionSystem.registerSurface(track, {
  width: 4,
  height: 0.2,
  onCursorMove: (cursor) => {
    // Move handle based on cursor position
    const value = (cursor.x + 2) / 4; // Normalize to 0-1
    handle.position.x = cursor.x;
    console.log('Slider value:', value);
  }
});
```

---

## 🎮 **Game Examples**

### 🎯 **Target Shooting Game**

```javascript
import { getHandPosition, isPinching2D } from 'handible';

class TargetGame {
  constructor(scene) {
    this.scene = scene;
    this.targets = [];
    this.score = 0;
    this.createTargets();
  }

  createTargets() {
    for (let i = 0; i < 5; i++) {
      const target = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      
      target.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        -5
      );
      
      this.targets.push(target);
      this.scene.add(target);
    }
  }

  update() {
    const handPos = getHandPosition(0);
    if (!handPos) return;

    // Check for target hits
    if (isPinching2D(0)) {
      this.targets.forEach((target, index) => {
        const distance = handPos.distanceTo(target.position);
        if (distance < 1) {
          // Hit!
          this.scene.remove(target);
          this.targets.splice(index, 1);
          this.score++;
          console.log('Score:', this.score);
        }
      });
    }
  }
}

// Usage
const game = new TargetGame(scene);
function animate() {
  game.update();
  requestAnimationFrame(animate);
}
```

### 🏗️ **Block Builder**

```javascript
import { isPinching2D, getHandPosition } from 'handible';

class BlockBuilder {
  constructor(scene) {
    this.scene = scene;
    this.blocks = [];
    this.lastPinchState = false;
  }

  update() {
    const isPinching = isPinching2D(0);
    const handPos = getHandPosition(0);

    // Place block on pinch start
    if (isPinching && !this.lastPinchState && handPos) {
      this.placeBlock(handPos);
    }

    this.lastPinchState = isPinching;
  }

  placeBlock(position) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshLambertMaterial({ 
        color: Math.random() * 0xffffff 
      })
    );
    
    // Snap to grid
    block.position.set(
      Math.round(position.x),
      Math.round(position.y),
      Math.round(position.z)
    );
    
    this.blocks.push(block);
    this.scene.add(block);
  }
}
```

---

## 🎨 **Creative Applications**

### 🖌️ **3D Drawing**

```javascript
import { getHandPosition, isPinching2D } from 'handible';

class Drawing3D {
  constructor(scene) {
    this.scene = scene;
    this.isDrawing = false;
    this.currentStroke = null;
    this.points = [];
  }

  update() {
    const handPos = getHandPosition(0);
    const isPinching = isPinching2D(0);

    if (isPinching && handPos) {
      if (!this.isDrawing) {
        this.startStroke(handPos);
      } else {
        this.addPoint(handPos);
      }
    } else if (this.isDrawing) {
      this.endStroke();
    }
  }

  startStroke(position) {
    this.isDrawing = true;
    this.points = [position.clone()];
  }

  addPoint(position) {
    this.points.push(position.clone());
    this.updateStroke();
  }

  updateStroke() {
    if (this.currentStroke) {
      this.scene.remove(this.currentStroke);
    }

    // Create line from points
    const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 3 
    });
    
    this.currentStroke = new THREE.Line(geometry, material);
    this.scene.add(this.currentStroke);
  }

  endStroke() {
    this.isDrawing = false;
    this.currentStroke = null;
    this.points = [];
  }
}
```

---

## 🔧 **Integration Examples**

### ⚛️ **React Integration**

```jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { startGestureControl } from 'handible';

function HandTrackingComponent() {
  const videoRef = useRef();
  const sceneRef = useRef();

  useEffect(() => {
    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    sceneRef.current = { scene, camera, renderer };

    // Initialize hand tracking
    startGestureControl(videoRef.current, scene);

    return () => {
      // Cleanup
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
}
```

### 📱 **Mobile Optimization**

```javascript
// Detect mobile and adjust settings
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Mobile-optimized initialization
async function initMobile() {
  const config = {
    numHands: 1, // Single hand for better performance
    videoConstraints: {
      width: isMobile ? 640 : 1280,
      height: isMobile ? 480 : 720,
      facingMode: 'user'
    }
  };

  const video = document.getElementById('webcam');
  const stream = await navigator.mediaDevices.getUserMedia({ 
    video: config.videoConstraints 
  });
  
  video.srcObject = stream;
  await startGestureControl(video, scene, config.numHands);
}
```

---

## 🎯 **Use Case Gallery**

### 🏥 **Medical Training**
- Virtual anatomy exploration
- Surgical simulation training
- Touchless interface for sterile environments

### 🎓 **Education**
- Interactive 3D models in science class
- Math visualization with hand gestures
- Language learning with gesture-based interaction

### 🎨 **Art & Design**
- Sculptural 3D modeling
- Virtual reality art creation
- Interactive installations

### 🏢 **Business**
- Presentation control without remotes
- Data visualization interaction
- Virtual showrooms

Ready to build something amazing? Check out our [API Reference](api-reference.md) for the complete function documentation!
