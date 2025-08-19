
<p align="center" style="font-size: 18px;"><b></b></p>

<p align="center">
  <img src="./assets/logo.png" alt="Handible Logo" width="200"/>
</p>

<h1 align="center">H a n d i b l e</h1>

<p align="center">
  <i>An intuitive hand tracking + gesture control library for virtual web experience. 🪄</i>
</p>

<!-- ![Handible Banner](https://via.placeholder.com/1200x400?text=Gestix+Hand+Gesture+Library) Replace with a real banner image, e.g., from your demos -->


<p align="center">
  <a href="https://www.npmjs.com/package/Handible">
    <img src="https://img.shields.io/npm/v/Handible?style=round-square&logo=npm&color=CB3837" alt="NPM Version"/>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow?style=round-square" alt="License"/>
  </a>
  <a href="https://your-demo-link.com">
    <img src="https://img.shields.io/badge/demo-live-green?style=round-square" alt="Demo"/>
  </a>
  <a href="https://github.com/gust10/Handible">
    <img src="https://img.shields.io/github/stars/gust10/Handible?style=round-square&logo=github" alt="Stars"/>
  </a>
  <img src="https://img.shields.io/badge/JavaScript-ES6+-darkblue?style=round-square&logo=javascript&logoColor" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/Web-Project-purple?style=round-square&logo=google-chrome&logoColor=white" alt="Web Project"/>
  <img src="https://img.shields.io/badge/framework-Three%2Ejs-brown" alt="Three.js Badge" />
</p>

---

### 🔗 Quick Links
| Demo | Website | Documentation | npm |
|------|---------|---------------|-----|
| [💻 Try Demo!](https://demo.com) | [🌐 Website](https://handible.com) | [📖 Docs](https://doc.com) | [📦 npm](https://npm.com) |

<!-- (banner or demo video) -->


# Handible: Hand Tracking Magic for Virtual 3D Experiences in Web ✨

Handible is an intuitive JavaScript library for hand gesture detection and interaction in 3D scenes. It lets you build magical experiences without expensive gear but just your normal webcam. It includes features like pinching objects, palm-facing UI panels, or grid-snapping on virtual tables. It is powered by MediaPipe for real-time hand tracking and Three.js for visuals. Perfect for games, tools, or creative apps—turn your webcam into a wand! 🪄

Inspired by demos like interactive whiteboards and chessboards on tables, Handible makes it easy to add gesture controls without the hassle.

## 📑 Table of Contents
- [🚀 Features](#-features)
- [📦 Installation](#-installation)
- [💻 Usage](#-usage)
- [🛠️ API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)
- [⚖️ License](#-license)

## 🚀 Features
- **Pinch Detection**: Check if a hand is pinched with `getIsPinched()`—great for grabbing or selecting. 🤏
- **Hand Coordinates**: Get real-time 3D positions of 21 landmarks per hand. 📍
- **Palm Facing Check**: Detect if the palm is facing the camera to trigger UI or actions. 👋
- **UI Panel**: Auto-show a customizable panel on palm flip, with button support. 🖼️
- **Gesture Controls**: Raycasting, snapping to grids, and more for interactive scenes.
- **Scene Setups**: Ready-to-use functions for cursor control with hand rotations
- **Easy Integration**: Works with Three.js scenes; modular for picking what you need.
- **Multi-Hand Support**: Tracks up to 2 hands independently.

<!-- ![Demo GIF](https://via.placeholder.com/800x400?text=Gestix+Demo+GIF) Add a GIF from your table/whiteboard demo -->

## 📦 Installation
Install via NPM for your project:

```bash
npm install handible
```

## 💻 Usage
```js
import { getIsPinched, getWristPosition } from "handible";

// Example: Check if user is pinching
if (getIsPinched()) {
  console.log("User is pinching 🤏");
}

// Example: Get wrist position in 3D
const wrist = getWristPosition();
console.log("Wrist coordinates:", wrist);
```

## 🛠️ API-Reference
### `getIsPinched(handIndex = 0): boolean`
- Checks if a hand is pinched (thumb + index finger touching).  
- `handIndex`: optional, which hand to check (0 = first hand, 1 = second hand).  
- Returns: `true` if pinched, else `false`.  

```js
if (getIsPinched()) {
  console.log("User is pinching 🤏");
}
```

## 🤝 Contributing
We ❤️ contributions! Fork the repo, make changes, and submit a PR.
- Report issues here.
- Follow the Code of Conduct.

## ⚖️ License
MIT License. See LICENSE for details.
Made with passion and ☕ by Hyunsung Shin. Inspired by real-time hand magic! 🌟

If you like this project, give it a ⭐ on <a href="https://github.com/gust10/Handible">GitHub</a>!
</p>

