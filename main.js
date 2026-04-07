import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const light = new THREE.AmbientLight(0xffffff, 1); 
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const loader = new GLTFLoader();
let table;

loader.load('models/table.glb', (gltf) => {
  table = gltf.scene;
  scene.add(table);
});

camera.position.set = (5, 5, 5);

function animate() {
  renderer.render( scene, camera );
}
