import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;

export function setupThreeScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // Whiteboard wall (vertical plane)
  const wallGeometry = new THREE.PlaneGeometry(5, 3); // Wider and taller for a whiteboard feel
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // White color for whiteboard
    roughness: 0.2,
    metalness: 0.0
  });
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.z = -1; // Closer to the camera (was -2)
  wall.receiveShadow = true;
  wall.userData.isWall = true; // Identifier for raycasting and to prevent grabbing
  scene.add(wall);

  // Add buttons on the whiteboard
  const buttonPositions = [
    { x: -1, y: 0.5, color: 0xff0000 }, // Red button
    { x: 0, y: 0.5, color: 0x00ff00 }, // Green button
    { x: 1, y: 0.5, color: 0x0000ff } // Blue button
  ];

  buttonPositions.forEach(pos => {
    const buttonGeometry = new THREE.CircleGeometry(0.2, 32); // Circular button
    const buttonMaterial = new THREE.MeshStandardMaterial({ color: pos.color });
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(pos.x, pos.y, wall.position.z + 0.01); // Slightly in front of the wall
    button.userData.isButton = true;
    button.userData.defaultColor = pos.color;
    button.userData.hoverColor = 0xffff00; // Yellow for hover
    button.userData.activeColor = 0xffa500; // Orange for pinched
    scene.add(button);
  });

  // Hand ray visual
  const handRayMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const handRayGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  ]);
  const handRay = new THREE.Line(handRayGeometry, handRayMaterial);
  scene.add(handRay);
  handRay.visible = false;

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2;

  const canvas = document.getElementById("threeCanvas");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.minDistance = 1;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(5, 10, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  const objectsGroup = new THREE.Group();
  scene.add(objectsGroup);

  // Removed the cubes and spheres

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