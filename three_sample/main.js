import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// BoxGeometry로 큐브 생성 테스트
//--- 1. 기본 3가지값 세팅
const scene = new THREE.Scene();

//camera: 가상시점 - (fov : 디스플레이에 표시되는 장면의 범위. default 50, aspect, near, far)
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set(5,5,5);
// camera.lookAt(0,0,0)

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


//이벤트용 객체 설정
const raycaster = new THREE.Raycaster();
const clickableobjects = [];
const mouse = new THREE.Vector2();

// gltf loader
const loader = new GLTFLoader();
loader.load('resources/textures/server_rack.glb', 
    function(gltf){ // onLoad - 로딩이 완료된 후 호출되는 함수
        console.log('loading complete');

        //모델크기 확인
        var gltfObj = new THREE.Box3().setFromObject(gltf.scene); // gltf.scene을 감싼 box3객체. 
        var gltfObjSize = gltfObj.getSize(new THREE.Vector3());
        // console.log(gltfObjSize);
        
        //모델 스케일 변경 (gltf.scene이 로딩된 객체 그자체.)
        const rackModel = gltf.scene;
        rackModel.scale.set(0.7, 0.7, 0.7);

        //생성 위치 설정
        rackModel.position.set(0,0,0); // 기준위치 초기화

        let rackPos = []
        for(let i = -4 ; i < 5 ; i++){
            if (i == 0) continue;

            for (let j = -2; j < 3; j ++){
                if (j == 0) continue;
                rackPos.push({x : i, y : 0, z : j})
            }
        }

        // const rackPositions = [
        //     {x : -4, y : 0, z : -2},
        //     {x : -4, y : 0, z : -1},
        //     {x : -4, y : 0, z : 0},
        //     {x : -4, y : 0, z : 1},
        //     {x : -4, y : 0, z : 2},
        //     {x : -3, y : 0, z : -2},
        //     {x : -3, y : 0, z : -1},
        //     {x : -3, y : 0, z : 0},
        //     {x : -3, y : 0, z : 1},
        //     {x : -3, y : 0, z : 2},
        //     {x : -1, y : 0, z : -2},
        //     {x : -1, y : 0, z : -1},
        //     {x : -1, y : 0, z : 0},
        //     {x : -1, y : 0, z : 1},
        //     {x : -1, y : 0, z : 2},
        //     {x : 0, y : 0, z : -2},
        //     {x : 0, y : 0, z : -1},
        //     {x : 0, y : 0, z : 0},
        //     {x : 0, y : 0, z : 1},
        //     {x : 0, y : 0, z : 2},
        //     {x : 2, y : 0, z : -2},
        //     {x : 2, y : 0, z : -1},
        //     {x : 2, y : 0, z : 0},
        //     {x : 2, y : 0, z : 1},
        //     {x : 2, y : 0, z : 2},
        //     {x : 3, y : 0, z : -2},
        //     {x : 3, y : 0, z : -1},
        //     {x : 3, y : 0, z : 0},
        //     {x : 3, y : 0, z : 1},
        //     {x : 3, y : 0, z : 2},
        // ]

        rackPos.forEach((pos, index) => {
            const rackClone = rackModel.clone(); // glb 복제
            rackClone.position.set(pos.x, pos.y, pos.z); // 개별 위치 설정
            
            //고유아이디 추가
            // rackClone.userData = {rackId : `rack_${index+1}`};

            rackClone.traverse((child)=> {
                child.userData = {rackId : `rack_${index + 1}`} // 자식노드에게도 모두 id추가
            });

            scene.add(rackClone);
            clickableobjects.push(rackClone);

            //  //계층구조 확인
            //  rackClone.traverse((node)=> {console.log('Node:', node.name, 'userData: ', node.userData)});
        });

        // gltf.scene.userData = {itemId : '1', rackId : '2'};
        // gltf.scene.userData.itemId = '1';
        // console.log(gltfObj);
        // console.log('GLTF Scene:', gltf.scene);
        // console.log('User Data:', gltf.scene.userData);
        // console.log('Extras:', gltf.scene.userData.extras || 'No extras found');
        // clickableobjects.push(gltf.scene);
        
        // scene.add(gltf.scene); // 기존 scene에 로딩한 scene을 추가
}
// , function (xhr){ // onProgress - 로딩이 진행되는동안 호출될 함수
//     console.log()
// }
// , function (error){ // onError - 에러정보
//     console.error(error);
// }
)

