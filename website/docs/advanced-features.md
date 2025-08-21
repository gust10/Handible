---
sidebar_position: 5
---

# 🚀 Advanced Features

> **Unlock the full potential** of Handible with professional-grade audio, loading systems, and advanced interaction features.

---

## 🔊 Professional Audio System

### Web Audio API Integration

Handible includes a comprehensive audio system built on the Web Audio API for high-quality, low-latency sound effects:

```javascript
import { audioSystem, AudioSystem } from 'handible';

// Use the global instance
audioSystem.createClickSound();        // 🔊 Button click
audioSystem.createSuccessSound();      // ✅ Success chime
audioSystem.createHoverSound();        // 🎯 Hover feedback
audioSystem.createErrorSound();        // ❌ Error notification

// Volume control
audioSystem.setVolume(0.4);            // 🔊 Set to 40%
audioSystem.toggleEnabled();           // 🔄 Toggle on/off
```

### Custom Audio Instances

Create multiple audio systems for different contexts:

```javascript
// Create a custom audio system for ambient sounds
const ambientAudio = new AudioSystem();
ambientAudio.setVolume(0.2);

// Create a custom audio system for UI sounds
const uiAudio = new AudioSystem();
uiAudio.setVolume(0.6);
```

### Console Controls

For development and debugging, audio controls are available globally:

```javascript
// Available in browser console
toggleButtonSounds();     // 🔄 Quick toggle
setButtonVolume(0.5);     // 🔊 Quick volume adjust
```

---

## 🎬 Loading & Progress System

### Scene Loading with Professional Gauges

The built-in loading system provides smooth, animated progress indicators:

```javascript
import { sceneLoader } from 'handible';

// Show loading for a specific scene
sceneLoader.show('tableScene');

// Manual progress control
sceneLoader.setProgress(25);
sceneLoader.setStage('Loading assets...');

// Animated progress transitions
await sceneLoader.animateProgress(75, 2000); // 75% over 2 seconds

// Hide when complete
sceneLoader.hide();
```

### Realistic Loading Stages

The system includes realistic loading stages that simulate actual loading processes:

```javascript
// Automatic stages during scene switching:
"Initializing..."     → 15%
"Loading models..."   → 40% 
"Setting up scene..." → 70%
"Finalizing..."       → 90%
"Ready!"             → 100%
```

### Custom Loading Implementation

```javascript
async function loadCustomScene() {
  sceneLoader.show('customScene');
  
  try {
    sceneLoader.setStage('Loading textures...');
    await loadTextures();
    await sceneLoader.animateProgress(30, 800);
    
    sceneLoader.setStage('Loading models...');
    await loadModels();
    await sceneLoader.animateProgress(60, 1200);
    
    sceneLoader.setStage('Setting up lighting...');
    await setupLighting();
    await sceneLoader.animateProgress(85, 600);
    
    sceneLoader.setStage('Ready!');
    await sceneLoader.animateProgress(100, 400);
    
  } catch (error) {
    sceneLoader.setStage('Error loading scene');
    console.error(error);
  } finally {
    setTimeout(() => sceneLoader.hide(), 500);
  }
}
```

---

---

## 🖥️ Advanced UI Interaction

### UI Panel System

Handible provides a sophisticated UI interaction system with palm-activated panels:

```javascript
// The UI panel appears when the left palm faces the camera
// Features include:
// - Dynamic positioning based on hand location
// - Configurable size (UI_PANEL_WIDTH, UI_PANEL_HEIGHT)
// - Transparent material with customizable appearance
// - Automatic cursor positioning
// - Scene switching buttons
```

### UI Panel Configuration

```javascript
// Customize UI panel behavior
const UI_PANEL_WIDTH = 1.0;              // Panel dimensions
const UI_PANEL_HEIGHT = 0.6;
const UI_CURSOR_SENSITIVITY = 1.0;       // Movement sensitivity
const UIBUTTON_HOVER_THRESHOLD = 0.2;    // Button interaction precision
```

### Scene Switching Buttons

The UI panel includes built-in scene switching functionality:

```javascript
// Automatic scene switching buttons:
// 🟢 Green Button → Table Scene
// 🔵 Blue Button → Demo Scene (threeSetup)

// Buttons automatically:
// - Show loading gauges during transitions
// - Play audio feedback on interaction
// - Handle scene cleanup and re-initialization
```

---

## 🎯 Surface Interaction System

### Advanced Surface Registration

The Surface Interaction System allows complex interactions with flat surfaces:

```javascript
import { SurfaceInteractionSystem } from 'handible';

// Register interactive surfaces
SurfaceInteractionSystem.registerSurface(surface, {
  width: 3,
  height: 2,
  cursorScaleFactor: 2.5,
  buttonHoverThreshold: 0.3,
  getNormal: (surface) => new THREE.Vector3(0, 0, 1),
  getButtonFilter: (obj) => obj.userData.isButton,
  handleCursorPosition: (cursorPoint, surface, config) => {
    // Custom cursor positioning logic
    return worldPosition;
  }
});
```

