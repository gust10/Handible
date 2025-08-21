---
sidebar_position: 2
title: "🚀 Getting Started"
description: "Jump into hand tracking magic with Handible in minutes"
---

# 🚀 Getting Started with Handible

> **Transform your web app with gesture control** - Combine MediaPipe's AI-powered hand detection with Three.js for mind-blowing 3D interactions!

---

## 📦 Installation

<div className="api-section">

```bash
# 🎯 Get Handible in your project (coming soon to npm)
npm install handible

# 🛠️ Or clone the repository for development
git clone https://github.com/your-repo/handible.git
```

**Dependencies you'll need:**
- `three` - 3D graphics library
- `@mediapipe/hands` - Hand tracking AI

</div>

---

## ⚡ Quick Start

<div className="example-section">

### 🎬 **30-Second Setup**

```javascript
import { startGestureControl, setSceneObjects } from 'handible';
import * as THREE from 'three';

// 🎭 Create your Three.js stage
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 🔗 Connect everything
setSceneObjects({ scene, camera, renderer });

// 📹 Get webcam access
const video = document.getElementById('webcam');

// 🚀 Launch gesture control
async function init() {
  const handLandmarker = await startGestureControl(video, scene, 2);
  console.log('🎉 Hand tracking is live!');
  
  // Start your render loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

init();
```

**🎯 That's it!** Your hands are now controlling 3D space.

</div>

---

## 🎯 Core Features

<div className="surface-types">

### 🖐️ **Real-time Hand Tracking**
- 21 3D landmarks per hand
- MediaPipe AI precision
- Up to 2 hands simultaneously
- 60fps smooth performance

### 🤏 **Gesture Recognition**
- Pinch detection with callbacks
- Custom gesture events
- Multi-hand gesture support
- Sensitivity controls

### 🎮 **3D Interaction**
- Object grabbing and manipulation
- Surface interaction system
- Button and UI controls
- Ray casting visualization

### 🎨 **Visual Feedback**
- Cone cursors for each hand
- Hover states and animations
- Customizable visual themes
- Smooth interpolation

### 🔊 **Professional Audio System**
- Web Audio API integration
- High-quality sound effects
- Volume control and toggles
- Low-latency feedback

### 🎬 **Loading & Progress**
- Animated loading gauges
- Scene transition effects
- Professional progress stages
- Smooth visual feedback

</div>

---

## 🎨 Your First Interactive Object

<div className="feature-showcase">

**Let's create a cube you can grab with your hands:**

```javascript
import { registerOnPinchStart, registerOnPinchEnd } from 'handible';

// 🎲 Create an interactive cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

// 🏷️ Mark it as grabbable
cube.userData.isGrabbable = true;
cube.position.set(0, 0, -5);
scene.add(cube);

// 🎣 Hook into gesture events
registerOnPinchStart((handIndex, handedness) => {
  console.log(`✨ ${handedness} hand started grabbing!`);
});

registerOnPinchEnd((handIndex) => {
  console.log(`🔄 Hand ${handIndex} released the object`);
});
```

**🎉 Now pinch to grab the cube and move it around!**

</div>

---

## 🔊 Adding Audio Feedback

<div className="audio-showcase">

**Make your interactions come alive with professional sound effects:**

```javascript
import { audioSystem, registerOnPinchStart } from 'handible';

// 🔊 Set comfortable volume
audioSystem.setVolume(0.4);

// 🎵 Add sound to interactions
registerOnPinchStart((handIndex, handedness) => {
  audioSystem.createClickSound();           // 🔊 Click feedback
  console.log(`✨ ${handedness} hand grabbed something!`);
});

// 🎛️ Quick controls (also available in console)
// toggleButtonSounds();     // Toggle on/off
// setButtonVolume(0.6);     // Adjust volume
```

**🎵 Instant professional audio feedback with zero setup!**

</div>

---

## 🖥️ Adding UI Controls

<div className="multi-hand-features">

**Create floating UI panels that respond to gestures:**

