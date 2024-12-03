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
const wallHeight = 2.5/2;
backWall.position.set(0,wallHeight,-2.5);
scene.add(backWall);

// 옆벽 - 뒷벽 소재 재활용
const sidewallGeometry = new THREE.PlaneGeometry(5,2.5);
const leftWall = new THREE.Mesh(sidewallGeometry, wallMaterial);
leftWall.rotation.y = -Math.PI/2;
leftWall.position.set(-5, wallHeight, 0);
scene.add(leftWall);

const rightWall = new THREE.Mesh(sidewallGeometry, wallMaterial);
rightWall.rotation.y = Math.PI/2;
rightWall.position.set(5,wallHeight, 0);
scene.add(rightWall);

// 4. 서버랙 만들기
function createServerRack(x,z){
    const rackGroup = new THREE.Group();

    //랙 프레임
    const rackGeometry = new THREE.BoxGeometry(1, 2, 0.8);
    const rackMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness:0.7
    });

    const rack = new THREE.Mesh(rackGeometry, rackMaterial);
    rack.position.set(x,1,z);
    rack.castShadow = true;
    rackGroup.add(rack);

    //서버 유닛들 추가
    const serverHeight = 0.15;
    const serverGeometry = new THREE.BoxGeometry(1, serverHeight, 0.7);
    const serverMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.5
    });

    for(let i = 0; i < 10; i++){
        const server = new THREE.Mesh(serverGeometry, serverMaterial);
        server.position.set(x, i/5, z);
        server.castShadow = true;
        rackGroup.add(server);
    }

    // led 표시등
    const ledGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
    const ledMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive : 0x00ff00,
        emissiveIntensity:0.5
    });

    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(x + 0.3, 2, z-0.3);
    rackGroup.add(led);

    return rackGroup;
}

scene.add(createServerRack(-1.5, 0));
scene.add(createServerRack(0,-1))
scene.add(createServerRack(1.5,-2))

// 5. Animation Loop
function animate(){
    renderer.setAnimationLoop(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// 6. 기타 이벤트 처리
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}