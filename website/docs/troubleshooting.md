---
sidebar_position: 6
title: "🔧 Troubleshooting"
description: "Common issues and solutions for Handible"
---

# 🔧 Troubleshooting

> **Having issues?** Here are the most common problems and their solutions.

---

## 🚨 Common Issues

### 📹 **Camera Not Working**

**Problem:** Webcam feed not showing or permission denied

**Solutions:**
```javascript
// Ensure proper camera permissions
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    videoElement.srcObject = stream;
  })
  .catch(err => {
    console.error('Camera access denied:', err);
  });
```

- ✅ Check browser permissions for camera access
- ✅ Ensure HTTPS (required for camera access)
- ✅ Try refreshing the page
- ✅ Check if another app is using the camera

### 🤝 **Hand Detection Not Working**

**Problem:** Hands not being detected or tracked poorly

**Solutions:**
- ✅ **Lighting**: Ensure good, even lighting
- ✅ **Background**: Use contrasting background
- ✅ **Distance**: Keep hands 1-3 feet from camera
- ✅ **Position**: Keep hands visible in camera frame

### 🐌 **Performance Issues**

**Problem:** Low FPS or laggy tracking

**Solutions:**
```javascript
// Reduce tracking complexity
await startGestureControl(videoElement, scene, 1); // Track only 1 hand

// Optimize Three.js scene
renderer.setPixelRatio(1); // Reduce pixel ratio
scene.children.length < 100; // Limit scene complexity
```

### 🚫 **Import Errors**

**Problem:** Module import failures

**Solutions:**
```javascript
// Correct imports
import { startGestureControl, isPinching2D } from 'handible';

// Not this:
import handible from 'handible'; // ❌ Wrong
```

---

## 🛠️ Debug Mode

Enable debug logging to troubleshoot issues:

```javascript
// Enable verbose logging
console.log('Handible Debug Mode');
window.HANDIBLE_DEBUG = true;

// Check hand tracking status
import { getHandPosition } from 'handible';
const position = getHandPosition(0);
console.log('Hand 0 position:', position);
```

---

## 📞 Getting Help

Still having issues? Here's how to get support:

1. **📖 Check Documentation** - Review all docs sections
2. **🐛 GitHub Issues** - [Report bugs](https://github.com/gust10/Handible/issues)
3. **💬 Discussions** - [Community help](https://github.com/gust10/Handible/discussions)
4. **📧 Email Support** - For enterprise users

### 🐛 **Bug Report Template**

When reporting issues, please include:

```markdown
**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Handible version: 0.1.0

**Issue:**
Describe what's happening...

**Expected:**
Describe what should happen...

**Code:**
```javascript
// Minimal reproduction code
```

**Console Errors:**
Paste any error messages...
```

---

## 💡 Performance Tips

### 🎯 **Optimization Best Practices**

```javascript
// 1. Limit hand tracking to what you need
await startGestureControl(video, scene, 1); // 1 hand vs 2

// 2. Throttle gesture checks
setInterval(() => {
  if (isPinching2D(0)) {
    // Handle pinch
  }
}, 50); // Check every 50ms instead of every frame

// 3. Optimize Three.js scene
renderer.shadowMap.enabled = false; // Disable shadows if not needed
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 4. Use object pooling for interactive elements
const objectPool = [];
```

### 📱 **Mobile Optimization**

```javascript
// Detect mobile and adjust settings
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Reduce quality for better performance
  renderer.setPixelRatio(1);
  camera.far = 100; // Reduce render distance
}
```

---

## ⚠️ **Known Limitations**

- **Lighting Dependency**: Poor lighting affects accuracy
- **Single Hand Preference**: Works best with one hand for complex gestures
- **Processing Power**: Requires modern GPU for smooth 60fps
- **Network**: Initial model download (~5MB) required