```javascript
// 🖼️ Create a UI panel
const panelGeometry = new THREE.PlaneGeometry(2, 1.2);
const panelMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xbffbff, 
  transparent: true, 
  opacity: 0.8 
});
const uiPanel = new THREE.Mesh(panelGeometry, panelMaterial);
uiPanel.position.set(3, 2, -3);
scene.add(uiPanel);

// 🔘 Add interactive buttons
const buttonGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.05);
const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
const button = new THREE.Mesh(buttonGeometry, buttonMaterial);

// 🏷️ Configure button behavior
button.userData.isUIButton = true;
button.userData.defaultColor = 0x4CAF50;
button.userData.hoverColor = 0x81C784;
button.userData.activeColor = 0x2E7D32;
button.userData.action = 'switchScene';

button.position.set(0, 0, 0.05);
uiPanel.add(button);
```

**👉 Right hand controls UI, left hand controls objects!**

</div>

---

## ♟️ Grid-Based Interactions

<div className="chessboard-feature">

**Perfect for board games, tactical interfaces, and grid-based controls:**

```javascript
// 🏁 Create a chessboard/grid surface
const boardGeometry = new THREE.PlaneGeometry(4, 4);
const boardMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
const chessboard = new THREE.Mesh(boardGeometry, boardMaterial);
chessboard.rotation.x = -Math.PI / 2; // Lay flat
chessboard.userData.isChessboard = true;
scene.add(chessboard);

// 🎯 Add grid squares
for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const squareGeometry = new THREE.PlaneGeometry(0.45, 0.45);
    const isLight = (row + col) % 2 === 0;
    const squareMaterial = new THREE.MeshBasicMaterial({ 
      color: isLight ? 0xF0D9B5 : 0xB58863 
    });
    
    const square = new THREE.Mesh(squareGeometry, squareMaterial);
    square.position.set(
      (col - 3.5) * 0.5,
      0.01,
      (row - 3.5) * 0.5
    );
    square.rotation.x = -Math.PI / 2;
    chessboard.add(square);
  }
}
```

**🎯 Your cursor now snaps to grid squares with visual feedback!**

</div>

---

## 🎛️ Customization Options

<div className="config-section">

**Fine-tune everything to match your vision:**

```javascript
import { 
  BUTTON_HOVER_THRESHOLD,
  UIBUTTON_HOVER_THRESHOLD,
  CHESSBOARD_SIZE,
  HIGHLIGHT_COLOR 
} from 'handible';

// 🎯 Adjust interaction distances
console.log('BUTTON_HOVER_THRESHOLD:', BUTTON_HOVER_THRESHOLD);     // Wall button range: 0.4
console.log('UIBUTTON_HOVER_THRESHOLD:', UIBUTTON_HOVER_THRESHOLD); // UI precision: 0.2
console.log('UI_CURSOR_THRESHOLD:', UI_CURSOR_THRESHOLD);           // UI activation zone: 1.5

// 🎨 Customize visual feedback
const cones = getConeVisualsPerHand();
cones[0].material.color.set(0x00ff00);  // 💚 Player 1: Green
cones[1].material.color.set(0xff0000);  // ❤️ Player 2: Red

// 🏁 Configure grid behavior
console.log('CHESSBOARD_SIZE:', CHESSBOARD_SIZE);        // Grid dimensions: 8
console.log('HIGHLIGHT_COLOR:', HIGHLIGHT_COLOR);        // Selection color: 0xffff00
```

**🎨 Make Handible uniquely yours!**

</div>

---

## 🎯 Next Steps

<div className="state-visual-grid">

### 📚 **Learn More**
- Read the [Core Concepts](./core-concepts) for deep understanding
- Explore the complete [API Reference](./api-reference)
- Check out [Advanced Features](./advanced-features)

### 🛠️ **Build Something Amazing**
- Create interactive galleries
- Build gesture-controlled games
- Design immersive presentations
- Develop accessible interfaces

### 🌟 **Get Inspired**
- Browse example projects
- Join the community
- Share your creations
- Contribute to development

### 🚀 **Level Up**
- Master multi-surface interactions
- Implement custom gestures
- Optimize for performance
- Deploy to production

</div>

---

<div className="footer-note">

> 💡 **Pro Tip:** Start simple with basic object interaction, then progressively add UI panels, grid systems, and custom gestures as you get comfortable.

> 🎯 **Performance:** Handible is optimized for 60fps experiences. All interactions use efficient algorithms and smart caching.

> 🎨 **Creativity:** The only limit is your imagination! Handible provides the foundation - you create the magic.

</div>
