---
sidebar_position: 3
title: "💡 Core Concepts"
description: "Understanding the fundamentals of Handible gesture control"
---

# 🧠 Core Concepts

> **Master the building blocks** of immersive hand tracking and gesture control

---

## 🖐️ Hand Tracking System

<div className="concept-highlight">

**Powered by MediaPipe's cutting-edge AI** - providing accurate real-time hand detection with **21 3D landmarks per hand**.

</div>

### 📍 Hand Landmarks Map

<div className="landmark-grid">

| Landmark Group | Points | Description |
|----------------|---------|-------------|
| **🤚 Wrist** | 0 | Base reference point |
| **👍 Thumb** | 1-4 | From base to tip |
| **👆 Index** | 5-8 | Pointing finger |
| **🖕 Middle** | 9-12 | Center finger |
| **💍 Ring** | 13-16 | Ring finger |
| **🤙 Pinky** | 17-20 | Smallest finger |

</div>

```javascript
// Example: Access specific landmarks
const wrist = handLandmarks[0];          // 🤚 Wrist position
const indexTip = handLandmarks[8];       // 👆 Index finger tip
const thumbTip = handLandmarks[4];       // 👍 Thumb tip
```

### 🔄 Hand State Management

<div className="state-grid">

#### 🎯 **Real-time Tracking**
- `isPinchingState` - Live pinch detection per hand
- `lastSnappedSquarePerHand` - Grid position memory
- Smoothed ray origins and directions
- Visual cone cursor positions

#### ✨ **Smart Smoothing**
- Exponential moving average filtering
- Jitter reduction algorithms
- Predictive movement interpolation

</div>

---

## 🤏 Gesture Detection

### 🎯 Pinch Detection Engine

<div className="feature-showcase">

**Advanced 2D/3D pinch detection** with customizable sensitivity and real-time feedback.

```javascript
import { isPinching2D } from 'handible';

// Detect pinch with custom sensitivity
const isPinching = isPinching2D(handLandmarks, 640, 480, 25);

if (isPinching) {
  console.log('🤏 Pinch detected - trigger your magic!');
}
```

**🔧 Fine-tuning Options:**
- Adjust `thresholdPixels` for sensitivity
- Works across different screen resolutions
- Optimized for various hand sizes

</div>

### 🎣 Event-Driven Architecture

<div className="event-flow">

```javascript
import { registerOnPinchStart, registerOnPinchEnd } from 'handible';

// 🚀 Pinch Start - User begins gesture
registerOnPinchStart((handIndex, handedness) => {
  console.log(`✨ ${handedness} hand gesture started!`);
  triggerButtonPress();
  startObjectGrab();
  playHapticFeedback();
});

// 🛑 Pinch End - User releases gesture
registerOnPinchEnd((handIndex) => {
  console.log(`🔄 Hand ${handIndex} gesture completed`);
  releaseObject();
  resetButtonStates();
});
```

**🌟 Event Benefits:**
- **Decoupled architecture** - Easy to extend
- **Multiple listeners** - Chain multiple actions
- **Hand-specific handling** - Left/right hand logic

</div>

---

## 🏗️ Surface Interaction System

<div className="system-highlight">

**🚀 Revolutionary feature!** Transform any flat surface into an interactive interface.

</div>

### 🎨 Surface Types Gallery

<div className="surface-types">

#### 🖼️ **Whiteboards**
- Vertical drawing surfaces
- Button interaction zones
- Precise cursor control
- Multi-hand drawing support

#### 🏓 **Tables** 
- Horizontal interaction planes
- Chessboard grid systems
- Object placement zones
- Tactile surface feedback

#### 📱 **UI Panels**
- Floating interface elements
- Context-sensitive controls
- Gesture-based navigation
- Adaptive layouts

#### 🎛️ **Custom Surfaces**
- User-defined interaction planes
- Flexible configuration options
- Custom interaction rules
- Infinite possibilities

</div>

### 🔧 Advanced Surface Configuration

