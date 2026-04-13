import * as THREE from 'three';
import RAPIER from 'rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.style.opacity = '0';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 500);
};

loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  console.log(`Loading: ${Math.round(progress)}%`);
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e9b6);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const tablelightone = new THREE.DirectionalLight( 0xffffff, 3.5 );
tablelightone.position.set(5, 10, 7);
tablelightone.layers.set(1);
scene.add( tablelightone );
const tablelighttwo = new THREE.DirectionalLight( 0xffffff, 3.5 );
tablelighttwo.position.set(-5, -10, -7);
tablelighttwo.layers.set(1);
scene.add( tablelighttwo );

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = true;
controls.rotateSpeed = 0.5;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

let table;
const loader = new GLTFLoader(loadingManager);
loader.load('models/table.glb', (gltf) => {
  table = gltf.scene;
  table.traverse((node) => {
    if (node.isMesh) {
      node.layers.set(1);
      node.material.metalness = 0;
      node.material.roughness = 0.05;
      node.material.clearcoat = 1.0;
      node.material.clearcoatRoughness = 0;
      node.material.ior = 1.5;
      node.material.color.set(0xffffff);
    }
  });
  table.position.set(0, 0, 0);
  scene.add(table);
  controls.target.copy(table.position);
  controls.update();
});

camera.position.set(0, 1.3, 1.3);
camera.lookAt(0, 0, 0);
camera.layers.enable(1);

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

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop( animate );