### Multiple Surface Types

Support for different surface configurations:

```javascript
// Wall/Whiteboard surfaces
surfaceSystem.registerSurface(wallObj, {
  width: WHITEBOARD_WIDTH,        // 5 units
  height: WHITEBOARD_HEIGHT,      // 3 units
  cursorScaleFactor: CURSOR_SCALE_FACTOR,
  buttonHoverThreshold: BUTTON_HOVER_THRESHOLD,
  getNormal: (surface) => new THREE.Vector3(0, 0, 1),
  getButtonFilter: (obj) => obj.userData.isButton || obj.userData.isKnob
});

// Table surfaces with custom positioning
surfaceSystem.registerSurface(tableObj, {
  width: TABLE_WIDTH,             // 3 units
  height: TABLE_DEPTH,            // 2 units
  cursorScaleFactor: TABLE_CURSOR_SCALE_FACTOR,
  handleCursorPosition: (cursorPoint, surface, config) => {
    const scaledX = cursorPoint.x * config.cursorScaleFactor;
    const scaledZ = -cursorPoint.y * config.cursorScaleFactor;
    const clampedX = Math.max(-config.width / 2, Math.min(config.width / 2, scaledX));
    const clampedZ = Math.max(-config.height / 2, Math.min(config.height / 2, scaledZ));
    const localPos = new THREE.Vector3(clampedX, 0.1, clampedZ);
    return localPos.applyMatrix4(surface.matrixWorld);
  }
});
```

---

## ♟️ Chessboard Integration

### Advanced Grid System

The library includes special support for chessboard and grid-based interactions:

```javascript
// Chessboard features include:
// - 8x8 grid system with configurable size
// - Intelligent square highlighting
// - Snap-to-grid positioning
// - Multiple hand interaction support
// - Grabbed object positioning on squares
```

### Chessboard Configuration

```javascript
const CHESSBOARD_SIZE = 8;                // 8x8 grid
const CHESSBOARD_SCALE_FACTOR = 4;        // Grid sensitivity
const HIGHLIGHT_COLOR = 0xffff00;         // Yellow square highlights

// Automatic features:
// - Square highlighting on hover
// - Cursor snapping to square centers
// - Object placement on grid positions
// - Color state management for squares
```

### Custom Grid Interactions

```javascript
// The system automatically handles:
// 1. Cursor position mapping to grid coordinates
// 2. Square highlighting with state preservation
// 3. Object snapping to square centers
// 4. Multi-hand grid interaction support

// Access grid data:
import { lastSnappedSquarePerHand } from 'handible';

// Get current grid position for each hand
const hand0Square = lastSnappedSquarePerHand[0]; // {row: 3, col: 4, square: meshRef}
const hand1Square = lastSnappedSquarePerHand[1]; // {row: 1, col: 2, square: meshRef}
```

---

## 🎮 Button Interaction

## 🎮 Enhanced Button Interaction

### Multi-Surface Button Support

The system supports buttons on different surface types with automatic audio feedback:

```javascript
// Wall buttons (larger threshold)
const wallButtons = wall.children.filter(obj => obj.userData.isButton);
// Table buttons (standard threshold)  
const tableButtons = table.children.filter(obj => obj.userData.isButton);
// UI panel buttons (precise threshold)
const uiButtons = panel.children.filter(obj => obj.userData.isUIButton);

// Automatic features for all button types:
// - Hover detection with visual feedback
// - Scale animation on hover (1.1x scale)
// - Color changes (hover colors)
// - Audio feedback on press
// - Distance-based interaction
```

### Button State Management

```javascript
// Buttons automatically store state information:
button.userData.defaultColor = originalColor;    // Preserve original appearance
button.userData.hoverColor = hoverColor;         // Define hover appearance
button.userData.isButton = true;                 // Mark as interactive
button.userData.action = 'customAction';         // Define button action

// Visual feedback system:
// - Scale: 1.0 (normal) → 1.1 (hover) → 1.0 (release)
// - Color: default → hover → default
// - Audio: hover sound → click sound → success sound
```

### Knob and Slider Support

Advanced slider/knob interaction with constrained movement:

```javascript
// Knobs are automatically detected and handled
knob.userData.isKnob = true;

// Features:
// - Horizontal sliding along predefined track
// - Constrained movement within bounds
// - Visual feedback during manipulation
// - Smooth position updates
// - Audio feedback on interaction
```

---

## ⚙️ Advanced Configuration

### Hand Tracking Configuration

Customize various tracking parameters for optimal performance:

```javascript
const handConfig = {
  runningMode: 'VIDEO',
  numHands: 2,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5
};
```

