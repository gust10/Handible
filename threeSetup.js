// Updated threeSetup.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setSceneObjects } from "./sceneManager.js";
import { handConfig } from "./handTracking.js";

export function setupThreeScene() {
  let scene, camera, renderer, controls; // Add this declaration line

  scene = new THREE.Scene(); // Now assigns to the declared variable
  scene.background = new THREE.Color(0x87ceeb);

  // Add a floor for cleanliness and shadows
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.5;
  floor.receiveShadow = true;
  scene.add(floor);

  // Whiteboard wall (vertical plane, tilted slightly downwards)
  const wallGeometry = new THREE.PlaneGeometry(5, 3);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.0
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.z = -1;
  wall.position.y = 0;
  wall.rotation.x = -Math.PI / 12;
  wall.receiveShadow = true;
  wall.castShadow = true;
  wall.userData.isWall = true;
  scene.add(wall);

  // Add 3D buttons on the whiteboard
  const buttonPositions = [
    { x: -1, y: 0.5, color: 0xff0000 },
    { x: 0, y: 0.5, color: 0x00ff00 },
    { x: 1, y: 0.5, color: 0x0000ff }
  ];

  buttonPositions.forEach(pos => {
    const buttonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
    const buttonMaterial = new THREE.MeshStandardMaterial({ 
      color: pos.color,
      roughness: 0.4,
      metalness: 0.5
    });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(pos.x, pos.y, 0.05);
    button.rotation.x = Math.PI / 2;
    wall.add(button);
    button.userData.isButton = true;
    button.userData.defaultColor = pos.color;
    button.userData.hoverColor = 0xffff00;
    button.userData.activeColor = 0xffa500;
    button.userData.defaultPosition = button.position.clone();
    button.castShadow = true;
  });

  // Add 3D horizontal slider below the buttons
  const sliderTrackGeometry = new THREE.BoxGeometry(3, 0.1, 0.1);
  const sliderTrackMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    roughness: 0.4,
    metalness: 0.5
  });
  const sliderTrack = new THREE.Mesh(sliderTrackGeometry, sliderTrackMaterial);
  sliderTrack.position.set(0, -0.5, 0.05);
  sliderTrack.castShadow = true;
  wall.add(sliderTrack);

  const knobGeometry = new THREE.SphereGeometry(0.15, 32, 32);
  const knobMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.5
  });
  const knob = new THREE.Mesh(knobGeometry, knobMaterial);
  knob.position.set(0, -0.5, 0.05 + 0.05);
  knob.userData.isKnob = true;
  knob.userData.defaultColor = 0xffffff;
  knob.userData.hoverColor = 0xffff00;
  knob.userData.activeColor = 0xffa500;
  knob.castShadow = true;
  wall.add(knob);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Now assigns to declared variable
  camera.position.set(0, 0.0, 1);

  const canvas = document.getElementById("threeCanvas");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.target.set(0, 0, -1);

  // Improved lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
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

  const pointLight = new THREE.PointLight(0xffffff, 0.8, 10);
  pointLight.position.set(0, 2, 0);
  pointLight.castShadow = true;
  scene.add(pointLight);

  const objectsGroup = new THREE.Group();
  scene.add(objectsGroup);
  
  // Set whiteboard-specific offsets (defaults; modify object properties)
  handConfig.xScale = 2;
  handConfig.yScale = -2;
  handConfig.zMagnification = 2;
  handConfig.zOffset = 0;
  handConfig.rotationOffset.set(0, 0, 0); // No rotation

  setSceneObjects({ scene, camera, renderer, controls });
}

// Remove the resize listener and getSceneObjects export (moved/handled elsewhere)