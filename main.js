import * as THREE from 'three';
import RAPIER from 'rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
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

RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xead2a8);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const keylighttable = new THREE.DirectionalLight(0xffffff, 1.2);
keylighttable.position.set(5, 8, 5);
keylighttable.castShadow = true;
keylighttable.lookAt(0, 0, 0);
keylighttable.layers.set(1);
scene.add(keylighttable);
keylighttable.shadow.mapSize.set(1024, 1024);
keylighttable.shadow.camera.far = 20;
const filllighttable = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.4); 
filllighttable.layers.set(1);
scene.add(filllighttable);
const rimlighttable = new THREE.SpotLight(0xffffff, 2.5);
rimlighttable.position.set(-5, 6, -8);
rimlighttable.angle = Math.PI / 6;
rimlighttable.penumbra = 0.5;
rimlighttable.decay = 2;
rimlighttable.distance = 50;
scene.add(rimlighttable);

camera.position.set(0, 1.3, 1.3);
camera.lookAt(0, 0, 0);
camera.layers.enable(1);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = true;
controls.rotateSpeed = 0.5;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

let table;
const loader = new GLTFLoader(loadingManager);
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
loader.load('models/table.glb', (gltf) => {
  table = gltf.scene;
  table.traverse((node) => {
    if (node.isMesh && node.material.map) {
      node.layers.set(1);
      node.material.metalness = 0;
      node.material.roughness = 0;
      node.material.clearcoat = 1.0;
      node.material.clearcoatRoughness = 0;
      node.material.ior = 1.5;
      node.material.color.set(0xffffff);
      const maps = [node.material.map, node.material.normalMap, node.material.roughnessMap, node.material.metalnessMap];
      maps.forEach((map) => {
        if (map) {
          map.anisotropy = maxAnisotropy;
          map.minFilter = THREE.LinearMipmapLinearFilter;
          map.needsUpdate = true;
        }
      });
    }
  });
  table.position.set(0, 0, 0);
  scene.add(table);
  controls.target.copy(table.position);
  controls.update();
});

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
