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

// controls.minPolarAngle = Math.PI / 4; // 45도 (상하 최소각도)
// controls.maxPolarAngle = Math.PI / 2;

// controls.minAzimuthAngle = -Math.PI / 4; // -45도 (좌우 최소각도)
// controls.maxAzimuthAngle = Math.PI / 4;

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

        //랙 그룹 생성
        const rackGroup = new THREE.Group();

        //모델크기 확인
        var gltfObj = new THREE.Box3().setFromObject(gltf.scene); // gltf.scene을 감싼 box3객체. 
        var gltfObjSize = gltfObj.getSize(new THREE.Vector3());
        // console.log(gltfObjSize);
        
        //모델 스케일 변경 (gltf.scene이 로딩된 객체 그자체.)
        const rackModel = gltf.scene;
        const rackScale = 0.5
        rackModel.scale.set(rackScale, rackScale, rackScale);

        //생성 위치 설정
        rackModel.position.set(0,0,0); // 기준위치 초기화

        let rackPos = []
        for(let i = -0.6 ; i < 1.3 ; i+=0.3){
                rackPos.push({x : 0, y : 0, z : i})
        }

        // const rackPositions = [
        //     {x : 0, y : 0, z : -0.6},
        //     {x : 0, y : 0, z : -0.3},
        //     {x : 0, y : 0, z : 0},
        //     {x : 0, y : 0, z : 0.3},
        //     {x : 0, y : 0, z : 0.6},
        //     {x : 0, y : 0, z : 0.9},
        //     {x : 0, y : 0, z : 1.2},
        // ]

        rackPos.forEach((pos, index) => {
            const rackClone = rackModel.clone(); // glb 복제
            rackClone.rotation.y = -Math.PI / 2;
            rackClone.position.set(pos.x, pos.y, pos.z); // 개별 위치 설정

            const rackClone_r = rackModel.clone();
            rackClone_r.rotation.y = Math.PI / 2;
            rackClone_r.position.set(pos.x + 1 , -pos.y, pos.z);

            //고유아이디 추가
            // rackClone.userData = {rackId : `rack_${index+1}`};

            rackClone.traverse((child)=> {
                child.userData = {rackId : `rack_${index + 1}`} // 자식노드에게도 모두 id추가

                if(child.name === 'Front_Door001'){ //자식노드 선택하여 invisible 처리
                    child.visible = false; // 해당 노드를 숨김
                }
            });

            rackClone_r.traverse((child)=> {
                child.userData = {rackId : `rack_r_${index + 1}`} // 자식노드에게도 모두 id추가

                if(child.name === 'Front_Door001'){ //자식노드 선택하여 invisible 처리
                    child.visible = false; // 해당 노드를 숨김
                }
            });


            clickableobjects.push(rackClone);
            clickableobjects.push(rackClone_r);

            rackGroup.add(rackClone);
            rackGroup.add(rackClone_r);

            const room = createRoom();
            rackGroup.add(room);

            //랙 그룹 위치 설정
            rackGroup.position.set(0, 0, 0);
            scene.add(rackGroup);

            //  //계층구조 확인
            //  rackClone.traverse((node)=> {console.log('Node:', node.name, 'userData: ', node.userData)});
        });

        // console.log('GLTF Scene:', gltf.scene);
        // console.log('User Data:', gltf.scene.userData);
        // console.log('Extras:', gltf.scene.userData.extras || 'No extras found');
}
// , function (xhr){ // onProgress - 로딩이 진행되는동안 호출될 함수
//     console.log()
// }
// , function (error){ // onError - 에러정보
//     console.error(error);
// }
)

// 서버룸 겉면 생성
function createRoom(){
    const roomGroup = new THREE.Group();

    const width = 1.2;
    const height= 1;
    const depth = 2.3;

    // 공통 벽재질
    const wallMaterial = new THREE.MeshStandardMaterial({
        color : 0x333333,
        roughness : 0.8,
        metalness : 0.2,
    });

    const glassDoorGeometry = new THREE.PlaneGeometry(0.5, 0.7);
    const glassDoorMaterial = new THREE.MeshStandardMaterial({
        color : 0x00ffff,
        transparent : true,
        opacity : 0.1,
        metalness : 0.5,
    });
    const glassDoor = new THREE.Mesh(glassDoorGeometry, glassDoorMaterial);
    glassDoor.position.set(0.5, height / 2 - 0.1 , 1.47);
    roomGroup.add(glassDoor);

    const ceilingMaterial = new THREE.MeshStandardMaterial({
        color : 0x00ffff,
        transparent : true,
        opacity : 0,
        roughness : 0.2,
        metalness : 0.5,
    })

    // 배열로 지정 (앞, 뒤, 왼, 오, 위, 아래) (우, 좌, 위, 아래, 앞, 뒤)
    const materials =[
        wallMaterial,
        wallMaterial,
        ceilingMaterial,
        ceilingMaterial,
        wallMaterial,
        wallMaterial,
    ]
    
    const roomGeometry = new THREE.BoxGeometry(width, height, depth);
    const room = new THREE.Mesh(roomGeometry, materials);

    room.position.set(0.5,height / 2, 0.3);
    room.receiveShadow = true;
    roomGroup.add(room);

    return roomGroup;

}


// 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionlLight = new THREE.DirectionalLight(0xffffff, 0.5); // 특정방향 조명 DirectionalLight( color : Integer, intensity : Float )
directionlLight.position.set(2, 2, 2);
directionlLight.castShadow = true; // 동적그림자 (비용이 많이듦)
scene.add(directionlLight);


//---2. 방 생성
// 바닥 생성
const floorTexture = createfloorTexture(512, 2); // 바닥면 크기 512px, 8*8 타일

// 텍스처 반복설정
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(15,7); // 전체타일 패턴 반복

const floorGeometry = new THREE.BoxGeometry(15, 7 , 0.1);
const floorMaterial = new THREE.MeshBasicMaterial({
    map : floorTexture,
    // color : 0xffffff,
    // roughness : 0.8,
    // metalness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 벽면 생성
const backwallGeometry = new THREE.BoxGeometry(15, 2, 0.1);
const backwallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness : 0.8,
    metalness: 0.5
})
const backwall = new THREE.Mesh(backwallGeometry, backwallMaterial);
backwall.position.set(0, 1, -2.7)
scene.add(backwall);

// 기둥 생성
const columnGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
const columnMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness : 0.8,
    metalness : 0.5,
})
const column = new THREE.Mesh(columnGeometry, columnMaterial);
column.position.set(0,1,-2.5)
scene.add(column);

// 바닥면 텍스쳐 생성
function createfloorTexture(size, divisions){
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    context.fillStyle = '#E0E0E0 ';
    context.fillRect(0, 0, size, size);

    const step = size / divisions;
    context.strokeStyle = '#000000';
    context.lineWidth = 3;
   
    for (let i = 0; i <= divisions; i++) {
        const position = i * step;

        // 수평선
        context.beginPath();
        context.moveTo(0, position);
        context.lineTo(size, position);
        context.stroke();

        // 수직선
        context.beginPath();
        context.moveTo(position, 0);
        context.lineTo(position, size);
        context.stroke();
    }

    return new THREE.CanvasTexture(canvas);
}

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