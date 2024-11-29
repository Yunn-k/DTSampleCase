import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5f5f5f);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight);
camera.position.set(5,5,5);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({antialias : true});
renderer.setSize(window.innerWidth/window.innerHeight);
renderer.shadowMap.enabled=true;

