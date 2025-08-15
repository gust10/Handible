// Three.js 및 GLTFLoader 모듈 임포트
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


// MediaPipe HandLandmarker는 CDN에서 계속 임포트합니다.
import {
  FilesetResolver,
  HandLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

// --- 전역 변수 ---
let scene, camera, renderer;
let video; // 웹캠 피드를 위한 비디오 요소
let handLandmarker; // MediaPipe HandLandmarker 인스턴스
let lastVideoTime = -1; // MediaPipe의 비디오 시간을 추적하기 위함
let results = undefined; // 최신 손 랜드마크 결과 저장

const NUM_HANDS_TO_DETECT = 2; // 감지할 손의 개수 설정 (1 또는 2)

// --- FPS 카운터 변수 ---
let fpsCounterElement;
let frameCount = 0;
let lastFpsUpdateTime = performance.now();

// ----------------------------------------------
// Pinching state (gesture control)
let isPinchingState = Array(NUM_HANDS_TO_DETECT).fill(false);

let raycaster = new THREE.Raycaster();
let grabbedObject = null;

// Debug purpose
let controls;

// ----------------------------------------------

// 랜드마크 시각화 (두 손용)
const landmarkVisualsPerHand = []; // 각 손에 대한 구체 배열: [[sphere0, ...], [sphere0, ...]]
const connectionVisualsPerHand = []; // 각 손에 대한 선 배열: [[line0, ...], [line0, ...]]

// --- 스무딩 매개변수 (지수 이동 평균 - EMA) ---
const EMA_ALPHA = 0.35; // 조절 가능: 0에 가까울수록 부드럽지만 지연, 1에 가까울수록 반응적이지만 떨림
const smoothedLandmarksPerHand = []; // 스무딩된 랜드마크 위치 저장: [[Vector3_0, ...], [Vector3_0, ...]]

// --- 깊이(Z) 변환을 위한 매개변수 ---
const Z_MAGNIFICATION_FACTOR = 5; // Z축 움직임의 민감도
const Z_OFFSET_FOR_DIRECT_DEPTH = 0; // Z축 위치를 조정하여 손을 적절한 깊이 범위로 가져옴

// 랜드마크 연결점 (MediaPipe 기준)
const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // 엄지
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // 검지
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // 중지
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // 약지
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // 새끼손가락
];

