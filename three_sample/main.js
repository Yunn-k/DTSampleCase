import * as THREE from 'three';

// BoxGeometry로 큐브 생성 테스트
//--- 1. 기본 3가지값 세팅
const scene = new THREE.Scene();

//fov : 디스플레이에 표시되는 장면의 범위. default 50
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);

// 렌더러 사이즈 설정
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

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
    cube.rotation.x += 0.02;
    // cube.rotation.y += 0.01;

    boxEdges.rotation.x += 0.02;
    // boxEdges.rotation.y += 0.01;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

