import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

// 1.  기본 scene, camera, renderer 세팅
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x5f5f5f);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight);
camera.position.set(5,5,5);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({antialias : true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. OrbitControls설정
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.minPolarAngle = Math.PI / 4; // 45도 (상하 최소각도)
controls.maxPolarAngle = Math.PI / 2;

controls.minAzimuthAngle = -Math.PI / 4; // -45도 (좌우 최소각도)
controls.maxAzimuthAngle = Math.PI / 4;

// 3. 룸 만들기
// 3-1. 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 전체조명
scene.add(ambientLight);

const directionlLight = new THREE.DirectionalLight(0xffffff, 0.5); // 특정방향 조명 DirectionalLight( color : Integer, intensity : Float )
directionlLight.position.set(5,5,5);
// directionlLight.castShadow = true; // 동적그림자 (비용이 많이듦)
scene.add(directionlLight);

// 3-2. 바닥 설정
const floorGeometry = new THREE.PlaneGeometry(10,5);
const floorMaterial = new THREE.MeshStandardMaterial({
    color : 0xcccccc,
    roughness : 0.8
})
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 3-3. 벽 생성
// 벽 소재 설정
const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.9
})

// 뒷벽
const backwallGeometry = new THREE.PlaneGeometry(10, 2.5);
const backWall = new THREE.Mesh(backwallGeometry, wallMaterial);
const height = 2.5/2;
backWall.position.set(0,height,-2.5);
scene.add(backWall);

// 옆벽 - 뒷벽 소재 재활용
const sidewallGeometry = new THREE.PlaneGeometry(5,2.5);
const leftWall = new THREE.Mesh(sidewallGeometry, wallMaterial);
leftWall.rotation.y = -Math.PI/2;
leftWall.position.set(-5, height, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(sidewallGeometry, wallMaterial);
rightWall.rotation.y = Math.PI/2;
rightWall.position.set(5,height, 0);
scene.add(rightWall);

// 4. 서버랙 만들기



// 5. Animation Loop
function animate(){
    renderer.setAnimationLoop(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// 6. 기타 이벤트 처리
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
    camera.asperct = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix;
    renderer.setSize(window.innerWidth, window.innerHeight);
}