import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let table;

const loader = new GLTFLoader();
loader.load( 'models/table.glb', function ( gltf ) {
  table = gltf.scene;
  scene.add( table );
});

const light = new THREE.AmbientLight( 0xffffff, 1 );
scene.add( light );

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

camera.position.set(0, 1.3, 1.3);
camera.lookAt(0, 0, -1);

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

const maxPanLimit = new THREE.Vector3(-0.8, 1, -0.7);
const minPanLimit = new THREE.Vector3(0.8, 1, 0.7);


function animate() {
  const distance = camera.position.distanceTo(controls.target);
  const zoomFactor = Math.max(0.1, 1 - (distance / 1.3));
  const currentMax = maxPanLimit.clone().multiplyScalar(zoomFactor);
  const currentMin = minPanLimit.clone().multiplyScalar(zoomFactor);
  controls.target.clamp(currentMin, currentMax);
  controls.update();
  console.log(camera.position);
  console.log('Azimuth (Horizontal):', controls.getAzimuthalAngle());
  console.log('Polar (Vertical):', controls.getPolarAngle());
  renderer.render( scene, camera );
}
