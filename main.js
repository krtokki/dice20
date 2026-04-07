import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;

let model = null;
let modelsize = new THREE.Vector3();

const originalPosition = new THREE.Vector3(0, 0, 5);
const originalTarget = new THREE.Vector3(0, 0, 0);
const currentSpherical = new THREE.Spherical();
const targetSpherical = new THREE.Spherical().setFromVector3(originalPosition);

const reboundSpeed = 0.0002;
let isInteracting = false;

camera.position.copy(originalPosition);

controls.addEventListener('start', () => { isInteracting = true; });
controls.addEventListener('end', () => { isInteracting = false; });

const loader = newGLTFLoader();
loader.load(
  'models/table.glb',
  (gltf) => {
    model = gltf.scene;
    scene.add(model);
    const bbox = new THREE.Box3().setFromObject(model);
    bbox.getSize(modelSize);
    const center = bbox.getCenter(new THREE.Vector3());
    model.position.sub(center);
    updateCameraForModelSize();
  },
  (progress) => { console.log('Loading models...', (progress.loaded / progress.total * 100) + '%'); },
  (error) => { console.error('Error loading models...', error); }
);

function updateCameraForModelSize() {
  if (!model) return;
  const bbox = new THREE.Box3().setFromObject(model);
  const radius = bbox.getSize(new THREE.Vector3()).length() / 2;
  const distance = radius * 0.3;
  const direction = originalPosition.clone().normalize();
  originalPosition.copy(direction.multiplyScalar(distance));
  targetSpherical.setFromVector3(originalPosition);
  camera.position.copy(originalPosition);
  camera.near = Math.max(0.1, radius * 0.1);
  camera.far = Math.max(1000, radius * 10);
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (model) {
    updateCameraForModelSize();
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (!isInteracting) {
    currentSpherical.setFromVector3(camera.position);
    currentSpherical.radius = THREE.MathUtils.lerp(currentSpherical.radius, targetSpherical.radius, reboundSpeed);
    currentSpherical.phi = THREE.MathUtils.lerp(currentSpherical.phi, targetSpherical.phi, reboundSpeed);
    currentSpherical.theta = THREE.MathUtils.lerp(currentSpherical.theta, targetSpherical.theta, reboundSpeed);
    camera.position.setFromSpherical(currentSpherical);
    controls.target.lerp(originalTarget, reboundSpeed);
    if (camera.position.distanceTo(originalPosition) < 0.01) {
        camera.position.copy(originalPosition);
        controls.target.copy(originalTarget);
    }
  }
  controls.update();
  renderer.render( scene, camera );
}
