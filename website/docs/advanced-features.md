---
sidebar_position: 5
---


# Advanced Features

## UI Interaction

Handible provides a sophisticated UI interaction system that allows users to interact with 3D interfaces using hand gestures.

### UI Panel

The library includes a built-in UI panel system that can be activated with hand gestures:

```javascript
// The UI panel appears when the left palm faces the camera
// It includes:
// - Configurable size (UI_PANEL_WIDTH, UI_PANEL_HEIGHT)
// - Transparent material with customizable appearance
// - Automatic positioning based on hand location
```

### Button Interaction

The system supports 3D button interaction:
- Proximity-based hover detection
- Gesture-based button activation
- Customizable interaction thresholds

## Chessboard Integration

The library includes special support for chessboard interactions:

```javascript
// Chessboard features include:
// - 8x8 grid system
// - Square highlighting
// - Position snapping
// - Multiple hand interaction support
```

## Advanced Configuration

### Hand Tracking Configuration

You can customize various tracking parameters:

```javascript
const handConfig = {
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
