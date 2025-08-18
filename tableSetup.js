// tableSetup.js
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setSceneObjects } from "./sceneManager.js";

export function setupTableScene() {
  let scene, camera, renderer, controls; // Add this declaration line

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // Copy floor from threeSetup.js
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

  // Add table instead of wall
  const tableGeometry = new THREE.BoxGeometry(3, 0.2, 2);
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.5,
    metalness: 0.1
  });
  const tableTop = new THREE.Mesh(tableGeometry, tableMaterial);
  tableTop.position.set(0, -1.3, -1);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  scene.add(tableTop);

  // Optionally add table legs (e.g., 4 cylinders)
  const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32);
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  const positions = [
    { x: 1.4, z: 0.9 }, { x: 1.4, z: -0.9 },
    { x: -1.4, z: 0.9 }, { x: -1.4, z: -0.9 }
  ];
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(pos.x, -1.9, pos.z - 1); // Adjusted for height/centering
    leg.castShadow = true;
    scene.add(leg);
  });

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

  // Copy lighting
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

  setSceneObjects({ scene, camera, renderer, controls });
}

// Remove the resize listener and getSceneObjects (handled elsewhere)