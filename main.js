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
controls.enableDamping = true;

function animate() {
  controls.update();
  console.log(camera.position);
  console.log('Azimuth (Horizontal):', controls.getAzimuthalAngle());
  console.log('Polar (Vertical):', controls.getPolarAngle());
  renderer.render( scene, camera );
}
