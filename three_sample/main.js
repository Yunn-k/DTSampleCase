import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

// BoxGeometry로 큐브 생성 테스트
//--- 1. 기본 3가지값 세팅
const scene = new THREE.Scene();

//fov : 디스플레이에 표시되는 장면의 범위. default 50
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);

// 렌더러 사이즈 설정
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

//OrbitControls 추가
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // 부드러운 애니메이션 효과 활성화 > controls.update()로 활성화
controls.dampingFactor = 0.05; //댐핑 효과의 강도 설정 > 값이 클수록 멈추는 속도가 느려짐. 기본값 0.25

controls.minDistance = 2; // 줌 최소거리
controls.maxDistance = 10; // 줌 최대거리
controls.minPolarAnagle = Math.PI/2;    // 상하 최소각도
// controls.maxPolarAngle = Math.PI/2;     // 상하 최대각도
controls.minAzimuthAngle = -Math.PI/4;   // 좌우 최소각도
controls.maxAzimuthAngle = Math.PI / 4; // 좌우 최대각도
// controls.target.set(1, 1, 1); // 새로운 바라볼 지점 설정
// controls.update(); // 설정이 끝난 뒤 업데이트


//---2. 큐브 생성
//박스 생성 및 설정
const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color : 0x00ff00 });
const cube = new THREE.Mesh(geometry, material); // 큐브 설정값 결합

//박스 라인 생성 및 설정
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
const boxEdges = new THREE.LineSegments(edges, lineMaterial);

//scene에 추가
scene.add(cube);
scene.add(boxEdges);

// 카메라 위치 조정
camera.position.x = 3;
camera.position.y = 1;
camera.position.z = 7; // (+)줌아웃, (-) 줌인
camera.lookAt(3,0,0) // 카메라가 고정적으로 바라보는 지점 고정. 기본값 0,0,0

//---3. 장면렌더링
//애니메이션 루프를 이용하여 렌더링
function animate(){
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
window.addEventListener('resize', onWindowResize,false);

// 브라우저창 크기가 변경될 때 발생하는 resize 반응형 처리
function onWindowResize (){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix(); // 카메라 설정 (특히 aspect) 파라미터가 변경되면 반드시 호출되어야 함
    renderer.setSize(window.innerWidth, window.innerHeight);
}