```javascript
import { SurfaceInteractionSystem } from 'handible';

// 🎨 Register a holographic control panel
SurfaceInteractionSystem.registerSurface(hologramSurface, {
  width: 5,                    // 📐 Surface dimensions
  height: 3,
  cursorScaleFactor: 2.5,     // 🎯 Movement sensitivity
  buttonHoverThreshold: 0.4,   // 🔘 Button activation distance
  
  // 🧭 Define surface orientation
  getNormal: (surface) => new THREE.Vector3(0, 0, 1),
  
  // 🎯 Filter interactive elements
  getButtonFilter: (obj) => obj.userData.isButton,
  
  // 🎮 Custom cursor positioning
  handleCursorPosition: (cursorPoint, surface, config) => {
    // Your custom logic here
    return worldPosition;
  }
});
```

### 👥 Multi-Hand Excellence

<div className="multi-hand-features">

**🤝 Simultaneous multi-hand interaction** without conflicts:

- **Independent hover states** - Each hand has its own interaction bubble
- **Smart conflict resolution** - Closest hand wins for shared elements
- **Per-hand state tracking** - Separate memory for each hand
- **Collaborative interactions** - Two hands, infinite possibilities

```javascript
// Example: Both hands can interact simultaneously
leftHand.hover(buttonA);   // 👈 Left hand hovers button A
rightHand.hover(buttonB);  // 👉 Right hand hovers button B
// No conflicts, both work perfectly! ✨
```

</div>

---

## 🎬 Scene Integration

<div className="integration-showcase">

**Seamless Three.js integration** with zero configuration overhead.

```javascript
import { setSceneObjects } from 'handible';

// 🎬 Your Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  alpha: true 
});
const controls = new OrbitControls(camera, renderer.domElement);

// 🔌 One line to connect everything
setSceneObjects({ scene, camera, renderer, controls });

// 🎉 Handible is now part of your scene!
```

</div>

### 🎮 Object Interaction Magic

<div className="interaction-features">

#### 🎯 **Smart Ray Casting**
```javascript
// Automatic ray visualization for each hand
// Smooth interpolated movement
// Distance-based interaction zones
// Visual feedback for all interactions
```

#### 🤏 **Intelligent Object Grabbing**
```javascript
// Nearest object detection algorithm
// Visual feedback with color changes
// Scale and position preservation
// Multi-hand grab prevention
```

#### 🔘 **Advanced Button System**
```javascript
// Hover state management
// Press animations and effects
// Distance-based activation
// Multi-hand button support
```

</div>

### ♟️ Chessboard Integration

<div className="chessboard-feature">

**🏁 Special grid interaction system** for board games and tactical interfaces:

```javascript
// 8x8 grid with smart snapping
const position = lastSnappedSquarePerHand[handIndex];
console.log(`Hand at row ${position.row}, col ${position.col}`);

// Features:
// ✨ Square highlighting with visual feedback
// 📍 Position tracking per hand
// 🎯 Smooth cursor movement and snapping
// 🎨 Customizable grid colors and effects
```

</div>

---

## 🎨 Visual Feedback System

### 🎯 Cursor Visualization

<div className="visual-features">

**🔺 3D cone cursors** that adapt to any surface:

- **Dynamic positioning** - Follows hand movement perfectly
- **Surface-aware orientation** - Always points in the right direction
- **Color-coded states** - Visual feedback for different modes
- **Smooth animations** - No jarring movements

```javascript
// Customize cursor appearance
const cones = getConeVisualsPerHand();
cones[0].material.color.set(0x00ff00);  // 💚 Green for player 1
cones[1].material.color.set(0xff0000);  // ❤️ Red for player 2
```

</div>

### ✨ Interactive State Visualization

<div className="state-visual-grid">

#### 🔘 **Button States**
- **Idle** - Default colors and scale
- **Hover** - Enlarged with highlight color
- **Press** - Pressed animation with active color
- **Multi-hand** - Conflict resolution with visual priority

#### 🎨 **Object States**
- **Grabbable** - Subtle glow effect
- **Grabbed** - Orange highlight with scale change
- **Hovered** - Soft color transition
- **Released** - Smooth return to original state

#### 🏁 **Grid Highlights**
- **Current square** - Bright yellow highlight
- **Path tracing** - Fade trail effect
- **Multi-hand** - Different colors per hand
- **Snap feedback** - Satisfying snap animations