// --- 초기화 ---
async function init() {
  console.log("애플리케이션 초기화 중...");
  document.getElementById("ema-alpha-display").textContent = EMA_ALPHA;
  fpsCounterElement = document.getElementById("fps-counter");

  video = document.getElementById("webcamVideo");
  const canvas = document.getElementById("threeCanvas");

  // 1. Three.js 씬 설정
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Light blue sky

  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x228b22, // Forest green
    roughness: 0.8,
    metalness: 0.0
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Make it horizontal
  ground.position.y = -1; // Slightly below origin
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
  handRay.visible = false; // Hide until a hand is detected


  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2; // 카메라 위치

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // For shadowing
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // sphere.castShadow = true;
  ground.receiveShadow = true;

  // Add OrbitControls for mouse rotation
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth motion
  controls.dampingFactor = 0.05;
  controls.enableZoom = true; // Allow zooming
  controls.minDistance = 1; // Limit zoom in
  controls.maxDistance = 10; // Limit zoom out
  controls.target.set(0, 0, 0); // Look at origin


  // Ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  // Directional sunlight
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(5, 10, 5);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  // // Create a group to hold interactive objects
  // const objectsGroup = new THREE.Group();
  // scene.add(objectsGroup);

  // // Helper function to make a mesh
  // function makeObject(geometry, color, x, y, z) {
  //     const material = new THREE.MeshStandardMaterial({ color });
  //     const mesh = new THREE.Mesh(geometry, material);
  //     mesh.position.set(x, y, z);
  //     mesh.castShadow = true;
  //     mesh.receiveShadow = true;
  //     objectsGroup.add(mesh);
  //     return mesh;
  // }

  // // Add some cubes
  // makeObject(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0xff0000, -1, 0, -1);
  // makeObject(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0x00ff00, 1, 0, -1);
  // makeObject(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0x0000ff, 0, 0.5, 1);

  // // Add some spheres
  // makeObject(new THREE.SphereGeometry(0.2, 32, 32), 0xffff00, -0.5, 0.3, 0.5);
  // makeObject(new THREE.SphereGeometry(0.2, 32, 32), 0xff00ff, 0.5, 0.3, -0.5);
  // makeObject(new THREE.SphereGeometry(0.2, 32, 32), 0x00ffff, 0, 1, 0);

  window.addEventListener("resize", onWindowResize);

  // 2. MediaPipe HandLandmarker 초기화
  console.log("MediaPipe HandLandmarker 모델 로드 중...");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: NUM_HANDS_TO_DETECT, // 이제 두 손을 감지합니다.
  });
  console.log("MediaPipe HandLandmarker 로드 완료.");

  // 3. GLTF 리깅된 손 모델 로드 (두 손을 위해 두 번 로드하거나 복제)

  for (let i = 0; i < NUM_HANDS_TO_DETECT; i++) {
    // 각 손에 대한 랜드마크 시각화 요소 초기화
    const currentHandSpheres = [];
    const currentSmoothedLandmarks = [];
    // sharedMat for other fingers except pinching
    const sharedMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const sphereGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    for (let j = 0; j < 21; j++) {
      let sphereMaterial;

      // Give thumb tip (4) and index tip (8) their own material
      if (j === 4 || j === 8) {
        sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      } else {
        sphereMaterial = sharedMaterial;
      }

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.visible = false;
      scene.add(sphere);
      currentHandSpheres.push(sphere);
      currentSmoothedLandmarks.push(new THREE.Vector3());
    }
    landmarkVisualsPerHand.push(currentHandSpheres);
    smoothedLandmarksPerHand.push(currentSmoothedLandmarks);

    const currentHandConnections = [];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      linewidth: 2,
    });
    for (const connection of HAND_CONNECTIONS) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(6), 3)
      );
      const line = new THREE.Line(geometry, lineMaterial);
      line.visible = false; // 처음에는 숨김
      scene.add(line);
      currentHandConnections.push(line);
    }
    connectionVisualsPerHand.push(currentHandConnections);
  }

  document.getElementById("loading-message").style.display = "none";
  await startWebcam();
  animate();
}

// ----------- Functions for gesture control, grabbing and more --------------
function isPinching2D(rawLandmarks, videoWidth, videoHeight, thresholdPixels = 35) {
    // Get thumb tip (index 4) and index tip (index 8)
    const thumbTip = rawLandmarks[4];
    const indexTip = rawLandmarks[8];

    // Convert normalized coords (0–1) to pixels
    const thumbX = thumbTip.x * videoWidth;
    const thumbY = thumbTip.y * videoHeight;
    const indexX = indexTip.x * videoWidth;
    const indexY = indexTip.y * videoHeight;

    // 2D Euclidean distance (ignore Z)
    const dx = thumbX - indexX;
    const dy = thumbY - indexY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < thresholdPixels;
}

function onPinchStart(handIndex) {
  // console.log(`Hand ${handIndex} pinch START`);
  // Example: grab nearest object

  // if (grabbedObject) return;

  // const handLandmarks = smoothedLandmarksPerHand[handIndex];
  // const palmPos = new THREE.Vector3()
  //   .add(handLandmarks[0])
  //   .add(handLandmarks[5])
  //   .add(handLandmarks[17])
  //   .divideScalar(3);
  // const dir = new THREE.Vector3().subVectors(handLandmarks[12], palmPos).normalize();

  // raycaster.set(palmPos, dir);

  // const selectableObjects = scene.children.filter(obj =>
  //     obj.isMesh && !landmarkVisualsPerHand.flat().includes(obj) && !connectionVisualsPerHand.flat().includes(obj)
  // );

  // const intersects = raycaster.intersectObjects(selectableObjects);
  // if (intersects.length > 0) {
  //     grabbedObject = intersects[0].object;
  //     console.log("Grabbed:", grabbedObject.name || grabbedObject.id);
  // }

  grabNearestObject();
}

