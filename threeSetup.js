import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function setupThreeScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x228b22,
    roughness: 0.8,
    metalness: 0.0
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Hand ray visual
  const handRayMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const handRayGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1)
  ]);
  const handRay = new THREE.Line(handRayGeometry, handRayMaterial);
  scene.add(handRay);
  handRay.visible = false;

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2;

  const canvas = document.getElementById("threeCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const controls = new OrbitControls(camera, renderer.domElement);
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

  function makeObject(geometry, color, x, y, z) {
    const material = new THREE.MeshStandardMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    objectsGroup.add(mesh);
    return mesh;
  }

  makeObject(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0xff0000, -1, 0, -1);
  makeObject(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0x00ff00, 1, 0, -1);
  makeObject(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0x0000ff, 0, 0.5, 1);
  makeObject(new THREE.SphereGeometry(0.2, 32, 32), 0xffff00, -0.5, 0.3, 0.5);
  makeObject(new THREE.SphereGeometry(0.2, 32, 32), 0xff00ff, 0.5, 0.3, -0.5);
  makeObject(new THREE.SphereGeometry(0.2, 32, 32), 0x00ffff, 0, 1, 0);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}