</div>

---

## ⚙️ Configuration Powerhouse

### 🎛️ Threshold Management

<div className="config-section">

**Fine-tune every interaction** with precision controls:

```javascript
// 🔘 Button interaction distances
BUTTON_HOVER_THRESHOLD = 0.4        // Wall buttons - generous range
UIBUTTON_HOVER_THRESHOLD = 0.2      // UI buttons - precise control
UI_CURSOR_THRESHOLD = 1.5           // UI activation zone

// 🎯 Interaction sensitivity
CURSOR_SCALE_FACTOR = 2.5           // General movement scaling
TABLE_CURSOR_SCALE_FACTOR = 2.5     // Table-specific scaling
CHESSBOARD_SCALE_FACTOR = 4         // Grid interaction sensitivity
```

</div>

### 🎨 Visual Customization

<div className="visual-config">

**Make it yours** with extensive visual options:

```javascript
// 🎨 Cursor appearance
CONE_HEIGHT = 0.1                   // Cursor size
CONE_RADIUS = 0.05                  // Cursor thickness
SPHERE_RADIUS = 0.05                // Landmark size

// 🌈 Color schemes
HIGHLIGHT_COLOR = 0xffff00          // Grid highlights
// Add your custom colors!

// ⚡ Animation settings
EMA_ALPHA = 0.35                    // Smoothing factor
GRAB_SCALE_FACTOR = 3               // Object grab scaling
```

</div>

---

<div className="concept-footer">

> 💡 **Getting Started Tip:** Begin with basic setup and gradually explore advanced features. Each system is designed to work independently while integrating seamlessly with others.

> 🚀 **Performance Note:** All systems are optimized with efficient algorithms, distance calculations, and smart state management for smooth 60fps experiences.

> 🎯 **Customization Philosophy:** Every aspect can be customized - from visual appearance to interaction behavior. Make Handible truly yours!

</div>

## Scene Integration

The library seamlessly integrates with Three.js scenes:

```javascript
import { setSceneObjects } from 'handible';

// Set up your Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);

// Register your scene with Handible
setSceneObjects({ scene, camera, renderer, controls });
```

### Object Interaction

The library provides comprehensive object interaction:

#### Ray Casting
- Visual ray representation for each hand
- Smooth ray direction interpolation
- Distance-based interaction thresholds

#### Object Grabbing
- Automatic nearest object detection
- Visual feedback for grabbed objects
- Color and scale preservation
- Multi-hand grab prevention

#### Button Interactions
- Hover state management with visual feedback
- Press animations and state changes
- Distance-based activation thresholds
- Multi-hand button support

### Chessboard Integration

Special support for chessboard/grid interactions:
- 8x8 grid snapping
- Square highlighting
- Position tracking per hand
- Smooth cursor movement

## Visual Feedback System

### Cursor Visualization
- Cone-shaped cursors for each hand
- Dynamic positioning and orientation
- Surface-aware cursor behavior
- Color-coded interaction states

### Object State Visualization
- Hover states with scale and color changes
- Grabbed object highlighting
- Button press animations
- Grid square highlighting

### Smoothing and Interpolation
- Exponential moving average for smooth movement
- Ray direction smoothing
- Position interpolation
- State transition animations

## Configuration System

### Threshold Management
Different interaction types use specific distance thresholds:
- `BUTTON_HOVER_THRESHOLD`: Wall button interactions
- `UIBUTTON_HOVER_THRESHOLD`: UI panel buttons (more precise)
- `UI_CURSOR_THRESHOLD`: UI panel activation distance

### Visual Configuration
Customizable visual elements:
- Cursor cone size and appearance
- Interaction sphere radius
- Color schemes for different states
- Animation timing and smoothing factors

### Surface Scaling
Configurable cursor scaling for different surfaces:
- `CURSOR_SCALE_FACTOR`: General cursor movement
- `TABLE_CURSOR_SCALE_FACTOR`: Table-specific scaling
- `CHESSBOARD_SCALE_FACTOR`: Grid interaction sensitivity
