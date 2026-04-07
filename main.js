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
controls.minPolarAngle = Math.PI / 2 - fifteenDeg;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = -fifteenDeg;
controls.maxAzimuthAngle = fifteenDeg;

const loader = new GLTFLoader();
let table, lantern;

loader.load('models/table.glb', (gltf) => {
  table = gltf.scene;
  table.scale.setScalar(3.3);
  table.rotation.x = Math.PI / 2.7;
  scene.add(table);

  table.position.z = 1;
  table.position.y = -0.5;
});

loader.load('models/lantern.glb', (gltf) => {
  lantern = gltf.scene;
  lantern.scale.setScalar(0.1);
  lantern.rotation.x = Math.PI / 2.7;
  scene.add(lantern);

  lantern.position.z = 2.7;
  lantern.position.y = +1.3;
  lantern.position.x = -2;
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

const reboundSpeed = 0.000024;
let isInteracting = false;

camera.position.copy(originalPosition);

controls.addEventListener('start', () => { isInteracting = true; });
controls.addEventListener('end', () => {
  isInteracting = false;
  camera.lookAt(controls.target);
});

function animate() {
  requestAnimationFrame(animate);
  if (!isInteracting) {
    const dist = camera.position.distanceTo(originalPosition);
    currentSpherical.setFromVector3(camera.position);
    const phiDist = Math.abs(targetSpherical.phi - currentSpherical.phi);
    const thetaDist = Math.abs(targetSpherical.theta - currentSpherical.theta);
    const totalDist = phiDist + thetaDist + 0.01;
    const alpha = reboundSpeed / totalDist;
    currentSpherical.phi = THREE.MathUtils.lerp(currentSpherical.phi, targetSpherical.phi, alpha);
    currentSpherical.theta = THREE.MathUtils.lerp(currentSpherical.theta, targetSpherical.theta, alpha);
    currentSpherical.radius = THREE.MathUtils.lerp(currentSpherical.radius, targetSpherical.radius, alpha);
    camera.position.setFromSpherical(currentSpherical);
    if (dist > 0.01) {
      camera.position.lerp(originalPosition, alpha);
      controls.target.lerp(originalTarget, alpha);
    } else {
      camera.position.copy(originalPosition);
      controls.target.copy(originalTarget);
    }
  }
  controls.update();
  renderer.render( scene, camera );
}