### Interaction Thresholds

Fine-tune interaction distances for different scenarios:

```javascript
// Different thresholds for different interaction types
const BUTTON_HOVER_THRESHOLD = 0.4;        // Wall buttons (larger)
const UIBUTTON_HOVER_THRESHOLD = 0.2;      // UI buttons (precise)
const KNOB_HOVER_THRESHOLD = 0.6;          // Knobs (medium)
const UI_CURSOR_THRESHOLD = 1.5;           // UI activation (wide)
const CLOSE_DISTANCE_THRESHOLD = 3.0;      // General interaction
```

### Visual Customization

Customize the appearance of all visual elements:

```javascript
// Cursor appearance
const CONE_HEIGHT = 0.1;                   // Cursor size
const CONE_RADIUS = 0.05;                  // Cursor thickness
const SPHERE_RADIUS = 0.05;                // Landmark size
const PALM_SPHERE_RADIUS = 0.03;           // Palm indicator size

// Animation settings
const EMA_ALPHA = 0.35;                    // Smoothing factor (0-1)
const GRAB_SCALE_FACTOR = 3;               // Object scaling when grabbed

// Color schemes
const HIGHLIGHT_COLOR = 0xffff00;          // Grid highlights (yellow)
// Add custom colors for buttons, cursors, etc.
```

### Performance Optimization

The library includes several performance optimizations:

```javascript
// Automatic optimizations:
// - Exponential moving average for smooth movement
// - Efficient distance calculations
// - Smart state management
// - Optimized raycasting
// - Selective visual updates
// - Audio context management

// Manual performance controls:
// - Adjustable smoothing factors
// - Configurable update frequencies  
// - Optional visual elements
// - Selective surface registration
```

---

## 🔧 Integration Examples

### Complete Interactive Scene

```javascript
import { 
  startGestureControl, 
  setSceneObjects,
  SurfaceInteractionSystem,
  registerOnPinchStart,
  audioSystem,
  sceneLoader
} from 'handible';

async function setupAdvancedScene() {
  // Initialize with loading
  sceneLoader.show('advancedScene');
  sceneLoader.setStage('Setting up advanced features...');
  
  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  
  setSceneObjects({ scene, camera, renderer });
  
  // Hand tracking
  await sceneLoader.animateProgress(25, 800);
  const video = document.getElementById('webcam');
  await startGestureControl(video, scene, 2);
  
  // Audio setup
  await sceneLoader.animateProgress(50, 600);
  audioSystem.setVolume(0.4);
  
  // Custom surface
  await sceneLoader.animateProgress(75, 800);
  const customSurface = createCustomSurface();
  SurfaceInteractionSystem.registerSurface(customSurface, {
    width: 4,
    height: 3,
    cursorScaleFactor: 2.0,
    buttonHoverThreshold: 0.3,
    getNormal: () => new THREE.Vector3(0, 1, 0),
    getButtonFilter: (obj) => obj.userData.isCustomButton
  });
  
  // Interaction callbacks
  registerOnPinchStart((handIndex, handedness) => {
    audioSystem.createClickSound();
    console.log(`Advanced interaction: ${handedness} hand`);
  });
  
  sceneLoader.setStage('Ready!');
  await sceneLoader.animateProgress(100, 400);
  sceneLoader.hide();
  
  console.log('🚀 Advanced scene ready with all features!');
}
```

---

<div className="advanced-footer">

> 🎵 **Audio Tip:** The Web Audio API provides zero-latency sound effects that enhance user experience without affecting performance.

> 🎬 **Loading Tip:** Use realistic loading stages to keep users engaged. The animated progress gauge creates a professional feel.

> 🎯 **Interaction Tip:** Different surfaces can have different interaction thresholds - use precise thresholds for UI elements and larger ones for spatial interactions.

> ⚡ **Performance Tip:** All systems are optimized for 60fps. Use the built-in smoothing and state management for optimal performance.

</div>
  xScale: 2,         // Horizontal scaling
  yScale: -2,        // Vertical scaling (inverted)
  zMagnification: 2, // Depth scaling
  zOffset: 0,        // Depth offset
  rotationOffset: new THREE.Euler(0, 0, 0) // Rotation adjustment
};
```

### Interaction Thresholds

Fine-tune interaction distances and sensitivities:

```javascript
const CLOSE_DISTANCE_THRESHOLD = 3.0;    // Object interaction range
const BUTTON_HOVER_THRESHOLD = 0.4;      // Button activation distance
const UI_CURSOR_THRESHOLD = 1.5;         // UI interaction range
const KNOB_HOVER_THRESHOLD = 0.6;        // Knob interaction distance
```

## Performance Optimization

The library includes several optimization features:
- EMA (Exponential Moving Average) smoothing for hand movements
- Scene object caching
- Efficient ray casting
- Anti-flicker mechanisms for UI elements
