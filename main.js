import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const originalPosition = new THREE.Vector3(0, 0, 5);
const originalTarget = new THREE.Vector3(0, 0, 0);
const reboundSpeed = 0.0005;
let isInteracting = false;

camera.position.copy(originalPosition);

controls.addEventListener('start', () => {
    isInteracting = true;
});
controls.addEventListener('end', () => {
    isInteracting = false;
});

function animate() {
  requestAnimationFrame(animate);
  if(!isInteracting) {
    camera.position.lerp(originalPosition, reboundSpeed);
    controls.target.lerp(originalTarget, reboundSpeed);
    if (camera.position.distanceTo(originalPosition) < 0.01) {
        camera.position.copy(originalPosition);
        controls.target.copy(originalTarget);
    }
  }
  controls.update();
  renderer.render( scene, camera );
}
animate();
