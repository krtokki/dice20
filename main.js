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

const loader = new GLTFLoader();
let model;

loader.load('https://threejs.org/examples/models/gltf/Duck/glTF/Duck.gltf', (gltf) => {
  model = gltf.scene;
  scene.add(model);
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

const reboundSpeed = 0.0003;
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
