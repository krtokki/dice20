import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const light = new THREE.AmbientLight(0xffffff, 1); 
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();
let table;

loader.load('models/table.glb', (gltf) => {
  table = gltf.scene;
  const box = new THREE.Box3().setFromObject(table);
  const center = box.getCenter(new THREE.Vector3());
  table.position.sub(center);
  table.scale.setScalar(0.5);
  scene.add(table);

  controls.target.set(0, 0, 0);
  controls.update;
});

camera.position.set = (0, 0, 5);

function animate() {
  renderer.render( scene, camera );
}
