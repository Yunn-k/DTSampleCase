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

controls.minAzimuthAngle = -Math.PI / 3; // -45도 (좌우 최소각도)
controls.maxAzimuthAngle = Math.PI / 3;

// 2-1. 이벤트 처리를 위한 객체 정의
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const clickableObjects = []; // 클릭가능한 객체들을 저장할 배열 
const temperatureLights = []; // 경고등
const temperatureWarnings = new Map(); // 온도경고 상태 추적

// 3. 룸 만들기
// 3-1. 조명 설정
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 전체조명
scene.add(ambientLight);

const directionlLight = new THREE.DirectionalLight(0xffffff, 0.5); // 특정방향 조명 DirectionalLight( color : Integer, intensity : Float )
directionlLight.position.set(5,5,5);
directionlLight.castShadow = true; // 동적그림자 (비용이 많이듦)
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
function createServerRack(x,z, rackNumber){
    temperatureWarnings.set(rackNumber, false);
    const rackGroup = new THREE.Group();

    //랙 프레임
    const rack_x = 1;
    const rack_y = 2;
    const rack_z = 0.8;

    const rackGeometry = new THREE.BoxGeometry(rack_x, rack_y, rack_z);
    const rackMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness:0.7
    });

    const rack = new THREE.Mesh(rackGeometry, rackMaterial);
    rack.position.set(x,1,z);
    rack.castShadow = true;
    rack.userData = { //식별데이터
        type:'rack', 
        number: rackNumber, 
        temperature : 20 + Math.random() * 20 // 20~40사이 랜덤온도
    }; 
  
    clickableObjects.push(rack); // 식별가능하도록 배열에 추가
    rackGroup.add(rack);

    //랙 바닥 온도표시등
    const temperatureLight = createTemperatureLight(x, z, rack.userData.temperature);
    temperatureLights.push({
        light: temperatureLight,
        rack: rack
    });

    rackGroup.add(temperatureLight);


    // 랙 라인
    const rackEdgeGeometry = new THREE.EdgesGeometry(rackGeometry);
    const rackEdgeMaterial = new THREE.MeshBasicMaterial({
        color: 0x3f7b9d
    })
    const rackEdges = new THREE.LineSegments(rackEdgeGeometry, rackEdgeMaterial);
    rackEdges.position.set(x,1,z);
    rackGroup.add(rackEdges); // rackGroup에 추가해주어야 클릭이벤트시 하나의 덩어리로 인식함. scene에 추가하면 안됨!

    //서버 유닛들 추가
    const serverHeight = 0.13;
    const serverGeometry = new THREE.BoxGeometry(1, serverHeight, 0.7);

    for(let i = 0; i < 10; i++){
        const serverMaterial = new THREE.MeshPhongMaterial({ //각자가 color, emissive를 가질 수 있도록 for문 안으로 넣어서 처리!
            color: 0x666666,
            emissive : 0x000000
        });

        const server = new THREE.Mesh(serverGeometry, serverMaterial);
        server.position.set(x + 0.01, i/6 + 0.3, z);
        server.castShadow = true;
        server.userData = {type : 'server', number: rackNumber, unit : i+1 }; // 유닛 식별데이터
        clickableObjects.push(server); // 식별가능하도록 배열에 추가
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

    // rackGroup.rotation.y = Math.PI/2;

    return rackGroup;
}

scene.add(createServerRack(-1.5, 0, 1));
scene.add(createServerRack(0,-1, 2))
scene.add(createServerRack(1.5,-2, 3))


// 5. 온도 경고등
function createTemperatureLight(x,z,temperature){
    const radius = 0.8;
    const segments = 32;
    const lightGeometry = new THREE.CircleGeometry(radius, segments);

    //온도에 따른 색상 설정(20도~40도 사이)
    const t = (temperature - 20) / 20; // 0~1 범위로 정규화
    const color = new THREE.Color();
    color.setHSL(0.3 * (1 - t), 1, 0.5); // 초록(0.3)에서 빨강(0)으로

    const lightMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent : true,
        opacity: 0.3,
        // opacity: 0.3 + (t * 0.5),
        // side: THREE.FrontSide
        side: THREE.DoubleSide
    });

    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(x, 0.01, z);
    light.rotation.x = -Math.PI/2;

    return light;
}



