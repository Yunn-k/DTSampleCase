import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// BoxGeometry로 큐브 생성 테스트
//--- 1. 기본 3가지값 세팅
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5f5f5f);

//camera: 가상시점 - (fov : 디스플레이에 표시되는 장면의 범위. default 50, aspect, near, far)
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(5,5,5);
camera.lookAt(0,0,0)

// 렌더러 생성 및 캔버스 사이즈 설정
const renderer = new THREE.WebGLRenderer({  antialias: true }); //안티앨리어싱 활성화로 계단현상없이 부드럽게 렌더링처리
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // 그림자 활성화 > 조명과 객체에 의해 생성되는 그림자가 랜더링 됨. default: false

document.body.appendChild(renderer.domElement);

//OrbitControls 추가
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 부드러운 애니메이션 효과 활성화 > controls.update()로 활성화
controls.dampingFactor = 0.05; //댐핑 효과의 강도 설정 > 값이 클수록 멈추는 속도가 느려짐. 기본값 0.25

controls.minDistance = 2; // 줌 최소거리
controls.maxDistance = 10; // 줌 최대거리

controls.minPolarAngle = Math.PI / 4; // 45도 (상하 최소각도)
controls.maxPolarAngle = Math.PI / 2;

controls.minAzimuthAngle = -Math.PI / 4; // -45도 (좌우 최소각도)
controls.maxAzimuthAngle = Math.PI / 4;

controls.target.set(1, 1, 1); // 새로운 바라볼 지점 설정
controls.update(); // 설정이 끝난 뒤 업데이트


//---2. 큐브 생성
//박스 생성 및 설정
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material); // 큐브 설정값 결합
cube.position.set(1, 0, 0); // (x,y,z 순서)

const geometry2 = new THREE.BoxGeometry(1, 2, 1);
const material2 = new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
const cube2 = new THREE.Mesh(geometry2, material2);
cube2.position.set(0, 0.5, 0); // (x,y,z 순서)

//박스 라인 생성 및 설정
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const boxEdges = new THREE.LineSegments(edges, lineMaterial);
boxEdges.position.set(2, 0, 0)


//scene에 추가
scene.add(cube);
scene.add(cube2);
scene.add(boxEdges);

// 카메라 위치 조정
camera.position.x = 3;
camera.position.y = 1;
camera.position.z = 7; // (+)줌아웃, (-) 줌인
camera.lookAt(3, 0, 0) // 카메라가 고정적으로 바라보는 지점 고정. 기본값 0,0,0

//---3. 장면렌더링
//애니메이션 루프를 이용하여 렌더링
function animate() {
    // requestAnimationFrame(animate) // 순수 자바스크립트에서 지원하는 애니메이션 루프
    renderer.setAnimationLoop(animate); // three.js의 WebGLRenderer에서 지원하는 애니메이션 루프

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    // boxEdges.rotation.x += 0.01;
    // boxEdges.rotation.y += 0.01;

    controls.update(); // OrbitControls 업데이트
    renderer.render(scene, camera);
}

animate();

//기타 이벤트 처리
window.addEventListener('resize', onWindowResize, false);

// 브라우저창 크기가 변경될 때 발생하는 resize 반응형 처리
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // 카메라 설정 (특히 aspect) 파라미터가 변경되면 반드시 호출되어야 함
    renderer.setSize(window.innerWidth, window.innerHeight);
}