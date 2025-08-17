// Updated threeSetup.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;

export function setupThreeScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Keep sky blue for now

  // Add a floor for cleanliness and shadows
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.5; // Below the whiteboard
  floor.receiveShadow = true;
  scene.add(floor);

  // Whiteboard wall (vertical plane, tilted slightly downwards)
  const wallGeometry = new THREE.PlaneGeometry(5, 3); // Wider and taller for a whiteboard feel
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White color for whiteboard
    roughness: 0.2,
    metalness: 0.0
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.z = -1; // Closer to the camera
  wall.position.y = 0; // Center vertically
  wall.rotation.x = -Math.PI / 12; // Tilt downwards by 15 degrees for better button press visibility
  wall.receiveShadow = true;
  wall.castShadow = true; // Allow whiteboard to cast shadows if needed
  wall.userData.isWall = true; // Identifier for raycasting and to prevent grabbing
  scene.add(wall);

  // Add 3D buttons on the whiteboard
  const buttonPositions = [
    { x: -1, y: 0.5, color: 0xff0000 }, // Red button
    { x: 0, y: 0.5, color: 0x00ff00 }, // Green button
    { x: 1, y: 0.5, color: 0x0000ff } // Blue button
  ];

  buttonPositions.forEach(pos => {
    const buttonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32); // 3D cylinder for button depth
    const buttonMaterial = new THREE.MeshStandardMaterial({ 
      color: pos.color,
      roughness: 0.4,
      metalness: 0.5 // Slight metallic sheen for prettier look
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(pos.x, pos.y, 0.05); // Initial height above the board (half of cylinder height)
    button.rotation.x = Math.PI / 2; // Rotate to face outwards (cylinder defaults to y-up)
    
    // Attach button to wall so it tilts with it
    wall.add(button);

    button.userData.isButton = true;
    button.userData.defaultColor = pos.color;
    button.userData.hoverColor = 0xffff00; // Yellow for hover
    button.userData.activeColor = 0xffa500; // Orange for pressed
    button.userData.defaultPosition = button.position.clone(); // Store default position for reset
    button.castShadow = true;
  });

  // Add 3D horizontal slider below the buttons
  const sliderTrackGeometry = new THREE.BoxGeometry(3, 0.1, 0.1); // Wide horizontal track
  const sliderTrackMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888, // Gray color
    roughness: 0.4,
    metalness: 0.5
  });
  const sliderTrack = new THREE.Mesh(sliderTrackGeometry, sliderTrackMaterial);
  sliderTrack.position.set(0, -0.5, 0.05); // Below buttons, slightly above board
  sliderTrack.castShadow = true;
  wall.add(sliderTrack);

  const knobGeometry = new THREE.SphereGeometry(0.15, 32, 32); // Knob as sphere
  const knobMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, // White color
    roughness: 0.4,
    metalness: 0.5
  });
  const knob = new THREE.Mesh(knobGeometry, knobMaterial);
  knob.position.set(0, -0.5, 0.05 + 0.05); // Center on track, slightly above
  knob.userData.isKnob = true;
  knob.userData.defaultColor = 0xffffff;
  knob.userData.hoverColor = 0xffff00; // Yellow for hover
  knob.userData.activeColor = 0xffa500; // Orange for active (grabbed)
  knob.castShadow = true;
  wall.add(knob);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0.0, 1); // Slightly higher to see the tilt better

  const canvas = document.getElementById("threeCanvas");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better color grading for prettier scene
  renderer.toneMappingExposure = 1.2; // Slightly brighter

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.target.set(0, 0, -1); // Target the whiteboard

  // Improved lighting for fancier, cleaner look
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Softer ambient
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6); // Sky/ground light for natural feel
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2); // Brighter sun
  sunLight.position.set(5, 10, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -10;
  sunLight.shadow.camera.right = 10;
  sunLight.shadow.camera.top = 10;
  sunLight.shadow.camera.bottom = -10;
  scene.add(sunLight);

  // Add a point light above the whiteboard for highlight
  const pointLight = new THREE.PointLight(0xffffff, 0.8, 10);
  pointLight.position.set(0, 2, 0);
  pointLight.castShadow = true;
  scene.add(pointLight);

  const objectsGroup = new THREE.Group();
  scene.add(objectsGroup);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}

export function getSceneObjects() {
  return { scene, camera, renderer, controls };
}