// 기타 이벤트 처리
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onMouseClick, false);
window.addEventListener('DOMContentLoaded', checkTemperatures, false);


// 6-1 resize event
function onWindowResize(e) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 6-2. click event
function onMouseClick(e){

    // 마우스 위치를 정규화된 장치 좌표로 변환 (-1 ~ 1)
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // console.log(mouse);

    //Raycaster
    raycaster.setFromCamera(mouse, camera); // 카메라의 시점에서 마우스가 가리키는 방향으로 광선 생성 -> 객체와 교차여부 확인

    const intersects = raycaster.intersectObjects(clickableObjects);

    if(intersects.length > 0 ){
        // const find = intersects.find(obj => obj.object.userData.type ==='server'); //find메서드로 일치하는 데이터를 콜백으로 받음
        const find = intersects[0].object;
        
        if(find.userData.unit === undefined){
            alert(`서버랙 ${find.userData.number}이 선택되었습니다`);
        } else {
            alert(`서버랙 ${find.userData.number}번의 ${find.userData.unit}번 유닛이 선택되었습니다.`)
            if (find.material && find.material.emissive) {
                find.material.emissive.setHex(0xff0000);

                setTimeout(() => {
                    find.material.emissive.setHex(0x000000);
                }, 150);
            }
        }
    }
}

function checkTemperatures(){
    clickableObjects.forEach(object => {
        if (object.userData.type === 'rack') {
            // 온도 경고 체크 (35도이상)
            const temperature = object.userData.temperature;
            const rackNumber = object.userData.number;
            const hasWarning = temperatureWarnings.get(rackNumber);

            if(temperature > 35 && !hasWarning){
                temperatureWarnings.set(rackNumber, true);
                showAlert(rackNumber, temperature);

            } else if (temperature <= 35 && hasWarning){
                temperatureWarnings.set(rackNumber, false);
            }
            
        }
    });
}


// 온도변화 시뮬레이션 (자동)
function updateTemperatures(){
    clickableObjects.forEach(object => {
        if (object.userData.type === 'rack') {
            // 온도 변화 (-1°C ~ +1°C)
            object.userData.temperature += (Math.random() * 2 - 1);
            // 온도 범위 제한 (20°C ~ 40°C)
            object.userData.temperature = Math.max(20, Math.min(40, object.userData.temperature));
            
            // 온도 경고 체크 (35도이상)
            const hasWarning = temperatureWarnings.get(object.userData.number);

            if(object.userData.temperature > 35 && !hasWarning){
                temperatureWarnings.set(object.userData.temperature, true);
                const rackNumber = object.userData.number;
                const temperature = object.userData.temperature;
                showAlert(rackNumber, temperature);

            } else if (object.userData.temperature <= 35 && hasWarning){
                temperatureWarnings.set(object.userData.temperature, false);
            }

            // 해당 랙의 온도 표시등 업데이트
            const tempLight = temperatureLights.find(t => t.rack === object);
            if (tempLight) {
                const t = (object.userData.temperature - 20) / 20;
                const color = new THREE.Color();
                color.setHSL(0.3 * (1 - t), 1, 0.5);
                tempLight.light.material.color = color;
                tempLight.light.material.opacity = 0.3 + (t * 0.5);
            }
        }
    });
}

//35도 이상일 시 경고메세지 표시
function showAlert(rackNumber, temperature){
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert';
    alertDiv.innerHTML = `온도경고! 서버랙 ${rackNumber} 번 온도가 ${temperature}도 입니다.<br> 확인해주세요`;
    document.body.appendChild(alertDiv);

    setTimeout(()=> {
        alertDiv.remove()
    }, 2000)
}



// Animation Loop
function animate(){
    renderer.setAnimationLoop(animate);
    controls.update();
    // updateTemperatures();
    checkTemperatures();
    renderer.render(scene, camera);
}

animate();
