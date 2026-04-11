import * as THREE from 'three';
import RAPIER from 'rapier3d-compat';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

let world;

async function initPhysics() {
  await RAPIER.init();
  const gravity = { x: 0.0, y: -9.80665, z: 0.0 };
  world = new RAPIER.World(gravity);
  createDebugFloor();
}

const loader = new GLTFLoader();

function createDebugFloor() {
  const width = 1.89;
  const height = 0.037;
  const depth = 1.185;

  let bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0.215, 0);
  let body = world.createRigidBody(bodyDesc);
  let colliderDesc = RAPIER.ColliderDesc.cuboid(width, height, depth);
  world.createCollider(colliderDesc, body);

  const debugGeo = new THREE.BoxGeometry(width * 2, height * 2, depth * 2);
  const debugMat = new THREE.MeshBasicMaterial({
    color: 0x32CD32,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const debugMesh = new THREE.Mesh(debugGeo, debugMat);
  debugMesh.position.y = 0.215;
  scene.add(debugMesh);
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0e9b6);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const minPanLimit = new THREE.Vector3(-1.4, 0.7, -1.6);
const maxPanLimit = new THREE.Vector3(1.4, 0.7, 1.6);

let table, d20;

async function startApp() {
  await initPhysics();
  loader.load( 'models/table.glb', function ( gltf ) {
    table = gltf.scene;
    //scene.add( table );
    loader.load( 'models/d20.glb', function ( gltf ) {
      d20 = gltf.scene;
      d20.scale.set(4, 4, 4);
      scene.add( d20 );
      d20.traverse((child) => {
        if (child.isMesh) {
          createDicePhysics(child);
        }
      });
      renderer.setAnimationLoop(animate);
    });
  });
}

startApp();

function createDicePhysics(mesh) {
  let rbDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 5, -1.2)
      .setCanSleep(true);
  let rigidBody = world.createRigidBody(rbDesc);
  rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
  rigidBody.resetForces(true);
  rigidBody.resetTorques(true);
  const tempGeo = mesh.geometry.clone().toNonIndexed();
  const vertices = tempGeo.attributes.position.array;
  let clDesc = RAPIER.ColliderDesc.convexHull(new Float32Array(vertices))
      .setRestitution(0.7)
      .setFriction(0.5);
  world.createCollider(clDesc, rigidBody);
  d20.userData.physicsBody = rigidBody;
  tempGeo.dispose();
}

const light = new THREE.AmbientLight( 0xffffff, 2 );
scene.add( light );

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setPixelRatio(1);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.set(0, 1.3, 1.3);
camera.lookAt(0, 0, -1);
const originalDistance = camera.position.length();

const controls = new OrbitControls( camera, renderer.domElement );
const currentPolarAngle = controls.getPolarAngle();
const twentyfiveDeg = 25 * (Math.PI / 180);
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

const fpsValue = document.getElementById('fps-value');
let frames = 0;
let prevTime = performance.now();

function animate() {

  if (world && d20 && d20.userData && d20.userData.physicsBody) {
    world.step();
    const rb = d20.userData.physicsBody;
    const pos = rb.translation();
    const rot = rb.rotation();

    d20.position.set(pos.x, pos.y, pos.z);
    d20.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  }
  
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

  frames++;
  const time = performance.now();
  if (time >= prevTime + 1000) {
    fpsValue.innerText = Math.round((frames * 1000) / (time - prevTime));
    prevTime = time;
    frames = 0;
  }

  renderer.render(scene, camera);
}
