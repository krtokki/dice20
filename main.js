import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(0.17);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.000018;

const fifteenDeg = THREE.MathUtils.degToRad(15);
const fiveDeg = THREE.MathUtils.degToRad(5);
controls.minPolarAngle = Math.PI / 2 - fifteenDeg;
controls.maxPolarAngle = Math.PI / 2 + fiveDeg;

const loader = new GLTFLoader();
let model;

loader.load('models/table.glb', (gltf) => {
  model = gltf.scene;
  model.scale.setScalar(3.3);
  model.rotation.x = Math.PI / 2.7;
  scene.add(model);

  model.position.z = 1;
  model.position.y = -0.5;
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const originalPosition = new THREE.Vector3(0, 0, 5);
const originalTarget = new THREE.Vector3(0, 0, 0);
const currentSpherical = new THREE.Spherical();
const targetSpherical = new THREE.Spherical().setFromVector3(originalPosition);

const reboundSpeed = 0.0006;
let isInteracting = false;

camera.position.copy(originalPosition);

controls.addEventListener('start', () => { isInteracting = true; });
controls.addEventListener('end', () => { isInteracting = false; });

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