function onPinchEnd(handIndex) {
  // console.log(`Hand ${handIndex} pinch END`);
  // Example: release grabbed object

  releaseObject();
}

function grabNearestObject() {
  console.log("Grabbing object...");
  // TODO: Raycast toward hand & attach object



}

function releaseObject() {
  console.log("Releasing object...");
  // TODO: Drop or deselect object
}


// ---------------------------------------------------------------------------

// --- 웹캠 함수 ---
async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.onloadeddata = () => {
      console.log("웹캠 비디오 로드 완료.");
      predictWebcam();
    };
  } catch (error) {
    console.error("웹캠 접근 오류:", error);
    document.getElementById("loading-message").textContent =
      "오류: 웹캠에 접근할 수 없습니다. 카메라 접근을 허용해 주십시오.";
    document.getElementById("loading-message").style.color = "red";
  }
}



async function predictWebcam() {
  if (
    !handLandmarker ||
    !video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
  ) {
    requestAnimationFrame(predictWebcam);
    return;
  }

  let startTimeMs = performance.now();
  // 'results' 변수가 항상 최신 감지 결과로 업데이트되도록 조건 제거
  lastVideoTime = video.currentTime;
  const currentResults = handLandmarker.detectForVideo(video, startTimeMs);
  // 전역 'results' 변수를 업데이트합니다.
  results = currentResults;

  // 모든 손 시각화를 기본적으로 숨깁니다.
  // 감지된 손만 표시하도록 업데이트할 것입니다.
  for (let i = 0; i < NUM_HANDS_TO_DETECT; i++) {
    landmarkVisualsPerHand[i].forEach((sphere) => (sphere.visible = false));
    connectionVisualsPerHand[i].forEach((line) => (line.visible = false));
  }

  if (results && results.landmarks && results.landmarks.length > 0) {
    for (let handIndex = 0; handIndex < results.landmarks.length; handIndex++) {
      const currentHandLandmarks = results.landmarks[handIndex];
      //const handedness = results.handedness[handIndex][0].categoryName; // 'Left' 또는 'Right'

      // // temp
      // // Assume smoothedLandmarksPerHand[handIndex] exists
      // const handLandmarks = smoothedLandmarksPerHand[handIndex];

      // // Get hand position (palm center = average of wrist [0], index base [5], pinky base [17])
      // const palmPos = new THREE.Vector3()
      //   .add(handLandmarks[0])
      //   .add(handLandmarks[5])
      //   .add(handLandmarks[17])
      //   .divideScalar(3);

      // // Get direction: from palm to middle finger tip [12]
      // const dir = new THREE.Vector3().subVectors(handLandmarks[12], palmPos).normalize();

      // // Update ray visual
      // handRay.position.copy(palmPos);
      // const points = [new THREE.Vector3(0,0,0), dir.clone().multiplyScalar(5)];
      // handRay.geometry.setFromPoints(points);
      // handRay.visible = true;

      // // Raycast from palm forward
      // raycaster.set(palmPos, dir);

      // const selectableObjects = scene.children.filter(obj =>
      //   obj.isMesh && !landmarkVisualsPerHand.flat().includes(obj) && !connectionVisualsPerHand.flat().includes(obj)
      // );

      // const intersects = raycaster.intersectObjects(selectableObjects);

      // if (intersects.length > 0) {
      //   handRayMaterial.color.set(0x00ff00); // Green if pointing at something
      // } else {
      //   handRayMaterial.color.set(0xffff00); // Yellow if nothing hit
      // }

      // Triggering Pinching State
      const pinchingNow = isPinching2D(currentHandLandmarks, video.videoWidth, video.videoHeight);

      // If state changed, trigger event
      if (pinchingNow && !isPinchingState[handIndex]) {
          console.log(`Hand ${handIndex} PINCH START`);
          isPinchingState[handIndex] = true;
          onPinchStart(handIndex);
      } 
      else if (!pinchingNow && isPinchingState[handIndex]) {
          console.log(`Hand ${handIndex} PINCH END`);
          isPinchingState[handIndex] = false;
          onPinchEnd(handIndex);
      }

      // Optional: Visual feedback (color fingertips)
      const tipColor = pinchingNow ? 0xff0000 : 0x00ffff;
      landmarkVisualsPerHand[handIndex][4].material.color.set(tipColor);
      landmarkVisualsPerHand[handIndex][8].material.color.set(tipColor);

      const currentLandmarkSpheres = landmarkVisualsPerHand[handIndex];
      const currentHandConnections = connectionVisualsPerHand[handIndex];
      const currentSmoothedLandmarks = smoothedLandmarksPerHand[handIndex];


      // 현재 손 시각화 요소 표시
      currentLandmarkSpheres.forEach((sphere) => (sphere.visible = true));
      currentHandConnections.forEach((line) => (line.visible = true));

      for (let i = 0; i < currentHandLandmarks.length; i++) {
        const rawLandmark = currentHandLandmarks[i];

        // --- X축 미러링 (다시 활성화) ---
        // 웹캠의 X좌표 0(왼쪽)이 3D의 X좌표 1(오른쪽)에 매핑되도록 합니다.
        const targetX = (1.0 - rawLandmark.x - 0.5) * 2;

        // --- Y축 반전 (웹캠 Y축은 아래로 증가, Three.js는 위로 증가) ---
        const targetY = (rawLandmark.y - 0.5) * -2;

        // --- Z축 직접 매핑 (가까울수록 가까이) ---
        // MediaPipe의 Z값은 음수이며, 0에 가까울수록(덜 음수일수록) 카메라에 가깝습니다.
        // targetZ = (rawLandmark.z * -Z_MAGNIFICATION_FACTOR) + Z_OFFSET_FOR_DIRECT_DEPTH;
        // Z_MAGNIFICATION_FACTOR에 음수를 곱하여 가까이 있는 것이 3D에서도 가까이 보이도록 합니다.
        // Z_OFFSET_FOR_DIRECT_DEPTH를 통해 전체적인 깊이 위치를 조정합니다.
        const targetZ =
          rawLandmark.z * Z_MAGNIFICATION_FACTOR + Z_OFFSET_FOR_DIRECT_DEPTH;

        const currentPosition = new THREE.Vector3(targetX, targetY, targetZ);

        // EMA 스무딩 적용
        currentSmoothedLandmarks[i].lerp(currentPosition, EMA_ALPHA);

        // 구체 위치 업데이트
        currentLandmarkSpheres[i].position.copy(currentSmoothedLandmarks[i]);

        // Trying out pinching and other functions for gesture control

      }

      // --- 각 손에 대한 연결선 업데이트 ---
      for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
        const connection = HAND_CONNECTIONS[i];
        const startLandmarkIndex = connection[0];
        const endLandmarkIndex = connection[1];

        const line = currentHandConnections[i];
        const positions = line.geometry.attributes.position.array;

        positions[0] = currentSmoothedLandmarks[startLandmarkIndex].x;
        positions[1] = currentSmoothedLandmarks[startLandmarkIndex].y;
        positions[2] = currentSmoothedLandmarks[startLandmarkIndex].z;

        positions[3] = currentSmoothedLandmarks[endLandmarkIndex].x;
        positions[4] = currentSmoothedLandmarks[endLandmarkIndex].y;
        positions[5] = currentSmoothedLandmarks[endLandmarkIndex].z;

        line.geometry.attributes.position.needsUpdate = true;
      }
    }
  }
  requestAnimationFrame(predictWebcam);
}

// --- Three.js 애니메이션 루프 ---
function animate() {
  requestAnimationFrame(animate);

  controls.update(); // Required for damping

  frameCount++;
  const currentTime = performance.now();
  if (currentTime - lastFpsUpdateTime >= 1000) {
    // 1초마다 업데이트
    fpsCounterElement.textContent = `FPS: ${frameCount}`;
    frameCount = 0;
    lastFpsUpdateTime = currentTime;
  }

  renderer.render(scene, camera);
}

// --- 이벤트 핸들러 ---
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}



window.onload = init;

