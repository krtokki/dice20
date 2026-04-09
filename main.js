import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Stats } from 'three/addons/libs/stats.module.js';

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e9b6);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const minPanLimit = new THREE.Vector3(-1.4, 0.7, -1.6);
const maxPanLimit = new THREE.Vector3(1.4, 0.7, 1.6);

let table;

const loader = new GLTFLoader();
loader.load( 'models/table.glb', function ( gltf ) {
  table = gltf.scene;
  scene.add( table );
});

const light = new THREE.AmbientLight( 0xffffff, 2 );
scene.add( light );

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
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

  stats.begin();
  
  const livePolarAngle = controls.getPolarAngle();

  if (livePolarAngle < 0.01) {
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 2;
    
    controls.update();
    controls.target.clamp(minPanLimit, maxPanLimit);
  } else {
    controls.enablePan = false;
    controls.enableZoom = false;

    controls.minDistance = THREE.MathUtils.lerp(controls.minDistance, originalDistance, 0.06);
    controls.maxDistance = THREE.MathUtils.lerp(controls.maxDistance, originalDistance, 0.06);

    controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.06);

    controls.update();
  }

  renderer.render(scene, camera);

  stats.end();
}
