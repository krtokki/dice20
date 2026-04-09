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
  // 1. Process rotation math first
  controls.update();

  const livePolarAngle = controls.getPolarAngle();

  if (livePolarAngle < 0.05) {
    // --- TOP DOWN MODE ---
    controls.enablePan = true;
    controls.enableZoom = true;
    
    // Set ranges for free movement
    controls.minDistance = 0.5;
    controls.maxDistance = 2;

    // Hard Wall Clamp (After update to prevent bounce)
    controls.target.clamp(minPanLimit, maxPanLimit);
  } else {
    // --- THE GLIDE TRANSITION ---
    controls.enablePan = false;
    controls.enableZoom = false;

    // 1. Smoothly bring the pivot back
    controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.1);

    // 2. Smoothly pull the "track" back to original distance
    // Instead of setLength, we lerp the limits. 
    // OrbitControls will naturally slide the camera to fit inside these limits.
    controls.minDistance = THREE.MathUtils.lerp(controls.minDistance, originalDistance, 0.1);
    controls.maxDistance = THREE.MathUtils.lerp(controls.maxDistance, originalDistance, 0.1);
    
    // 3. Optional: If the camera is still slightly off-radius, nudge it
    // This helps the "spiral" feel without the snapping.
    if (Math.abs(camera.position.length() - originalDistance) > 0.01) {
        camera.position.setLength(THREE.MathUtils.lerp(camera.position.length(), originalDistance, 0.1));
    }
  }

  renderer.render(scene, camera);
}