// 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);


//---2. 방 생성
// 바닥 생성
const floorGeometry = new THREE.BoxGeometry(10, 5 , 0.1);
const floorMaterial = new THREE.MeshStandardMaterial({
    color : 0xffffff,
    roughness : 0.8,
    metalness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 벽면 생성
const backwallGeometry = new THREE.BoxGeometry(10, 2, 0.1);
const backwallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness : 0.8,
    metalness: 0.5
})
const backwall = new THREE.Mesh(backwallGeometry, backwallMaterial);
backwall.position.set(0, 1, -2.4)
scene.add(backwall);


//박스 생성 및 설정
const geometry = new THREE.BoxGeometry(0.5, 2, 0.5);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x555555, 
    roughness: 0.2, 
});
const cube = new THREE.Mesh(geometry, material); // 큐브 설정값 결합
cube.position.set(0, 1.1, -2); // (x,y,z 순서)

const geometry2 = new THREE.BoxGeometry(0.5, 1, 0.5);
const material2 = new THREE.MeshBasicMaterial({ color: 0x00000 })
const cube2 = new THREE.Mesh(geometry2, material2);
const cube2_x = 0;
const cube2_y = 0.55;
const cube2_z = 0;
cube2.position.set(cube2_x, cube2_y, cube2_z); // (x,y,z 순서)

//박스 라인 생성 및 설정
const edges = new THREE.EdgesGeometry(geometry2);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const boxEdges = new THREE.LineSegments(edges, lineMaterial);
boxEdges.position.set(cube2_x, cube2_y, cube2_z);
 
clickableobjects.push(cube2);

//scene에 추가
scene.add(cube);
// scene.add(cube2);
// scene.add(boxEdges);


// 카메라 위치 조정
camera.position.x = 3;
camera.position.y = 7;
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

//클릭이벤트 설정
window.addEventListener('click', e =>{

    // 마우스 위치를 정규화된 장치 좌표로 변환 (-1 ~ 1)
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableobjects); // true값은 하위노드까지 탐색 (default: false)
    

    if(intersects.length > 0){
        let clickedObj = intersects[0].object; // 재할당을 위해 let으로 선언
        console.log(clickedObj);
        // const clickedObj = intersects.find(intersection => intersection.object === cube2);

        console.log(`finding parent data: ${clickedObj.parent.userData.rackId}`);

        while (clickedObj && !clickedObj.userData.rackId) { //부모노드(clickedObj ==undefined, itemId가 있음) 의 userData를 찾기 위한 탐색 
            clickedObj = clickedObj.parent; // 부모노드로 이동
        };

        if (clickedObj && clickedObj.userData) {
            const rackId = clickedObj.userData.rackId; // 객체의 rackId 가져오기
            const itemId = clickedObj.userData.itemId;
            console.log(`Clicked rackId: ${rackId}`);
            console.log(`Clicked itemId: ${itemId}`);

            // 특정 rackId에 따라 동작 설정
            if (rackId === 'rack_1') {
                window.location.href = './room.html'; // 페이지 이동
            }

            // if (itemId === '1'){
            //     window.location.href = './room.html'
            // }
        } else {
            console.log('No userData found on the clicked object.');
        }
    }
});

//기타 이벤트 처리
window.addEventListener('resize', onWindowResize, false);

function onWindowResize(e) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}