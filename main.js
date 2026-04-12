import * as THREE from 'three';
import RAPIER from 'rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e9b6);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const light = new THREE.AmbientLight( 0xffffff, 2 );
scene.add( light );

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setAnimationLoop(animate);
document.body.appendChild( renderer.domElement );

let table;
const loader = new GLTFLoader();
loader.load('models/table.glb', (gltf) => {
  table = gltf.scene;
  table.position.set(0, 0, 0);
  scene.add(table);
});

camera.position.set(0, 1.3, 1.3);
camera.lookAt(0, 0, 0);

const fpsValue = document.getElementById('fps-value');
let frames = 0;
let prevTime = performance.now();

function animate() {
  
  frames++;
  const time = performance.now();
  if (time >= prevTime + 1000) {
    fpsValue.innerText = Math.round((frames * 1000) / (time - prevTime));
    prevTime = time;
    frames = 0;
  }

  renderer.render(scene, camera);
}
