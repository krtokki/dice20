import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e9b6);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const minPanLimit = new THREE.Vector3(-0.8, 0.7, -0.7);
const maxPanLimit = new THREE.Vector3(0.8, 0.7, 0.7);

let table;

const loader = new GLTFLoader();
loader.load( 'models/table.glb', function ( gltf ) {
  table = gltf.scene;
  scene.add( table );
});

const light = new THREE.AmbientLight( 0xffffff, 2 );
scene.add( light );

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

camera.position.set(0, 1.3, 1.3);
camera.lookAt(0, 0, -1);
const originalDistance = camera.position.length();

const controls = new OrbitControls( camera, renderer.domElement );
const currentPolarAngle = controls.getPolarAngle();
controls.minPolarAngle = 0;
controls.maxPolarAngle = currentPolarAngle + 25 * (Math.PI / 180);
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = 0;
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.minDistance = 1;
controls.maxDistance = 2;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: null,
  RIGHT: THREE.MOUSE.PAN
};
controls.enablePan = false;
controls.enableZoom = false;

function animate() {
  // 1. Process all mouse movement and damping math first
  // This calculates where the camera "wants" to be.
  controls.update();

  const livePolarAngle = controls.getPolarAngle();

  if (livePolarAngle < 0.01) {
    // --- TOP DOWN MODE ---
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 2;

    // THE HARD WALL: Apply the clamp AFTER update to kill the "bounce"
    controls.target.clamp(minPanLimit, maxPanLimit);

  } else {
    // --- FOLLOW THE ORBIT TRANSITION ---
    controls.enablePan = false;
    controls.enableZoom = false;

    // A. Lerp the Target: Pull the pivot point back to (0,0,0)
    controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);

    // B. Lerp the Radius: Pull the camera back to the original orbit distance
    // This allows the user's current rotation to stay active while distance corrects
    const currentDist = camera.position.length();
    const targetDist = THREE.MathUtils.lerp(currentDist, originalDistance, 0.1);
    camera.position.setLength(targetDist);

    // C. Lock the Zoom: Sync limits so it lands at originalDistance
    controls.minDistance = THREE.MathUtils.lerp(controls.minDistance, originalDistance, 0.1);
    controls.maxDistance = THREE.MathUtils.lerp(controls.maxDistance, originalDistance, 0.1);
    
    // D. SAFETY LOCK: Prevent fast-drag "slide" in side-view
    // If the mouse flick is very fast, force target to center immediately
    if (livePolarAngle > 0.1) {
        controls.target.set(0, 0, 0);
    }
  }

  // 2. Final Render
  renderer.render(scene, camera);
}
